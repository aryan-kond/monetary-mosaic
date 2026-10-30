import { categories, type CategoryId } from '../../data/categories';
import { Button } from '../Button/Button';
import { Card } from '../Card/Card';
import '../SettingsList/SettingsList.css';

export interface RuleItem {
  key: string;
  merchant: string;
  categoryId: CategoryId;
}

interface CategoryRulesCardProps {
  rules: RuleItem[];
  onRemove: (rule: RuleItem) => void;
}

export function CategoryRulesCard({ rules, onRemove }: CategoryRulesCardProps) {
  return (
    <Card
      title="Category rules"
      description="Merchants you asked us to remember. They apply to future imports only, and never change transactions you already have."
    >
      {rules.length === 0 ? (
        <p className="settings-text">
          No saved rules yet. When you correct a category, tick &ldquo;Use this category for future
          transactions&rdquo; to save one.
        </p>
      ) : (
        <ul className="settings-list">
          {rules.map((rule) => (
            <li key={rule.key} className="settings-list__item">
              <div className="settings-list__main">
                <p className="settings-list__title">{rule.merchant}</p>
                <p className="settings-list__meta">
                  Future transactions go in {categories[rule.categoryId].label}
                </p>
              </div>
              <Button
                variant="secondary"
                size="compact"
                aria-label={`Remove the rule for ${rule.merchant}`}
                onClick={() => onRemove(rule)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
