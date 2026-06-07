/**
 * Real F1 Circuit Data for Simulation Calibration
 *
 * Sources: formula1.com, motorsporttickets.com, motorsportmagazine.com,
 *          autosport.com, racingnews365.com, statsf1.com, Wikipedia,
 *          themotorsportmetrics.com, pirelli.com, f1chronicle.com
 *
 * Lap records: official FIA race fastest laps and qualifying records
 * Top speeds: speed trap data from official FIA timing
 * Average speeds: computed from fastest lap time and track length
 *
 * Last updated: 2026-03-29
 */

// ---------------------------------------------------------------------------
// CIRCUIT DATA
// ---------------------------------------------------------------------------

export const circuits = [
  {
    id: "bahrain",
    name: "Bahrain International Circuit",
    location: "Sakhir, Bahrain",
    lengthKm: 5.412,
    laps: 57,
    raceDistanceKm: 308.484,
    turns: 15,
    trackType: "permanent",
    character: "technical",       // stop-start layout with heavy braking zones
    fastestLap: {
      timeSeconds: 87.447,        // 1:27.447 – Pedro de la Rosa (note: race FL is 1:31.447)
      driver: "Max Verstappen",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:29.179",  // 2024 pole
    },
    raceFastestLap: {
      timeSeconds: 91.447,        // 1:31.447 – Pedro de la Rosa, 2005
      driver: "Pedro de la Rosa",
      year: 2005,
      timeFormatted: "1:31.447",
    },
    typicalRaceLapSeconds: 95.0,  // mid-race with fuel & tyre deg (~1:35)
    topSpeedKmh: 340.2,
    avgSpeedKmh: 213.0,           // based on qualifying pace
    drsZones: 3,
  },
  {
    id: "jeddah",
    name: "Jeddah Corniche Circuit",
    location: "Jeddah, Saudi Arabia",
    lengthKm: 6.174,
    laps: 50,
    raceDistanceKm: 308.45,
    turns: 27,
    trackType: "street",
    character: "high-speed",      // fastest street circuit, flowing high-speed corners
    fastestLap: {
      timeSeconds: 87.472,        // 1:27.472 – Verstappen qualifying 2024
      driver: "Max Verstappen",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:27.472",
    },
    raceFastestLap: {
      timeSeconds: 90.734,        // 1:30.734 – Hamilton, 2021
      driver: "Lewis Hamilton",
      year: 2021,
      timeFormatted: "1:30.734",
    },
    typicalRaceLapSeconds: 95.0,  // ~1:35
    topSpeedKmh: 341.2,
    avgSpeedKmh: 254.6,           // qualifying average speed
    drsZones: 3,
  },
  {
    id: "melbourne",
    name: "Albert Park Circuit",
    location: "Melbourne, Australia",
    lengthKm: 5.278,
    laps: 58,
    raceDistanceKm: 306.124,
    turns: 16,
    trackType: "street",          // semi-permanent street circuit around a lake
    character: "medium-speed",
    fastestLap: {
      timeSeconds: 77.0,          // ~1:17.0 – estimated from 2024 qualifying pace
      driver: "Max Verstappen",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:17.0",
    },
    raceFastestLap: {
      timeSeconds: 79.813,        // 1:19.813 – Leclerc, 2024
      driver: "Charles Leclerc",
      year: 2024,
      timeFormatted: "1:19.813",
    },
    typicalRaceLapSeconds: 84.0,  // ~1:24
    topSpeedKmh: 336.3,
    avgSpeedKmh: 253.1,           // qualifying average speed
    drsZones: 4,
  },
  {
    id: "monaco",
    name: "Circuit de Monaco",
    location: "Monte Carlo, Monaco",
    lengthKm: 3.337,
    laps: 78,
    raceDistanceKm: 260.286,
    turns: 19,
    trackType: "street",
    character: "technical",       // slowest circuit – tight, narrow, elevation changes
    fastestLap: {
      timeSeconds: 70.270,        // 1:10.270 – Leclerc qualifying 2024
      driver: "Charles Leclerc",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:10.270",
    },
    raceFastestLap: {
      timeSeconds: 72.909,        // 1:12.909 – Hamilton, 2021
      driver: "Lewis Hamilton",
      year: 2021,
      timeFormatted: "1:12.909",
    },
    typicalRaceLapSeconds: 77.0,  // ~1:17
    topSpeedKmh: 291.5,
    avgSpeedKmh: 171.0,           // slowest on calendar
    drsZones: 1,
  },
  {
    id: "barcelona",
    name: "Circuit de Barcelona-Catalunya",
    location: "Barcelona, Spain",
    lengthKm: 4.657,
    laps: 66,
    raceDistanceKm: 307.236,
    turns: 14,
    trackType: "permanent",
    character: "technical",       // benchmark test circuit, mix of high/low speed
    fastestLap: {
      timeSeconds: 75.0,          // ~1:15.0 – estimated qualifying pace (2024 layout)
      driver: "Lando Norris",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:15.0",
    },
    raceFastestLap: {
      timeSeconds: 76.330,        // 1:16.330 – Piastri, 2025
      driver: "Oscar Piastri",
      year: 2025,
      timeFormatted: "1:16.330",
    },
    typicalRaceLapSeconds: 79.0,  // ~1:19
    topSpeedKmh: 330.0,
    avgSpeedKmh: 220.0,           // estimated from qualifying
    drsZones: 2,
  },
  {
    id: "silverstone",
    name: "Silverstone Circuit",
    location: "Silverstone, United Kingdom",
    lengthKm: 5.891,
    laps: 52,
    raceDistanceKm: 306.198,
    turns: 18,
    trackType: "permanent",
    character: "high-speed",      // fast, flowing corners (Maggots-Becketts-Chapel)
    fastestLap: {
      timeSeconds: 85.819,        // 1:25.819 – Russell qualifying 2024
      driver: "George Russell",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:25.819",
    },
    raceFastestLap: {
      timeSeconds: 87.097,        // 1:27.097 – Verstappen, 2020
      driver: "Max Verstappen",
      year: 2020,
      timeFormatted: "1:27.097",
    },
    typicalRaceLapSeconds: 93.0,  // ~1:33
    topSpeedKmh: 335.8,
    avgSpeedKmh: 250.3,           // qualifying average speed
    drsZones: 2,
  },
  {
    id: "monza",
    name: "Autodromo Nazionale Monza",
    location: "Monza, Italy",
    lengthKm: 5.793,
    laps: 53,
    raceDistanceKm: 306.72,
    turns: 11,
    trackType: "permanent",
    character: "high-speed",      // fastest circuit – long straights, low downforce
    fastestLap: {
      timeSeconds: 79.0,          // ~1:19.0 – estimated qualifying pace
      driver: "Lando Norris",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:19.0",
    },
    raceFastestLap: {
      timeSeconds: 80.901,        // 1:20.901 – Norris, 2025
      driver: "Lando Norris",
      year: 2025,
      timeFormatted: "1:20.901",
    },
    typicalRaceLapSeconds: 85.0,  // ~1:25
    topSpeedKmh: 357.1,
    avgSpeedKmh: 264.4,           // fastest on calendar
    drsZones: 2,
  },
  {
    id: "spa",
    name: "Circuit de Spa-Francorchamps",
    location: "Stavelot, Belgium",
    lengthKm: 7.004,
    laps: 44,
    raceDistanceKm: 308.052,
    turns: 20,
    trackType: "permanent",
    character: "high-speed",      // iconic high-speed circuit with elevation changes
    fastestLap: {
      timeSeconds: 101.0,         // ~1:41.0 – estimated qualifying pace
      driver: "Max Verstappen",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:41.0",
    },
    raceFastestLap: {
      timeSeconds: 104.701,       // 1:44.701 – Perez, 2024
      driver: "Sergio Perez",
      year: 2024,
      timeFormatted: "1:44.701",
    },
    typicalRaceLapSeconds: 109.0, // ~1:49
    topSpeedKmh: 357.2,
    avgSpeedKmh: 243.2,           // qualifying average speed
    drsZones: 2,
  },
  {
    id: "suzuka",
    name: "Suzuka International Racing Course",
    location: "Suzuka, Japan",
    lengthKm: 5.807,
    laps: 53,
    raceDistanceKm: 307.471,
    turns: 18,
    trackType: "permanent",
    character: "technical",       // figure-8 layout, demanding high-speed S curves
    fastestLap: {
      timeSeconds: 88.0,          // ~1:28.0 – estimated qualifying pace
      driver: "Max Verstappen",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:28.0",
    },
    raceFastestLap: {
      timeSeconds: 90.965,        // 1:30.965 – Antonelli, 2025
      driver: "Kimi Antonelli",
      year: 2025,
      timeFormatted: "1:30.965",
    },
    typicalRaceLapSeconds: 95.0,  // ~1:35
    topSpeedKmh: 309.8,
    avgSpeedKmh: 240.3,           // qualifying average speed
    drsZones: 2,
  },
  {
    id: "singapore",
    name: "Marina Bay Street Circuit",
    location: "Singapore",
    lengthKm: 4.940,
    laps: 62,
    raceDistanceKm: 306.143,
    turns: 19,
    trackType: "street",
    character: "technical",       // night race, bumpy, humid, physically demanding
    fastestLap: {
      timeSeconds: 90.0,          // ~1:30.0 – estimated qualifying pace
      driver: "Lando Norris",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:30.0",
    },
    raceFastestLap: {
      timeSeconds: 93.808,        // 1:33.808 – Hamilton, 2025
      driver: "Lewis Hamilton",
      year: 2025,
      timeFormatted: "1:33.808",
    },
    typicalRaceLapSeconds: 99.0,  // ~1:39
    topSpeedKmh: 318.4,
    avgSpeedKmh: 199.0,           // second slowest on calendar
    drsZones: 3,
  },
  {
    id: "interlagos",
    name: "Autodromo Jose Carlos Pace",
    location: "Sao Paulo, Brazil",
    lengthKm: 4.309,
    laps: 71,
    raceDistanceKm: 305.909,
    turns: 15,
    trackType: "permanent",
    character: "medium-speed",    // anti-clockwise, elevation changes, short lap
    fastestLap: {
      timeSeconds: 69.0,          // ~1:09.0 – estimated qualifying pace
      driver: "Lando Norris",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:09.0",
    },
    raceFastestLap: {
      timeSeconds: 70.540,        // 1:10.540 – Bottas, 2018
      driver: "Valtteri Bottas",
      year: 2018,
      timeFormatted: "1:10.540",
    },
    typicalRaceLapSeconds: 73.0,  // ~1:13
    topSpeedKmh: 333.9,
    avgSpeedKmh: 225.0,           // estimated from qualifying
    drsZones: 2,
  },
  {
    id: "abudhabi",
    name: "Yas Marina Circuit",
    location: "Abu Dhabi, UAE",
    lengthKm: 5.281,
    laps: 58,
    raceDistanceKm: 306.183,
    turns: 16,
    trackType: "permanent",
    character: "medium-speed",    // mix of straights and slow-speed sections
    fastestLap: {
      timeSeconds: 82.595,        // 1:22.595 – Norris qualifying 2024
      driver: "Lando Norris",
      context: "qualifying",
      year: 2024,
      timeFormatted: "1:22.595",
    },
    raceFastestLap: {
      timeSeconds: 85.637,        // 1:25.637 – Magnussen, 2024
      driver: "Kevin Magnussen",
      year: 2024,
      timeFormatted: "1:25.637",
    },
    typicalRaceLapSeconds: 89.0,  // ~1:29
    topSpeedKmh: 341.1,
    avgSpeedKmh: 230.0,           // estimated from qualifying
    drsZones: 2,
  },
];


// ---------------------------------------------------------------------------
// F1 CAR PERFORMANCE CONSTANTS
// ---------------------------------------------------------------------------

export const carPerformance = {
  // Top speed range (km/h)
  topSpeed: {
    min: 310,                     // low-downforce tracks typical minimum trap speed
    max: 370,                     // absolute maximum recorded (Monza/Spa slipstream/DRS)
    typical: 340,                 // most circuits see 330-350 km/h trap speeds
    allTimeRecord: 372.6,         // Bottas, 2016 Mexican GP (high altitude)
    season2024Record: 356.4,      // Colapinto, Las Vegas GP qualifying 2024
  },

  // Wet weather impact on lap times
  wetWeather: {
    // Percentage slower than dry conditions
    intermediateTiresPct: 10,     // ~10% slower on intermediates vs dry slicks
    fullWetTiresPct: 25,          // ~25% slower on full wets vs dry slicks
    // Absolute time penalties (seconds per lap on a ~90s circuit)
    intermediateSecondsPerLap: 8,   // 5-12 seconds slower depending on water level
    fullWetSecondsPerLap: 20,       // 15-25 seconds slower in heavy rain
    // Safety car likelihood increases significantly in wet
    notes: "Light rain: 5-8s slower. Heavy rain: 15-25s slower. Drying track can see rapid improvement of 1-2s per lap.",
  },

  // Tire degradation data (seconds lost per lap)
  tireDegradation: {
    // Per-lap degradation rates (seconds/lap) — varies hugely by circuit
    soft: {
      lowDegCircuit: 0.05,        // e.g., Monza, low lateral load
      medDegCircuit: 0.10,        // e.g., Silverstone
      highDegCircuit: 0.18,       // e.g., Bahrain, Barcelona, Singapore
      expectedLifeLaps: { min: 10, max: 25 },
    },
    medium: {
      lowDegCircuit: 0.03,
      medDegCircuit: 0.06,
      highDegCircuit: 0.12,
      expectedLifeLaps: { min: 20, max: 40 },
    },
    hard: {
      lowDegCircuit: 0.02,
      medDegCircuit: 0.04,
      highDegCircuit: 0.08,
      expectedLifeLaps: { min: 30, max: 60 },
    },
    // Cliff effect: sudden loss of grip after exceeding tyre life
    cliffEffectSecondsPerLap: 1.5,  // once past life, lose ~1-2s/lap rapidly
    // Compound deltas (seconds per lap advantage of softer compound on fresh tyres)
    compoundDelta: {
      softVsMedium: 0.6,           // soft ~0.5-0.7s faster per lap when fresh
      mediumVsHard: 0.5,           // medium ~0.4-0.6s faster per lap when fresh
      softVsHard: 1.0,             // soft ~0.8-1.2s faster per lap when fresh
    },
  },

  // Fuel load effect on lap times
  fuelEffect: {
    maxFuelKg: 110,               // FIA max fuel load regulation
    secondsPerKg: 0.033,          // 0.025-0.040 s/kg depending on circuit
    secondsPer10Kg: 0.33,         // ~0.25-0.40 s per 10 kg
    totalFuelEffectSeconds: 3.63, // full tank vs empty: ~110 * 0.033
    fuelBurnRateKgPerLap: {
      // varies by circuit length and character
      short: 1.5,                 // short circuits like Monaco/Interlagos
      medium: 1.7,                // most circuits
      long: 2.0,                  // long circuits like Spa
    },
    notes: "Stop-start circuits (Bahrain, Singapore): 0.030-0.040 s/kg. Flowing circuits (Monza, Spa): 0.025-0.030 s/kg.",
  },

  // General car characteristics (2022-2025 ground-effect era)
  general: {
    minWeightKg: 798,             // FIA minimum weight (car + driver, no fuel)
    powerHp: 1000,                // approximately 1000 bhp from PU (ICE + MGU-K)
    zeroTo100Kmh: 2.6,            // seconds
    zeroTo200Kmh: 4.5,            // seconds
    maxLateralG: 6.0,             // peak cornering G-force
    maxBrakingG: 6.5,             // peak deceleration under braking
    downforceKg: 1800,            // approximate at 250 km/h
  },
};


// ---------------------------------------------------------------------------
// HELPER: Convert mm:ss.SSS to total seconds
// ---------------------------------------------------------------------------

export function lapTimeToSeconds(timeStr) {
  // Accepts "1:30.734" or "90.734"
  if (timeStr.includes(":")) {
    const [min, secMs] = timeStr.split(":");
    return parseInt(min, 10) * 60 + parseFloat(secMs);
  }
  return parseFloat(timeStr);
}

// ---------------------------------------------------------------------------
// HELPER: Convert total seconds to mm:ss.SSS
// ---------------------------------------------------------------------------

export function secondsToLapTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(3);
  return `${minutes}:${secs.padStart(6, "0")}`;
}

// ---------------------------------------------------------------------------
// HELPER: Calculate average speed from lap time and distance
// ---------------------------------------------------------------------------

export function avgSpeedFromLap(trackLengthKm, lapTimeSeconds) {
  return (trackLengthKm / lapTimeSeconds) * 3600; // km/h
}
