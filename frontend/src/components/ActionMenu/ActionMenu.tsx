import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Ellipsis } from 'lucide-react';
import { positionPopover } from '../../utils/positionPopover';
import './ActionMenu.css';

export interface ActionMenuItem {
  id: string;
  label: string;
  onSelect: () => void;
  /** An action that removes something. It is also set apart by its words, not only by color. */
  destructive?: boolean;
}

interface ActionMenuProps {
  /** The accessible name of the button, for example "Actions for Zomato, 25 Oct". */
  label: string;
  items: ActionMenuItem[];
}

/**
 * A "more actions" button that opens a small menu. It uses the browser's popover, so the menu is
 * never clipped by a table, and Escape, clicking outside, and returning focus all work natively.
 */
export function ActionMenu({ label, items }: ActionMenuProps) {
  const id = useId();
  const menuId = `${id}-menu`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const itemElements = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  const handleToggle = (newState: string) => {
    const menu = menuRef.current;
    const trigger = triggerRef.current;
    if (!menu || !trigger) return;

    if (newState === 'open') {
      positionPopover(trigger, menu, { align: 'end' });
      menu.dataset.positioned = 'true';
      setOpen(true);
      itemElements()[0]?.focus();
    } else {
      delete menu.dataset.positioned;
      setOpen(false);
    }
  };

  // The menu is placed relative to the window, so close it if the window moves under it.
  useEffect(() => {
    if (!open) return;
    const close = () => menuRef.current?.hidePopover();
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && menuRef.current?.contains(event.target)) return;
      close();
    };
    window.addEventListener('resize', close);
    document.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', close);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const elements = itemElements();
    const current = elements.indexOf(document.activeElement as HTMLElement);
    let next: number | null = null;

    if (event.key === 'ArrowDown') next = (current + 1) % elements.length;
    else if (event.key === 'ArrowUp') next = (current - 1 + elements.length) % elements.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = elements.length - 1;
    else if (event.key === 'Tab') {
      // Close the menu and leave focus on the button.
      event.preventDefault();
      menuRef.current?.hidePopover();
      return;
    }

    if (next === null) return;
    event.preventDefault();
    elements[next]?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="icon-button action-menu__trigger"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        popoverTarget={menuId}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            menuRef.current?.showPopover();
          }
        }}
      >
        <Ellipsis size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        role="menu"
        aria-label={label}
        className="action-menu"
        onToggle={(event) => handleToggle(event.newState)}
        onKeyDown={handleMenuKeyDown}
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={
              item.destructive
                ? 'action-menu__item action-menu__item--destructive'
                : 'action-menu__item'
            }
            onClick={() => {
              // Close first, so a dialog that opens next can take focus cleanly.
              menuRef.current?.hidePopover();
              item.onSelect();
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}
