import { useState } from 'react';
import { Card } from '../../components/Card/Card';
import {
  CategoryRulesCard,
  type RuleItem,
} from '../../components/CategoryRulesCard/CategoryRulesCard';
import { ConfirmDialog } from '../../components/ConfirmDialog/ConfirmDialog';
import { ImportHistoryCard } from '../../components/ImportHistoryCard/ImportHistoryCard';
import { SampleDataCard } from '../../components/SampleDataCard/SampleDataCard';
import type { Transaction } from '../../data/transactions';
import type { ImportRecord } from '../../hooks/useTransactionEdits';
import { formatDateTime } from '../../utils/formatDate';
import '../../components/SettingsList/SettingsList.css';
import './SettingsPage.css';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

type Pending =
  { kind: 'undo'; record: ImportRecord; count: number } | { kind: 'sample'; count: number };

interface SettingsPageProps {
  transactions: Transaction[];
  history: ImportRecord[];
  rules: RuleItem[];
  onUndoImport: (importId: string) => void;
  onRemoveSample: () => void;
  onRemoveRule: (key: string) => void;
}

export function SettingsPage({
  transactions,
  history,
  rules,
  onUndoImport,
  onRemoveSample,
  onRemoveRule,
}: SettingsPageProps) {
  // What is being confirmed stays put while the dialog fades out, so its text does not change.
  const [pending, setPending] = useState<Pending | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const sampleCount = transactions.filter((transaction) => transaction.isSample).length;

  const askToUndo = (record: ImportRecord) => {
    setPending({
      kind: 'undo',
      record,
      count: transactions.filter((transaction) => transaction.importId === record.id).length,
    });
    setConfirmOpen(true);
  };

  const askToRemoveSample = () => {
    setPending({ kind: 'sample', count: sampleCount });
    setConfirmOpen(true);
  };

  const cancel = () => setConfirmOpen(false);

  const confirm = () => {
    if (!pending) return;
    if (pending.kind === 'undo') {
      onUndoImport(pending.record.id);
      setNotice(
        `Removed ${plural(pending.count, 'transaction')} imported from ${pending.record.fileName}.`,
      );
    } else {
      onRemoveSample();
      setNotice(`Removed ${plural(pending.count, 'sample transaction')}.`);
    }
    setConfirmOpen(false);
  };

  const removeRule = (rule: RuleItem) => {
    onRemoveRule(rule.key);
    setNotice(
      `Removed the rule for ${rule.merchant}. Future ${rule.merchant} transactions will be categorized automatically again.`,
    );
  };

  const dialog =
    pending?.kind === 'undo'
      ? {
          title: 'Undo this import?',
          description: `This removes the ${plural(pending.count, 'transaction')} imported from ${pending.record.fileName} on ${formatDateTime(pending.record.importedAt)}.`,
          effects: [
            'Any changes you made to those transactions are removed with them.',
            'Your other transactions and your saved category rules stay as they are.',
            'You can import the file again at any time.',
          ],
          confirmLabel: 'Undo import',
        }
      : {
          title: 'Remove the sample data?',
          description: `This removes the ${plural(pending?.count ?? 0, 'example transaction')} that came with the app, including anything you imported from the sample statement.`,
          effects: [
            'Transactions from your own files stay.',
            'Your saved category rules stay.',
            'With nothing left, the Overview asks you to import a statement.',
            'In this prototype, reloading the page brings the sample data back, and clears everything you imported.',
          ],
          confirmLabel: 'Remove sample data',
        };

  return (
    <div className="settings">
      {notice && (
        <div className="settings__notice" role="status">
          {notice}
        </div>
      )}

      <ImportHistoryCard records={history} onUndo={askToUndo} />
      <CategoryRulesCard rules={rules} onRemove={removeRule} />
      {sampleCount > 0 && <SampleDataCard count={sampleCount} onRemove={askToRemoveSample} />}

      <Card title="Where your data lives" description="How your statements are handled.">
        <p className="settings-text">
          Files you import are read inside this browser tab. Nothing is sent to a server, and
          nothing connects to your bank.
        </p>
        <p className="settings-text settings-text--secondary">
          In this prototype, your transactions, rules, and history are kept in memory only, so
          reloading the page clears them.
        </p>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        title={dialog.title}
        description={dialog.description}
        effects={dialog.effects}
        confirmLabel={dialog.confirmLabel}
        onConfirm={confirm}
        onCancel={cancel}
      />
    </div>
  );
}
