import { Button } from '../Button/Button';
import { Logo } from '../Logo/Logo';
import './SessionNotice.css';

interface SessionNoticeProps {
  title: string;
  text?: string;
  /** A way forward, such as trying again. */
  action?: { label: string; onClick: () => void };
}

/** A calm full-page message, shown while the app works out whether anyone is signed in. */
export function SessionNotice({ title, text, action }: SessionNoticeProps) {
  return (
    <main className="session-notice">
      <Logo variant="full" height={64} />
      <div className="session-notice__body" role={action ? 'alert' : 'status'}>
        <h1 className="session-notice__title">{title}</h1>
        {text && <p className="session-notice__text">{text}</p>}
      </div>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </main>
  );
}
