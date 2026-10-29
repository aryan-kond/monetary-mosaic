import { Check } from 'lucide-react';
import { Button } from '../Button/Button';
import './DoneStep.css';

interface DoneStepProps {
  fileName: string;
  imported: number;
  /** Imported transactions still marked Needs review. */
  needsReview: number;
  skippedDuplicates: number;
  /** Rows left out because they could not be read. */
  excluded: number;
  /** Imported transactions dated outside the Overview's reporting period. */
  outsidePeriod: number;
  periodLabel: string;
  onViewTransactions: () => void;
  onImportAnother: () => void;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function DoneStep({
  fileName,
  imported,
  needsReview,
  skippedDuplicates,
  excluded,
  outsidePeriod,
  periodLabel,
  onViewTransactions,
  onImportAnother,
}: DoneStepProps) {
  const notes: string[] = [];
  if (needsReview > 0) {
    notes.push(
      `${plural(needsReview, 'imported transaction')} ${needsReview === 1 ? 'is' : 'are'} marked Needs review. Check ${needsReview === 1 ? 'it' : 'them'} in Transactions.`,
    );
  }
  if (excluded > 0) {
    notes.push(
      `${plural(excluded, 'row')} could not be read and ${excluded === 1 ? 'was' : 'were'} left out. Fix ${excluded === 1 ? 'it' : 'them'} in your file and upload it again if you need ${excluded === 1 ? 'it' : 'them'}.`,
    );
  }
  if (outsidePeriod > 0) {
    notes.push(
      `${plural(outsidePeriod, 'imported transaction')} ${outsidePeriod === 1 ? 'falls' : 'fall'} outside ${periodLabel}, so ${outsidePeriod === 1 ? 'it appears' : 'they appear'} in Transactions but ${outsidePeriod === 1 ? 'is' : 'are'} not counted in the Overview yet.`,
    );
  }

  return (
    <div className="done">
      <div className="done__banner" role="status">
        <span className="done__icon" aria-hidden="true">
          <Check size={22} strokeWidth={2.25} />
        </span>
        <div>
          <h3 className="done__title">Import complete</h3>
          <p>
            {plural(imported, 'transaction')} from {fileName} {imported === 1 ? 'was' : 'were'}{' '}
            added to your transactions.
          </p>
        </div>
      </div>

      <dl className="done__facts">
        <div>
          <dt>Imported</dt>
          <dd>{imported}</dd>
        </div>
        <div>
          <dt>Duplicates skipped</dt>
          <dd>{skippedDuplicates}</dd>
        </div>
        <div>
          <dt>Rows left out</dt>
          <dd>{excluded}</dd>
        </div>
        <div>
          <dt>Need review</dt>
          <dd>{needsReview}</dd>
        </div>
      </dl>

      {notes.length > 0 && (
        <ul className="done__notes">
          {notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      <div className="done__actions">
        <Button onClick={onViewTransactions}>View transactions</Button>
        <Button variant="secondary" onClick={onImportAnother}>
          Import another statement
        </Button>
      </div>
    </div>
  );
}
