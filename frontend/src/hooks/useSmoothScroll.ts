import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

/**
 * Subtle smooth scrolling with Lenis.
 * - Disabled entirely when the user prefers reduced motion.
 * - While `paused` is true (for example, a drawer is open) page scrolling is locked.
 * Scrollable inner areas should carry `data-lenis-prevent` so they keep native scrolling.
 */
export function useSmoothScroll(paused = false) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    const sync = () => {
      if (query.matches) {
        lenisRef.current?.destroy();
        lenisRef.current = null;
      } else if (!lenisRef.current) {
        lenisRef.current = new Lenis({ autoRaf: true, duration: 0.9 });
      }
    };

    sync();
    query.addEventListener('change', sync);
    return () => {
      query.removeEventListener('change', sync);
      lenisRef.current?.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!paused) return;
    lenisRef.current?.stop();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      lenisRef.current?.start();
    };
  }, [paused]);
}
