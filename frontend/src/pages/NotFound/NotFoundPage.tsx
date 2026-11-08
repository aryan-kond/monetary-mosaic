import { useEffect } from 'react';
import { Button } from '../../components/Button/Button';
import { ButtonLink } from '../../components/Button/ButtonLink';
import './NotFoundPage.css';

/** The outline is drawn first and the same shapes again on top, so only the outer edge shows. */
function CloudShapes() {
  return (
    <>
      <circle cx="70" cy="84" r="26" />
      <circle cx="118" cy="64" r="36" />
      <circle cx="166" cy="82" r="28" />
      <rect x="70" y="84" width="96" height="26" />
    </>
  );
}

/** A small sad cloud with a tear, and rain. It is decoration, so screen readers skip it. */
function SadCloud() {
  return (
    <svg className="not-found__art" viewBox="0 0 240 160" aria-hidden="true" focusable="false">
      <g className="not-found__cloud">
        <g className="not-found__cloud-outline">
          <CloudShapes />
        </g>
        <g className="not-found__cloud-fill">
          <CloudShapes />
        </g>
        <ellipse className="not-found__eye" cx="103" cy="80" rx="4" ry="5" />
        <ellipse className="not-found__eye" cx="133" cy="80" rx="4" ry="5" />
        <path className="not-found__mouth" d="M107 101 Q118 91 129 101" />
        <path className="not-found__tear" d="M99 88 C95 94 94 98 99 98 C104 98 103 94 99 88 Z" />
      </g>
      <g className="not-found__rain">
        <line className="not-found__drop" x1="92" y1="124" x2="92" y2="136" />
        <line className="not-found__drop" x1="118" y1="124" x2="118" y2="136" />
        <line className="not-found__drop" x1="144" y1="124" x2="144" y2="136" />
      </g>
    </svg>
  );
}

export function NotFoundPage() {
  // Opened in a new tab, there is nowhere to go back to, so the button is left out.
  const canGoBack = window.history.length > 1;

  useEffect(() => {
    document.title = 'Page not found · Monetary Mosaic';
  }, []);

  return (
    <main className="not-found">
      <SadCloud />
      <p className="not-found__code" aria-hidden="true">
        404
      </p>
      <h1 className="not-found__title">
        <span className="visually-hidden">Error 404. </span>
        We can&apos;t find that page
      </h1>
      <p className="not-found__text">
        The address may be mistyped, or the page may have moved. Nothing is wrong with your account
        or your data.
      </p>

      <div className="not-found__actions">
        <ButtonLink href="/">Go to Overview</ButtonLink>
        {canGoBack && (
          <Button variant="secondary" onClick={() => window.history.back()}>
            Go back
          </Button>
        )}
      </div>
    </main>
  );
}
