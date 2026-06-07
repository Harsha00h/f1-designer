import { useState } from 'react';
import { Settings, CircleDot, Disc, ArrowRight, AlertTriangle, CheckCircle, XCircle, Shield, Wrench, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COMPATIBILITY_RULES, TEAMS } from '../data/components';

function getTeamName(teamId) {
  return TEAMS.find(t => t.id === teamId)?.name || teamId;
}
function getTeam(teamId) {
  return TEAMS.find(t => t.id === teamId);
}

const HOTSPOTS = [
  { id: 'engine', label: 'Engine', x: '68%', y: '52%' },
  { id: 'brakes', label: 'Brakes', x: '42%', y: '58%' },
  { id: 'tires', label: 'Front Tyres', x: '58%', y: '72%' },
];

export default function Integration() {
  const { state, dispatch } = useApp();
  const { selectedEngine, selectedTires, selectedBrakes, compatibilityResults, isIntegrated } = state;
  const [isIntegrating, setIsIntegrating] = useState(false);
  const [hoveredHotspot, setHoveredHotspot] = useState(null);

  const allSelected = selectedEngine && selectedTires && selectedBrakes;
  const selectedComponents = { engine: selectedEngine, tires: selectedTires, brakes: selectedBrakes };
  const selectedCount = [selectedEngine, selectedTires, selectedBrakes].filter(Boolean).length;

  const hasErrors = compatibilityResults.some(r => r.severity === 'error');
  const checkRun = compatibilityResults.length > 0;

  const successCount = compatibilityResults.filter(r => r.severity === 'success').length;
  const errorCount = compatibilityResults.filter(r => r.severity === 'error').length;
  const warnCount = compatibilityResults.filter(r => r.severity === 'warning').length;

  const runCheck = () => {
    if (!allSelected) return;
    const results = [];
    const selectedTeams = { engine: selectedEngine.team, tires: selectedTires.team, brakes: selectedBrakes.team };

    COMPATIBILITY_RULES.forEach(rule => {
      const [type1, type2] = rule.type;
      const team1 = selectedTeams[type1];
      const team2 = selectedTeams[type2];
      if ((rule.components.includes(team1) && rule.components.includes(team2)) && team1 !== team2) {
        results.push({ severity: rule.severity, message: rule.message });
      }
    });

    const uniqueTeams = new Set(Object.values(selectedTeams));
    if (uniqueTeams.size === 1) {
      results.push({ severity: 'success', message: `All components from ${getTeamName([...uniqueTeams][0])}. Perfect integration!` });
    } else if (results.length === 0) {
      results.push({ severity: 'success', message: 'All selected components are compatible. No conflicts detected.' });
    }

    dispatch({ type: 'SET_COMPATIBILITY', payload: results });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: results.some(r => r.severity === 'error') ? 'error' : 'success', message: 'Compatibility check complete' } });
  };

  const handleIntegrate = () => {
    setIsIntegrating(true);
    setTimeout(() => {
      setIsIntegrating(false);
      dispatch({ type: 'INTEGRATE_CAR' });
      dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: 'Car integrated successfully!' } });
    }, 1500);
  };

  const componentIcons = {
    engine: Settings,
    tires: CircleDot,
    brakes: Disc,
  };

  const componentLabels = {
    engine: 'ENGINE',
    tires: 'TYRES',
    brakes: 'BRAKES',
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative max-w-7xl mx-auto px-6 py-6">
        {/* Main two-column layout */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* LEFT — Blueprint with hotspots */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden border border-gray-800/80 bg-[#0a1628]">
              {/* Car blueprint image */}
              <img
                src="/f1-blueprint.png"
                alt="F1 Car Blueprint"
                className="w-full h-auto"
                style={{ minHeight: '380px', objectFit: 'cover', filter: 'brightness(0.9)' }}
              />

              {/* Component hotspot labels */}
              {HOTSPOTS.map(h => {
                const comp = selectedComponents[h.id];
                const isSelected = !!comp;
                const isHovered = hoveredHotspot === h.id;

                return (
                  <div
                    key={h.id}
                    className="absolute group cursor-pointer"
                    style={{ left: h.x, top: h.y, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => setHoveredHotspot(h.id)}
                    onMouseLeave={() => setHoveredHotspot(null)}
                    onClick={() => !comp && dispatch({ type: 'SET_VIEW', payload: 'selection' })}
                  >
                    {/* Dot */}
                    <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                      isSelected 
                        ? 'bg-red-500 border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]' 
                        : 'bg-cyan-400 border-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.6)]'
                    }`} />
                    {/* Label line + text */}
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1 flex flex-col items-center transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-80'}`}>
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap backdrop-blur-md ${
                        isSelected 
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/25'
                      }`}>
                        {h.label}
                      </span>
                      <div className={`w-px h-4 ${isSelected ? 'bg-red-500/40' : 'bg-cyan-400/40'}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-8 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                <span className="text-xs text-gray-400">Available Component</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                <span className="text-xs text-gray-400">Selected Component</span>
              </div>
            </div>

            {/* Action Buttons */}
            <button
              onClick={runCheck}
              disabled={!allSelected}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm disabled:opacity-40 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-blue-600/30 transition-all duration-300"
            >
              Run Compatibility Check
            </button>

            {/* Compatibility Results (inline) */}
            {checkRun && (
              <div className="p-4 rounded-xl border border-gray-800 bg-gray-900/50 space-y-2">
                {compatibilityResults.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    {r.severity === 'error' ? <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> :
                     r.severity === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" /> :
                     <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
                    <span className="text-gray-300">{r.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Proceed to Simulation */}
            <button
              onClick={() => {
                if (!isIntegrated && checkRun && !hasErrors) {
                  handleIntegrate();
                  setTimeout(() => dispatch({ type: 'SET_VIEW', payload: 'simulation' }), 1600);
                } else if (isIntegrated) {
                  dispatch({ type: 'SET_VIEW', payload: 'simulation' });
                }
              }}
              disabled={!checkRun || hasErrors}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-700/90 to-red-600/80 hover:from-red-600 hover:to-red-500 text-white/90 hover:text-white font-semibold text-sm disabled:opacity-30 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-red-600/20 transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Proceed to Simulation
            </button>
          </div>

          {/* RIGHT — Selected Components Panel */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">Selected Components</h2>

            {/* Component Cards */}
            {['engine', 'tires', 'brakes'].map(cat => {
              const comp = selectedComponents[cat];
              const team = comp ? getTeam(comp.team) : null;
              const Icon = componentIcons[cat];

              return (
                <div
                  key={cat}
                  className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                    comp
                      ? 'bg-gray-900/80 border-gray-700/80 hover:border-gray-600'
                      : 'bg-gray-900/30 border-dashed border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => !comp && dispatch({ type: 'SET_VIEW', payload: 'selection' })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-1.5">{componentLabels[cat]}</div>
                      {comp ? (
                        <>
                          <h3 className="text-sm font-bold text-white truncate pr-6">{comp.model}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{team?.name}</p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600 italic">Not selected</p>
                      )}
                    </div>

                    {/* Status icon */}
                    {comp ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Team color accent */}
                  {comp && team && (
                    <div
                      className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
                      style={{ backgroundColor: team.color }}
                    />
                  )}
                </div>
              );
            })}

            {/* Selection progress */}
            <div className="p-4 rounded-xl border border-gray-800/60 bg-gray-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Component Status</span>
                <span className="text-xs font-bold text-gray-400">{selectedCount}/3</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-blue-500"
                  style={{ width: `${(selectedCount / 3) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick actions */}
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
              className="w-full py-2.5 rounded-lg border border-gray-800 text-gray-500 hover:text-white hover:bg-gray-800/50 hover:border-gray-700 text-sm cursor-pointer bg-transparent transition-all duration-300 inline-flex items-center justify-center gap-2"
            >
              <Wrench className="w-3.5 h-3.5" />
              Edit Components
            </button>

            {/* Integration status */}
            {isIntegrated && (
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Car Integrated</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Ready for simulation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
