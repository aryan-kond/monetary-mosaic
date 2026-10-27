import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, buildMonthGrid, toIsoDate, weekdayIndex } from '../../utils/calendar';
import {
  daysBetween,
  formatFullDate,
  formatLongDate,
  formatMonthYear,
  shiftIsoDate,
  weekdayNames,
} from '../../utils/formatDate';
import { Button } from '../Button/Button';
import '../Field/Field.css';
import './DatePickerField.css';

interface Highlight {
  startDate: string;
  days: number;
  /** Legend text, for example "Counts in Overview". */
  label: string;
}

interface DatePickerFieldProps {
  label: string;
  /** An ISO date, YYYY-MM-DD. */
  value: string;
  onChange: (value: string) => void;
  /** Days in this range are softly shaded, so people can see what the Overview counts. */
  highlight?: Highlight;
  /** Explains a consequence of the chosen date. */
  hint?: string;
}

const MOVES: Record<string, (isoDate: string) => string> = {
  ArrowLeft: (isoDate) => shiftIsoDate(isoDate, -1),
  ArrowRight: (isoDate) => shiftIsoDate(isoDate, 1),
  ArrowUp: (isoDate) => shiftIsoDate(isoDate, -7),
  ArrowDown: (isoDate) => shiftIsoDate(isoDate, 7),
  Home: (isoDate) => shiftIsoDate(isoDate, -weekdayIndex(isoDate)),
  End: (isoDate) => shiftIsoDate(isoDate, 6 - weekdayIndex(isoDate)),
  PageUp: (isoDate) => addMonths(isoDate, -1),
  PageDown: (isoDate) => addMonths(isoDate, 1),
};

/** Places the calendar under the field, or above it when there is no room below. */
function positionPopover(trigger: HTMLElement, popover: HTMLElement) {
  const gap = 8;
  const margin = 16;
  const rect = trigger.getBoundingClientRect();
  const { offsetWidth: width, offsetHeight: height } = popover;

  const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
  const below = rect.bottom + gap;
  const fitsBelow = below + height <= window.innerHeight - margin;
  const top = fitsBelow ? below : Math.max(margin, rect.top - gap - height);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

export function DatePickerField({ label, value, onChange, highlight, hint }: DatePickerFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const hintId = `${id}-hint`;
  const titleId = `${id}-title`;
  const popoverId = `${id}-calendar`;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const focusDay = useRef(false);

  const today = toIsoDate(new Date());
  const [open, setOpen] = useState(false);
  /** The day that has keyboard focus. It also decides which month is on screen. */
  const [cursor, setCursor] = useState(value || today);

  // After a keyboard move, put focus on the day the cursor now points at.
  useEffect(() => {
    if (!focusDay.current) return;
    focusDay.current = false;
    gridRef.current
      ?.querySelector<HTMLElement>(`[data-date="${cursor}"]`)
      ?.focus({ preventScroll: true });
  }, [cursor]);

  // When the calendar opens, move focus onto the selected day.
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus({ preventScroll: true });
  }, [open]);

  // The calendar is placed relative to the window, so close it if the window moves under it.
  useEffect(() => {
    if (!open) return;
    const close = () => popoverRef.current?.hidePopover();
    window.addEventListener('resize', close);
    document.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('resize', close);
      document.removeEventListener('scroll', close, true);
    };
  }, [open]);

  const handleToggle = (newState: 'open' | 'closed') => {
    const popover = popoverRef.current;
    const trigger = triggerRef.current;
    if (!popover || !trigger) return;

    if (newState === 'open') {
      setCursor(value || today);
      positionPopover(trigger, popover);
      popover.dataset.positioned = 'true';
      setOpen(true);
    } else {
      delete popover.dataset.positioned;
      setOpen(false);
    }
  };

  const choose = (isoDate: string) => {
    onChange(isoDate);
    popoverRef.current?.hidePopover();
    triggerRef.current?.focus();
  };

  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = MOVES[event.key];
    if (!move) return;
    event.preventDefault();
    focusDay.current = true;
    setCursor(move(cursor));
  };

  const inHighlight = (isoDate: string) => {
    if (!highlight) return false;
    const offset = daysBetween(highlight.startDate, isoDate);
    return offset >= 0 && offset < highlight.days;
  };

  const weeks = buildMonthGrid(cursor);

  return (
    <div className="field">
      <label id={labelId} className="field__label" htmlFor={id}>
        {label}
      </label>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="field__control date-trigger"
        popoverTarget={popoverId}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${valueId}`}
        aria-describedby={hint ? hintId : undefined}
      >
        <CalendarDays size={18} strokeWidth={1.75} aria-hidden="true" />
        <span id={valueId}>{value ? formatFullDate(value) : 'Choose a date'}</span>
      </button>
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}

      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        role="dialog"
        aria-label={`Choose ${label.toLowerCase()}`}
        className="calendar"
        onToggle={(event) => handleToggle(event.newState)}
      >
        <div className="calendar__header">
          <p id={titleId} className="calendar__title" aria-live="polite">
            {formatMonthYear(cursor)}
          </p>
          <div className="calendar__nav">
            <button
              type="button"
              className="icon-button calendar__nav-button"
              aria-label="Previous month"
              onClick={() => setCursor(addMonths(cursor, -1))}
            >
              <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button calendar__nav-button"
              aria-label="Next month"
              onClick={() => setCursor(addMonths(cursor, 1))}
            >
              <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div
          ref={gridRef}
          role="grid"
          aria-labelledby={titleId}
          className="calendar__grid"
          onKeyDown={handleGridKeyDown}
        >
          <div role="row" className="calendar__row">
            {weekdayNames.map((day) => (
              <span
                key={day.long}
                role="columnheader"
                aria-label={day.long}
                className="calendar__weekday"
              >
                {day.short}
              </span>
            ))}
          </div>
          {weeks.map((week) => (
            <div key={week[0].isoDate} role="row" className="calendar__row">
              {week.map((day) => {
                const selected = day.isoDate === value;
                const isToday = day.isoDate === today;
                const classes = [
                  'calendar__day',
                  !day.inMonth && 'calendar__day--outside',
                  inHighlight(day.isoDate) && 'calendar__day--period',
                  isToday && 'calendar__day--today',
                  selected && 'calendar__day--selected',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <div key={day.isoDate} role="gridcell" aria-selected={selected}>
                    <button
                      type="button"
                      data-date={day.isoDate}
                      tabIndex={day.isoDate === cursor ? 0 : -1}
                      className={classes}
                      aria-label={`${formatLongDate(day.isoDate)}${isToday ? ', today' : ''}`}
                      aria-current={isToday ? 'date' : undefined}
                      onClick={() => choose(day.isoDate)}
                    >
                      {Number(day.isoDate.slice(8))}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="calendar__footer">
          {highlight ? (
            <p className="calendar__legend">
              <span className="calendar__swatch" aria-hidden="true" />
              {highlight.label}
            </p>
          ) : (
            <span />
          )}
          <Button variant="secondary" size="compact" onClick={() => choose(today)}>
            Today
          </Button>
        </div>
      </div>
    </div>
  );
}
