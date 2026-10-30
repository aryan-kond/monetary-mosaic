import type { ImportRecord } from '../../hooks/useTransactionEdits';
import { formatDateTime } from '../../utils/formatDate';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import { Chip } from '../Chip/Chip';
import '../SettingsList/SettingsList.css';

interface ImportHistoryCardProps {
  records: ImportRecord[];
  onUndo: (record: ImportRecord) => void;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

export function ImportHistoryCard({ records, onUndo }: ImportHistoryCardProps) {
  // Newest first.
  const newestFirst = [...records].reverse();

  return (
    <Card
      title="Import history"
      description="Every file you have imported. Undo an import to remove the transactions it added."
    >
      {newestFirst.length === 0 ? (
        <>
          <p className="settings-text">No imports yet. Use Import statement to add a CSV file.</p>
          <p className="settings-text settings-text--secondary">
            The example transactions that came with the app are not listed here.
          </p>
        </>
      ) : (
        <ul className="settings-list">
          {newestFirst.map((record) => (
            <li key={record.id} className="settings-list__item">
              <div className="settings-list__main">
                <p className="settings-list__title">{record.fileName}</p>
                <p className="settings-list__meta">
                  {record.undoneAt
                    ? `Imported ${formatDateTime(record.importedAt)}. Undone ${formatDateTime(record.undoneAt)}.`
                    : `Imported ${formatDateTime(record.importedAt)}`}
                </p>
                <p className="settings-list__meta">
                  {plural(record.imported, 'transaction')} imported ·{' '}
                  {plural(record.skippedDuplicates, 'duplicate')} skipped ·{' '}
                  {plural(record.excluded, 'row')} left out
                </p>
              </div>
              <div className="settings-list__side">
                {record.isSample && <Chip>Sample data</Chip>}
                {record.undoneAt ? (
                  <Chip>Undone</Chip>
                ) : (
                  <Button
                    variant="secondary"
                    size="compact"
                    aria-label={`Undo import of ${record.fileName}`}
                    onClick={() => onUndo(record)}
                  >
                    Undo import
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
