import { useEffect } from 'react';
import { Button } from '../../components/Button/Button';
import { ButtonLink } from '../../components/Button/ButtonLink';
import { Logo } from '../../components/Logo/Logo';
import './NotFoundPage.css';

/** Long addresses are shortened, so they can never push the page wider than the screen. */
const MAX_PATH_LENGTH = 120;

export function NotFoundPage() {
  const path = window.location.pathname;
  const shownPath = path.length > MAX_PATH_LENGTH ? `${path.slice(0, MAX_PATH_LENGTH)}…` : path;
  // Opened in a new tab, there is nowhere to go back to, so the button is left out.
  const canGoBack = window.history.length > 1;

  useEffect(() => {
    document.title = 'Page not found · Monetary Mosaic';
  }, []);

  return (
    <div className="not-found">
      <header className="not-found__header">
        <a href="/" className="not-found__home" aria-label="Go to the Monetary Mosaic start page">
          <Logo variant="full" height={64} />
        </a>
      </header>

      <main className="not-found__main">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found__title">
          <span className="visually-hidden">Error 404. </span>
          We can&apos;t find that page
        </h1>
        <p className="not-found__text">
          The address may be mistyped, or the page may have moved. Nothing is wrong with your
          account or your data.
        </p>
        <p className="not-found__path">
          You tried <code>{shownPath}</code>
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
    </div>
  );
}
