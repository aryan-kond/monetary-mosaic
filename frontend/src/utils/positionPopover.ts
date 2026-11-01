interface PositionOptions {
  /** Which edge of the trigger the popover lines up with. */
  align?: 'start' | 'end';
  /** Makes the popover exactly as wide as the trigger. */
  matchWidth?: boolean;
}

/**
 * Places a popover next to its trigger, or above it when there is no room below. The popover
 * must already be shown, so it can be measured.
 */
export function positionPopover(
  trigger: HTMLElement,
  popover: HTMLElement,
  { align = 'start', matchWidth = false }: PositionOptions = {},
) {
  const gap = 8;
  const margin = 16;
  const rect = trigger.getBoundingClientRect();
  if (matchWidth) popover.style.width = `${rect.width}px`;

  const { offsetWidth: width, offsetHeight: height } = popover;
  const preferredLeft = align === 'end' ? rect.right - width : rect.left;
  const left = Math.max(margin, Math.min(preferredLeft, window.innerWidth - width - margin));
  const below = rect.bottom + gap;
  const fitsBelow = below + height <= window.innerHeight - margin;
  const top = fitsBelow ? below : Math.max(margin, rect.top - gap - height);

  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}
