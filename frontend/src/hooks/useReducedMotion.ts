import { useMediaQuery } from './useMediaQuery';

/** True when the user prefers reduced motion. Use it to switch off chart animation. */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
