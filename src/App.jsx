import { useState } from 'react';
import { Zap, Menu, X } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import ComponentSelection from './components/ComponentSelection';
import Integration from './components/Integration';
import Simulation from './components/Simulation';
import SavedConfigs from './components/SavedConfigs';
import TeamWorkspace from './components/TeamWorkspace';
import LiveData from './components/LiveData';
import Welcome from './components/Welcome';
import './index.css';

const VIEWS = [
  { id: 'welcome', label: 'Home' },
  { id: 'selection', label: 'Components' },
  { id: 'integration', label: 'Integration' },
  { id: 'simulation', label: 'Simulator' },
  { id: 'saved', label: 'Saved Builds' },
  { id: 'workspace', label: 'Teams' },
  { id: 'livedata', label: 'Live Data' },
];

function Toasts() {
  const { state, dispatch } = useApp();
  return (
    <div className="toast-container">
      {state.notifications.map(n => (
        <div key={n.id} className={`toast ${n.type}`}>
          <span>{n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}</span>
          <span className="toast-message">{n.message}</span>
          <div className="toast-actions">
            {n.retryAction && (
              <button
                className="toast-retry-btn"
                onClick={() => {
                  dispatch(n.retryAction);
                  dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id });
                }}
              >
                Retry
              </button>
            )}
            <button
              className="toast-dismiss-btn"
              onClick={() => dispatch({ type: 'DISMISS_NOTIFICATION', payload: n.id })}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>About Virtual F1 Car Designer</h2>
        <p>
          Build your dream Formula 1 car by selecting components from different teams.
          Check component compatibility, run performance simulations, and save your configurations.
        </p>
        <p>
          <strong>How to use:</strong><br />
          1. Select an Engine, Tires, and Brakes from the Components tab.<br />
          2. Go to Integration to check for compatibility conflicts.<br />
          3. Run a Performance Simulation with your chosen track and weather.<br />
          4. Save your best setups for later use.<br />
          5. Use the Teams tab to edit components and track version history.
        </p>
        <button
          className="px-4 py-2 rounded-lg border border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 text-sm font-medium mt-4 cursor-pointer"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}

function AppShell() {
  const { state, dispatch } = useApp();
  const [showHelp, setShowHelp] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (state.currentView) {
      case 'welcome': return <Welcome />;
      case 'selection': return <ComponentSelection />;
      case 'integration': return <Integration />;
      case 'simulation': return <Simulation />;
      case 'saved': return <SavedConfigs />;
      case 'workspace': return <TeamWorkspace />;
      case 'livedata': return <LiveData />;
      default: return <Welcome />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Grid Background */}
      <div className="grid-bg"><div /></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/40 border-b border-red-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'welcome' })}
            className="flex items-center gap-2 group cursor-pointer bg-transparent border-none"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/50 group-hover:shadow-red-500/80 transition-all">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">F1 Designer</span>
          </button>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => dispatch({ type: 'SET_VIEW', payload: v.id })}
                className={`relative px-3 py-2 text-sm transition-all cursor-pointer bg-transparent border-none ${
                  state.currentView === v.id
                    ? 'text-red-500'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {v.label}
                {state.currentView === v.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-blue-500" />
                )}
              </button>
            ))}
            <button
              onClick={() => setShowHelp(true)}
              className="px-3 py-2 text-sm text-gray-300 hover:text-white transition-all cursor-pointer bg-transparent border-none"
            >
              Help
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2 bg-transparent border-none cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden backdrop-blur-xl bg-black/90 border-t border-gray-800">
            <div className="px-6 py-4 space-y-2">
              {VIEWS.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    dispatch({ type: 'SET_VIEW', payload: v.id });
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-3 rounded-lg transition-all cursor-pointer bg-transparent border-none ${
                    state.currentView === v.id
                      ? 'bg-red-500/20 text-red-500'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="relative pt-20">
        {renderView()}
      </main>

      <Toasts />
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
