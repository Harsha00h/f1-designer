import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { getSmoothPath } from '../data/trackPaths';

/**
 * TrackAnimation — renders the actual race circuit image with live telemetry.
 *
 * The car's progress is shown as a glowing dot tracing the circuit image
 * perimeter, synced to real simulation lap data.
 *
 * Props:
 *   trackId    — circuit id (e.g. 'silverstone')
 *   trackImage — path to the actual circuit image
 *   trackName  — name of the circuit
 *   lapData    — array from simulation results [{lap, lapTime, speed, tireWear}, ...]
 *   totalLaps  — number of laps to run
 *   onComplete — called when all laps finish
 */
export default function TrackAnimation({ trackId, trackImage, trackName, lapData, totalLaps, onComplete }) {
  const [speed, setSpeed] = useState(1);            // 1x, 2x, 3x, 5x, 10x
  const [isRunning, setIsRunning] = useState(false);
  const [currentLap, setCurrentLap] = useState(0);
  const [progress, setProgress] = useState(0);       // 0-1 within current lap
  const [elapsed, setElapsed] = useState(0);          // seconds elapsed this lap
  const [finished, setFinished] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentTireWear, setCurrentTireWear] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0); // 0-1 across all laps

  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const containerRef = useRef(null);
  const [imageAspect, setImageAspect] = useState(56); // default 16:9 ≈ 56%

  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    if (img.naturalWidth && img.naturalHeight) {
      const aspect = (img.naturalHeight / img.naturalWidth) * 100;
      setImageAspect(Math.min(aspect, 75)); // cap at 75% to avoid overly tall
    }
  }, []);

  if (!trackImage) return null;

  const currentLapTime = lapData?.[currentLap]?.lapTime || 80;

  // Animation loop
  const animate = useCallback((timestamp) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const delta = (timestamp - lastTimeRef.current) / 1000;
    lastTimeRef.current = timestamp;

    setElapsed(prev => {
      const newElapsed = prev + delta * speed;
      const lapTime = lapData?.[currentLap]?.lapTime || 80;
      const newProgress = Math.min(newElapsed / lapTime, 1);

      setProgress(newProgress);
      setTotalProgress(((currentLap + newProgress) / totalLaps));

      if (lapData?.[currentLap]) {
        setCurrentSpeed(lapData[currentLap].speed);
        setCurrentTireWear(lapData[currentLap].tireWear);
      }

      // Lap complete
      if (newProgress >= 1) {
        setCurrentLap(prevLap => {
          const nextLap = prevLap + 1;
          if (nextLap >= totalLaps) {
            setIsRunning(false);
            setFinished(true);
            setTotalProgress(1);
            if (onComplete) onComplete();
            return prevLap;
          }
          return nextLap;
        });
        return 0;
      }

      return newElapsed;
    });

    animRef.current = requestAnimationFrame(animate);
  }, [speed, currentLap, totalLaps, lapData, onComplete]);

  useEffect(() => {
    if (isRunning) {
      lastTimeRef.current = null;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, animate]);

  const handleStart = () => {
    if (finished) {
      setCurrentLap(0);
      setProgress(0);
      setElapsed(0);
      setFinished(false);
      setCurrentSpeed(0);
      setCurrentTireWear(0);
      setTotalProgress(0);
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentLap(0);
    setProgress(0);
    setElapsed(0);
    setFinished(false);
    setCurrentSpeed(0);
    setCurrentTireWear(0);
    setTotalProgress(0);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = (sec % 60).toFixed(1);
    return `${m}:${s.padStart(4, '0')}`;
  };

  const speedOptions = [1, 2, 3, 5, 10];

  // Calculate position of glowing car dot on the precise track boundary map
  const pathPoints = useMemo(() => getSmoothPath(trackId), [trackId]);
  
  // Interpolate position along the smooth path
  const totalPoints = pathPoints.length;
  const floatIndex = progress * totalPoints;
  const pathIndex = Math.floor(floatIndex) % totalPoints;
  const nextIndex = (pathIndex + 1) % totalPoints;
  const t = floatIndex - Math.floor(floatIndex);
  
  const p1 = pathPoints[pathIndex];
  const p2 = pathPoints[nextIndex];
  
  const carX = p1.x + (p2.x - p1.x) * t;
  const carY = p1.y + (p2.y - p1.y) * t;

  // Progress ring for SVG overlay
  const ringRadius = 140;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - (progress));

  return (
    <div className="p-6 rounded-xl border border-gray-800 bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl mt-6">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontSize: '0.85rem',
          letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-secondary)'
        }}>
          Live Track Simulation
        </h3>
        {/* Speed controls */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' }}>Speed:</span>
          {speedOptions.map(s => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: speed === s ? '1px solid var(--accent-red)' : '1px solid rgba(255,255,255,0.1)',
                background: speed === s ? 'rgba(225,6,0,0.2)' : 'rgba(255,255,255,0.03)',
                color: speed === s ? 'var(--accent-red)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 'bold',
                transition: 'all 0.2s',
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Track image with overlays */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#0a0a14',
        }}
      >
        {/* Container that uses background-image for proper coordinate alignment */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: `${imageAspect}%`,
          backgroundImage: `url(${trackImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: isRunning ? 'brightness(0.85) saturate(1.2)' : 'brightness(0.75) saturate(1.0)',
          transition: 'filter 0.5s ease',
        }} />

        {/* Hidden img to get natural aspect ratio */}
        <img
          src={trackImage}
          alt=""
          onLoad={handleImageLoad}
          style={{ display: 'none' }}
        />

        {/* Dark vignette overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Animated car glow dot */}
        {(isRunning || progress > 0) && (
          <div style={{
            position: 'absolute',
            left: `${carX}%`,
            top: `${carY}%`,
            transform: 'translate(-50%, -50%)',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#e10600',
            boxShadow: '0 0 20px 8px rgba(225,6,0,0.6), 0 0 60px 20px rgba(225,6,0,0.3)',
            zIndex: 10,
            transition: 'left 0.08s linear, top 0.08s linear',
          }}>
            <div style={{
              position: 'absolute',
              inset: '4px',
              borderRadius: '50%',
              background: 'white',
            }} />
          </div>
        )}

        {/* Circuit name badge - centered top */}
        {trackName && (
          <div style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 5,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              background: 'rgba(10,10,20,0.8)',
              padding: '6px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              backdropFilter: 'blur(8px)',
              whiteSpace: 'nowrap',
            }}>
              {trackName}
            </span>
          </div>
        )}

        {/* Lap counter - top left */}
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 5,
          background: 'rgba(10,10,20,0.85)', borderRadius: '10px',
          padding: '0.5rem 0.75rem', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Lap
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--accent-red)', fontWeight: 'bold' }}>
            {currentLap + 1} / {totalLaps}
          </div>
        </div>

        {/* Lap time - top right */}
        <div style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 5,
          background: 'rgba(10,10,20,0.85)', borderRadius: '10px',
          padding: '0.5rem 0.75rem', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)', textAlign: 'right',
        }}>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '2px' }}>
            Lap Time
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--accent-cyan)' }}>
            {formatTime(elapsed)}
          </div>
        </div>

        {/* Lap progress ring - bottom right */}
        <div style={{
          position: 'absolute', bottom: '12px', right: '12px', zIndex: 5,
        }}>
          <svg width="56" height="56" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="28" cy="28" r="22" fill="rgba(10,10,20,0.7)" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="28" cy="28" r="22"
              fill="none"
              stroke="#e10600"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-display)', fontSize: '0.65rem', color: 'var(--text-primary)', fontWeight: 'bold',
          }}>
            {Math.round(progress * 100)}%
          </div>
        </div>

        {/* Status badge - bottom left */}
        {finished && (
          <div style={{
            position: 'absolute', bottom: '12px', left: '12px', zIndex: 5,
            background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: '8px', padding: '6px 14px',
            backdropFilter: 'blur(8px)',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: '0.7rem',
              letterSpacing: '1.5px', color: 'var(--accent-neon)', fontWeight: 'bold',
            }}>
              ✓ RACE COMPLETE
            </span>
          </div>
        )}
      </div>

      {/* Bottom telemetry bar */}
      <div style={{
        display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '0.75rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          background: 'rgba(10,10,20,0.85)', borderRadius: '8px',
          padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', minWidth: '90px', flex: 1,
        }}>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>Speed</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--accent-orange)' }}>
            {currentSpeed || '—'} <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>km/h</span>
          </div>
        </div>
        <div style={{
          background: 'rgba(10,10,20,0.85)', borderRadius: '8px',
          padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', minWidth: '90px', flex: 1,
        }}>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>Tire Wear</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: currentTireWear > 70 ? '#e10600' : currentTireWear > 40 ? 'var(--accent-orange)' : 'var(--accent-neon)' }}>
            {currentTireWear || 0}<span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>%</span>
          </div>
        </div>
        <div style={{
          background: 'rgba(10,10,20,0.85)', borderRadius: '8px',
          padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', minWidth: '90px', flex: 1,
        }}>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>Target</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {formatTime(currentLapTime)}
          </div>
        </div>
        <div style={{
          background: 'rgba(10,10,20,0.85)', borderRadius: '8px',
          padding: '0.4rem 0.8rem', border: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center', minWidth: '90px', flex: 1,
        }}>
          <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)' }}>Race Progress</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {Math.round(totalProgress * 100)}<span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>%</span>
          </div>
        </div>
      </div>

      {/* Lap progress bar */}
      <div style={{ margin: '0.75rem 0 0.5rem', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${progress * 100}%`,
          background: 'linear-gradient(90deg, #e10600, #ff4444)',
          transition: 'width 0.1s linear',
          borderRadius: '2px',
        }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {!isRunning ? (
          <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium cursor-pointer transition-all border-none" onClick={handleStart}>
            {finished ? '↻ Restart' : currentLap === 0 && progress === 0 ? '▶ Start Race' : '▶ Resume'}
          </button>
        ) : (
          <button className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 font-medium cursor-pointer transition-all bg-transparent" onClick={() => setIsRunning(false)}>
            ⏸ Pause
          </button>
        )}
        <button className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 font-medium cursor-pointer transition-all bg-transparent" onClick={handleReset}>
          ⏹ Reset
        </button>
        {finished && (
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--accent-neon)', letterSpacing: '1px' }}>
            RACE COMPLETE — {totalLaps} laps finished
          </span>
        )}
      </div>
    </div>
  );
}
