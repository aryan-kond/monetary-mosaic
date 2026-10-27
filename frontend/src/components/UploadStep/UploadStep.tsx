import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { Download, FileText, Upload } from 'lucide-react';
import { sampleStatement } from '../../data/sampleStatement';
import type { ParsedCsv } from '../../utils/csv';
import { formatFileSize } from '../../utils/formatFileSize';
import { buildParsedCsv, readCsvFile, UploadError } from '../../utils/readCsvFile';
import { Button } from '../Button/Button';
import { Chip } from '../Chip/Chip';
import './UploadStep.css';

interface UploadStepProps {
  /** The file that has been read, or null before one is chosen. */
  parsed: ParsedCsv | null;
  onParsed: (parsed: ParsedCsv) => void;
  onClear: () => void;
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

function FileSummary({ parsed, onClear }: { parsed: ParsedCsv; onClear: () => void }) {
  return (
    <div className="file-summary">
      <div className="file-summary__head">
        <span className="file-summary__icon" aria-hidden="true">
          <FileText size={22} strokeWidth={1.75} />
        </span>
        <div className="file-summary__text">
          <p className="file-summary__name">{parsed.fileName}</p>
          <p className="file-summary__meta">
            {plural(parsed.rows.length, 'row')} · {plural(parsed.headers.length, 'column')} ·{' '}
            {formatFileSize(parsed.fileSize)}
          </p>
        </div>
        {parsed.isSample && <Chip>Sample data</Chip>}
      </div>

      <p className="file-summary__columns">
        <strong>Columns found:</strong>{' '}
        {parsed.headers.map((header) => header || '(no name)').join(', ')}
      </p>

      <div className="upload__actions">
        <Button variant="secondary" onClick={onClear}>
          Choose a different file
        </Button>
        <Button disabled>Continue</Button>
      </div>
      <p className="upload__hint">
        Matching your columns to dates, descriptions, and amounts is the next step. It is coming
        soon, so Continue stays off for now.
      </p>
    </div>
  );
}

export function UploadStep({ parsed, onParsed, onClear }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A file dropped outside the zone would make the browser open it and leave the app, losing
  // anything not yet saved. Ignore drops everywhere except on the drop zone.
  useEffect(() => {
    const ignore = (event: Event) => event.preventDefault();
    window.addEventListener('dragover', ignore);
    window.addEventListener('drop', ignore);
    return () => {
      window.removeEventListener('dragover', ignore);
      window.removeEventListener('drop', ignore);
    };
  }, []);

  const handleFiles = async (files: File[]) => {
    setError(null);
    if (files.length === 0) return;
    if (files.length > 1) {
      setError('Please add one file at a time.');
      return;
    }

    const file = files[0];
    setReading(file.name);
    try {
      onParsed(await readCsvFile(file));
    } catch (problem) {
      setError(
        problem instanceof UploadError
          ? problem.message
          : `We could not read "${file.name}". Try choosing the file again.`,
      );
    } finally {
      setReading(null);
    }
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Clear the input so choosing the same file again still counts as a change.
    event.target.value = '';
    void handleFiles(files);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  const loadSample = () => {
    setError(null);
    const { text, fileName } = sampleStatement;
    onParsed(buildParsedCsv(text, fileName, new Blob([text]).size, true));
  };

  const downloadSample = () => {
    const url = URL.createObjectURL(new Blob([sampleStatement.text], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = sampleStatement.fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="upload">
      <div className="upload__main">
        {parsed ? (
          <FileSummary parsed={parsed} onClear={onClear} />
        ) : (
          <>
            <div
              className={dragging ? 'dropzone dropzone--active' : 'dropzone'}
              aria-busy={reading !== null}
              onDragEnter={handleDragOver}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <span className="dropzone__icon" aria-hidden="true">
                <Upload size={22} strokeWidth={1.75} />
              </span>

              {reading !== null ? (
                <p className="dropzone__title" role="status">
                  Reading {reading}…
                </p>
              ) : (
                <>
                  <p className="dropzone__title">
                    {dragging ? 'Drop your file to upload it' : 'Drag your CSV file here'}
                  </p>
                  <p className="dropzone__text">or choose it from your computer</p>
                  <Button onClick={() => inputRef.current?.click()}>Choose file</Button>
                </>
              )}

              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="visually-hidden"
                tabIndex={-1}
                aria-hidden="true"
                onChange={handleInputChange}
              />
            </div>

            {error && (
              <div className="upload-error" role="alert">
                <p className="upload-error__title">That file cannot be used</p>
                <p>{error}</p>
              </div>
            )}

            <div className="upload__sample">
              <p>No file handy? Try a sample statement.</p>
              <div className="upload__sample-actions">
                <Button variant="secondary" size="compact" onClick={loadSample}>
                  Use sample statement
                </Button>
                <Button
                  variant="secondary"
                  size="compact"
                  icon={<Download size={16} strokeWidth={1.75} />}
                  onClick={downloadSample}
                >
                  Download sample CSV
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="upload__guide">
        <h3 className="upload__guide-title">What your file needs</h3>
        <ul className="upload__guide-list">
          <li>
            A CSV export from your bank&apos;s website or app. PDF and Excel files are not
            supported.
          </li>
          <li>A first row with column names, such as Date and Amount.</li>
          <li>
            One row per transaction, with a date and an amount (or separate debit and credit
            columns).
          </li>
          <li>Up to 5 MB.</li>
        </ul>

        <h3 className="upload__guide-title">Your privacy</h3>
        <p className="upload__guide-text">
          Your file is read inside this browser tab. Nothing is sent to a server, and nothing
          connects to your bank. You will review every transaction before anything is imported.
        </p>
      </div>
    </div>
  );
}
