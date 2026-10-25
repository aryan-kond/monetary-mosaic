import type { CategoryId } from './categories';

export const reportingPeriod = {
  label: '1 Oct – 25 Oct 2026',
};

export const trendPeriods = {
  current: { label: '1–25 Oct', month: 'Oct', caption: 'this month' },
  previous: { label: '1–25 Sep', month: 'Sep', caption: 'same days last month' },
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Sample daily spending in whole rupees, for days 1 to 25. */
export const dailySpending = {
  current: [
    16000, 1250, 1240, 820, 2650, 780, 910, 1880, 560, 3520, 640, 690, 1830, 1120, 2410, 795, 980,
    1860, 340, 2490, 610, 1575, 430, 1080, 1800,
  ],
  previous: [
    16000, 1040, 1890, 910, 2230, 1820, 360, 1370, 3340, 880, 1150, 3160, 590, 1230, 1980, 820,
    1610, 1130, 2870, 650, 1240, 980, 2130, 820, 1900,
  ],
};

/** Sample spending by category. These add up to the same ₹48,260 as the daily figures. */
export const categorySpending: { categoryId: CategoryId; amount: number }[] = [
  { categoryId: 'housing', amount: 16000 },
  { categoryId: 'groceries', amount: 8450 },
  { categoryId: 'dining', amount: 5120 },
  { categoryId: 'shopping', amount: 4970 },
  { categoryId: 'transport', amount: 3680 },
  { categoryId: 'bills', amount: 3240 },
  { categoryId: 'health', amount: 1920 },
  { categoryId: 'other', amount: 4880 },
];

/** Sample figures. Amounts are in whole rupees. */
export const summaryData = {
  previousPeriodShort: trendPeriods.previous.label,
  totalSpent: sum(dailySpending.current),
  previousTotalSpent: sum(dailySpending.previous),
  totalIncome: 125000,
  previousTotalIncome: 125000,
  monthlyBudget: 65000,
};
