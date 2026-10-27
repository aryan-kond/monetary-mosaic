import { Button } from '../Button/Button';
import './UndoToast.css';

interface UndoToastProps {
  /** Null hides the message. The region stays in the page so screen readers announce changes. */
  message: string | null;
  onUndo: () => void;
  onDismiss: () => void;
}

/** Stays until dismissed, so nobody has to race a timer to undo a change. */
export function UndoToast({ message, onUndo, onDismiss }: UndoToastProps) {
  return (
    <div className="toast-region" role="status">
      {message && (
        <div className="toast">
          <p className="toast__message">{message}</p>
          <div className="toast__actions">
            <Button variant="secondary" size="compact" onClick={onUndo}>
              Undo
            </Button>
            <button type="button" className="toast__dismiss" onClick={onDismiss}>
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
