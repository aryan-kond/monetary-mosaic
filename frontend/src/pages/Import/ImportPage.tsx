import { useState } from 'react';
import { Button } from '../../components/Button/Button';
import { Card } from '../../components/Card/Card';
import { ColumnsStep } from '../../components/ColumnsStep/ColumnsStep';
import { StepIndicator } from '../../components/StepIndicator/StepIndicator';
import { UploadStep } from '../../components/UploadStep/UploadStep';
import type { ParsedCsv } from '../../utils/csv';
import { detectColumns, type Detection } from '../../utils/detectColumns';
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
    description: 'Check what will be imported before anything is saved.',
  },
];

export function ImportPage() {
  const [step, setStep] = useState(0);
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [detection, setDetection] = useState<Detection | null>(null);

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

  const { title, description } = cardText[Math.min(step, cardText.length - 1)];

  return (
    <div className="import-page">
      <StepIndicator steps={steps} current={step} />
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
            onContinue={() => goTo(2)}
          />
        )}

        {step === 2 && (
          <div className="import-placeholder">
            <p>
              Reviewing transactions is the next step to be built. Your column choices are saved, so
              you can go back and change them.
            </p>
            <div>
              <Button variant="secondary" onClick={() => goTo(1)}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
