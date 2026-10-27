export const reportingPeriod = {
  label: '1 Oct – 25 Oct 2026',
  startDate: '2026-10-01',
  days: 25,
};

export const trendPeriods = {
  current: { label: '1–25 Oct', month: 'Oct', caption: 'this month' },
  previous: { label: '1–25 Sep', month: 'Sep', caption: 'same days last month' },
};

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Sample daily spending for the same days last month (1–25 Sep), in whole rupees. */
export const previousDailySpending = [
  16000, 1040, 1890, 910, 2230, 1820, 360, 1370, 3340, 880, 1150, 3160, 590, 1230, 1980, 820, 1610,
  1130, 2870, 650, 1240, 980, 2130, 820, 1900,
];

/** Sample figures from last month, used for comparisons in insights. */
export const previousPeriod = {
  monthName: 'September',
  diningSpend: 4340,
};

export const forecastConfig = {
  daysInMonth: 31,
  monthEndLabel: '31 Oct',
};

/** Sample figures that do not come from the transactions. Amounts are in whole rupees. */
export const summaryData = {
  previousPeriodShort: trendPeriods.previous.label,
  previousTotalSpent: sum(previousDailySpending),
  previousTotalIncome: 125000,
  monthlyBudget: 65000,
};
