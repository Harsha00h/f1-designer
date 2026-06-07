import { Gauge, TrendingUp, ArrowRight, Shield, Wrench, Save, Radio, Zap, Activity, Timer, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FEATURES = [
  {
    icon: Gauge,
    title: 'Component Library',
    desc: 'Access authentic F1 components from Ferrari, Mercedes, Red Bull & McLaren with real performance data.',
    gradient: 'from-red-500/5 to-transparent',
    border: 'border-red-500/20 hover:border-red-500/40',
    iconBg: 'bg-red-500/10 group-hover:bg-red-500/20',
    iconColor: 'text-red-500',
  },
  {
    icon: Shield,
    title: 'Smart Integration',
    desc: 'Intelligent compatibility checking ensures optimal component integration across different teams.',
    gradient: 'from-blue-500/5 to-transparent',
    border: 'border-blue-500/20 hover:border-blue-500/40',
    iconBg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
    iconColor: 'text-blue-500',
  },
  {
    icon: TrendingUp,
    title: 'Advanced Simulation',
    desc: 'Real-time telemetry analysis and performance prediction with live track animation across 12 circuits.',
    gradient: 'from-purple-500/5 to-transparent',
    border: 'border-purple-500/20 hover:border-purple-500/40',
    iconBg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
    iconColor: 'text-purple-500',
  },
  {
    icon: Radio,
    title: 'Real F1 Data',
    desc: 'Access real-world telemetry, race results, and driver standings powered by FastF1.',
    gradient: 'from-emerald-500/5 to-transparent',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
    iconColor: 'text-emerald-500',
  },
];

const STATS = [
  { value: '12', label: 'Real Circuits', icon: Activity },
  { value: '4', label: 'F1 Teams', icon: Zap },
  { value: '350+', label: 'Components', icon: Wrench },
  { value: '98%', label: 'Accuracy', icon: Timer },
];

export default function Welcome() {
  const { dispatch } = useApp();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative pt-8 pb-16 px-6">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-7">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-sm font-medium backdrop-blur-sm">
              <Zap className="w-3.5 h-3.5 mr-2" />
              Next-Gen Racing Technology
            </div>

            {/* Main Title */}
            <h1 className="text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-300 bg-clip-text text-transparent">
                Virtual F1 Car
              </span>
              <br />
              <span className="bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent">
                Designer
              </span>
            </h1>

            {/* Tagline */}
            <p className="text-xl text-gray-300 tracking-wide font-light">
              Build. Integrate. Simulate.
            </p>

            {/* Description */}
            <p className="text-base text-gray-500 max-w-lg leading-relaxed">
              Engineer your ultimate Formula 1 machine with precision component
              selection, real-time compatibility analysis, and advanced performance
              simulation.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'selection' })}
                className="group inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg shadow-lg shadow-red-600/40 hover:shadow-red-500/60 transition-all duration-300 cursor-pointer border-none"
              >
                Start Designing
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'saved' })}
                className="group inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold text-gray-300 border border-gray-700 hover:border-gray-500 hover:bg-white/5 rounded-lg backdrop-blur-sm transition-all duration-300 cursor-pointer bg-transparent"
              >
                <Save className="mr-2 w-4 h-4 text-gray-500" />
                View Saved Builds
              </button>
            </div>

            {/* Secondary links */}
            <div className="flex flex-wrap items-center gap-6">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'simulation' })}
                className="group inline-flex items-center text-gray-500 hover:text-white transition-all duration-300 cursor-pointer bg-transparent border-none text-sm"
              >
                <TrendingUp className="mr-2 w-4 h-4" />
                Performance Analytics
                <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'livedata' })}
                className="group inline-flex items-center text-emerald-500/70 hover:text-emerald-400 transition-all duration-300 cursor-pointer bg-transparent border-none text-sm"
              >
                <Radio className="mr-2 w-4 h-4" />
                Live F1 Data
                <ArrowRight className="ml-1.5 w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Content — F1 Car Image Card */}
          <div className="relative lg:ml-4">
            {/* Main image card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-red-500/10 bg-gradient-to-br from-gray-900/80 to-black">
              {/* Red gradient overlay at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-red-900/30 via-transparent to-transparent z-[1] pointer-events-none" />
              <img
                src="/f1-hero-car.png"
                alt="Formula 1 Car"
                className="w-full h-auto object-cover"
                style={{ filter: 'brightness(0.95) contrast(1.05)' }}
              />
            </div>

            {/* Floating badge — top right: Accuracy */}
            <div className="absolute -top-4 -right-4 z-10 backdrop-blur-xl bg-black/70 border border-white/10 rounded-xl p-3.5 shadow-xl shadow-black/50">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <div>
                  <div className="text-xl font-bold text-white leading-none">98%</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Accuracy</div>
                </div>
              </div>
            </div>

            {/* Floating badge — bottom left: Components */}
            <div className="absolute -bottom-4 left-6 z-10 backdrop-blur-xl bg-black/70 border border-red-500/20 rounded-xl p-3.5 shadow-xl shadow-black/50">
              <div className="flex items-center gap-2.5">
                <Gauge className="w-5 h-5 text-red-400" />
                <div>
                  <div className="text-xl font-bold text-white leading-none">350+</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">Components</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="group flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-red-500/30 hover:bg-red-500/[0.03] transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      </div>

      {/* Features Grid */}
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.2em] uppercase text-red-400/80 font-medium mb-3">Capabilities</p>
          <h2 className="text-3xl font-bold text-white">Everything You Need</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title} className={`group p-7 rounded-xl backdrop-blur-xl bg-gradient-to-br ${f.gradient} border ${f.border} transition-all duration-300 hover:translate-y-[-2px]`}>
                <div className={`w-11 h-11 ${f.iconBg} rounded-lg flex items-center justify-center mb-4 transition-colors duration-300`}>
                  <Icon className={`w-5 h-5 ${f.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 py-14 text-center">
        <p className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-5 font-medium">Technology Stack</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {['React 18', 'Tailwind CSS', 'Recharts', 'Vite', 'FastF1', 'FastAPI', 'LocalStorage'].map(t => (
            <span key={t} className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-gray-500 text-sm font-medium hover:border-red-500/30 hover:text-gray-300 transition-all duration-300 cursor-default">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
