/** The only address the app answers to for now. Screens switch inside it without changing it. */
export function isKnownPath(pathname: string): boolean {
  return pathname === '/' || pathname === '/index.html';
}
