import { useEffect, useState } from 'react';
import {
  fetchSession,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
  type User,
} from '../api/auth';

/** Set VITE_REQUIRE_AUTH=false in frontend/.env.local to work on the screens without a backend. */
const AUTH_DISABLED = import.meta.env.VITE_REQUIRE_AUTH === 'false';
const DEVELOPMENT_USER: User = { id: 'development', email: 'development@example.com' };

export type SessionState =
  | { status: 'checking' }
  /** The server could not be asked, so we do not know whether anyone is signed in. */
  | { status: 'unreachable' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; user: User };

export function useSession() {
  const [state, setState] = useState<SessionState>(
    AUTH_DISABLED ? { status: 'signedIn', user: DEVELOPMENT_USER } : { status: 'checking' },
  );
  const [attempt, setAttempt] = useState(0);

  // Ask the server who is signed in, when the app opens and whenever we retry.
  useEffect(() => {
    if (AUTH_DISABLED) return;
    let cancelled = false;

    fetchSession()
      .then((user) => {
        if (!cancelled) setState(user ? { status: 'signedIn', user } : { status: 'signedOut' });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unreachable' });
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setState({ status: 'checking' });
    setAttempt((current) => current + 1);
  };

  const signIn = async (email: string, password: string) => {
    setState({ status: 'signedIn', user: await apiSignIn(email, password) });
  };

  const signUp = async (email: string, password: string) => {
    setState({ status: 'signedIn', user: await apiSignUp(email, password) });
  };

  /** Throws if the server could not end the session, so the person is not told they are out when they are not. */
  const signOut = async () => {
    await apiSignOut();
    setState({ status: 'signedOut' });
  };

  return { state, authDisabled: AUTH_DISABLED, retry, signIn, signUp, signOut };
}
