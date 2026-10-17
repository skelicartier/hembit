import { useEffect, useRef } from 'react';

/**
 * Void cursor — a difference-blend dot + trailing ring for fine pointers.
 * Disabled for touch devices and reduced-motion users.
 */
export function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const html = document.documentElement;
    html.classList.add('has-cursor', 'cursor-idle');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let hover = false;
    let raf = null;

    const onMove = (event) => {
      mx = event.clientX;
      my = event.clientY;
      html.classList.remove('cursor-idle');
      const target = event.target;
      const isInteractive = !!(
        target &&
        target.closest &&
        target.closest('a, button, input, select, textarea, summary, label, [role="button"]')
      );
      if (isInteractive !== hover) {
        hover = isInteractive;
        ringRef.current?.classList.toggle('is-hover', hover);
      }
    };

    const onLeave = () => html.classList.add('cursor-idle');
    const onEnter = () => html.classList.remove('cursor-idle');

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) scale(${hover ? 1.45 : 1})`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseout', onLeave);
    window.addEventListener('mouseover', onEnter);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
      window.removeEventListener('mouseover', onEnter);
      html.classList.remove('has-cursor', 'cursor-idle');
    };
  }, []);

  return (
    <>
      <div className="cursor-dot" ref={dotRef} aria-hidden="true" />
      <div className="cursor-ring" ref={ringRef} aria-hidden="true" />
    </>
  );
}
