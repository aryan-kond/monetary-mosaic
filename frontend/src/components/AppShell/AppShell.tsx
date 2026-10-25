import { useEffect, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';

import { Menu } from 'lucide-react';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { Logo } from '../Logo/Logo';
import { Sidebar } from '../Sidebar/Sidebar';
import type { NavId } from '../Sidebar/navItems';
import './AppShell.css';

/** Below this width the sidebar becomes a drawer. Keep in sync with AppShell.css. */
const MOBILE_QUERY = '(max-width: 899px)';
/** Guidelines: dialogs and drawers use 300-350 ms. */
const DRAWER_SECONDS = 0.33;

interface AppShellProps {
  activeId: NavId;
  onNavigate: (id: NavId) => void;
  children: ReactNode;
}

export function AppShell({ activeId, onNavigate, children }: AppShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useSmoothScroll(drawerOpen);

  // Build the drawer animation only while the viewport is small.
  useEffect(() => {
    const mm = gsap.matchMedia(shellRef.current ?? undefined);
    mm.add(MOBILE_QUERY, () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timeline = gsap.timeline({
        paused: true,
        defaults: { duration: reduceMotion ? 0.001 : DRAWER_SECONDS, ease: 'power2.out' },
        onComplete: () => {
          sidebarRef.current?.querySelector<HTMLElement>('.nav-link')?.focus();
        },
        onReverseComplete: () => {
          menuButtonRef.current?.focus();
        },
      });
      timeline
        .fromTo(
          sidebarRef.current,
          { xPercent: -100, autoAlpha: 0 },
          { xPercent: 0, autoAlpha: 1 },
          0,
        )
        .fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1 }, 0);
      timelineRef.current = timeline;

      return () => {
        timelineRef.current = null;
      };
    });
    return () => mm.revert();
  }, []);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;
    if (drawerOpen) {
      timeline.play();
    } else if (timeline.progress() > 0) {
      timeline.reverse();
    }
  }, [drawerOpen]);

  // Escape closes the drawer.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  // Growing past the breakpoint resets the drawer so it is never stuck open.
  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (!event.matches) setDrawerOpen(false);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const handleNavigate = (id: NavId) => {
    onNavigate(id);
    setDrawerOpen(false);
  };

  return (
    <div className="app-shell" ref={shellRef}>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <header className="app-shell__topbar" inert={drawerOpen}>
        <button
          ref={menuButtonRef}
          type="button"
          className="icon-button"
          aria-label="Open navigation"
          aria-expanded={drawerOpen}
          aria-controls="app-sidebar"
          onClick={() => setDrawerOpen(true)}
        >
          <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <Logo variant="mark" height={36} />
      </header>

      <div
        className="app-shell__backdrop"
        ref={backdropRef}
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
      />

      <div id="app-sidebar" className="app-shell__sidebar" ref={sidebarRef} data-lenis-prevent>
        <Sidebar
          activeId={activeId}
          onNavigate={handleNavigate}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      <main id="main-content" className="app-shell__main" tabIndex={-1} inert={drawerOpen}>
        <div className="app-shell__content">{children}</div>
      </main>
    </div>
  );
}
