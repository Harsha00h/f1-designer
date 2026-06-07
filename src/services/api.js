/**
 * API client for FastF1 backend.
 * All functions return parsed JSON or throw on error.
 * Includes retry logic for transient failures.
 */

const API_BASE = '/api';

async function fetchWithRetry(url, retries = 2, delay = 1000) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, delay * (i + 1)));
    }
  }
}

// ---- Seasons & Events ----

export async function getSeasons() {
  return fetchWithRetry(`${API_BASE}/seasons`);
}

export async function getEvents(year) {
  return fetchWithRetry(`${API_BASE}/events/${year}`);
}

// ---- Session ----

export async function getSessionSummary(year, gp, session) {
  return fetchWithRetry(`${API_BASE}/session/${year}/${encodeURIComponent(gp)}/${session}`);
}

// ---- Telemetry ----

export async function getTelemetry(year, gp, session, driver, lap = null) {
  let url = `${API_BASE}/telemetry/${year}/${encodeURIComponent(gp)}/${session}/${driver}`;
  if (lap) url += `?lap=${lap}`;
  return fetchWithRetry(url);
}

// ---- Lap Times ----

export async function getLapTimes(year, gp, session, driver = null) {
  let url = `${API_BASE}/lap-times/${year}/${encodeURIComponent(gp)}/${session}`;
  if (driver) url += `?driver=${driver}`;
  return fetchWithRetry(url);
}

// ---- Race Results ----

export async function getRaceResults(year, gp) {
  return fetchWithRetry(`${API_BASE}/race-results/${year}/${encodeURIComponent(gp)}`);
}

// ---- Standings ----

export async function getStandings(year) {
  return fetchWithRetry(`${API_BASE}/standings/${year}`);
}

// ---- Driver Comparison ----

export async function compareDrivers(year, gp, session, driver1, driver2) {
  return fetchWithRetry(
    `${API_BASE}/compare/${year}/${encodeURIComponent(gp)}/${session}?driver1=${driver1}&driver2=${driver2}`
  );
}

// ---- Fastest Lap (for simulator calibration) ----

export async function getFastestLap(year, gp) {
  return fetchWithRetry(`${API_BASE}/fastest-lap/${year}/${encodeURIComponent(gp)}`);
}

// ---- Health Check ----

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

// ---- Transform helpers ----

/**
 * Merge two telemetry arrays by distance for overlay charts.
 * Returns [{distance, speed1, speed2, throttle1, throttle2}]
 */
export function mergeTelemetry(tel1, tel2, label1 = 'Driver 1', label2 = 'Driver 2') {
  const map = new Map();
  tel1.forEach(p => {
    const key = Math.round(p.distance / 10) * 10;
    map.set(key, { distance: key, [`speed_${label1}`]: p.speed, [`throttle_${label1}`]: p.throttle });
  });
  tel2.forEach(p => {
    const key = Math.round(p.distance / 10) * 10;
    const existing = map.get(key) || { distance: key };
    existing[`speed_${label2}`] = p.speed;
    existing[`throttle_${label2}`] = p.throttle;
    map.set(key, existing);
  });
  return Array.from(map.values()).sort((a, b) => a.distance - b.distance);
}
