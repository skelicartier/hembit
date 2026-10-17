import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scroll reveals — observes [data-reveal] nodes and adds .is-in as they enter.
 * Content is only hidden while "reveal-armed" (set by JS), so nothing ever
 * disappears without JS or for reduced-motion users.
 */
export function Reveals() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const html = document.documentElement;
    html.classList.add('reveal-armed');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.04 }
    );

    let scheduled = false;
    const scan = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el));
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      html.classList.remove('reveal-armed');
    };
  }, [pathname]);

  return null;
}
