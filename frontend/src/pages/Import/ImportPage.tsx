import { useState } from 'react';
import { Card } from '../../components/Card/Card';
import { StepIndicator } from '../../components/StepIndicator/StepIndicator';
import { UploadStep } from '../../components/UploadStep/UploadStep';
import type { ParsedCsv } from '../../utils/csv';
import './ImportPage.css';

const steps = ['Upload', 'Columns', 'Review', 'Done'];

export function ImportPage() {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);

  return (
    <div className="import-page">
      <StepIndicator steps={steps} current={0} />
      <Card
        title="Upload your statement"
        description="Add a CSV file from your bank. You will review every transaction before anything is imported."
      >
        <UploadStep parsed={parsed} onParsed={setParsed} onClear={() => setParsed(null)} />
      </Card>
    </div>
  );
}
