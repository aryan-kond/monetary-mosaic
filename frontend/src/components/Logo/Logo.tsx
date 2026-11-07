import logoMark from '../../assets/logo-mark.svg';
import './Logo.css';

/**
 * The size of the words as a share of the logo's height. At this value the two lines of text take
 * up a little over half of the ring's height, centered on it. Change this one number to make the
 * words larger or smaller, and they keep their place next to the ring.
 */
const WORD_SIZE = 0.32;

interface LogoProps {
  /** "full" is the ring with the words; "mark" is the ring only. */
  variant?: 'full' | 'mark';
  /** Height of the ring in px. The words and the spacing scale from it. */
  height?: number;
}

export function Logo({ variant = 'full', height = variant === 'full' ? 72 : 36 }: LogoProps) {
  if (variant === 'mark') {
    return (
      <img
        src={logoMark}
        alt="Monetary Mosaic"
        height={height}
        style={{ display: 'block', width: 'auto', height }}
      />
    );
  }

  // The words are real text in the app's own typeface, so they always match the rest of the app.
  // The whole lockup is announced once, as "Monetary Mosaic".
  return (
    <span
      className="logo"
      role="img"
      aria-label="Monetary Mosaic"
      style={{ fontSize: height * WORD_SIZE }}
    >
      <img className="logo__mark" src={logoMark} alt="" height={height} style={{ height }} />
      <span className="logo__word" aria-hidden="true">
        <span>Monetary</span>
        <span>Mosaic</span>
      </span>
    </span>
  );
}
