import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import './ConfirmDialog.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  /** What will and will not be affected, as short lines. */
  effects?: string[];
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Asks before something that is hard to reverse. Focus starts on Cancel, the safe choice. */
export function ConfirmDialog({
  open,
  title,
  description,
  effects,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} title={title} description={description}>
      {effects && effects.length > 0 && (
        <ul className="confirm__effects">
          {effects.map((effect) => (
            <li key={effect}>{effect}</li>
          ))}
        </ul>
      )}
      <div className="confirm__actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Dialog>
  );
}
