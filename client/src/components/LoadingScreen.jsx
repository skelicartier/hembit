import { useEffect, useRef, useState } from 'react';
import logoVideo from '../assets/logo-animation.mp4';

export function LoadingScreen({ onFinished, waitForBackend = false }) {
  const MIN_LOADING_MS = 1250;
  const BACKEND_RETRY_MS = 750;
  const [phase, setPhase] = useState('playing'); // playing → fading → done
  const [isColdStart, setIsColdStart] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);
  const minDelayPassed = useRef(false);
  const backendReady = useRef(!waitForBackend); // skip check if not needed
  const fadeStarted = useRef(false);

  const tryFade = () => {
    if (fadeStarted.current) return;
    if (!minDelayPassed.current || !backendReady.current) return;
    fadeStarted.current = true;
    setPhase('fading');
  };

  /* Enforce minimum loader time */
  useEffect(() => {
    const timer = setTimeout(() => {
      minDelayPassed.current = true;
      tryFade();
    }, MIN_LOADING_MS);
    return () => clearTimeout(timer);
  }, []);

  /* Progress readout — real elapsed time until ready */
  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setProgress((prev) => {
        if (fadeStarted.current) return 1;
        const target = Math.min(0.94, elapsed / 3200);
        return Math.max(prev, target);
      });
    }, 60);
    return () => clearInterval(interval);
  }, []);

  /* Ping backend health until it responds */
  useEffect(() => {
    if (!waitForBackend) return;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const MAX_BACKEND_WAIT_MS = 20000;
    const startedAt = Date.now();
    let cancelled = false;

    let firstAttempt = true;
    const finish = () => {
      backendReady.current = true;
      tryFade();
    };

    const ping = async () => {
      while (!cancelled) {
        try {
          const res = await fetch(`${API_URL}/health`, { method: 'GET' });
          if (res.ok) {
            finish();
            return;
          }
        } catch {
          /* server still waking up or unreachable */
        }
        if (firstAttempt) {
          firstAttempt = false;
          if (!cancelled) setIsColdStart(true);
        }
        if (Date.now() - startedAt >= MAX_BACKEND_WAIT_MS) {
          finish();
          return;
        }
        await new Promise((r) => setTimeout(r, BACKEND_RETRY_MS));
      }
    };

    ping();
    return () => { cancelled = true; };
  }, [waitForBackend]);

  /* Try to force-play the video on mount (mobile needs this) */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    vid.setAttribute('muted', '');
    vid.setAttribute('playsinline', '');
    vid.muted = true;

    const playPromise = vid.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(() => {});
    }
  }, []);

  const handleEnded = () => {
    /* If minimum delay/backend still not ready, loop the video */
    if ((!backendReady.current || !minDelayPassed.current) && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
    tryFade();
  };

  useEffect(() => {
    if (phase === 'fading') {
      const timer = setTimeout(() => {
        setPhase('done');
        onFinished?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);

  if (phase === 'done') return null;

  const statusText = phase === 'fading'
    ? 'READY'
    : isColdStart
      ? 'WAKING STOREFRONT'
      : 'LOADING STOREFRONT';
  const percent = String(Math.round((phase === 'fading' ? 1 : progress) * 100)).padStart(3, '0');

  return (
    <div className={`loading-screen${phase === 'fading' ? ' loading-screen--fade-out' : ''}`}>
      <div className="loading-screen-content">
        <div className="loading-screen-stage">
          <video
            ref={videoRef}
            src={logoVideo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={handleEnded}
            className="loading-screen-video"
          />
        </div>
        <div className="loading-screen-meta">
          <span className="loading-screen-status">{statusText}</span>
          <span className="loading-screen-counter">{percent}%</span>
        </div>
        <div className="loading-screen-track">
          <div
            className="loading-screen-bar"
            style={{ transform: `scaleX(${phase === 'fading' ? 1 : progress})` }}
          />
        </div>
        {isColdStart && (
          <div className="loading-screen-brand" aria-hidden="true">
            {'HEMBIT'.split('').map((char, i) => (
              <span key={i} className="loading-screen-letter" style={{ animationDelay: `${i * 0.18}s` }}>
                {char}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
