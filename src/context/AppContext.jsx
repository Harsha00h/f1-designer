import { createContext, useContext, useReducer, useEffect } from 'react';
import { DEFAULT_COMPONENTS } from '../data/components';

const AppContext = createContext();

// Deep clone helper
function cloneComponents(comps) {
  return JSON.parse(JSON.stringify(comps));
}

// Load persisted team components or fall back to defaults
function loadTeamComponents() {
  try {
    const saved = localStorage.getItem('f1-team-components');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate that saved data matches current team IDs (handles data schema changes)
      const defaultFirstId = DEFAULT_COMPONENTS.engine[0]?.id;
      const savedFirstId = parsed.engine?.[0]?.id;
      if (defaultFirstId && savedFirstId && defaultFirstId !== savedFirstId) {
        // Schema changed — clear stale data
        localStorage.removeItem('f1-team-components');
        localStorage.removeItem('f1-version-history');
        localStorage.removeItem('f1-saved-configs');
        return cloneComponents(DEFAULT_COMPONENTS);
      }
      return parsed;
    }
  } catch {}
  return cloneComponents(DEFAULT_COMPONENTS);
}

// Load version history
function loadVersionHistory() {
  try {
    const saved = localStorage.getItem('f1-version-history');
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

const initialState = {
  // Active team workspace
  activeTeam: null,
  // Components (mutable — reflects latest versions)
  components: loadTeamComponents(),
  // Version history archive
  versionHistory: loadVersionHistory(),
  // Selected components for car build
  selectedEngine: null,
  selectedTires: null,
  selectedBrakes: null,
  // Compatibility results
  compatibilityResults: [],
  // Integration
  isIntegrated: false,
  // Simulation
  simulationSettings: { track: null, weather: 'Dry', laps: 5 },
  simulationResults: null,
  isSimulating: false,
  // Saved configurations
  savedConfigs: JSON.parse(localStorage.getItem('f1-saved-configs') || '[]'),
  // Current view
  currentView: 'welcome',
  // Notifications (with optional retry support)
  notifications: [],
};

function appReducer(state, action) {
  switch (action.type) {
    // ---- Team workspace ----
    case 'SET_ACTIVE_TEAM':
      return { ...state, activeTeam: action.payload };

    // ---- Component update with versioning (US6 + US8) ----
    case 'UPDATE_COMPONENT': {
      const { category, componentId, updates } = action.payload;
      const newComponents = cloneComponents(state.components);
      const idx = newComponents[category].findIndex(c => c.id === componentId);
      if (idx === -1) return state;

      // Archive the old version
      const oldComponent = { ...state.components[category][idx] };
      const historyEntry = {
        id: `${componentId}-v${oldComponent.version}`,
        componentId,
        category,
        data: oldComponent,
        archivedAt: new Date().toISOString(),
      };

      // Apply updates and bump version
      const updated = {
        ...newComponents[category][idx],
        ...updates,
        version: oldComponent.version + 1,
        updatedAt: new Date().toISOString(),
      };
      newComponents[category][idx] = updated;

      const newHistory = [...state.versionHistory, historyEntry];

      // Persist
      localStorage.setItem('f1-team-components', JSON.stringify(newComponents));
      localStorage.setItem('f1-version-history', JSON.stringify(newHistory));

      // If the updated component is currently selected, update the selection too
      let newState = { ...state, components: newComponents, versionHistory: newHistory };
      const selKey = category === 'engine' ? 'selectedEngine' : category === 'tires' ? 'selectedTires' : 'selectedBrakes';
      if (state[selKey]?.id === componentId) {
        newState[selKey] = updated;
      }

      return newState;
    }

    case 'RESTORE_VERSION': {
      const { category, componentId, versionData } = action.payload;
      const newComponents = cloneComponents(state.components);
      const idx = newComponents[category].findIndex(c => c.id === componentId);
      if (idx === -1) return state;

      // Archive current before restoring
      const current = { ...state.components[category][idx] };
      const historyEntry = {
        id: `${componentId}-v${current.version}`,
        componentId,
        category,
        data: current,
        archivedAt: new Date().toISOString(),
      };

      const restored = {
        ...versionData,
        version: current.version + 1,
        updatedAt: new Date().toISOString(),
      };
      newComponents[category][idx] = restored;

      const newHistory = [...state.versionHistory, historyEntry];
      localStorage.setItem('f1-team-components', JSON.stringify(newComponents));
      localStorage.setItem('f1-version-history', JSON.stringify(newHistory));

      let newState = { ...state, components: newComponents, versionHistory: newHistory };
      const selKey = category === 'engine' ? 'selectedEngine' : category === 'tires' ? 'selectedTires' : 'selectedBrakes';
      if (state[selKey]?.id === componentId) {
        newState[selKey] = restored;
      }
      return newState;
    }

    case 'RESET_COMPONENTS': {
      const fresh = cloneComponents(DEFAULT_COMPONENTS);
      localStorage.setItem('f1-team-components', JSON.stringify(fresh));
      localStorage.removeItem('f1-version-history');
      return { ...state, components: fresh, versionHistory: [] };
    }

    // ---- Original actions ----
    case 'SELECT_ENGINE':
      return { ...state, selectedEngine: action.payload, compatibilityResults: [], simulationResults: null, isIntegrated: false };
    case 'SELECT_TIRES':
      return { ...state, selectedTires: action.payload, compatibilityResults: [], simulationResults: null, isIntegrated: false };
    case 'SELECT_BRAKES':
      return { ...state, selectedBrakes: action.payload, compatibilityResults: [], simulationResults: null, isIntegrated: false };
    case 'SET_COMPATIBILITY':
      return { ...state, compatibilityResults: action.payload };
    case 'SET_SIMULATION_SETTINGS':
      return { ...state, simulationSettings: { ...state.simulationSettings, ...action.payload } };
    case 'START_SIMULATION':
      return { ...state, isSimulating: true, simulationResults: null };
    case 'FINISH_SIMULATION':
      return { ...state, isSimulating: false, simulationResults: action.payload };
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SAVE_CONFIG': {
      const newConfigs = [...state.savedConfigs, action.payload];
      localStorage.setItem('f1-saved-configs', JSON.stringify(newConfigs));
      return { ...state, savedConfigs: newConfigs };
    }
    case 'LOAD_CONFIG':
      return {
        ...state,
        selectedEngine: action.payload.engine,
        selectedTires: action.payload.tires,
        selectedBrakes: action.payload.brakes,
        currentView: 'selection',
        isIntegrated: false,
      };
    case 'INTEGRATE_CAR':
      return { ...state, isIntegrated: true };
    case 'DELETE_CONFIG': {
      const filtered = state.savedConfigs.filter((_, i) => i !== action.payload);
      localStorage.setItem('f1-saved-configs', JSON.stringify(filtered));
      return { ...state, savedConfigs: filtered };
    }

    // ---- Enhanced notifications with retry (US9) ----
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          { id: Date.now(), ...action.payload },
        ],
      };
    case 'DISMISS_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Auto-dismiss notifications after 4 seconds (skip if notification has retry)
  useEffect(() => {
    if (state.notifications.length > 0) {
      const first = state.notifications[0];
      if (first.retryAction) return; // Don't auto-dismiss retryable notifications
      const timer = setTimeout(() => {
        dispatch({ type: 'DISMISS_NOTIFICATION', payload: first.id });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [state.notifications]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
