import { useRef, useState } from 'react';
import { categories, type CategoryId } from '../../data/categories';
import type { BuiltImport, DuplicateChoice, ImportPlan } from '../../utils/buildImportRows';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatFullDate, formatShortDate } from '../../utils/formatDate';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import { SelectField, type SelectOption } from '../Field/SelectField';
import './ReviewStep.css';

const PAGE_SIZE = 25;
const MAX_EXCLUDED_SHOWN = 10;

/** Spending moves between spending categories. Income is not one of them. */
const categoryOptions: SelectOption[] = (Object.keys(categories) as CategoryId[])
  .filter((id) => id !== 'income')
  .map((id) => ({ value: id, label: categories[id].label }));

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

function rangeText(first: string | null, last: string | null): string {
  if (!first || !last) return '—';
  return first === last
    ? formatFullDate(first)
    : `${formatShortDate(first)} – ${formatFullDate(last)}`;
}

interface ReviewStepProps {
  built: BuiltImport;
  plan: ImportPlan;
  duplicateChoices: Record<number, DuplicateChoice>;
  categoryChoices: Record<number, CategoryId>;
  onDuplicateChoice: (rowNumbers: number[], choice: DuplicateChoice) => void;
  onCategoryChange: (rowNumber: number, categoryId: CategoryId) => void;
  onBack: () => void;
  onImport: () => void;
}

export function ReviewStep({
  built,
  plan,
  duplicateChoices,
  categoryChoices,
  onDuplicateChoice,
  onCategoryChange,
  onBack,
  onImport,
}: ReviewStepProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const duplicates = built.rows.filter((row) => row.duplicate);
  const tableRows = built.rows.filter((row) => !row.duplicate);
  const visibleRows = tableRows.slice(0, visibleCount);
  const reviewCount = plan.rows.filter((row) => row.needsReview).length;
  const canImport = plan.undecided === 0 && plan.rows.length > 0;
  const excludedShown = built.excluded.slice(0, MAX_EXCLUDED_SHOWN);
  const excludedHidden = built.excluded.length - excludedShown.length;

  const showMore = () => {
    const next = visibleCount + PAGE_SIZE;
    setVisibleCount(next);
    // The button disappears once everything is shown, so keep keyboard focus on the page.
    if (next >= tableRows.length) requestAnimationFrame(() => headingRef.current?.focus());
  };

  let banner: { tone: 'ok' | 'check' | 'help'; title: string; text: string };
  if (plan.undecided > 0) {
    banner = {
      tone: 'check',
      title: `Decide what to do with ${plural(plan.undecided, 'possible duplicate')}`,
      text: 'Nothing will be imported until you choose. These look like transactions you already have.',
    };
  } else if (plan.rows.length === 0) {
    banner = {
      tone: 'help',
      title: 'There is nothing to import',
      text:
        built.rows.length === 0
          ? 'None of the rows in your file could be read. Go back and check your columns, or choose a different file.'
          : 'You chose to skip every row. Go back to choose a different file.',
    };
  } else {
    banner = {
      tone: 'ok',
      title: `Ready to import ${plural(plan.rows.length, 'transaction')}`,
      text:
        reviewCount > 0
          ? `${plural(reviewCount, 'transaction')} ${reviewCount === 1 ? 'has' : 'have'} a category we are not sure about. They are marked Needs review. Check them below, or later in Transactions.`
          : 'Check the summary below, then import.',
    };
  }

  return (
    <div className="review">
      <div className={`review-banner review-banner--${banner.tone}`} role="status">
        <p className="review-banner__title">{banner.title}</p>
        <p>{banner.text}</p>
      </div>

      <dl className="review-summary">
        <div>
          <dt>To import</dt>
          <dd>
            {plan.rows.length}
            {plan.undecided > 0 && (
              <span className="review-summary__sub">
                + {plan.undecided} waiting for your decision
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt>Dates</dt>
          <dd className="review-summary__small">{rangeText(plan.firstDate, plan.lastDate)}</dd>
        </div>
        <div>
          <dt>Money out</dt>
          <dd className="tabular">{formatCurrency(plan.moneyOut)}</dd>
        </div>
        <div>
          <dt>Money in</dt>
          <dd className="tabular">{formatCurrency(plan.moneyIn)}</dd>
        </div>
      </dl>

      {built.excluded.length > 0 && (
        <section className="review-section" aria-labelledby="excluded-title">
          <h3 id="excluded-title" className="review-section__title">
            {plural(built.excluded.length, 'row')} will be left out
          </h3>
          <p className="review-section__text">
            We could not read {built.excluded.length === 1 ? 'this row' : 'these rows'}, so{' '}
            {built.excluded.length === 1 ? 'it' : 'they'} will not be imported. Fix{' '}
            {built.excluded.length === 1 ? 'it' : 'them'} in your file and upload it again, or
            continue without {built.excluded.length === 1 ? 'it' : 'them'}.
          </p>
          <ul className="excluded-list">
            {excludedShown.map((row) => (
              <li key={row.rowNumber} className="excluded-list__item">
                <p className="excluded-list__reason">
                  <strong>Row {row.rowNumber}.</strong> {row.reason}
                </p>
                <p className="excluded-list__preview">{row.preview}</p>
              </li>
            ))}
          </ul>
          {excludedHidden > 0 && (
            <p className="review-section__text">
              And {plural(excludedHidden, 'more row')} with similar problems.
            </p>
          )}
        </section>
      )}

      {duplicates.length > 0 && (
        <section className="review-section" aria-labelledby="duplicates-title">
          <h3 id="duplicates-title" className="review-section__title">
            {plural(duplicates.length, 'possible duplicate')}
          </h3>
          <p className="review-section__text">
            Each of these matches a transaction you already have on date, amount, and name. An equal
            amount alone is never treated as a duplicate. Choose what to do with each one. Nothing
            you already have will be changed.
          </p>

          {duplicates.length > 1 && (
            <div className="review-bulk">
              <Button
                variant="secondary"
                size="compact"
                onClick={() =>
                  onDuplicateChoice(
                    duplicates.map((row) => row.rowNumber),
                    'skip',
                  )
                }
              >
                Skip all
              </Button>
              <Button
                variant="secondary"
                size="compact"
                onClick={() =>
                  onDuplicateChoice(
                    duplicates.map((row) => row.rowNumber),
                    'import',
                  )
                }
              >
                Import all anyway
              </Button>
            </div>
          )}

          <ul className="duplicate-list">
            {duplicates.map((row) => {
              const choice = duplicateChoices[row.rowNumber];
              return (
                <li key={row.rowNumber} className="duplicate-list__item">
                  <div className="duplicate-list__info">
                    <p className="duplicate-list__title">
                      {row.merchant} · {formatShortDate(row.date)} ·{' '}
                      <span className="tabular">{formatCurrency(row.amount)}</span>
                    </p>
                    <p className="duplicate-list__detail">
                      Row {row.rowNumber} in your file: {row.description}
                    </p>
                    <p className="duplicate-list__detail">{row.duplicate?.reason}</p>
                    {choice === undefined && (
                      <p className="duplicate-list__pending">Choose what to do</p>
                    )}
                  </div>
                  <div
                    className="duplicate-list__choice"
                    role="group"
                    aria-label={`What to do with ${row.merchant} on ${formatShortDate(row.date)}`}
                  >
                    <Button
                      variant="secondary"
                      size="compact"
                      aria-pressed={choice === 'skip'}
                      onClick={() => onDuplicateChoice([row.rowNumber], 'skip')}
                    >
                      Skip
                    </Button>
                    <Button
                      variant="secondary"
                      size="compact"
                      aria-pressed={choice === 'import'}
                      onClick={() => onDuplicateChoice([row.rowNumber], 'import')}
                    >
                      Import anyway
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {tableRows.length > 0 && (
        <section className="review-section" aria-labelledby="rows-title">
          <h3 id="rows-title" ref={headingRef} tabIndex={-1} className="review-section__title">
            Transactions to import
          </h3>
          <p className="review-section__text">
            Change a category if it is wrong. Categories marked Needs review are our best guess.
          </p>

          <div className="review-table-wrap">
            {/* The roles keep this a table for screen readers even when CSS stacks the rows. */}
            <table className="review-table" role="table">
              <caption className="visually-hidden">Transactions that will be imported</caption>
              <colgroup>
                <col className="review-table__col-date" />
                <col />
                <col className="review-table__col-category" />
                <col className="review-table__col-amount" />
                <col className="review-table__col-status" />
              </colgroup>
              <thead role="rowgroup">
                <tr role="row">
                  <th role="columnheader" scope="col">
                    Date
                  </th>
                  <th role="columnheader" scope="col">
                    Description
                  </th>
                  <th role="columnheader" scope="col">
                    Category
                  </th>
                  <th role="columnheader" scope="col">
                    Amount
                  </th>
                  <th role="columnheader" scope="col">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody role="rowgroup">
                {visibleRows.map((row) => {
                  const chosen = categoryChoices[row.rowNumber];
                  const categoryId = chosen ?? row.categoryId;
                  const stillAGuess = row.needsReview && chosen === undefined;

                  return (
                    <tr key={row.rowNumber} role="row">
                      <td role="cell" className="review-table__date">
                        <time dateTime={row.date}>{formatShortDate(row.date)}</time>
                      </td>
                      <td role="cell" className="review-table__merchant">
                        <span className="review-table__name">{row.merchant}</span>
                        <span className="review-table__original" title={row.description}>
                          {row.description}
                        </span>
                      </td>
                      <td role="cell" className="review-table__category">
                        {row.direction === 'in' ? (
                          <span>{categories.income.label}</span>
                        ) : (
                          <SelectField
                            label={`Category for ${row.merchant}, row ${row.rowNumber}`}
                            hideLabel
                            value={categoryId}
                            options={categoryOptions}
                            onChange={(value) =>
                              onCategoryChange(row.rowNumber, value as CategoryId)
                            }
                          />
                        )}
                      </td>
                      <td role="cell" className="review-table__amount tabular">
                        {row.direction === 'in' ? (
                          <span className="review-table__income">
                            <span className="visually-hidden">Income </span>
                            {formatCurrency(row.amount, { signed: true })}
                          </span>
                        ) : (
                          formatCurrency(row.amount)
                        )}
                      </td>
                      <td role="cell" className="review-table__status">
                        {stillAGuess && <Chip tone="warning">Needs review</Chip>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {tableRows.length > visibleRows.length && (
            <div className="review-more">
              <p>
                Showing {visibleRows.length} of {tableRows.length}
              </p>
              <Button variant="secondary" onClick={showMore}>
                Show {Math.min(PAGE_SIZE, tableRows.length - visibleRows.length)} more
              </Button>
            </div>
          )}
        </section>
      )}

      <div className="review__actions">
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button disabled={!canImport} onClick={onImport}>
          {plan.rows.length > 0 ? `Import ${plural(plan.rows.length, 'transaction')}` : 'Import'}
        </Button>
      </div>
      {!canImport && (
        <p className="review__hint">
          {plan.undecided > 0
            ? `Choose what to do with the ${plural(plan.undecided, 'possible duplicate')} to turn on Import.`
            : 'There is nothing to import.'}
        </p>
      )}
    </div>
  );
}
