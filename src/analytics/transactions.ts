import { TransactionNormalizedRecord } from '../data/transactions/types';
import {
  groupByYear,
  groupByMonth,
  groupByHour,
  groupByWeekday,
  YearBucket,
  MonthBucket,
  HourBucket,
  WeekdayBucket,
} from './temporal';

export interface TransactionCategoryBucket {
  category: string;
  count: number;
  amount: number;
  percentage: number;
  avgAmount: number;
}

export interface TransactionLocationBucket {
  location: string;
  count: number;
  totalAmount: number;
}

export interface TransactionAmountBucket {
  range: string;
  min: number;
  max: number;
  count: number;
}

export interface TransactionAnalytics {
  totalRecords: number;
  dateRange: { start: string; end: string };
  categoryFrequency: TransactionCategoryBucket[];
  categoryPercentages: TransactionCategoryBucket[];
  categoryAmounts: TransactionCategoryBucket[];
  categoryAverageAmount: { category: string; avgAmount: number }[];
  yearlyCounts: YearBucket[];
  yearlyAmounts: YearBucket[];
  monthlyCounts: MonthBucket[];
  monthlyAmounts: MonthBucket[];
  hourlyCounts: HourBucket[];
  weekdayCounts: WeekdayBucket[];
  cityDistribution: TransactionLocationBucket[];
  stateDistribution: TransactionLocationBucket[];
  merchantCategoryDistribution: TransactionCategoryBucket[];
  amountDistribution: TransactionAmountBucket[];
  largestSafeAggregates: { label: string; value: number }[];
  missingCategoryCount: number;
  totalAmount: number;
}

const AMOUNT_RANGES = [
  { range: '₹0–₹500', min: 0, max: 500 },
  { range: '₹500–₹1K', min: 500, max: 1000 },
  { range: '₹1K–₹2K', min: 1000, max: 2000 },
  { range: '₹2K–₹5K', min: 2000, max: 5000 },
  { range: '₹5K–₹10K', min: 5000, max: 10000 },
  { range: '₹10K+', min: 10000, max: Infinity },
];

export function computeTransactionAnalytics(records: TransactionNormalizedRecord[]): TransactionAnalytics {
  if (!records || records.length === 0) return createEmptyTransactionAnalytics();

  let minDate = '';
  let maxDate = '';
  let totalAmount = 0;
  let missingCategoryCount = 0;

  const catMap = new Map<string, { count: number; amount: number }>();
  const cityMap = new Map<string, { count: number; amount: number }>();
  const stateMap = new Map<string, { count: number; amount: number }>();
  const amountBuckets = new Array(AMOUNT_RANGES.length).fill(0) as number[];

  for (const r of records) {
    if (!minDate || r.date < minDate) minDate = r.date;
    if (!maxDate || r.date > maxDate) maxDate = r.date;

    totalAmount += r.amount;

    const category = r.category === 'Uncategorized' ? 'Uncategorized' : r.category;
    if (category === 'Uncategorized') missingCategoryCount++;

    let cData = catMap.get(category);
    if (!cData) { cData = { count: 0, amount: 0 }; catMap.set(category, cData); }
    cData.count++;
    cData.amount += r.amount;

    // Safe location aggregates
    if (r.city && r.city !== 'Unknown') {
      let cityData = cityMap.get(r.city);
      if (!cityData) { cityData = { count: 0, amount: 0 }; cityMap.set(r.city, cityData); }
      cityData.count++;
      cityData.amount += r.amount;
    }

    if (r.state && r.state !== 'Unknown') {
      let stateData = stateMap.get(r.state);
      if (!stateData) { stateData = { count: 0, amount: 0 }; stateMap.set(r.state, stateData); }
      stateData.count++;
      stateData.amount += r.amount;
    }

    // Amount distribution
    for (let i = 0; i < AMOUNT_RANGES.length; i++) {
      const range = AMOUNT_RANGES[i]!;
      if (r.amount >= range.min && r.amount < range.max) {
        amountBuckets[i]!++;
        break;
      }
    }
  }

  const totalRecords = records.length;

  const categoryFrequency: TransactionCategoryBucket[] = Array.from(catMap.entries())
    .map(([category, d]) => ({
      category,
      count: d.count,
      amount: Math.round(d.amount),
      percentage: Number((d.count / totalRecords * 100).toFixed(2)),
      avgAmount: Number((d.amount / Math.max(1, d.count)).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);

  const categoryAmounts: TransactionCategoryBucket[] = [...categoryFrequency]
    .sort((a, b) => b.amount - a.amount);

  const categoryPercentages = categoryAmounts.map((c) => ({
    ...c,
    percentage: Number((c.amount / Math.max(1, totalAmount) * 100).toFixed(2)),
  }));

  return {
    totalRecords,
    dateRange: { start: minDate, end: maxDate },
    totalAmount: Math.round(totalAmount),
    categoryFrequency,
    categoryPercentages,
    categoryAmounts,
    categoryAverageAmount: categoryFrequency.map((c) => ({ category: c.category, avgAmount: c.avgAmount })),
    yearlyCounts: groupByYear(records, (r) => r.year, () => 1),
    yearlyAmounts: groupByYear(records, (r) => r.year, (r) => r.amount),
    monthlyCounts: groupByMonth(records, (r) => r.year, (r) => r.month, () => 1),
    monthlyAmounts: groupByMonth(records, (r) => r.year, (r) => r.month, (r) => r.amount),
    hourlyCounts: groupByHour(records, (r) => r.hour),
    weekdayCounts: groupByWeekday(records, (r) => r.weekday, (r) => r.amount),
    cityDistribution: Array.from(cityMap.entries())
      .map(([location, d]) => ({ location, count: d.count, totalAmount: Math.round(d.amount) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    stateDistribution: Array.from(stateMap.entries())
      .map(([location, d]) => ({ location, count: d.count, totalAmount: Math.round(d.amount) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15),
    merchantCategoryDistribution: categoryFrequency,
    amountDistribution: AMOUNT_RANGES.map((r, i) => ({ ...r, count: amountBuckets[i] ?? 0 })),
    largestSafeAggregates: categoryAmounts.slice(0, 5).map((c) => ({
      label: `${c.category} total`,
      value: c.amount,
    })),
    missingCategoryCount,
  };
}

export function createEmptyTransactionAnalytics(): TransactionAnalytics {
  return {
    totalRecords: 0,
    dateRange: { start: '', end: '' },
    totalAmount: 0,
    categoryFrequency: [],
    categoryPercentages: [],
    categoryAmounts: [],
    categoryAverageAmount: [],
    yearlyCounts: [],
    yearlyAmounts: [],
    monthlyCounts: [],
    monthlyAmounts: [],
    hourlyCounts: [],
    weekdayCounts: [],
    cityDistribution: [],
    stateDistribution: [],
    merchantCategoryDistribution: [],
    amountDistribution: [],
    largestSafeAggregates: [],
    missingCategoryCount: 0,
  };
}
