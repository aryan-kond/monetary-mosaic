import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** One primary button per view. Use secondary for supporting actions. */
  variant?: 'primary' | 'secondary';
  /** "compact" is 40 px high, for use inside table rows. */
  size?: 'default' | 'compact';
  /** Optional leading icon. It is decorative, so the label must carry the meaning. */
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  icon,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'button',
    `button--${variant}`,
    size === 'compact' && 'button--compact',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {icon && (
        <span className="button__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}
