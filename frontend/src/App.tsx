import { Workspace } from './Workspace';
import { isAuthPreview, previewSignIn, previewSignUp } from './auth/preview';
import { useSession } from './auth/useSession';
import { SessionNotice } from './components/SessionNotice/SessionNotice';
import { AuthPage } from './pages/Auth/AuthPage';

export default function App() {
  const { state, authDisabled, retry, signIn, signUp, signOut } = useSession();

  // Development only: look at the sign-in screens without a backend.
  if (isAuthPreview) return <AuthPage onSignIn={previewSignIn} onSignUp={previewSignUp} />;

  switch (state.status) {
    case 'checking':
      return <SessionNotice title="Checking your session…" />;
    case 'unreachable':
      return (
        <SessionNotice
          title="We couldn't reach the server"
          text="We can't check whether you're signed in right now. Nothing has been lost. Try again in a moment."
          action={{ label: 'Try again', onClick: retry }}
        />
      );
    case 'signedOut':
      return (
        <AuthPage
          onSignIn={({ email, password }) => signIn(email, password)}
          onSignUp={({ email, password }) => signUp(email, password)}
        />
      );
    case 'signedIn':
      // Keyed by person, so nothing one account had open can carry over to another.
      return (
        <Workspace
          key={state.user.id}
          user={state.user}
          authDisabled={authDisabled}
          onSignOut={signOut}
        />
      );
  }
}
