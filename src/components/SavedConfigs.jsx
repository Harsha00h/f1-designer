import { useState } from 'react';
import { Plus, Trash2, Clock, TrendingUp, ArrowRight, Search, Settings, CircleDot, Disc } from 'lucide-react';
import { useApp } from '../context/AppContext';

const slotIcons = { engine: Settings, tires: CircleDot, brakes: Disc };

function ComparisonPanel({ configA, configB, onClose }) {
  function compareVal(a, b, higherBetter = true) {
    const numA = parseFloat(a), numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB) || numA === numB) return ['text-white', 'text-white'];
    const aBetter = higherBetter ? numA > numB : numA < numB;
    return [aBetter ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold', !aBetter ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'];
  }

  function Row({ label, valA, valB, higher = true }) {
    const [sA, sB] = compareVal(valA, valB, higher);
    return (
      <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
        <span className="text-gray-500">{label}</span>
        <span className={sA}>{String(valA)}</span>
        <span className={sB}>{String(valB)}</span>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Configuration Comparison</h3>
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm cursor-pointer bg-transparent">Close</button>
      </div>
      <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-800 text-sm font-bold">
        <span className="text-gray-500">Field</span>
        <span>{configA.name}</span>
        <span>{configB.name}</span>
      </div>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">Engine</div>
      <Row label="Model" valA={configA.engine.model} valB={configB.engine.model} />
      <Row label="Power" valA={configA.engine.power} valB={configB.engine.power} />
      <Row label="Weight" valA={configA.engine.weight} valB={configB.engine.weight} higher={false} />
      <Row label="Reliability" valA={configA.engine.reliability} valB={configB.engine.reliability} />
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">Tires</div>
      <Row label="Grip" valA={configA.tires.grip} valB={configB.tires.grip} />
      <Row label="Durability" valA={configA.tires.durability} valB={configB.tires.durability} />
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-4 mb-2">Brakes</div>
      <Row label="Stopping" valA={configA.brakes.stopping} valB={configB.brakes.stopping} />
      <div className="flex gap-6 text-xs text-gray-500 mt-4 pt-3 border-t border-gray-800">
        <span><span className="text-emerald-400 font-bold">Green</span> = better</span>
        <span><span className="text-red-400 font-bold">Red</span> = worse</span>
      </div>
    </div>
  );
}

export default function SavedConfigs() {
  const { state, dispatch } = useApp();
  const { selectedEngine, selectedTires, selectedBrakes, savedConfigs } = state;
  const [configName, setConfigName] = useState('');
  const [search, setSearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  const allSelected = selectedEngine && selectedTires && selectedBrakes;
  const filtered = savedConfigs.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = () => {
    if (!configName.trim() || !allSelected) return;
    dispatch({ type: 'SAVE_CONFIG', payload: { name: configName.trim(), engine: selectedEngine, tires: selectedTires, brakes: selectedBrakes, createdAt: new Date().toISOString() } });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'success', message: `"${configName}" saved!` } });
    setConfigName('');
  };

  const handleLoad = config => {
    dispatch({ type: 'LOAD_CONFIG', payload: config });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'info', message: `Loaded "${config.name}"` } });
  };

  const handleDelete = index => {
    dispatch({ type: 'DELETE_CONFIG', payload: index });
    setSelectedForCompare(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    setShowComparison(false);
  };

  const toggleCompare = index => {
    setSelectedForCompare(prev => {
      if (prev.includes(index)) return prev.filter(i => i !== index);
      if (prev.length >= 2) return [prev[1], index];
      return [...prev, index];
    });
    setShowComparison(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Saved Builds</h1>
            <p className="text-gray-400 mt-2">{savedConfigs.length} saved configurations</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white text-sm font-medium cursor-pointer border-none shadow-lg shadow-red-500/30 transition-all"
          >
            <Plus className="mr-2 w-4 h-4" /> New Build
          </button>
        </div>

        {/* Save Form */}
        {allSelected && (
          <div className="p-6 rounded-xl border border-gray-800 backdrop-blur-xl bg-gray-900/50 mb-8">
            <h3 className="text-lg font-bold mb-4">Save Current Configuration</h3>
            <div className="flex gap-3 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <input type="text" placeholder="Enter build name..." value={configName} onChange={e => setConfigName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()}
                  className="w-full px-4 py-3 rounded-lg bg-black/50 border border-gray-700 text-white text-sm focus:border-red-500 focus:outline-none" />
              </div>
              <button onClick={handleSave} disabled={!configName.trim()}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none shadow-lg shadow-red-500/30 transition-all">
                Save
              </button>
            </div>
          </div>
        )}

        {/* Search + Compare */}
        <div className="flex gap-4 mb-8 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input placeholder="Search builds..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 h-12 rounded-lg bg-gray-900/50 border border-gray-800 text-white text-sm focus:border-red-500 focus:outline-none" />
          </div>
          {savedConfigs.length >= 2 && (
            <>
              <button onClick={() => setShowComparison(true)} disabled={selectedForCompare.length !== 2}
                className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none cursor-pointer border-none transition-all">
                Compare ({selectedForCompare.length}/2)
              </button>
              {selectedForCompare.length > 0 && (
                <button onClick={() => { setSelectedForCompare([]); setShowComparison(false); }}
                  className="px-4 py-3 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-sm cursor-pointer bg-transparent">
                  Clear
                </button>
              )}
            </>
          )}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-400">No Builds Found</h2>
            <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer border-none transition-all">
              Create First Build <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((config, i) => (
              <div key={i} className={`group p-6 rounded-xl backdrop-blur-xl bg-gradient-to-br from-gray-900/80 to-gray-900/40 border transition-all ${
                selectedForCompare.includes(i) ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-gray-800 hover:border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold truncate">{config.name}</h3>
                  {savedConfigs.length >= 2 && (
                    <input type="checkbox" checked={selectedForCompare.includes(i)} onChange={() => toggleCompare(i)}
                      className="w-4 h-4 cursor-pointer accent-blue-500" title="Select for comparison" />
                  )}
                </div>
                <div className="flex gap-2 mb-4">
                  {['engine', 'tires', 'brakes'].map(cat => {
                    const c = config[cat]; const I = slotIcons[cat];
                    return <div key={cat} className={`w-9 h-9 rounded-lg flex items-center justify-center ${c ? 'bg-white/10' : 'bg-gray-800/50'}`} title={c?.model || `No ${cat}`}><I className={`w-4 h-4 ${c ? 'text-white' : 'text-gray-600'}`} /></div>;
                  })}
                </div>
                <div className="space-y-1 mb-4">
                  {['engine', 'tires', 'brakes'].map(cat => {
                    const c = config[cat]; if (!c) return null;
                    return <div key={cat} className="text-sm text-gray-400 truncate">{c.model}</div>;
                  })}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(config.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleLoad(config)} className="flex-1 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm cursor-pointer border-none transition-all">
                    Load Build
                  </button>
                  <button onClick={() => handleDelete(i)}
                    className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer bg-transparent transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showComparison && selectedForCompare.length === 2 && (
          <ComparisonPanel
            configA={savedConfigs[selectedForCompare[0]]}
            configB={savedConfigs[selectedForCompare[1]]}
            onClose={() => { setShowComparison(false); setSelectedForCompare([]); }}
          />
        )}
      </div>
    </div>
  );
}
