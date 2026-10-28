export interface ParsedAmount {
  /** Negative for amounts written with a minus sign or brackets. */
  value: number;
  /** Set when the text itself says which way the money went, such as "1,200.00 Dr". */
  explicit?: 'out' | 'in';
}

/** Reads an amount as written in a statement. Returns null when the text is not an amount. */
export function parseAmount(raw: string): ParsedAmount | null {
  let text = raw.trim();
  if (text === '') return null;

  let negative = false;
  if (/^\(.*\)$/.test(text)) {
    negative = true;
    text = text.slice(1, -1).trim();
  }

  let explicit: ParsedAmount['explicit'];
  const marker = text.match(/\s*(dr|cr)\.?$/i);
  if (marker) {
    explicit = marker[1].toLowerCase() === 'dr' ? 'out' : 'in';
    text = text.slice(0, marker.index).trim();
  }

  text = text.replace(/₹|rs\.?|inr/gi, '').replace(/[,\s]/g, '');
  if (text.endsWith('-')) {
    negative = true;
    text = text.slice(0, -1);
  }
  if (!/^[-+]?(\d+\.?\d*|\.\d+)$/.test(text)) return null;

  const number = Number(text);
  const value = negative ? -Math.abs(number) : number;
  return explicit ? { value: Math.abs(value), explicit } : { value };
}

/** The share of values (0 to 1) that read as amounts. */
export function numberShare(values: string[]): number {
  if (values.length === 0) return 0;
  return values.filter((value) => parseAmount(value) !== null).length / values.length;
}

export interface AmountSummary {
  /** Values that read as amounts. */
  total: number;
  negative: number;
  positive: number;
  /** Values that say Dr or Cr themselves. */
  explicit: number;
}

export function summarizeAmounts(values: string[]): AmountSummary {
  const summary: AmountSummary = { total: 0, negative: 0, positive: 0, explicit: 0 };

  for (const value of values) {
    const parsed = parseAmount(value);
    if (!parsed) continue;
    summary.total += 1;
    if (parsed.explicit) summary.explicit += 1;
    else if (parsed.value < 0) summary.negative += 1;
    else if (parsed.value > 0) summary.positive += 1;
  }

  return summary;
}
