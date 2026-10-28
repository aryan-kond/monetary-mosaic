import { useMemo, useState } from 'react';
import type { ParsedCsv } from '../../utils/csv';
import { signConventionFor, dateFormatFor } from '../../utils/detectColumns';
import { formatExactCurrency } from '../../utils/formatCurrency';
import { formatFullDate } from '../../utils/formatDate';
import { summarizeAmounts } from '../../utils/importAmounts';
import { dateFormatNames, detectDateFormat, type DateFormat } from '../../utils/importDates';
import {
  columnValues,
  readRow,
  sampleValues,
  validateMapping,
  type AmountLayout,
  type ColumnMapping,
  type FieldKey,
  type SignConvention,
} from '../../utils/importMapping';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { RadioGroupField } from '../Field/RadioGroupField';
import { SelectField, type SelectOption } from '../Field/SelectField';
import './ColumnsStep.css';

interface ColumnsStepProps {
  parsed: ParsedCsv;
  mapping: ColumnMapping;
  /** Fields that were matched by a best guess and still need a look. */
  guessed: FieldKey[];
  onChange: (mapping: ColumnMapping) => void;
  onBack: () => void;
  onContinue: () => void;
}

interface Status {
  tone: 'positive' | 'warning' | 'neutral';
  text: string;
}

const toIndex = (value: string) => (value === '' ? null : Number(value));

export function ColumnsStep({
  parsed,
  mapping,
  guessed,
  onChange,
  onBack,
  onContinue,
}: ColumnsStepProps) {
  /** Fields the person has looked at, so their "Please check" label goes away. */
  const [checked, setChecked] = useState<FieldKey[]>([]);
  const [signChecked, setSignChecked] = useState(false);

  const { issues, ready } = useMemo(() => validateMapping(parsed, mapping), [parsed, mapping]);

  const update = (changes: Partial<ColumnMapping>, field: FieldKey) => {
    onChange({ ...mapping, ...changes });
    setChecked((current) => (current.includes(field) ? current : [...current, field]));
  };

  // Column choices. Duplicate names get their column number so they can be told apart.
  const duplicates = new Set(
    parsed.headers.filter((name, i) => parsed.headers.indexOf(name) !== i),
  );
  const columnOptions = (emptyLabel: string): SelectOption[] => [
    { value: '', label: emptyLabel },
    ...parsed.headers.map((name, index) => {
      const shown = name || `Column ${index + 1}`;
      return {
        value: String(index),
        label: duplicates.has(name) ? `${shown} (column ${index + 1})` : shown,
      };
    }),
  ];

  const examples = (index: number | null) =>
    index === null ? undefined : `Examples: ${sampleValues(parsed, index, 3).join(', ')}`;

  const statusFor = (field: FieldKey, index: number | null, isOptional = false): Status => {
    if (issues[field]) return { tone: 'warning', text: 'Needs input' };
    if (index === null) {
      return isOptional
        ? { tone: 'neutral', text: 'Optional' }
        : { tone: 'warning', text: 'Needs input' };
    }
    if (guessed.includes(field) && !checked.includes(field)) {
      return { tone: 'warning', text: 'Please check' };
    }
    return { tone: 'positive', text: 'Matched' };
  };

  const badge = (status: Status) => <Chip tone={status.tone}>{status.text}</Chip>;

  // Dates
  const dateDetection =
    mapping.date === null ? null : detectDateFormat(columnValues(parsed, mapping.date));
  const dateHint = [
    examples(mapping.date),
    mapping.dateFormat && !dateDetection?.ambiguous
      ? `Read as ${dateFormatNames[mapping.dateFormat]}`
      : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  // Amounts in one column
  const amountSummary = summarizeAmounts(
    mapping.amount === null ? [] : columnValues(parsed, mapping.amount),
  );
  const needsSignQuestion =
    mapping.layout === 'single' &&
    mapping.amount !== null &&
    amountSummary.total > 0 &&
    amountSummary.explicit === 0;
  const allPositive = amountSummary.negative === 0;
  const signNeedsCheck = needsSignQuestion && !allPositive && !signChecked;

  let amountStatus = statusFor('amount', mapping.amount);
  if (amountStatus.tone === 'positive' && signNeedsCheck) {
    amountStatus = { tone: 'warning', text: 'Please check' };
  }

  // Banner
  const messages = Object.values(issues).filter((message): message is string => Boolean(message));
  const needsCheck = signNeedsCheck || guessed.some((field) => !checked.includes(field));

  let banner: { tone: 'ok' | 'check' | 'help'; title: string; text?: string };
  if (!ready) {
    banner = {
      tone: 'help',
      title: `We need your help with ${messages.length} ${messages.length === 1 ? 'thing' : 'things'}`,
    };
  } else if (needsCheck) {
    banner = {
      tone: 'check',
      title: 'We matched your columns',
      text: 'A few were matched by best guess. Check the fields marked Please check, then continue.',
    };
  } else {
    banner = {
      tone: 'ok',
      title: 'We matched all your columns',
      text: 'Check the preview below, then continue.',
    };
  }

  const previewRows = parsed.rows.slice(0, 4).map((row) => readRow(row, mapping));

  return (
    <div className="columns">
      <div className={`match-banner match-banner--${banner.tone}`} role="status">
        <p className="match-banner__title">{banner.title}</p>
        {banner.text && <p>{banner.text}</p>}
        {!ready && (
          <ul className="match-banner__list">
            {messages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="columns__grid">
        <SelectField
          label="Date"
          value={mapping.date === null ? '' : String(mapping.date)}
          options={columnOptions('Choose a column')}
          hint={dateHint || undefined}
          error={issues.date}
          badge={badge(statusFor('date', mapping.date))}
          onChange={(value) => {
            const index = toIndex(value);
            update(
              { date: index, dateFormat: index === null ? null : dateFormatFor(parsed, index) },
              'date',
            );
          }}
        />

        <SelectField
          label="Description"
          value={mapping.description === null ? '' : String(mapping.description)}
          options={columnOptions('Choose a column')}
          hint={examples(mapping.description)}
          error={issues.description}
          badge={badge(statusFor('description', mapping.description))}
          onChange={(value) => update({ description: toIndex(value) }, 'description')}
        />

        {dateDetection?.ambiguous && dateDetection.example && (
          <div className="columns__wide">
            <RadioGroupField
              legend="How are the dates written in your file?"
              value={mapping.dateFormat ?? ''}
              error={issues.dateFormat}
              options={[
                {
                  value: 'dmy',
                  label: 'Day first',
                  description: `${dateDetection.example.text} means ${dateDetection.example.dayFirst}`,
                },
                {
                  value: 'mdy',
                  label: 'Month first',
                  description: `${dateDetection.example.text} means ${dateDetection.example.monthFirst}`,
                },
              ]}
              onChange={(value) => update({ dateFormat: value as DateFormat }, 'dateFormat')}
            />
          </div>
        )}

        {!dateDetection?.ambiguous && issues.dateFormat && (
          <p className="field__error columns__wide">{issues.dateFormat}</p>
        )}

        <div className="columns__wide">
          <RadioGroupField
            legend="How are amounts shown?"
            value={mapping.layout}
            options={[
              {
                value: 'single',
                label: 'One amount column',
                description:
                  'Money out and money in share a column, as negative and positive numbers.',
              },
              {
                value: 'split',
                label: 'Separate debit and credit columns',
                description: 'One column for money going out, and one for money coming in.',
              },
            ]}
            onChange={(value) => update({ layout: value as AmountLayout }, 'layout')}
          />
        </div>

        {mapping.layout === 'single' ? (
          <>
            <SelectField
              label="Amount"
              value={mapping.amount === null ? '' : String(mapping.amount)}
              options={columnOptions('Choose a column')}
              hint={examples(mapping.amount)}
              error={issues.amount}
              badge={badge(amountStatus)}
              onChange={(value) => {
                const index = toIndex(value);
                setSignChecked(false);
                update(
                  {
                    amount: index,
                    signConvention: index === null ? null : signConventionFor(parsed, index),
                  },
                  'amount',
                );
              }}
            />

            {needsSignQuestion && (
              <div className="columns__wide">
                <RadioGroupField
                  legend={
                    allPositive
                      ? 'Are these amounts money going out or coming in?'
                      : 'Which amounts are money going out?'
                  }
                  value={mapping.signConvention ?? ''}
                  error={issues.signConvention}
                  options={
                    allPositive
                      ? [
                          {
                            value: 'positiveOut',
                            label: 'Money going out (spending)',
                            description: `All ${amountSummary.total} amounts are positive. Choose this for a credit card or spending-only statement.`,
                          },
                          {
                            value: 'negativeOut',
                            label: 'Money coming in (income)',
                            description: 'Choose this only if the file lists deposits.',
                          },
                        ]
                      : [
                          {
                            value: 'negativeOut',
                            label: 'Negative amounts',
                            description: `${amountSummary.negative} negative and ${amountSummary.positive} positive. Most bank accounts work this way.`,
                          },
                          {
                            value: 'positiveOut',
                            label: 'Positive amounts',
                            description:
                              'Common in credit card statements, where purchases are positive.',
                          },
                        ]
                  }
                  onChange={(value) => {
                    setSignChecked(true);
                    update({ signConvention: value as SignConvention }, 'signConvention');
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <>
            <SelectField
              label="Debit (money out)"
              value={mapping.debit === null ? '' : String(mapping.debit)}
              options={columnOptions('None')}
              hint={examples(mapping.debit)}
              error={issues.debit}
              badge={badge(statusFor('debit', mapping.debit, true))}
              onChange={(value) => update({ debit: toIndex(value) }, 'debit')}
            />
            <SelectField
              label="Credit (money in)"
              value={mapping.credit === null ? '' : String(mapping.credit)}
              options={columnOptions('None')}
              hint={examples(mapping.credit)}
              error={issues.credit}
              badge={badge(statusFor('credit', mapping.credit, true))}
              onChange={(value) => update({ credit: toIndex(value) }, 'credit')}
            />
          </>
        )}

        <SelectField
          label="Category (optional)"
          value={mapping.category === null ? '' : String(mapping.category)}
          options={columnOptions('Not in my file')}
          hint={
            examples(mapping.category) ??
            'If your bank already labels transactions, we use its labels as a starting suggestion.'
          }
          badge={badge(statusFor('category', mapping.category, true))}
          onChange={(value) => update({ category: toIndex(value) }, 'category')}
        />

        <SelectField
          label="Currency (optional)"
          value={mapping.currency === null ? '' : String(mapping.currency)}
          options={columnOptions('Not in my file')}
          hint={examples(mapping.currency) ?? 'Amounts are read as rupees (₹).'}
          error={issues.currency}
          badge={badge(statusFor('currency', mapping.currency, true))}
          onChange={(value) => update({ currency: toIndex(value) }, 'currency')}
        />
      </div>

      <section className="preview" aria-labelledby="preview-title">
        <h3 id="preview-title" className="preview__title">
          How we will read your first rows
        </h3>
        {ready ? (
          <div className="preview__frame">
            {/* The roles keep this a table for screen readers even when CSS stacks the rows. */}
            <table className="preview__table" role="table">
              <caption className="visually-hidden">
                First rows of your file, as they will be read
              </caption>
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col">
                    Date
                  </th>
                  <th role="columnheader" scope="col">
                    Description
                  </th>
                  <th role="columnheader" scope="col">
                    Amount
                  </th>
                  <th role="columnheader" scope="col">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {previewRows.map((row, index) => (
                  <tr key={index} role="row">
                    <td role="cell" className="preview__date">
                      {row.date ? formatFullDate(row.date) : 'Cannot read date'}
                    </td>
                    <td role="cell" className="preview__description">
                      {row.description || 'No description'}
                    </td>
                    <td role="cell" className="preview__amount tabular">
                      {row.amount === null ? 'Cannot read amount' : formatExactCurrency(row.amount)}
                    </td>
                    <td role="cell" className="preview__type">
                      {row.direction === 'out'
                        ? 'Money out'
                        : row.direction === 'in'
                          ? 'Money in'
                          : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="preview__empty">Finish matching your columns above to see a preview.</p>
        )}
        <p className="preview__note">
          Rows that cannot be read will be flagged in the review step, and nothing is imported until
          you confirm.
        </p>
      </section>

      <div className="columns__actions">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!ready} onClick={onContinue}>
          Continue
        </Button>
      </div>
      {!ready && <p className="preview__note">Finish the steps above to turn on Continue.</p>}
    </div>
  );
}
