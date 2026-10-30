import { useRef, useState, type FormEvent } from 'react';
import { categories, type CategoryId } from '../../data/categories';
import type { Transaction } from '../../data/transactions';
import { ruleKey, type TransactionDetails } from '../../hooks/useTransactionEdits';

import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { DatePickerField } from '../DatePickerField/DatePickerField';
import { Dialog } from '../Dialog/Dialog';
import { CheckboxField } from '../Field/CheckboxField';
import { SelectField, type SelectOption } from '../Field/SelectField';
import { TextField } from '../Field/TextField';
import './EditTransactionDialog.css';

/** Spending moves between spending categories. Income is not one of them. */
const categoryOptions: SelectOption[] = (Object.keys(categories) as CategoryId[])
  .filter((id) => id !== 'income')
  .map((id) => ({ value: id, label: categories[id].label }));

interface Period {
  startDate: string;
  endDate: string;
  days: number;
  label: string;
}

interface Errors {
  merchant?: string;
  amount?: string;
}

/** People may type commas or a ₹ sign, so strip them before reading the number. */
const cleanAmount = (value: string) => value.replace(/[,\s₹]/g, '');
/** Shows paise only when there are some, so 620 stays 620 and 312.4 becomes 312.40. */
const amountToInput = (amount: number) =>
  Number.isInteger(amount) ? String(amount) : amount.toFixed(2);

function validate(merchant: string, amount: string): Errors {
  const errors: Errors = {};
  const digits = cleanAmount(amount);

  if (merchant.trim() === '') errors.merchant = 'Enter a merchant or description.';
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(digits) || Number(digits) <= 0) {
    errors.amount = 'Enter an amount in rupees, for example 1250 or 312.40.';
  }
  return errors;
}

interface FormProps {
  transaction: Transaction;
  rules: Record<string, CategoryId>;
  period: Period;
  onCancel: () => void;
  onSave: (details: TransactionDetails, rememberRule: boolean) => void;
}

function EditTransactionForm({ transaction, rules, period, onCancel, onSave }: FormProps) {
  const isIncome = transaction.direction === 'in';
  const [merchant, setMerchant] = useState(transaction.merchant);
  const [date, setDate] = useState(transaction.date);
  const [amount, setAmount] = useState(amountToInput(transaction.amount));
  const [categoryId, setCategoryId] = useState<CategoryId>(transaction.categoryId);
  const [rememberRule, setRememberRule] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);

  const needsReview = Boolean(transaction.needsReview);
  const hasChanges =
    merchant.trim() !== transaction.merchant ||
    date !== transaction.date ||
    Number(cleanAmount(amount)) !== transaction.amount ||
    categoryId !== transaction.categoryId;
  const canSave = hasChanges || needsReview || rememberRule;
  const saveLabel = !hasChanges && needsReview ? 'Confirm category' : 'Save changes';

  const merchantName = merchant.trim() || transaction.merchant;
  const existingRule = rules[ruleKey(merchantName)];

  const periodNote =
    date < period.startDate
      ? `This date is before ${period.label}, so it will not count in the Overview figures.`
      : date > period.endDate
        ? `This date is after ${period.label}. Saving it changes the period the Overview covers.`
        : undefined;

  const clearError = (field: keyof Errors) =>
    setErrors((current) => ({ ...current, [field]: undefined }));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate(merchant, amount);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      // Move focus to the first field that needs fixing.
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
      return;
    }

    onSave(
      { merchant: merchant.trim(), date, amount: Number(cleanAmount(amount)), categoryId },
      rememberRule,
    );
  };

  return (
    <form ref={formRef} className="edit-form" noValidate onSubmit={handleSubmit}>
      {needsReview && (
        <div className="edit-notice">
          <Chip tone="warning">Needs review</Chip>
          <p>
            This category was assigned automatically and may be wrong. Check it, then confirm or
            change it.
          </p>
        </div>
      )}

      <TextField
        label="Merchant or description"
        value={merchant}
        maxLength={60}
        error={errors.merchant}
        onChange={(value) => {
          setMerchant(value);
          clearError('merchant');
        }}
      />

      <div className="edit-grid">
        <DatePickerField
          label="Date"
          value={date}
          onChange={setDate}
          highlight={{
            startDate: period.startDate,
            days: period.days,
            label: 'Counts in Overview',
          }}
          hint={periodNote}
        />
        <TextField
          label="Amount"
          prefix="₹"
          inputMode="numeric"
          value={amount}
          error={errors.amount}
          hint={errors.amount ? undefined : 'In rupees, for example 1250 or 312.40'}
          onChange={(value) => {
            setAmount(value);
            clearError('amount');
          }}
        />
      </div>

      {!isIncome && (
        <>
          <SelectField
            label="Category"
            value={categoryId}
            options={categoryOptions}
            onChange={(value) => setCategoryId(value as CategoryId)}
          />

          {existingRule && (
            <p className="edit-hint">
              A saved rule already puts future {merchantName} transactions in{' '}
              {categories[existingRule].label}.
            </p>
          )}

          <CheckboxField
            label={`Use ${categories[categoryId].label} for future transactions from ${merchantName}`}
            hint="Applies to future imports only. Transactions you have already imported stay as they are."
            checked={rememberRule}
            onChange={setRememberRule}
          />
        </>
      )}

      {!canSave && <p className="edit-hint">Change a detail to turn on Save.</p>}

      <div className="edit-actions">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canSave}>
          {saveLabel}
        </Button>
      </div>
    </form>
  );
}

interface EditTransactionDialogProps {
  open: boolean;
  /** Changes every time the dialog opens, so the form starts fresh. */
  session: number;
  transaction: Transaction | undefined;
  /** Categories the person chose to remember, keyed by merchant. */
  rules: Record<string, CategoryId>;
  /** The reporting period, used to warn when a date falls outside it. */
  period: Period;
  onClose: () => void;
  onSave: (details: TransactionDetails, rememberRule: boolean) => void;
}

export function EditTransactionDialog({
  open,
  session,
  transaction,
  rules,
  period,
  onClose,
  onSave,
}: EditTransactionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit transaction"
      description="Change any detail. Totals and charts update to match."
    >
      {transaction && (
        <EditTransactionForm
          key={session}
          transaction={transaction}
          rules={rules}
          period={period}
          onCancel={onClose}
          onSave={onSave}
        />
      )}
    </Dialog>
  );
}
