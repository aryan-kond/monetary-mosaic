import logoFull from '../../assets/logo-full.svg';
import logoMark from '../../assets/logo-mark.svg';

interface LogoProps {
  /** "full" is the mark plus wordmark; "mark" is the symbol only. */
  variant?: 'full' | 'mark';
  /** Rendered height in px. Width follows the logo's aspect ratio. */
  height?: number;
}

export function Logo({ variant = 'full', height = variant === 'full' ? 56 : 36 }: LogoProps) {
  return (
    <img
      src={variant === 'full' ? logoFull : logoMark}
      alt="Monetary Mosaic"
      height={height}
      style={{ display: 'block', width: 'auto', height }}
    />
  );
}
