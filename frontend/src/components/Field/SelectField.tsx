import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { positionPopover } from '../../utils/positionPopover';
import './Field.css';
import './SelectField.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Explains what the field is for, or shows examples. */
  hint?: string;
  /** Plain-language message when the choice is not valid. */
  error?: string;
  /** Shown beside the label, for example a status chip. */
  badge?: ReactNode;
  /** Keeps the label for screen readers but hides it on screen, for selects inside tables. */
  hideLabel?: boolean;
}

/** How long typing a few letters keeps building one search, in milliseconds. */
const TYPEAHEAD_MS = 600;
/** A keyboard press also sends a click. Clicks this soon after one are ignored. */
const KEYBOARD_CLICK_WINDOW_MS = 300;

/**
 * A dropdown that follows the "select-only combobox" pattern: focus stays on the button, the
 * arrow keys move through the options, and typing jumps to a match. The list is a native popover.
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  hint,
  error,
  badge,
  hideLabel = false,
}: SelectFieldProps) {
  const id = useId();
  const labelId = `${id}-label`;
  const valueId = `${id}-value`;
  const listId = `${id}-list`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: '', timer: 0 });
  const lastKeyboardAction = useRef(0);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const lastIndex = options.length - 1;

  const openList = () => {
    setActiveIndex(selectedIndex);
    listRef.current?.showPopover();
  };
  const closeList = () => listRef.current?.hidePopover();

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    closeList();
  };

  const handleToggle = (newState: string) => {
    const list = listRef.current;
    const trigger = triggerRef.current;
    if (!list || !trigger) return;

    if (newState === 'open') {
      positionPopover(trigger, list, { matchWidth: true });
      list.dataset.positioned = 'true';
      setOpen(true);
    } else {
      delete list.dataset.positioned;
      setOpen(false);
    }
  };

  // Keep the highlighted option in view as the arrow keys move through a long list.
  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  // The list is placed relative to the window, so close it if something else is used or moves.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const trigger = triggerRef.current;
    const close = () => list?.hidePopover();

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (list?.contains(target) || trigger?.contains(target)) return;
      close();
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && list?.contains(event.target)) return;
      close();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const jumpToMatch = (character: string) => {
    window.clearTimeout(typeahead.current.timer);
    typeahead.current.text += character.toLowerCase();
    typeahead.current.timer = window.setTimeout(() => {
      typeahead.current.text = '';
    }, TYPEAHEAD_MS);

    const text = typeahead.current.text;
    // Pressing one letter again moves on to the next option that starts with it.
    const start = text.length === 1 ? activeIndex + 1 : activeIndex;
    for (let step = 0; step < options.length; step += 1) {
      const index = (start + step) % options.length;
      if (options[index].label.toLowerCase().startsWith(text)) {
        setActiveIndex(index);
        return;
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        lastKeyboardAction.current = performance.now();
        openList();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex((current) => Math.min(current + 1, lastIndex));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex((current) => Math.max(current - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(lastIndex);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        lastKeyboardAction.current = performance.now();
        choose(activeIndex);
        break;
      case 'Escape':
        event.preventDefault();
        closeList();
        break;
      case 'Tab':
        // Like a native select, leaving the field keeps the highlighted option.
        choose(activeIndex);
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          jumpToMatch(event.key);
        }
    }
  };

  const handleClick = () => {
    // Some browsers send a click after Space or Enter that the keyboard already handled.
    if (performance.now() - lastKeyboardAction.current < KEYBOARD_CLICK_WINDOW_MS) return;
    if (open) closeList();
    else openList();
  };

  // Clicking the label moves focus to the dropdown without opening it, like a native select.
  const handleLabelClick = (event: MouseEvent) => {
    event.preventDefault();
    triggerRef.current?.focus();
  };

  return (
    <div className="field">
      <div className="field__label-row">
        <label
          id={labelId}
          className={hideLabel ? 'field__label visually-hidden' : 'field__label'}
          htmlFor={id}
          onClick={handleLabelClick}
        >
          {label}
        </label>
        {badge}
      </div>

      <div className="field__wrap">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          role="combobox"
          className="field__control select-trigger"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={open ? `${id}-option-${activeIndex}` : undefined}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <span id={valueId} className="select-trigger__value">
            {options[selectedIndex]?.label ?? ''}
          </span>
          <ChevronDown
            className="select-trigger__chevron"
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
          />
        </button>

        <ul
          ref={listRef}
          id={listId}
          popover="manual"
          role="listbox"
          aria-labelledby={labelId}
          className="select-list"
          data-lenis-prevent
          onToggle={(event) => handleToggle(event.newState)}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              data-active={open && index === activeIndex ? 'true' : undefined}
              className="select-option"
              // Keeps focus on the dropdown button while the pointer picks an option.
              onPointerDown={(event) => event.preventDefault()}
              onMouseMove={() => {
                if (activeIndex !== index) setActiveIndex(index);
              }}
              onClick={() => choose(index)}
            >
              <span>{option.label}</span>
              {option.value === value && <Check size={16} strokeWidth={2} aria-hidden="true" />}
            </li>
          ))}
        </ul>
      </div>

      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
