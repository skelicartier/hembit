import { useEffect, useRef, useState } from 'react';

export function LoadingScreen({ onFinished, waitForBackend = false, minTime = 900 }) {
  const BACKEND_RETRY_MS = 600;
  const MAX_BACKEND_WAIT_MS = 5000;
  const [phase, setPhase] = useState('playing'); // playing → fading → done
  const [progress, setProgress] = useState(0);
  const minDelayPassed = useRef(false);
  const backendReady = useRef(!waitForBackend);
  const fadeStarted = useRef(false);

  const tryFade = () => {
    if (fadeStarted.current) return;
    if (!minDelayPassed.current || !backendReady.current) return;
    fadeStarted.current = true;
    setPhase('fading');
  };

  const skip = () => {
    minDelayPassed.current = true;
    backendReady.current = true;
    tryFade();
  };

  /* Minimum on-screen time — the loader never lingers */
  useEffect(() => {
    const timer = setTimeout(() => {
      minDelayPassed.current = true;
      tryFade();
    }, minTime);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minTime]);

  /* Progress readout — real elapsed time */
  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress((prev) => {
        if (fadeStarted.current) return 1;
        const target = Math.min(0.94, elapsed / 2200);
        return Math.max(prev, target);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  /* Bounded backend warm-up ping — never blocks longer than MAX */
  useEffect(() => {
    if (!waitForBackend) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const startedAt = Date.now();
    let cancelled = false;

    const ping = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(`${API_URL}/health`, { method: 'GET' });
          if (res.ok) break;
        } catch {
          /* server still waking up or unreachable */
        }
        if (Date.now() - startedAt >= MAX_BACKEND_WAIT_MS) break;
        await new Promise((resolve) => setTimeout(resolve, BACKEND_RETRY_MS));
      }
      if (!cancelled) {
        backendReady.current = true;
        tryFade();
      }
    };

    ping();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waitForBackend]);

  /* Fade out, then report done */
  useEffect(() => {
    if (phase === 'fading') {
      const timer = setTimeout(() => {
        setPhase('done');
        onFinished?.();
      }, 420);
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);

  if (phase === 'done') return null;

  const statusText = phase === 'fading' ? 'READY' : 'INITIALISING';
  const percent = String(Math.round((phase === 'fading' ? 1 : progress) * 100)).padStart(3, '0');

  return (
    <div
      className={`loading-screen${phase === 'fading' ? ' loading-screen--fade-out' : ''}`}
      role="button"
      tabIndex={0}
      aria-label="Enter site"
      onClick={skip}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') skip();
      }}
    >
      <div className="loading-screen-content">
        <div className="loading-screen-brand" aria-hidden="true">
          {'HEMBIT'.split('').map((char, i) => (
            <span key={i} className="loading-screen-letter" style={{ animationDelay: `${i * 0.07}s` }}>
              {char}
            </span>
          ))}
        </div>
        <span className="loading-screen-tag">MODERN CLOTHING — SYSTEM 2026</span>
        <div className="loading-screen-meta">
          <span>{statusText}</span>
          <span className="loading-screen-counter">{percent}%</span>
        </div>
        <div className="loading-screen-track">
          <div
            className="loading-screen-bar"
            style={{ transform: `scaleX(${phase === 'fading' ? 1 : progress})` }}
          />
        </div>
        <span className="loading-screen-skip">TAP TO ENTER</span>
      </div>
    </div>
  );
}
