import type { CategoryId } from '../data/categories';
import { ruleKey } from './merchantRules';

export interface Categorization {
  /** A cleaned-up merchant name, for example "Zomato". */
  merchant: string;
  categoryId: CategoryId;
  /** True when the category is a guess the person should check. */
  uncertain: boolean;
}

interface KnownMerchant {
  merchant: string;
  categoryId: CategoryId;
  /** Words or phrases that identify it in a bank description, in lower case. */
  words: string[];
  /** The merchant is recognized, but its category could still be wrong. */
  uncertain?: boolean;
}

const KNOWN_MERCHANTS: KnownMerchant[] = [
  { merchant: 'Salary credit', categoryId: 'income', words: ['salary'] },
  { merchant: 'Interest credit', categoryId: 'income', words: ['interest'] },
  { merchant: 'Rent payment', categoryId: 'housing', words: ['rent', 'nobroker'] },

  { merchant: 'Zomato', categoryId: 'dining', words: ['zomato'] },
  { merchant: 'Swiggy', categoryId: 'dining', words: ['swiggy'] },
  { merchant: 'Starbucks', categoryId: 'dining', words: ['starbucks'] },
  { merchant: 'Chaayos', categoryId: 'dining', words: ['chaayos'] },
  { merchant: 'Pizza Hut', categoryId: 'dining', words: ['pizza hut'] },
  { merchant: 'Dominos', categoryId: 'dining', words: ['dominos'] },
  { merchant: 'Cafe Coffee Day', categoryId: 'dining', words: ['cafe coffee day', 'ccd'] },
  { merchant: 'Barbeque Nation', categoryId: 'dining', words: ['barbeque nation'] },
  { merchant: 'McDonalds', categoryId: 'dining', words: ['mcdonalds'] },

  { merchant: 'BigBasket', categoryId: 'groceries', words: ['bigbasket'] },
  { merchant: 'Blinkit', categoryId: 'groceries', words: ['blinkit'] },
  { merchant: 'Zepto', categoryId: 'groceries', words: ['zepto'] },
  { merchant: 'DMart', categoryId: 'groceries', words: ['dmart'] },
  { merchant: 'Reliance Fresh', categoryId: 'groceries', words: ['reliance fresh'] },

  { merchant: 'Uber', categoryId: 'transport', words: ['uber'] },
  { merchant: 'Ola', categoryId: 'transport', words: ['ola'] },
  { merchant: 'Rapido', categoryId: 'transport', words: ['rapido'] },
  { merchant: 'Indian Oil', categoryId: 'transport', words: ['indian oil', 'iocl'] },
  { merchant: 'Metro card recharge', categoryId: 'transport', words: ['metro'] },
  { merchant: 'FASTag', categoryId: 'transport', words: ['fastag'] },

  { merchant: 'Amazon', categoryId: 'shopping', words: ['amazon'], uncertain: true },
  { merchant: 'Flipkart', categoryId: 'shopping', words: ['flipkart'] },
  { merchant: 'Myntra', categoryId: 'shopping', words: ['myntra'] },
  { merchant: 'Decathlon', categoryId: 'shopping', words: ['decathlon'] },
  { merchant: 'Croma', categoryId: 'shopping', words: ['croma'] },
  { merchant: 'Nykaa', categoryId: 'shopping', words: ['nykaa'] },

  { merchant: 'Airtel', categoryId: 'bills', words: ['airtel'] },
  { merchant: 'Jio', categoryId: 'bills', words: ['jio'] },
  { merchant: 'Electricity bill', categoryId: 'bills', words: ['electricity', 'bescom'] },
  { merchant: 'Broadband', categoryId: 'bills', words: ['broadband'] },
  { merchant: 'Netflix', categoryId: 'bills', words: ['netflix'] },
  { merchant: 'Spotify', categoryId: 'bills', words: ['spotify'] },

  { merchant: 'Apollo Pharmacy', categoryId: 'health', words: ['apollo'] },
  { merchant: 'Practo', categoryId: 'health', words: ['practo'] },
  { merchant: 'MedPlus', categoryId: 'health', words: ['medplus'] },
  { merchant: 'Cult.fit', categoryId: 'health', words: ['cult fit', 'cultfit'] },

  { merchant: 'ATM withdrawal', categoryId: 'other', words: ['atm'], uncertain: true },
];

/** Hints from a category column in the person's own file. Only used as a starting suggestion. */
const BANK_CATEGORY_HINTS: [RegExp, CategoryId][] = [
  [/food|dining|restaurant|cafe|eating/, 'dining'],
  [/grocer|supermarket/, 'groceries'],
  [/shop|retail|apparel|cloth|electronic/, 'shopping'],
  [/travel|transport|fuel|taxi|cab|petrol/, 'transport'],
  [/bill|utilit|telecom|insurance|recharge/, 'bills'],
  [/health|medical|pharma|hospital|fitness/, 'health'],
  [/rent|housing|home|mortgage/, 'housing'],
];

/** Lower case, letters and digits only, single spaces. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Words banks add to descriptions that say nothing about the merchant. */
const NOISE_WORDS = new Set([
  'upi',
  'pos',
  'neft',
  'imps',
  'rtgs',
  'atm',
  'wdl',
  'bill',
  'pay',
  'ach',
  'ecs',
  'nach',
  'card',
  'debit',
  'credit',
  'txn',
  'purchase',
  'payment',
  'to',
  'from',
  'by',
  'ref',
  'vpa',
  'dr',
  'cr',
  'hdfc',
  'icici',
  'sbi',
  'axis',
  'kotak',
  'pnb',
  'bob',
]);

/** Reference numbers and masked card numbers, such as 402312345678 or 4455XXXX1234. */
const looksLikeReference = (part: string) =>
  (part.match(/\d/g)?.length ?? 0) >= 4 || /x{3,}/i.test(part);

function titleCase(text: string): string {
  return text
    .toLowerCase()
    .replace(
      /(^|[\s.'&-])([a-z])/g,
      (_, start: string, letter: string) => start + letter.toUpperCase(),
    );
}

/** Turns "UPI-R SHARMA-R.SHARMA@OKSBI" into "R Sharma". Falls back to the original text. */
export function cleanMerchantName(description: string): string {
  const words = description
    .split(/[\s\-/_,]+/)
    .filter((part) => part && !part.includes('@') && !looksLikeReference(part))
    .map((part) => part.replace(/[^A-Za-z0-9&.']/g, ''))
    .filter((part) => part && !/^\d+$/.test(part) && !NOISE_WORDS.has(part.toLowerCase()));

  const unique = words.filter(
    (word, index) => index === 0 || word.toLowerCase() !== words[index - 1].toLowerCase(),
  );
  const name = unique.slice(0, 3).join(' ');
  return name ? titleCase(name) : description.trim();
}

function categoryFromBank(label: string): CategoryId | null {
  const text = label.toLowerCase();
  for (const [pattern, categoryId] of BANK_CATEGORY_HINTS) {
    if (pattern.test(text)) return categoryId;
  }
  return null;
}

interface CategorizeInput {
  description: string;
  direction: 'out' | 'in';
  /** The value from the person's own category column, if they have one. */
  bankCategory?: string;
  /** Categories the person chose to remember, keyed by merchant. */
  rules: Record<string, CategoryId>;
}

/**
 * Works out a merchant name and a suggested category. Order of trust: a rule the person saved,
 * then a recognized merchant, then a hint from their own file, and finally "Other" to be checked.
 */
export function categorize({
  description,
  direction,
  bankCategory,
  rules,
}: CategorizeInput): Categorization {
  const text = ` ${normalize(description)} `;
  const known = KNOWN_MERCHANTS.find(
    (entry) =>
      (direction === 'in' || entry.categoryId !== 'income') &&
      entry.words.some((word) => text.includes(` ${word} `)),
  );
  const merchant = known?.merchant ?? cleanMerchantName(description || 'No description');

  if (direction === 'in') return { merchant, categoryId: 'income', uncertain: false };

  const saved = rules[ruleKey(merchant)];
  if (saved) return { merchant, categoryId: saved, uncertain: false };

  if (known) return { merchant, categoryId: known.categoryId, uncertain: Boolean(known.uncertain) };

  const hinted = bankCategory ? categoryFromBank(bankCategory) : null;
  if (hinted) return { merchant, categoryId: hinted, uncertain: true };

  return { merchant, categoryId: 'other', uncertain: true };
}
