import { useState, useEffect } from 'react';
import { Play, RotateCcw, Gauge, Timer, Zap, Shield, ArrowRight, Activity, Save, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TRACKS, WEATHER_OPTIONS } from '../data/components';
import { circuits, carPerformance } from '../data/circuitData';
import TrackAnimation from './TrackAnimation';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart, Legend,
} from 'recharts';
import { getFastestLap, checkBackendHealth } from '../services/api';

function generateSimData(engine, tires, brakes, track, weather, laps) {
  const circuit = circuits.find(c => c.id === track.id);
  if (!circuit) return null;

  const basePower = parseInt(engine.power);
  const powerFactor = basePower / 1010;
  const gripFactor = tires.grip / 100;
  const brakeFactor = brakes.stopping / 100;
  const durability = tires.durability / 100;
  const reliability = engine.reliability / 100;

  const weatherLapMult = weather === 'Wet' ? 1.10 : weather === 'Mixed' ? 1.05 : 1.0;
  const weatherSpeedMult = weather === 'Wet' ? 0.92 : weather === 'Mixed' ? 0.96 : 1.0;

  const realTopSpeed = circuit.topSpeedKmh;
  const topSpeed = Math.round(realTopSpeed * powerFactor * weatherSpeedMult);

  const realAvgSpeed = circuit.avgSpeedKmh;
  const avgSpeedFactor = 0.5 + gripFactor * 0.3 + brakeFactor * 0.2;
  const avgSpeed = Math.round(realAvgSpeed * avgSpeedFactor * powerFactor * weatherSpeedMult);

  const realBestLapSec = circuit.raceFastestLap.timeSeconds;
  const gripPenalty = (1 - gripFactor) * 8;
  const brakePenalty = (1 - brakeFactor) * 5;
  const powerPenalty = (1 - powerFactor) * 3;
  const bestLapSec = (realBestLapSec + gripPenalty + brakePenalty + powerPenalty) * weatherLapMult;
  const bestLapMin = Math.floor(bestLapSec / 60);
  const bestLapRemSec = (bestLapSec % 60).toFixed(1);

  const tireType = tires.type?.toLowerCase() || 'medium';
  const circuitDegLevel = circuit.character === 'high-speed' ? 'lowDegCircuit'
    : circuit.character === 'medium-speed' ? 'medDegCircuit' : 'highDegCircuit';
  const compound = tireType === 'soft' ? 'soft' : tireType === 'hard' ? 'hard' : 'medium';
  const baseDegRate = carPerformance.tireDegradation[compound][circuitDegLevel];
  const degRate = baseDegRate * (1.5 - durability);

  const fuelBurnType = circuit.lengthKm > 6 ? 'long' : circuit.lengthKm < 4.5 ? 'short' : 'medium';
  const fuelBurnPerLap = carPerformance.fuelEffect.fuelBurnRateKgPerLap[fuelBurnType];
  const secPerKgFuel = carPerformance.fuelEffect.secondsPerKg;

  const typicalRaceLap = circuit.typicalRaceLapSeconds;
  const adjustedTypicalLap = (typicalRaceLap + gripPenalty + brakePenalty + powerPenalty) * weatherLapMult;

  const lapData = [];
  const totalFuelKg = Math.min(carPerformance.fuelEffect.maxFuelKg, laps * fuelBurnPerLap);

  for (let i = 1; i <= laps; i++) {
    const fuelRemaining = Math.max(0, totalFuelKg - (i - 1) * fuelBurnPerLap);
    const fuelTimePenalty = fuelRemaining * secPerKgFuel;
    const tireDegSeconds = degRate * i;
    const tireLife = carPerformance.tireDegradation[compound].expectedLifeLaps;
    const cliffPenalty = i > tireLife.max ? (i - tireLife.max) * carPerformance.tireDegradation.cliffEffectSecondsPerLap : 0;
    const randomness = -0.3 + Math.random() * 0.6;
    const lapTime = adjustedTypicalLap + fuelTimePenalty + tireDegSeconds + cliffPenalty + randomness - (totalFuelKg * secPerKgFuel * 0.5);
    const lapAvgSpeed = (circuit.lengthKm / lapTime) * 3600;
    const speed = Math.round(lapAvgSpeed);
    const tireWear = Math.min(100, Math.round((tireDegSeconds / (realBestLapSec * 0.05)) * 100));
    lapData.push({ lap: i, lapTime: Math.round(lapTime * 100) / 100, speed, tireWear });
  }

  return {
    topSpeed, avgSpeed,
    bestLap: `${bestLapMin}:${bestLapRemSec.padStart(4, '0')}`,
    reliability: Math.round(reliability * 100),
    lapData,
  };
}

export default function Simulation() {
  const { state, dispatch } = useApp();
  const { selectedEngine, selectedTires, selectedBrakes, simulationSettings, simulationResults, isSimulating } = state;
  const [localTrack, setLocalTrack] = useState(simulationSettings.track || '');
  const [localWeather, setLocalWeather] = useState(simulationSettings.weather);
  const [localLaps, setLocalLaps] = useState(simulationSettings.laps);
  const [configName, setConfigName] = useState('');
  const [activeChart, setActiveChart] = useState('speed');
  const [realData, setRealData] = useState(null);
  const [loadingReal, setLoadingReal] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend on mount
  useEffect(() => {
    checkBackendHealth().then(setBackendOnline);
  }, []);

  const allSelected = selectedEngine && selectedTires && selectedBrakes;
  const selectedTrackData = TRACKS.find(t => t.id === localTrack);

  const handleRun = () => {
    if (!allSelected || !localTrack) return;
    const track = TRACKS.find(t => t.id === localTrack);
    dispatch({ type: 'SET_SIMULATION_SETTINGS', payload: { track: localTrack, weather: localWeather, laps: localLaps } });
    dispatch({ type: 'START_SIMULATION' });
    setTimeout(() => {
      try {
        const results = generateSimData(selectedEngine, selectedTires, selectedBrakes, track, localWeather, localLaps);
        dispatch({ type: 'FINISH_SIMULATION', payload: results });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Simulation complete!' } });
      } catch {
        dispatch({ type: 'FINISH_SIMULATION', payload: null });
        dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: 'Simulation failed.' } });
      }
    }, 2500);
  };

  const handleSaveConfig = () => {
    if (!configName.trim() || !allSelected) return;
    dispatch({ type: 'SAVE_CONFIG', payload: { name: configName.trim(), engine: selectedEngine, tires: selectedTires, brakes: selectedBrakes, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `Configuration "${configName}" saved!` } });
    setConfigName('');
  };

  const handleCalibrateReal = async () => {
    if (!localTrack) return;
    setLoadingReal(true);
    try {
      const data = await getFastestLap(2024, localTrack);
      setRealData(data);
    } catch (e) {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'error', message: `Could not fetch real data: ${e.message}` } });
    } finally {
      setLoadingReal(false);
    }
  };

  const handleReset = () => {
    dispatch({ type: 'FINISH_SIMULATION', payload: null });
  };

  const metricCards = simulationResults ? [
    { label: 'Top Speed', value: simulationResults.topSpeed, unit: 'km/h', icon: Gauge, color: 'from-red-500 to-orange-500', glow: 'shadow-red-500/30' },
    { label: 'Average Speed', value: simulationResults.avgSpeed, unit: 'km/h', icon: Zap, color: 'from-amber-500 to-yellow-400', glow: 'shadow-amber-500/30' },
    { label: 'Best Lap', value: simulationResults.bestLap, unit: '', icon: Timer, color: 'from-cyan-500 to-blue-400', glow: 'shadow-cyan-500/30' },
    { label: 'Reliability', value: `${simulationResults.reliability}`, unit: '%', icon: Shield, color: 'from-green-500 to-emerald-400', glow: 'shadow-green-500/30' },
  ] : [];

  const tooltipStyle = { backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Performance Simulator
            </h1>
            <p className="text-gray-400 mt-2">
              {allSelected ? 'Configure track and run simulation' : 'Select components first to run the simulation'}
            </p>
          </div>
          <div className="flex gap-3">
            {simulationResults && (
              <button onClick={handleReset} className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm font-medium cursor-pointer bg-transparent transition-all">
                <RotateCcw className="mr-2 w-4 h-4" /> Reset
              </button>
            )}
            <button
              onClick={handleRun}
              disabled={!allSelected || !localTrack || isSimulating}
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-500 hover:to-purple-400 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-blue-500/30 transition-all"
            >
              {isSimulating ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Simulating...</>
              ) : (
                <><Play className="mr-2 w-4 h-4" /> Run Simulation</>
              )}
            </button>
            {localTrack && backendOnline && (
              <button
                onClick={handleCalibrateReal}
                disabled={loadingReal}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-emerald-500/30 transition-all"
              >
                {loadingReal ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Loading...</>
                ) : (
                  <><Radio className="mr-2 w-4 h-4" /> Calibrate with Real Data</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* No Components */}
        {!allSelected && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <Gauge className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-400">No Components Selected</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Go to Components to select parts for your F1 car, then return here to simulate.</p>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer border-none transition-all"
            >
              Select Components <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        )}

        {allSelected && (
          <>
            {/* Track Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Select Circuit</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {TRACKS.map(t => {
                  const isSelected = localTrack === t.id;
                  const circuitInfo = circuits.find(c => c.id === t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setLocalTrack(t.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer bg-transparent ${
                        isSelected
                          ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      <div className="text-sm font-bold text-white mb-1">{t.flag} {t.name}</div>
                      <div className="text-xs text-gray-500">
                        {t.lengthKm} km · {circuitInfo?.turns || '—'} turns
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weather & Laps */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Weather</label>
                <select
                  value={localWeather}
                  onChange={e => setLocalWeather(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none"
                >
                  {WEATHER_OPTIONS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Laps</label>
                <input
                  type="number" min="1" max="78" value={localLaps}
                  onChange={e => setLocalLaps(Math.max(1, Math.min(78, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Simulation Progress */}
            {isSimulating && (
              <div className="max-w-2xl mx-auto py-20 text-center">
                <div className="w-20 h-20 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Activity className="w-10 h-10 text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Running Simulation</h2>
                <p className="text-gray-400">Analyzing component interactions and computing performance metrics...</p>
                <div className="h-3 bg-gray-800 rounded-full overflow-hidden mt-8">
                  <div className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-full animate-pulse" style={{ width: '70%' }} />
                </div>
              </div>
            )}

            {/* Results */}
            {simulationResults && !isSimulating && (
              <div className="space-y-8">
                {/* Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {metricCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div key={i} className={`group p-5 rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border border-gray-800 hover:border-gray-700 transition-all shadow-lg ${card.glow}`}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-xs text-gray-400 font-medium">{card.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">
                          {card.value}
                          <span className="text-sm text-gray-500 ml-1 font-normal">{card.unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Track Animation */}
                {localTrack && (
                  <TrackAnimation
                    trackId={localTrack}
                    trackImage={selectedTrackData?.image}
                    trackName={selectedTrackData?.name}
                    lapData={simulationResults.lapData}
                    totalLaps={localLaps}
                  />
                )}

                {/* Charts */}
                <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
                  <div className="flex items-center gap-4 mb-6">
                    {[
                      { id: 'speed', label: 'Speed Telemetry', color: 'text-red-400' },
                      { id: 'laptime', label: 'Lap Times', color: 'text-cyan-400' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveChart(tab.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border-none bg-transparent ${
                          activeChart === tab.id
                            ? `bg-gray-800 ${tab.color} border border-gray-700`
                            : 'text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      {activeChart === 'speed' ? (
                        <AreaChart data={simulationResults.lapData}>
                          <defs>
                            <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="lap" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Area type="monotone" dataKey="speed" stroke="#ef4444" strokeWidth={2} fill="url(#speedGrad)" />
                        </AreaChart>
                      ) : (
                        <LineChart data={simulationResults.lapData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                          <XAxis dataKey="lap" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Line type="monotone" dataKey="lapTime" stroke="#06b6d4" strokeWidth={2} dot={false} />
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Real Data Comparison Panel */}
                {realData && simulationResults && (
                  <div className="p-6 rounded-xl border border-emerald-500/30 backdrop-blur-xl bg-emerald-500/5 mt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Radio className="w-5 h-5 text-emerald-400" />
                      Your Build vs. Real F1 Car
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Top Speed', sim: `${simulationResults.topSpeed} km/h`, real: realData.topSpeed ? `${Math.round(realData.topSpeed)} km/h` : '—' },
                        { label: 'Avg Speed', sim: `${simulationResults.avgSpeed} km/h`, real: realData.avgSpeed ? `${Math.round(realData.avgSpeed)} km/h` : '—' },
                        { label: 'Best Lap', sim: simulationResults.bestLap, real: realData.lapTime || '—' },
                        { label: 'Driver', sim: 'Your Build', real: `${realData.driver || '—'} (${realData.team || ''})` },
                      ].map((item, i) => (
                        <div key={i} className="p-4 rounded-lg bg-black/30 border border-gray-800">
                          <div className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{item.label}</div>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm"><span className="text-blue-400">Sim:</span> <span className="text-white font-medium">{item.sim}</span></div>
                            <div className="text-sm"><span className="text-emerald-400">Real:</span> <span className="text-white font-medium">{item.real}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Speed overlay chart */}
                    {realData.telemetry && realData.telemetry.length > 0 && (
                      <div>
                        <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Speed Trace: Real vs Simulated</h4>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={realData.telemetry}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                              <XAxis dataKey="distance" stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                              <YAxis stroke="#6b7280" tick={{ fill: '#6b7280', fontSize: 11 }} />
                              <Tooltip contentStyle={tooltipStyle} />
                              <Legend />
                              <Line type="monotone" dataKey="speed" name="Real (Fastest Lap)" stroke="#10b981" strokeWidth={1.5} dot={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Save Configuration */}
                <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Save className="w-5 h-5 text-blue-400" /> Save Configuration
                  </h3>
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-[200px]">
                      <input
                        type="text" placeholder="Enter build name..."
                        value={configName} onChange={e => setConfigName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSaveConfig()}
                        className="w-full px-4 py-3 rounded-lg bg-black/50 border border-gray-700 text-white text-sm focus:border-red-500 focus:outline-none"
                      />
                    </div>
                    <button
                      onClick={handleSaveConfig}
                      disabled={!configName.trim()}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-red-500/30 transition-all"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Navigate */}
                <div className="flex items-center justify-between p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50">
                  <div>
                    <p className="text-gray-400 text-sm">Want to view all saved builds?</p>
                    <p className="font-bold">View your saved configurations</p>
                  </div>
                  <button
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: 'saved' })}
                    className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-500 hover:to-blue-400 text-white font-medium cursor-pointer border-none shadow-lg shadow-purple-500/30 transition-all"
                  >
                    Saved Builds <ArrowRight className="ml-2 w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
