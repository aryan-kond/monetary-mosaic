import { useRef, useState, type FormEvent } from 'react';
import { amountToInput, readAmount } from '../../utils/amountInput';
import { Button } from '../Button/Button';
import { Dialog } from '../Dialog/Dialog';
import { TextField } from '../Field/TextField';
import './BudgetDialog.css';

const DEFAULT_HINT = 'In rupees, for example 5000';

interface FormProps {
  fieldLabel: string;
  placeholder: string;
  /** Null when no amount is set yet. */
  initialValue: number | null;
  /** Provided only when a limit exists, so it can be cleared. */
  onRemove?: () => void;
  /** A live note about the effect of the amount being typed. */
  getHint?: (amount: number) => string | undefined;
  onCancel: () => void;
  onSave: (amount: number) => void;
}

function BudgetForm({
  fieldLabel,
  placeholder,
  initialValue,
  onRemove,
  getHint,
  onCancel,
  onSave,
}: FormProps) {
  const [value, setValue] = useState(initialValue === null ? '' : amountToInput(initialValue));
  const [error, setError] = useState<string | undefined>();
  const formRef = useRef<HTMLFormElement>(null);

  const amount = readAmount(value);
  const unchanged = initialValue !== null && amount === initialValue;
  const hint = (amount !== null ? getHint?.(amount) : undefined) ?? DEFAULT_HINT;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (amount === null) {
      setError('Enter an amount in rupees, for example 5000.');
      // Move focus to the field that needs fixing.
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }
    onSave(amount);
  };

  return (
    <form ref={formRef} className="budget-form" noValidate onSubmit={handleSubmit}>
      <TextField
        label={fieldLabel}
        prefix="₹"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        hint={error ? undefined : hint}
        error={error}
        onChange={(next) => {
          setValue(next);
          setError(undefined);
        }}
      />

      {unchanged && <p className="budget-form__hint">Change the amount to turn on Save.</p>}

      <div className="budget-form__actions">
        {onRemove && (
          <Button variant="secondary" className="budget-form__remove" onClick={onRemove}>
            Remove limit
          </Button>
        )}
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={unchanged}>
          Save
        </Button>
      </div>
    </form>
  );
}

interface BudgetDialogProps extends Omit<FormProps, 'onCancel'> {
  open: boolean;
  /** Changes every time the dialog opens, so the form starts fresh. */
  session: number;
  title: string;
  description: string;
  onClose: () => void;
}

export function BudgetDialog({
  open,
  session,
  title,
  description,
  onClose,
  ...form
}: BudgetDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} description={description}>
      <BudgetForm key={session} {...form} onCancel={onClose} />
    </Dialog>
  );
}
