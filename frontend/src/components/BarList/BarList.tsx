import './BarList.css';

export interface BarItem {
  id: string;
  label: string;
  /** Always shown, so values never depend on hovering. */
  valueText: string;
  /** A short line under the bar. */
  detail?: string;
  /** How full the bar is, from 0 to 1. */
  fraction: number;
}

export function BarList({ items }: { items: BarItem[] }) {
  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li key={item.id} className="bar-row">
          <div className="bar-row__top">
            <span className="bar-row__label">{item.label}</span>
            <span className="bar-row__value tabular">{item.valueText}</span>
          </div>
          <div className="bar-row__track" aria-hidden="true">
            <div
              className="bar-row__fill"
              style={{ width: `${Math.min(Math.max(item.fraction, 0), 1) * 100}%` }}
            />
          </div>
          {item.detail && <p className="bar-row__detail">{item.detail}</p>}
        </li>
      ))}
    </ul>
  );
}
