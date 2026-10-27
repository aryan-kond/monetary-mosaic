import { useEffect, useRef, useState } from 'react';
import { Button } from '../Button/Button';
import './UndoToast.css';

/** Long enough to read and decide. The timer pauses while the pointer or focus is on the toast. */
const AUTO_DISMISS_MS = 10000;

interface UndoToastProps {
  /** Null hides the toast. */
  message: string | null;
  /** Changes with every new message, even when the text is the same, so the timer restarts. */
  messageId: number | null;
  onUndo: () => void;
  onDismiss: () => void;
}

/** Ctrl+Z should keep working normally while someone is typing. */
function isTypingTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

export function UndoToast({ message, messageId, onUndo, onDismiss }: UndoToastProps) {
  // Keep the last message while the toast fades out, so the text does not vanish first.
  const [displayed, setDisplayed] = useState(message);
  if (message !== null && message !== displayed) setDisplayed(message);

  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = message !== null;
  const paused = hovered || focused;

  // A hidden toast cannot be hovered or focused, so forget any leftover state.
  if (!visible && (hovered || focused)) {
    setHovered(false);
    setFocused(false);
  }

  const onUndoRef = useRef(onUndo);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onUndoRef.current = onUndo;
    onDismissRef.current = onDismiss;
  });

  // Close by itself after a while. Hovering or focusing pauses it, and leaving restarts it.
  useEffect(() => {
    if (!visible || paused) return;
    const timer = window.setTimeout(() => onDismissRef.current(), AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [visible, paused, messageId]);

  // Ctrl+Z (Cmd+Z on Mac) undoes the change, unless someone is typing or a dialog is open.
  useEffect(() => {
    if (!visible) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isUndo =
        event.key.toLowerCase() === 'z' &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey &&
        !event.altKey;
      if (!isUndo || isTypingTarget(event.target) || document.querySelector('dialog[open]')) return;

      event.preventDefault();
      onUndoRef.current();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [visible]);

  return (
    <>
      {/* Screen readers hear the message once, when it appears. */}
      <div className="visually-hidden" role="status">
        {message}
      </div>

      <div className="toast-region">
        <div
          className={visible ? 'toast toast--visible' : 'toast'}
          inert={!visible}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          <p className="toast__message">{displayed}</p>
          <Button
            variant="secondary"
            size="compact"
            aria-keyshortcuts="Control+Z Meta+Z"
            onClick={onUndo}
          >
            Undo
          </Button>
        </div>
      </div>
    </>
  );
}
