import { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { ColumnsStep } from '../../components/ColumnsStep/ColumnsStep';
import { DoneStep } from '../../components/DoneStep/DoneStep';
import { ReviewStep } from '../../components/ReviewStep/ReviewStep';
import { StepIndicator } from '../../components/StepIndicator/StepIndicator';
import { UploadStep } from '../../components/UploadStep/UploadStep';
import type { CategoryId } from '../../data/categories';
import { reportingPeriod } from '../../data/mockData';
import type { Transaction } from '../../data/transactions';
import {
  buildImportRows,
  planImport,
  type BuiltImport,
  type DuplicateChoice,
} from '../../utils/buildImportRows';
import type { ParsedCsv } from '../../utils/csv';
import { detectColumns, type Detection } from '../../utils/detectColumns';
import { daysBetween } from '../../utils/formatDate';
import type { ColumnMapping } from '../../utils/importMapping';
import './ImportPage.css';

const steps = ['Upload', 'Columns', 'Review', 'Done'];

const cardText = [
  {
    title: 'Upload your statement',
    description:
      'Add a CSV file from your bank. You will review every transaction before anything is imported.',
  },
  {
    title: 'Match your columns',
    description:
      'We looked at your file and matched what we could. Check each column, and change any that are wrong.',
  },
  {
    title: 'Review your transactions',
    description: 'Check what will be imported. Nothing is saved until you press Import.',
  },
  {
    title: 'Import complete',
    description: 'Your transactions have been added.',
  },
];

interface ImportResult {
  fileName: string;
  imported: number;
  needsReview: number;
  skippedDuplicates: number;
  excluded: number;
  outsidePeriod: number;
}

interface ImportPageProps {
  /** Existing transactions, used to spot possible duplicates. */
  transactions: Transaction[];
  /** Categories the person chose to remember, keyed by merchant. */
  rules: Record<string, CategoryId>;
  onImport: (transactions: Omit<Transaction, 'id'>[]) => void;
  onViewTransactions: () => void;
}

export function ImportPage({ transactions, rules, onImport, onViewTransactions }: ImportPageProps) {
  const [step, setStep] = useState(0);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [detection, setDetection] = useState<Detection | null>(null);
  const [built, setBuilt] = useState<BuiltImport | null>(null);
  const [duplicateChoices, setDuplicateChoices] = useState<Record<number, DuplicateChoice>>({});
  const [categoryChoices, setCategoryChoices] = useState<Record<number, CategoryId>>({});
  const [result, setResult] = useState<ImportResult | null>(null);

  const plan = built ? planImport(built, duplicateChoices, categoryChoices) : null;

  const goTo = (next: number) => {
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const handleParsed = (file: ParsedCsv) => {
    setParsed(file);
    setDetection(null);
  };

  const handleClear = () => {
    setParsed(null);
    setDetection(null);
  };

  // Columns are matched the first time the person continues, and kept if they come back.
  const handleContinueFromUpload = () => {
    if (!parsed) return;
    if (!detection) setDetection(detectColumns(parsed));
    goTo(1);
  };

  const handleMappingChange = (mapping: ColumnMapping) => {
    setDetection((current) => (current ? { ...current, mapping } : current));
  };

  // The rows are read again every time the person arrives at the review, so changed columns apply.
  const handleContinueFromColumns = () => {
    if (!parsed || !detection) return;
    setBuilt(buildImportRows(parsed, detection.mapping, transactions, rules));
    setDuplicateChoices({});
    setCategoryChoices({});
    goTo(2);
  };

  const handleDuplicateChoice = (rowNumbers: number[], choice: DuplicateChoice) => {
    setDuplicateChoices((current) => ({
      ...current,
      ...Object.fromEntries(rowNumbers.map((rowNumber) => [rowNumber, choice])),
    }));
  };

  const handleCategoryChange = (rowNumber: number, categoryId: CategoryId) => {
    setCategoryChoices((current) => ({ ...current, [rowNumber]: categoryId }));
  };

  const handleImport = () => {
    if (!parsed || !built || !plan || plan.undecided > 0 || plan.rows.length === 0) return;

    onImport(
      plan.rows.map((row) => ({
        merchant: row.merchant,
        date: row.date,
        categoryId: row.categoryId,
        amount: row.amount,
        direction: row.direction,
        needsReview: row.needsReview,
      })),
    );

    setResult({
      fileName: parsed.fileName,
      imported: plan.rows.length,
      needsReview: plan.rows.filter((row) => row.needsReview).length,
      skippedDuplicates: plan.skipped,
      excluded: built.excluded.length,
      outsidePeriod: plan.rows.filter((row) => {
        const offset = daysBetween(reportingPeriod.startDate, row.date);
        return offset < 0 || offset >= reportingPeriod.days;
      }).length,
    });
    goTo(3);
  };

  const startAnother = () => {
    setParsed(null);
    setDetection(null);
    setBuilt(null);
    setDuplicateChoices({});
    setCategoryChoices({});
    setResult(null);
    goTo(0);
  };

  const { title, description } = cardText[Math.min(step, cardText.length - 1)];

  return (
    <div className="import-page">
      {/* Once everything is finished, every step shows as complete. */}
      <StepIndicator steps={steps} current={step === 3 ? steps.length : step} />
      <p className="visually-hidden" role="status">
        Step {step + 1} of {steps.length}: {steps[step]}
      </p>

      <Card title={title} description={description}>
        {step === 0 && (
          <UploadStep
            parsed={parsed}
            onParsed={handleParsed}
            onClear={handleClear}
            onContinue={handleContinueFromUpload}
          />
        )}

        {step === 1 && parsed && detection && (
          <ColumnsStep
            parsed={parsed}
            mapping={detection.mapping}
            guessed={detection.guessed}
            onChange={handleMappingChange}
            onBack={() => goTo(0)}
            onContinue={handleContinueFromColumns}
          />
        )}

        {step === 2 && built && plan && (
          <ReviewStep
            built={built}
            plan={plan}
            duplicateChoices={duplicateChoices}
            categoryChoices={categoryChoices}
            onDuplicateChoice={handleDuplicateChoice}
            onCategoryChange={handleCategoryChange}
            onBack={() => goTo(1)}
            onImport={handleImport}
          />
        )}

        {step === 3 && result && (
          <DoneStep
            {...result}
            periodLabel={reportingPeriod.label}
            onViewTransactions={onViewTransactions}
            onImportAnother={startAnother}
          />
        )}
      </Card>
    </div>
  );
}
