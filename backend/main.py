"""
FastF1 Backend — FastAPI server wrapping the FastF1 library.
Provides real-world F1 telemetry, lap times, race results, and standings.
"""

import os
import json
import time
from typing import Optional
from functools import lru_cache

import fastf1
import pandas as pd
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# ---------------------------------------------------------------------------
# FastF1 cache setup
# ---------------------------------------------------------------------------
CACHE_DIR = os.path.join(os.path.dirname(__file__), "fastf1_cache")
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

# ---------------------------------------------------------------------------
# In-memory response cache (TTL = 10 min)
# ---------------------------------------------------------------------------
_response_cache: dict = {}
CACHE_TTL = 600  # seconds


def cached(key: str):
    """Return cached value if fresh, else None."""
    entry = _response_cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL:
        return entry["data"]
    return None


def set_cache(key: str, data):
    _response_cache[key] = {"data": data, "ts": time.time()}


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(
    title="F1 Designer — FastF1 API",
    description="Real-world F1 data powered by FastF1",
    version="1.0.0",
)

_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
_allowed_origins = [o.strip() for o in _origins_env.split(",")] if _origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def safe_value(val):
    """Convert numpy/pandas types to JSON-safe Python types."""
    if pd.isna(val):
        return None
    if hasattr(val, "item"):
        return val.item()
    if isinstance(val, pd.Timedelta):
        return val.total_seconds()
    if isinstance(val, pd.Timestamp):
        return val.isoformat()
    return val


def timedelta_to_str(td):
    """Format a pandas Timedelta to mm:ss.SSS string."""
    if pd.isna(td):
        return None
    total_seconds = td.total_seconds()
    if total_seconds < 0:
        return None
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    return f"{minutes}:{seconds:06.3f}"


def load_session(year: int, gp: str, session: str):
    """Load and return a FastF1 session."""
    try:
        sess = fastf1.get_session(year, gp, session)
        sess.load()
        return sess
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Session not found: {e}")


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "f1-fastf1-backend"}


@app.get("/api/seasons")
def get_seasons():
    """Return list of available seasons (2018-2025)."""
    return {"seasons": list(range(2018, 2026))}


@app.get("/api/events/{year}")
def get_events(year: int):
    """Return all events/grand prix for a given year."""
    cache_key = f"events-{year}"
    hit = cached(cache_key)
    if hit:
        return hit

    try:
        schedule = fastf1.get_event_schedule(year)
        events = []
        for _, row in schedule.iterrows():
            rn = safe_value(row.get("RoundNumber"))
            if rn is not None and rn > 0:
                events.append({
                    "round": rn,
                    "name": safe_value(row.get("EventName")),
                    "country": safe_value(row.get("Country")),
                    "location": safe_value(row.get("Location")),
                    "date": safe_value(row.get("EventDate")),
                })
        result = {"year": year, "events": events}
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/session/{year}/{gp}/{session}")
def get_session_summary(year: int, gp: str, session: str):
    """Get session summary — drivers, weather, track status."""
    cache_key = f"session-{year}-{gp}-{session}"
    hit = cached(cache_key)
    if hit:
        return hit

    sess = load_session(year, gp, session)

    drivers = []
    try:
        for drv in sess.drivers:
            info = sess.get_driver(drv)
            drivers.append({
                "number": safe_value(info.get("DriverNumber")),
                "code": safe_value(info.get("Abbreviation")),
                "name": f"{safe_value(info.get('FirstName', ''))} {safe_value(info.get('LastName', ''))}".strip(),
                "team": safe_value(info.get("TeamName")),
                "teamColor": safe_value(info.get("TeamColor")),
            })
    except Exception:
        pass

    weather_data = None
    try:
        if hasattr(sess, "weather_data") and sess.weather_data is not None and len(sess.weather_data) > 0:
            first_w = sess.weather_data.iloc[0]
            weather_data = {
                "airTemp": safe_value(first_w.get("AirTemp")),
                "trackTemp": safe_value(first_w.get("TrackTemp")),
                "humidity": safe_value(first_w.get("Humidity")),
                "rainfall": safe_value(first_w.get("Rainfall")),
                "windSpeed": safe_value(first_w.get("WindSpeed")),
            }
    except Exception:
        pass

    result = {
        "year": year,
        "gp": gp,
        "session": session,
        "name": getattr(sess, "event", {}).get("EventName", gp) if hasattr(sess, "event") and hasattr(sess.event, "get") else gp,
        "drivers": drivers,
        "weather": weather_data,
    }
    set_cache(cache_key, result)
    return result


@app.get("/api/telemetry/{year}/{gp}/{session}/{driver}")
def get_telemetry(year: int, gp: str, session: str, driver: str, lap: Optional[int] = Query(None)):
    """Get speed/throttle/brake/gear telemetry for a driver's fastest or specified lap."""
    cache_key = f"telem-{year}-{gp}-{session}-{driver}-{lap}"
    hit = cached(cache_key)
    if hit:
        return hit

    sess = load_session(year, gp, session)

    try:
        drv_laps = sess.laps.pick_drivers(driver)
        if lap is not None:
            target_lap = drv_laps[drv_laps["LapNumber"] == lap]
            if target_lap.empty:
                raise HTTPException(status_code=404, detail=f"Lap {lap} not found for {driver}")
            target_lap = target_lap.iloc[0]
        else:
            target_lap = drv_laps.pick_fastest()

        tel = target_lap.get_telemetry()

        # Downsample to max 500 points for frontend performance
        step = max(1, len(tel) // 500)
        sampled = tel.iloc[::step]

        telemetry = []
        for _, row in sampled.iterrows():
            telemetry.append({
                "distance": round(safe_value(row.get("Distance", 0)), 1),
                "speed": round(safe_value(row.get("Speed", 0)), 1),
                "throttle": round(safe_value(row.get("Throttle", 0)), 1),
                "brake": safe_value(row.get("Brake", False)),
                "gear": safe_value(row.get("nGear", 0)),
                "rpm": safe_value(row.get("RPM", 0)),
                "drs": safe_value(row.get("DRS", 0)),
            })

        lap_time_str = timedelta_to_str(target_lap.get("LapTime"))

        result = {
            "driver": driver,
            "lapNumber": safe_value(target_lap.get("LapNumber")),
            "lapTime": lap_time_str,
            "compound": safe_value(target_lap.get("Compound")),
            "telemetry": telemetry,
        }
        set_cache(cache_key, result)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Telemetry error: {e}")


@app.get("/api/lap-times/{year}/{gp}/{session}")
def get_lap_times(year: int, gp: str, session: str, driver: Optional[str] = Query(None)):
    """Get all lap times for a session, optionally filtered by driver."""
    cache_key = f"laps-{year}-{gp}-{session}-{driver}"
    hit = cached(cache_key)
    if hit:
        return hit

    sess = load_session(year, gp, session)

    try:
        laps = sess.laps
        if driver:
            laps = laps.pick_drivers(driver)

        lap_list = []
        for _, lap_row in laps.iterrows():
            lt = safe_value(lap_row.get("LapTime"))
            if lt is not None and isinstance(lt, (int, float)) and lt > 0:
                lap_list.append({
                    "driver": safe_value(lap_row.get("Driver")),
                    "lapNumber": safe_value(lap_row.get("LapNumber")),
                    "lapTime": round(lt, 3),
                    "lapTimeFormatted": timedelta_to_str(lap_row.get("LapTime")),
                    "compound": safe_value(lap_row.get("Compound")),
                    "sector1": safe_value(lap_row.get("Sector1Time")),
                    "sector2": safe_value(lap_row.get("Sector2Time")),
                    "sector3": safe_value(lap_row.get("Sector3Time")),
                    "stint": safe_value(lap_row.get("Stint")),
                })

        # If LapTime was Timedelta (not float), convert properly
        if lap_list and lap_list[0]["lapTime"] is None:
            lap_list_fixed = []
            for _, lap_row in laps.iterrows():
                lt_td = lap_row.get("LapTime")
                if pd.notna(lt_td):
                    lap_list_fixed.append({
                        "driver": safe_value(lap_row.get("Driver")),
                        "lapNumber": safe_value(lap_row.get("LapNumber")),
                        "lapTime": round(lt_td.total_seconds(), 3) if isinstance(lt_td, pd.Timedelta) else safe_value(lt_td),
                        "lapTimeFormatted": timedelta_to_str(lt_td) if isinstance(lt_td, pd.Timedelta) else str(lt_td),
                        "compound": safe_value(lap_row.get("Compound")),
                        "stint": safe_value(lap_row.get("Stint")),
                    })
            lap_list = lap_list_fixed

        result = {"laps": lap_list}
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lap times error: {e}")


@app.get("/api/race-results/{year}/{gp}")
def get_race_results(year: int, gp: str):
    """Get race results with positions, gaps, pit stops."""
    cache_key = f"results-{year}-{gp}"
    hit = cached(cache_key)
    if hit:
        return hit

    sess = load_session(year, gp, "R")

    try:
        results = []
        race_results = sess.results
        for _, row in race_results.iterrows():
            results.append({
                "position": safe_value(row.get("Position")),
                "number": safe_value(row.get("DriverNumber")),
                "driver": safe_value(row.get("Abbreviation")),
                "fullName": f"{safe_value(row.get('FirstName', ''))} {safe_value(row.get('LastName', ''))}".strip(),
                "team": safe_value(row.get("TeamName")),
                "teamColor": safe_value(row.get("TeamColor")),
                "gridPosition": safe_value(row.get("GridPosition")),
                "status": safe_value(row.get("Status")),
                "points": safe_value(row.get("Points")),
                "time": safe_value(row.get("Time")),
            })

        result = {"year": year, "gp": gp, "results": results}
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Results error: {e}")


@app.get("/api/standings/{year}")
def get_standings(year: int):
    """Get driver and constructor standings from Ergast (bundled in FastF1)."""
    cache_key = f"standings-{year}"
    hit = cached(cache_key)
    if hit:
        return hit

    try:
        # FastF1 doesn't directly provide standings — we'll compute from race results
        schedule = fastf1.get_event_schedule(year)
        driver_points: dict = {}
        constructor_points: dict = {}

        # Get results from completed rounds
        completed_rounds = []
        for _, row in schedule.iterrows():
            rn = safe_value(row.get("RoundNumber"))
            event_date = row.get("EventDate")
            if rn and rn > 0 and pd.notna(event_date):
                try:
                    event_date_ts = pd.Timestamp(event_date)
                    if event_date_ts < pd.Timestamp.now():
                        completed_rounds.append((rn, safe_value(row.get("EventName"))))
                except Exception:
                    pass

        # Limit to last 5 rounds for speed
        recent_rounds = completed_rounds[-5:] if len(completed_rounds) > 5 else completed_rounds

        for rn, event_name in recent_rounds:
            try:
                sess = fastf1.get_session(year, rn, "R")
                sess.load()
                for _, r in sess.results.iterrows():
                    drv = safe_value(r.get("Abbreviation"))
                    team = safe_value(r.get("TeamName"))
                    pts = safe_value(r.get("Points")) or 0

                    if drv:
                        if drv not in driver_points:
                            driver_points[drv] = {
                                "driver": drv,
                                "fullName": f"{safe_value(r.get('FirstName', ''))} {safe_value(r.get('LastName', ''))}".strip(),
                                "team": team,
                                "teamColor": safe_value(r.get("TeamColor")),
                                "points": 0,
                            }
                        driver_points[drv]["points"] += pts

                    if team:
                        if team not in constructor_points:
                            constructor_points[team] = {"team": team, "points": 0}
                        constructor_points[team]["points"] += pts
            except Exception:
                continue

        drivers_sorted = sorted(driver_points.values(), key=lambda x: x["points"], reverse=True)
        constructors_sorted = sorted(constructor_points.values(), key=lambda x: x["points"], reverse=True)

        # Add position
        for i, d in enumerate(drivers_sorted):
            d["position"] = i + 1
        for i, c in enumerate(constructors_sorted):
            c["position"] = i + 1

        result = {
            "year": year,
            "roundsIncluded": len(recent_rounds),
            "totalRounds": len(completed_rounds),
            "drivers": drivers_sorted,
            "constructors": constructors_sorted,
            "note": f"Standings computed from last {len(recent_rounds)} completed rounds" if len(completed_rounds) > 5 else "Full season standings",
        }
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Standings error: {e}")


@app.get("/api/compare/{year}/{gp}/{session}")
def compare_drivers(year: int, gp: str, session: str, driver1: str = Query(...), driver2: str = Query(...)):
    """Compare two drivers' telemetry on their fastest laps."""
    cache_key = f"compare-{year}-{gp}-{session}-{driver1}-{driver2}"
    hit = cached(cache_key)
    if hit:
        return hit

    sess = load_session(year, gp, session)

    def get_driver_data(drv_code):
        drv_laps = sess.laps.pick_drivers(drv_code)
        fastest = drv_laps.pick_fastest()
        tel = fastest.get_telemetry()
        step = max(1, len(tel) // 500)
        sampled = tel.iloc[::step]
        points = []
        for _, row in sampled.iterrows():
            points.append({
                "distance": round(safe_value(row.get("Distance", 0)), 1),
                "speed": round(safe_value(row.get("Speed", 0)), 1),
                "throttle": round(safe_value(row.get("Throttle", 0)), 1),
                "brake": safe_value(row.get("Brake", False)),
                "gear": safe_value(row.get("nGear", 0)),
            })
        return {
            "driver": drv_code,
            "lapTime": timedelta_to_str(fastest.get("LapTime")),
            "compound": safe_value(fastest.get("Compound")),
            "telemetry": points,
        }

    try:
        d1 = get_driver_data(driver1)
        d2 = get_driver_data(driver2)
        result = {"driver1": d1, "driver2": d2}
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Compare error: {e}")


@app.get("/api/fastest-lap/{year}/{gp}")
def get_fastest_lap(year: int, gp: str):
    """Get the fastest race lap for a specific GP — used by simulator calibration."""
    cache_key = f"fastest-{year}-{gp}"
    hit = cached(cache_key)
    if hit:
        return hit

    try:
        sess = load_session(year, gp, "R")
        fastest = sess.laps.pick_fastest()

        tel = fastest.get_telemetry()
        step = max(1, len(tel) // 300)
        sampled = tel.iloc[::step]
        telemetry = []
        for _, row in sampled.iterrows():
            telemetry.append({
                "distance": round(safe_value(row.get("Distance", 0)), 1),
                "speed": round(safe_value(row.get("Speed", 0)), 1),
            })

        result = {
            "driver": safe_value(fastest.get("Driver")),
            "lapTime": timedelta_to_str(fastest.get("LapTime")),
            "lapTimeSeconds": round(fastest.get("LapTime").total_seconds(), 3) if pd.notna(fastest.get("LapTime")) else None,
            "compound": safe_value(fastest.get("Compound")),
            "team": safe_value(fastest.get("Team")),
            "topSpeed": round(tel["Speed"].max(), 1) if "Speed" in tel.columns else None,
            "avgSpeed": round(tel["Speed"].mean(), 1) if "Speed" in tel.columns else None,
            "telemetry": telemetry,
        }
        set_cache(cache_key, result)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fastest lap error: {e}")


# ---------------------------------------------------------------------------
# Run with: uvicorn main:app --reload --port 8000
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
