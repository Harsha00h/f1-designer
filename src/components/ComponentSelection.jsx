import { useState } from 'react';
import { Settings, CircleDot, Disc, Check, Zap, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS } from '../data/components';

const SECTIONS = [
  { key: 'engine', label: 'Engine', icon: Settings },
  { key: 'tires', label: 'Tires', icon: CircleDot },
  { key: 'brakes', label: 'Brakes', icon: Disc },
];

function getTeam(teamId) {
  return TEAMS.find(t => t.id === teamId);
}

function StatBar({ label, value, max = 100, icon: Icon, color }) {
  const pct = typeof value === 'number' ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-400 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />} {label}
        </span>
        <span className="text-sm font-bold text-white">{value}{typeof value === 'number' && max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function getStats(comp, category) {
  if (category === 'engine') {
    const hp = parseInt(comp.power) || 0;
    return [
      { label: 'Power', value: comp.power, pct: (hp / 1100) * 100, icon: Zap, color: 'from-red-500 to-red-400' },
      { label: 'Weight', value: comp.weight, pct: 100 - ((parseInt(comp.weight) || 150) / 200) * 100, icon: Shield, color: 'from-blue-500 to-blue-400' },
      { label: 'Reliability', value: `${comp.reliability}%`, pct: comp.reliability, icon: TrendingUp, color: 'from-green-500 to-green-400' },
    ];
  }
  if (category === 'tires') {
    return [
      { label: 'Grip', value: `${comp.grip}%`, pct: comp.grip, icon: Zap, color: 'from-red-500 to-red-400' },
      { label: 'Durability', value: `${comp.durability}%`, pct: comp.durability, icon: Shield, color: 'from-blue-500 to-blue-400' },
      { label: 'Type', value: comp.type, pct: comp.grip, icon: TrendingUp, color: 'from-green-500 to-green-400' },
    ];
  }
  return [
    { label: 'Stopping', value: `${comp.stopping}%`, pct: comp.stopping, icon: Zap, color: 'from-red-500 to-red-400' },
    { label: 'Heat', value: comp.heat, pct: comp.heat === 'Low' ? 90 : comp.heat === 'Medium' ? 60 : 30, icon: Shield, color: 'from-blue-500 to-blue-400' },
    { label: 'Material', value: comp.material, pct: 85, icon: TrendingUp, color: 'from-green-500 to-green-400' },
  ];
}

export default function ComponentSelection() {
  const { state, dispatch } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('engine');
  const components = state.components;

  const handleSelect = (type, comp) => {
    const actionMap = { engine: 'SELECT_ENGINE', tires: 'SELECT_TIRES', brakes: 'SELECT_BRAKES' };
    dispatch({ type: actionMap[type], payload: comp });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'info', message: `${comp.model} (v${comp.version}) selected as ${type}` },
    });
  };

  const selectedMap = { engine: state.selectedEngine, tires: state.selectedTires, brakes: state.selectedBrakes };
  const selectedCount = [state.selectedEngine, state.selectedTires, state.selectedBrakes].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        {/* Top Summary Bar */}
        <div className="sticky top-[72px] z-40 backdrop-blur-xl bg-black/60 border-b border-red-500/20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <h2 className="text-lg font-bold">Selected Components ({selectedCount}/3)</h2>
                <div className="flex items-center gap-3">
                  {SECTIONS.map(cat => {
                    const Icon = cat.icon;
                    const selected = selectedMap[cat.key];
                    return (
                      <div key={cat.key} className={`px-3 py-1.5 rounded-lg border text-sm flex items-center gap-2 ${selected ? 'bg-green-500/20 border-green-500/50 text-green-400' : 'bg-gray-800/50 border-gray-700 text-gray-500'}`}>
                        <Icon className="w-4 h-4" />
                        {selected && <Check className="w-3 h-3" />}
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'integration' })}
                disabled={selectedCount === 0}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none transition-all"
              >
                Proceed to Integration <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Left Sidebar */}
            <div className="w-64 shrink-0 space-y-2 hidden md:block">
              <h3 className="text-sm font-bold text-gray-400 mb-4 px-4">COMPONENT CATEGORIES</h3>
              {SECTIONS.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.key;
                const hasComponent = selectedMap[cat.key] !== null;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`w-full px-4 py-3 rounded-lg border text-left flex items-center gap-3 transition-all cursor-pointer bg-transparent ${
                      isSelected
                        ? 'bg-red-500/20 border-red-500 text-white'
                        : 'border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="flex-1">{cat.label}</span>
                    {hasComponent && <Check className="w-4 h-4 text-green-500" />}
                  </button>
                );
              })}
            </div>

            {/* Mobile Category Tabs */}
            <div className="md:hidden w-full mb-6">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {SECTIONS.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`shrink-0 px-4 py-2 rounded-lg border flex items-center gap-2 text-sm cursor-pointer bg-transparent ${
                        selectedCategory === cat.key
                          ? 'bg-red-500/20 border-red-500 text-white'
                          : 'border-gray-800 text-gray-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2 capitalize">{selectedCategory}</h1>
                <p className="text-gray-400">Select a {selectedCategory} component for your F1 car</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {components[selectedCategory].map(comp => {
                  const isSelected = selectedMap[selectedCategory]?.id === comp.id;
                  const team = getTeam(comp.team);
                  const stats = getStats(comp, selectedCategory);

                  return (
                    <div
                      key={comp.id}
                      className={`group p-6 rounded-xl backdrop-blur-xl border-2 transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-green-500/20 to-transparent border-green-500 shadow-lg shadow-green-500/20'
                          : 'bg-gradient-to-br from-gray-900/50 to-transparent border-gray-800 hover:border-red-500/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className="px-3 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: `${team.color}20`, color: team.color }}
                        >
                          {team.name}
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-bold mb-4 text-white">{comp.model}</h3>

                      <div className="space-y-3 mb-6">
                        {stats.map(s => (
                          <div key={s.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-400 flex items-center gap-2">
                                <s.icon className="w-4 h-4" /> {s.label}
                              </span>
                              <span className="text-sm font-bold text-white">{s.value}</span>
                            </div>
                            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div className={`h-full bg-gradient-to-r ${s.color} transition-all`} style={{ width: `${s.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleSelect(selectedCategory, comp)}
                        className={`w-full inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer border-none transition-all ${
                          isSelected
                            ? 'bg-green-600 hover:bg-green-500 text-white'
                            : 'bg-red-600 hover:bg-red-500 text-white'
                        }`}
                      >
                        {isSelected ? (
                          <><Check className="mr-2 w-4 h-4" /> Selected</>
                        ) : (
                          'Select Component'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
