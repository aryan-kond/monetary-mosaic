import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import '../SettingsList/SettingsList.css';

interface SampleDataCardProps {
  /** How many example transactions are in the app right now. */
  count: number;
  onRemove: () => void;
}

export function SampleDataCard({ count, onRemove }: SampleDataCardProps) {
  return (
    <Card title="Sample data" description="Example transactions that came with the app.">
      <p className="settings-text">
        The app has {count} example transactions so you can try it out. They are not from a bank
        account. Remove them when you are ready to use your own files.
      </p>
      <div className="settings-actions">
        <Button variant="secondary" onClick={onRemove}>
          Remove sample data
        </Button>
      </div>
    </Card>
  );
}
