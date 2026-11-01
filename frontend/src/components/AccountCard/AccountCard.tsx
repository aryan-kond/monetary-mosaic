import { useState } from 'react';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import '../SettingsList/SettingsList.css';
import './AccountCard.css';

interface AccountCardProps {
  email: string;
  /** True while sign-in is switched off for development. */
  authDisabled: boolean;
  /** Should throw if the server could not end the session. */
  onSignOut: () => Promise<void>;
}

export function AccountCard({ email, authDisabled, onSignOut }: AccountCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setBusy(true);
    setError(null);
    try {
      await onSignOut();
    } catch {
      setError('We could not sign you out. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <Card
      title="Account"
      description={
        authDisabled
          ? 'Sign-in is switched off in this development build.'
          : 'The account you are signed in with.'
      }
    >
      {authDisabled ? (
        <p className="settings-text settings-text--secondary">
          VITE_REQUIRE_AUTH is set to false, so there is no account to sign out of.
        </p>
      ) : (
        <>
          <p className="settings-text">
            Signed in as <strong>{email}</strong>.
          </p>
          <div className="settings-actions">
            <Button variant="secondary" disabled={busy} onClick={handleSignOut}>
              {busy ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
          {error && (
            <p className="account-error" role="alert">
              {error}
            </p>
          )}
        </>
      )}
    </Card>
  );
}
