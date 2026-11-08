import type { AnchorHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export function ButtonLink({ variant = 'primary', className, children, ...rest }: ButtonLinkProps) {
  const classes = ['button', `button--${variant}`, className].filter(Boolean).join(' ');

  return (
    <a className={classes} {...rest}>
      {children}
    </a>
  );
}
