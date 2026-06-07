import { useState, useEffect } from 'react';
import {
  Trophy, Activity, Users, BarChart3, Timer, ChevronDown,
  Loader2, AlertCircle, Radio, Fuel, Gauge, Flag, ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getSeasons, getEvents, getRaceResults, getTelemetry,
  getStandings, compareDrivers, getSessionSummary, checkBackendHealth
} from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, Cell,
} from 'recharts';

const TABS = [
  { id: 'results', label: 'Race Results', icon: Trophy },
  { id: 'telemetry', label: 'Telemetry', icon: Activity },
  { id: 'compare', label: 'Compare', icon: Users },
  { id: 'standings', label: 'Standings', icon: BarChart3 },
];

const SESSIONS = [
  { id: 'FP1', label: 'FP1' },
  { id: 'FP2', label: 'FP2' },
  { id: 'FP3', label: 'FP3' },
  { id: 'Q', label: 'Qualifying' },
  { id: 'R', label: 'Race' },
];

const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'AlphaTauri': '#5E8FAA',
  'RB': '#6692FF',
  'Alfa Romeo': '#C92D4B',
  'Haas F1 Team': '#B6BABD',
  'Kick Sauber': '#52E252',
};

function getTeamColor(team, fallbackHex) {
  if (fallbackHex && fallbackHex !== 'None') return `#${fallbackHex}`;
  return TEAM_COLORS[team] || '#6b7280';
}

const tooltipStyle = {
  backgroundColor: '#111827',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '12px',
};

// ────────────────────────────────────────────────
// Shared selectors
// ────────────────────────────────────────────────

function SeasonSelector({ season, setSeason, seasons }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Season</label>
      <select
        value={season}
        onChange={e => setSeason(Number(e.target.value))}
        className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none"
      >
        {seasons.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
}

function GPSelector({ gp, setGp, events, loading }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Grand Prix</label>
      <select
        value={gp}
        onChange={e => setGp(e.target.value)}
        disabled={loading || events.length === 0}
        className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none disabled:opacity-50"
      >
        <option value="">Select Grand Prix</option>
        {events.map(ev => (
          <option key={ev.round} value={ev.name}>{ev.name}</option>
        ))}
      </select>
    </div>
  );
}

function StatusBanner({ isOnline }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
    }`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      {isOnline ? 'Backend Connected' : 'Backend Offline'}
    </div>
  );
}

function LoadingSpinner({ text = 'Loading data...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-10 h-10 text-red-500 animate-spin mb-4" />
      <p className="text-gray-400 text-sm">{text}</p>
      <p className="text-gray-600 text-xs mt-1">FastF1 may take a moment to download session data</p>
    </div>
  );
}

function ErrorBox({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-gray-300 font-medium mb-2">Something went wrong</p>
      <p className="text-gray-500 text-sm text-center max-w-md mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium cursor-pointer border-none transition-all">
          Retry
        </button>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// TAB 1: Race Results
// ────────────────────────────────────────────────

function RaceResultsTab({ season, gp, events, loadingEvents }) {
  const [localSeason, setLocalSeason] = useState(season);
  const [localGp, setLocalGp] = useState(gp);
  const [localEvents, setLocalEvents] = useState(events);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  useEffect(() => {
    if (localSeason !== season) {
      getEvents(localSeason).then(d => setLocalEvents(d.events || [])).catch(() => {});
    }
  }, [localSeason]);

  const fetchResults = async () => {
    if (!localGp) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRaceResults(localSeason, localGp);
      setResults(data.results || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SeasonSelector season={localSeason} setSeason={setLocalSeason} seasons={Array.from({length: 8}, (_, i) => 2025 - i)} />
        <GPSelector gp={localGp} setGp={setLocalGp} events={localEvents} loading={loadingEvents} />
        <div className="flex items-end">
          <button
            onClick={fetchResults}
            disabled={!localGp || loading}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-red-500/30 transition-all"
          >
            {loading ? 'Loading...' : 'Fetch Results'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Fetching race results..." />}
      {error && <ErrorBox message={error} onRetry={fetchResults} />}

      {results && !loading && (
        <div className="rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900/80">
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Pos</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Driver</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Team</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Grid</th>
                <th className="px-4 py-3 text-left text-gray-400 font-medium">Status</th>
                <th className="px-4 py-3 text-right text-gray-400 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                      r.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      r.position === 2 ? 'bg-gray-400/20 text-gray-300' :
                      r.position === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {r.position ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white font-medium">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: getTeamColor(r.team, r.teamColor) }} />
                      {r.fullName || r.driver}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{r.team}</td>
                  <td className="px-4 py-3 text-gray-400">{r.gridPosition ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      r.status === 'Finished' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {r.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-white">{r.points ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// TAB 2: Telemetry Viewer
// ────────────────────────────────────────────────

function TelemetryTab({ season, events }) {
  const [localSeason, setLocalSeason] = useState(season);
  const [localGp, setLocalGp] = useState('');
  const [localEvents, setLocalEvents] = useState(events);
  const [sessionType, setSessionType] = useState('Q');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [error, setError] = useState(null);
  const [activeTrace, setActiveTrace] = useState('speed');

  useEffect(() => { setLocalEvents(events); }, [events]);
  useEffect(() => {
    if (localSeason !== season) {
      getEvents(localSeason).then(d => setLocalEvents(d.events || [])).catch(() => {});
    }
  }, [localSeason]);

  // Fetch drivers when GP + session selected
  const fetchDrivers = async () => {
    if (!localGp || !sessionType) return;
    setLoadingDrivers(true);
    try {
      const data = await getSessionSummary(localSeason, localGp, sessionType);
      setDrivers(data.drivers || []);
      setSelectedDriver('');
    } catch { setDrivers([]); }
    finally { setLoadingDrivers(false); }
  };

  useEffect(() => { if (localGp && sessionType) fetchDrivers(); }, [localGp, sessionType]);

  const fetchTelemetry = async () => {
    if (!selectedDriver) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTelemetry(localSeason, localGp, sessionType, selectedDriver);
      setTelemetry(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const traces = [
    { id: 'speed', label: 'Speed', color: '#ef4444', unit: 'km/h' },
    { id: 'throttle', label: 'Throttle', color: '#22c55e', unit: '%' },
    { id: 'gear', label: 'Gear', color: '#a855f7', unit: '' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <SeasonSelector season={localSeason} setSeason={setLocalSeason} seasons={Array.from({length: 8}, (_, i) => 2025 - i)} />
        <GPSelector gp={localGp} setGp={setLocalGp} events={localEvents} />
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Session</label>
          <select value={sessionType} onChange={e => setSessionType(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none">
            {SESSIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Driver</label>
          <select value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)} disabled={drivers.length === 0} className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none disabled:opacity-50">
            <option value="">{loadingDrivers ? 'Loading...' : 'Select Driver'}</option>
            {drivers.map(d => <option key={d.code} value={d.code}>{d.code} — {d.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchTelemetry}
            disabled={!selectedDriver || loading}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-emerald-500/30 transition-all"
          >
            {loading ? 'Loading...' : 'Load Telemetry'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Downloading telemetry data..." />}
      {error && <ErrorBox message={error} onRetry={fetchTelemetry} />}

      {telemetry && !loading && (
        <div className="space-y-6">
          {/* Lap info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Driver', value: telemetry.driver, icon: Users },
              { label: 'Lap', value: `#${telemetry.lapNumber}`, icon: Flag },
              { label: 'Lap Time', value: telemetry.lapTime || '—', icon: Timer },
              { label: 'Compound', value: telemetry.compound || '—', icon: Fuel },
            ].map((card, i) => (
              <div key={i} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <card.icon className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500">{card.label}</span>
                </div>
                <div className="text-lg font-bold text-white">{card.value}</div>
              </div>
            ))}
          </div>

          {/* Trace selector */}
          <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
            <div className="flex items-center gap-3 mb-6">
              {traces.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTrace(t.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none bg-transparent ${
                    activeTrace === t.id ? 'bg-gray-800 text-white border border-gray-700' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: t.color }} />
                  {t.label}
                </button>
              ))}
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={telemetry.telemetry}>
                  <defs>
                    <linearGradient id="telGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={traces.find(t => t.id === activeTrace)?.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={traces.find(t => t.id === activeTrace)?.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="distance" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} label={{ value: 'Distance (m)', position: 'insideBottom', offset: -5, fill: '#6b7280', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey={activeTrace} stroke={traces.find(t => t.id === activeTrace)?.color} strokeWidth={1.5} fill="url(#telGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// TAB 3: Driver Comparison
// ────────────────────────────────────────────────

function CompareTab({ season, events }) {
  const [localSeason, setLocalSeason] = useState(season);
  const [localGp, setLocalGp] = useState('');
  const [localEvents, setLocalEvents] = useState(events);
  const [sessionType, setSessionType] = useState('Q');
  const [drivers, setDrivers] = useState([]);
  const [driver1, setDriver1] = useState('');
  const [driver2, setDriver2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setLocalEvents(events); }, [events]);
  useEffect(() => {
    if (localSeason !== season) {
      getEvents(localSeason).then(d => setLocalEvents(d.events || [])).catch(() => {});
    }
  }, [localSeason]);

  useEffect(() => {
    if (localGp && sessionType) {
      getSessionSummary(localSeason, localGp, sessionType)
        .then(d => { setDrivers(d.drivers || []); setDriver1(''); setDriver2(''); })
        .catch(() => setDrivers([]));
    }
  }, [localGp, sessionType]);

  const fetchComparison = async () => {
    if (!driver1 || !driver2) return;
    setLoading(true);
    setError(null);
    try {
      const data = await compareDrivers(localSeason, localGp, sessionType, driver1, driver2);
      setComparison(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Merge telemetry for overlay
  const mergedData = comparison ? (() => {
    const map = new Map();
    comparison.driver1.telemetry.forEach(p => {
      const key = Math.round(p.distance / 20) * 20;
      map.set(key, { distance: key, speed1: p.speed, throttle1: p.throttle });
    });
    comparison.driver2.telemetry.forEach(p => {
      const key = Math.round(p.distance / 20) * 20;
      const existing = map.get(key) || { distance: key };
      existing.speed2 = p.speed;
      existing.throttle2 = p.throttle;
      map.set(key, existing);
    });
    return Array.from(map.values()).sort((a, b) => a.distance - b.distance);
  })() : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SeasonSelector season={localSeason} setSeason={setLocalSeason} seasons={Array.from({length: 8}, (_, i) => 2025 - i)} />
        <GPSelector gp={localGp} setGp={setLocalGp} events={localEvents} />
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Session</label>
          <select value={sessionType} onChange={e => setSessionType(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none">
            {SESSIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Driver 1</label>
          <select value={driver1} onChange={e => setDriver1(e.target.value)} disabled={drivers.length === 0} className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-red-500/30 text-white text-sm focus:border-red-500 focus:outline-none disabled:opacity-50">
            <option value="">Select</option>
            {drivers.map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Driver 2</label>
          <select value={driver2} onChange={e => setDriver2(e.target.value)} disabled={drivers.length === 0} className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none disabled:opacity-50">
            <option value="">Select</option>
            {drivers.filter(d => d.code !== driver1).map(d => <option key={d.code} value={d.code}>{d.code}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={fetchComparison}
            disabled={!driver1 || !driver2 || loading}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-purple-500/30 transition-all"
          >
            {loading ? 'Loading...' : 'Compare'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Comparing drivers..." />}
      {error && <ErrorBox message={error} onRetry={fetchComparison} />}

      {comparison && !loading && (
        <div className="space-y-6">
          {/* Lap time cards */}
          <div className="grid grid-cols-2 gap-4">
            {[comparison.driver1, comparison.driver2].map((drv, i) => (
              <div key={i} className={`p-5 rounded-xl border ${i === 0 ? 'border-red-500/30 bg-red-500/5' : 'border-cyan-500/30 bg-cyan-500/5'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-red-500' : 'bg-cyan-400'}`} />
                  <span className="text-lg font-bold text-white">{drv.driver}</span>
                </div>
                <div className="text-2xl font-bold text-white">{drv.lapTime || '—'}</div>
                <div className="text-sm text-gray-400 mt-1">{drv.compound || 'Unknown'} compound</div>
              </div>
            ))}
          </div>

          {/* Speed overlay */}
          <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Speed Comparison (km/h)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="distance" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="speed1" name={comparison.driver1.driver} stroke="#ef4444" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" dataKey="speed2" name={comparison.driver2.driver} stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Throttle overlay */}
          <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
            <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Throttle Comparison (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mergedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="distance" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Area type="monotone" dataKey="throttle1" name={comparison.driver1.driver} stroke="#ef4444" fill="#ef444420" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="throttle2" name={comparison.driver2.driver} stroke="#06b6d4" fill="#06b6d420" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// TAB 4: Standings
// ────────────────────────────────────────────────

function StandingsTab({ season }) {
  const [localSeason, setLocalSeason] = useState(season);
  const [standings, setStandings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConstructors, setShowConstructors] = useState(false);

  const fetchStandings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStandings(localSeason);
      setStandings(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <SeasonSelector season={localSeason} setSeason={setLocalSeason} seasons={Array.from({length: 8}, (_, i) => 2025 - i)} />
        <div className="flex items-end">
          <button onClick={fetchStandings} disabled={loading} className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-amber-500/30 transition-all">
            {loading ? 'Loading...' : 'Fetch Standings'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Computing standings..." />}
      {error && <ErrorBox message={error} onRetry={fetchStandings} />}

      {standings && !loading && (
        <div className="space-y-6">
          {standings.note && (
            <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              ℹ️ {standings.note}
            </div>
          )}

          {/* Toggle */}
          <div className="flex gap-2">
            {['Drivers', 'Constructors'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setShowConstructors(i === 1)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none bg-transparent ${
                  (i === 0 && !showConstructors) || (i === 1 && showConstructors)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {!showConstructors ? (
            /* Drivers table */
            <div className="rounded-xl border border-gray-800 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900/80">
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Pos</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Driver</th>
                    <th className="px-4 py-3 text-left text-gray-400 font-medium">Team</th>
                    <th className="px-4 py-3 text-right text-gray-400 font-medium">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.drivers.map((d, i) => (
                    <tr key={i} className="border-t border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          d.position === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                          d.position === 2 ? 'bg-gray-400/20 text-gray-300' :
                          d.position === 3 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-800 text-gray-400'
                        }`}>{d.position}</span>
                      </td>
                      <td className="px-4 py-3 text-white font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: getTeamColor(d.team, d.teamColor) }} />
                          {d.fullName || d.driver}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{d.team}</td>
                      <td className="px-4 py-3 text-right font-bold text-white">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Constructors bar chart */
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={standings.constructors} layout="vertical" margin={{ left: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis type="number" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                      <YAxis dataKey="team" type="category" stroke="#6b7280" tick={{ fill: '#e5e7eb', fontSize: 12 }} width={100} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="points" radius={[0, 6, 6, 0]}>
                        {standings.constructors.map((entry, idx) => (
                          <Cell key={idx} fill={getTeamColor(entry.team)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────────

export default function LiveData() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('results');
  const [season, setSeason] = useState(2024);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Check backend health
  useEffect(() => {
    checkBackendHealth().then(setIsOnline);
    const interval = setInterval(() => checkBackendHealth().then(setIsOnline), 15000);
    return () => clearInterval(interval);
  }, []);

  // Load events for default season
  useEffect(() => {
    setLoadingEvents(true);
    getEvents(season)
      .then(d => setEvents(d.events || []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, [season]);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Live F1 Data
            </h1>
            <p className="text-gray-400 mt-2">
              Real-world race results, telemetry, and standings powered by FastF1
            </p>
          </div>
          <StatusBanner isOnline={isOnline} />
        </div>

        {/* Offline warning */}
        {!isOnline && (
          <div className="mb-8 p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-amber-400 font-bold mb-1">Backend Server Not Running</h3>
                <p className="text-gray-400 text-sm mb-3">
                  The FastF1 Python backend needs to be running to fetch real F1 data. Start it with:
                </p>
                <div className="bg-black/50 rounded-lg px-4 py-3 font-mono text-sm text-emerald-400">
                  cd backend && pip install -r requirements.txt && python main.py
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl bg-gray-900/50 border border-gray-800 overflow-x-auto">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer border-none whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600/20 to-blue-600/20 text-white border border-gray-700'
                    : 'text-gray-500 hover:text-gray-300 bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'results' && <RaceResultsTab season={season} gp="" events={events} loadingEvents={loadingEvents} />}
        {activeTab === 'telemetry' && <TelemetryTab season={season} events={events} />}
        {activeTab === 'compare' && <CompareTab season={season} events={events} />}
        {activeTab === 'standings' && <StandingsTab season={season} />}
      </div>
    </div>
  );
}
