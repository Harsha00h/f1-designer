import { useState } from 'react';
import { Settings, CircleDot, Disc, History, Edit2, RotateCcw, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TEAMS, EDITABLE_FIELDS } from '../data/components';

const CATEGORIES = [
  { key: 'engine', label: 'Engines', icon: Settings },
  { key: 'tires', label: 'Tires', icon: CircleDot },
  { key: 'brakes', label: 'Brakes', icon: Disc },
];

function getTeam(teamId) {
  return TEAMS.find(t => t.id === teamId);
}

function EditModal({ component, category, onClose, dispatch }) {
  const fields = EDITABLE_FIELDS[category];
  const [form, setForm] = useState(() => {
    const initial = {};
    fields.forEach(f => { initial[f.key] = component[f.key]; });
    return initial;
  });

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_COMPONENT',
      payload: { category, componentId: component.id, updates: form },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'success', message: `${component.model} updated to v${component.version + 1}` },
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">Edit {component.model}</h2>
        <p className="text-sm text-gray-400 mb-6">
          Current version: v{component.version} &middot; {getTeam(component.team)?.name}
        </p>

        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-300 block">{field.label}</label>
              {field.type === 'select' ? (
                <select
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:border-red-500 focus:outline-none"
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                >
                  {field.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:border-red-500 focus:outline-none"
                  min={field.min}
                  max={field.max}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: parseInt(e.target.value) || 0 })}
                />
              ) : (
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white text-sm focus:border-red-500 focus:outline-none"
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-all"
            onClick={handleSave}
          >
            Save Changes (v{component.version + 1})
          </button>
          <button
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function VersionHistoryModal({ componentId, category, versionHistory, dispatch, onClose }) {
  const versions = versionHistory
    .filter(v => v.componentId === componentId && v.category === category)
    .sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));

  const handleRestore = (versionData) => {
    dispatch({
      type: 'RESTORE_VERSION',
      payload: { category, componentId, versionData },
    });
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { type: 'success', message: `Restored v${versionData.version} of ${versionData.model}` },
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <h2 className="text-xl font-bold text-white mb-6">Version History</h2>
        
        {versions.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No previous versions archived yet.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {versions.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-800 bg-gray-900/50">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
                    v{v.data.version}
                  </div>
                  <div>
                    <div className="font-bold text-white">{v.data.model}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Archived: {new Date(v.archivedAt).toLocaleString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <button
                  className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-sm font-medium transition-all"
                  onClick={() => handleRestore(v.data)}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button 
            className="px-6 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-all" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ComponentRow({ comp, category, dispatch, versionHistory }) {
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const team = getTeam(comp.team);

  return (
    <>
      <div className="relative group p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl hover:border-gray-700 transition-all overflow-hidden">
        {/* Team Color Bar */}
        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: team.color }} />
        
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: team.color }}>
              {team.name}
            </div>
            <div className="text-lg font-bold text-white">{comp.model}</div>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-gray-800 text-gray-300 text-xs font-bold border border-gray-700">
            v{comp.version}
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {category === 'engine' && (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Power</span><span className="font-medium text-white">{comp.power}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Weight</span><span className="font-medium text-white">{comp.weight}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Reliability</span><span className="font-medium text-white">{comp.reliability}%</span></div>
            </>
          )}
          {category === 'tires' && (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Grip</span><span className="font-medium text-white">{comp.grip}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Durability</span><span className="font-medium text-white">{comp.durability}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Type</span><span className="font-medium text-white capitalize">{comp.type}</span></div>
            </>
          )}
          {category === 'brakes' && (
            <>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Stopping</span><span className="font-medium text-white">{comp.stopping}%</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Heat</span><span className="font-medium text-white">{comp.heat}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Material</span><span className="font-medium text-white">{comp.material}</span></div>
            </>
          )}
        </div>

        {comp.updatedAt && (
          <div className="text-xs text-gray-500 mb-6">
            Last updated: {new Date(comp.updatedAt).toLocaleString('en-US', {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium transition-all" 
            onClick={() => setEditing(true)}
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
          <button 
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 text-xs font-medium transition-all" 
            onClick={() => setShowHistory(true)}
          >
            <History className="w-3.5 h-3.5" /> History
          </button>
        </div>
      </div>
      
      {editing && (
        <EditModal component={comp} category={category} dispatch={dispatch} onClose={() => setEditing(false)} />
      )}
      {showHistory && (
        <VersionHistoryModal
          componentId={comp.id}
          category={category}
          versionHistory={versionHistory}
          dispatch={dispatch}
          onClose={() => setShowHistory(false)}
        />
      )}
    </>
  );
}

export default function TeamWorkspace() {
  const { state, dispatch } = useApp();
  const [selectedTeam, setSelectedTeam] = useState(state.activeTeam || null);
  const [activeCategory, setActiveCategory] = useState('engine');

  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
    dispatch({ type: 'SET_ACTIVE_TEAM', payload: teamId });
  };

  const teamComponents = selectedTeam
    ? state.components[activeCategory].filter(c => c.team === selectedTeam)
    : [];

  const handleReset = () => {
    dispatch({ type: 'RESET_COMPONENTS' });
    dispatch({ type: 'ADD_NOTIFICATION', payload: { type: 'warning', message: 'All components reset to defaults' } });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
            Team Workspace
          </h1>
          <p className="text-gray-400 mt-2">
            Select your team to manage components independently. Edit components and track version history.
          </p>
        </div>

        {/* Team selector */}
        <div className="flex flex-wrap gap-4 mb-10">
          {TEAMS.map(team => {
            const isSelected = selectedTeam === team.id;
            return (
              <button
                key={team.id}
                onClick={() => handleTeamSelect(team.id)}
                className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                  isSelected 
                    ? 'bg-gray-900 border-gray-600 shadow-lg' 
                    : 'bg-black border-gray-800 hover:border-gray-700'
                }`}
                style={{
                  boxShadow: isSelected ? `0 0 20px -5px ${team.color}40` : 'none',
                  borderColor: isSelected ? team.color : ''
                }}
              >
                <div className="w-4 h-4 rounded-full shadow-inner" style={{ background: team.color }} />
                <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                  {team.name}
                </span>
              </button>
            );
          })}
        </div>

        {!selectedTeam ? (
          <div className="p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/30 backdrop-blur-xl">
            <div className="w-20 h-20 mx-auto bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">🏢</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-300 mb-2">Select a team to begin</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Each team manages their own components independently. Select a team above to view and edit their component iterations.
            </p>
          </div>
        ) : (
          <>
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 border-b border-gray-800">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all ${
                      isActive 
                        ? 'bg-gray-800 text-white border-b-2 border-red-500' 
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium whitespace-nowrap">{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Components Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teamComponents.map(comp => (
                <ComponentRow
                  key={comp.id}
                  comp={comp}
                  category={activeCategory}
                  dispatch={dispatch}
                  versionHistory={state.versionHistory}
                />
              ))}
            </div>

            {teamComponents.length === 0 && (
              <div className="p-12 text-center rounded-2xl border border-gray-800 bg-gray-900/30">
                <p className="text-gray-500">No components for this team in this category.</p>
              </div>
            )}

            {/* Reset button */}
            <div className="mt-12 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                This will reset all component versions back to defaults
              </div>
              <button 
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm font-medium transition-all"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4" />
                Reset All Components
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
