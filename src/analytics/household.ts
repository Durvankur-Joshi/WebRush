import { HouseholdNormalizedRecord } from '../data/household/types';
import {
  groupByYear,
  groupByMonth,
  groupByWeekday,
  YearBucket,
  MonthBucket,
  WeekdayBucket,
} from './temporal';

export interface HouseholdCategoryBucket {
  category: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface HouseholdSubcategoryBucket {
  subcategory: string;
  category: string;
  count: number;
  amount: number;
}

export interface HouseholdYearlyRecord {
  year: number;
  expenses: number;
  income: number;
  net: number;
  count: number;
}

export interface HouseholdLargeTransaction {
  date: string;
  category: string;
  subcategory: string;
  amount: number;
  direction: string;
}

export interface HouseholdAnalytics {
  totalRecords: number;
  dateRange: { start: string; end: string };
  expenseCount: number;
  incomeCount: number;
  totalExpenses: number;
  totalIncome: number;
  netAmount: number;
  categoryFrequency: HouseholdCategoryBucket[];
  categoryAmounts: HouseholdCategoryBucket[];
  categoryPercentages: HouseholdCategoryBucket[];
  subcategoryFrequency: HouseholdSubcategoryBucket[];
  subcategoryAmounts: HouseholdSubcategoryBucket[];
  yearlyAmounts: HouseholdYearlyRecord[];
  yearlyCounts: YearBucket[];
  monthlyAmounts: MonthBucket[];
  weekdayAmounts: WeekdayBucket[];
  topSubcategories: HouseholdSubcategoryBucket[];
  largestTransactions: HouseholdLargeTransaction[];
  modeDistribution: { mode: string; count: number; percentage: number }[];
  currencyDistribution: { currency: string; count: number }[];
  incomeVsExpense: { label: string; value: number }[];
}

export function computeHouseholdAnalytics(records: HouseholdNormalizedRecord[]): HouseholdAnalytics {
  if (!records || records.length === 0) return createEmptyHouseholdAnalytics();

  let minDate = '';
  let maxDate = '';
  let totalExpenses = 0;
  let totalIncome = 0;
  let expenseCount = 0;
  let incomeCount = 0;

  const catMap = new Map<string, { count: number; expense: number }>();
  const subcatMap = new Map<string, { category: string; count: number; expense: number }>();
  const yearlyMap = new Map<number, { expenses: number; income: number; count: number }>();
  const modeMap = new Map<string, number>();
  const currencyMap = new Map<string, number>();
  const largestTxns: HouseholdLargeTransaction[] = [];

  for (const r of records) {
    if (!minDate || r.date < minDate) minDate = r.date;
    if (!maxDate || r.date > maxDate) maxDate = r.date;

    const isExpense = r.direction === 'expense';
    const isIncome = r.direction === 'income';

    if (isExpense) { totalExpenses += r.amount; expenseCount++; }
    if (isIncome) { totalIncome += r.amount; incomeCount++; }

    // Category
    let cData = catMap.get(r.category);
    if (!cData) { cData = { count: 0, expense: 0 }; catMap.set(r.category, cData); }
    cData.count++;
    if (isExpense) cData.expense += r.amount;

    // Subcategory
    const subKey = `${r.category}:::${r.subcategory}`;
    let sData = subcatMap.get(subKey);
    if (!sData) { sData = { category: r.category, count: 0, expense: 0 }; subcatMap.set(subKey, sData); }
    sData.count++;
    if (isExpense) sData.expense += r.amount;

    // Yearly
    let yData = yearlyMap.get(r.year);
    if (!yData) { yData = { expenses: 0, income: 0, count: 0 }; yearlyMap.set(r.year, yData); }
    yData.count++;
    if (isExpense) yData.expenses += r.amount;
    if (isIncome) yData.income += r.amount;

    // Mode
    modeMap.set(r.mode, (modeMap.get(r.mode) ?? 0) + 1);

    // Currency
    currencyMap.set(r.currency, (currencyMap.get(r.currency) ?? 0) + 1);

    // Collect for largest transactions (top 20 by amount)
    if (isExpense && r.amount > 0) {
      largestTxns.push({ date: r.date, category: r.category, subcategory: r.subcategory, amount: r.amount, direction: r.direction });
    }
  }

  const totalRecords = records.length;

  // Category aggregates
  const categoryFrequency: HouseholdCategoryBucket[] = Array.from(catMap.entries())
    .map(([category, d]) => ({
      category,
      count: d.count,
      amount: Math.round(d.expense),
      percentage: Number((d.count / totalRecords * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);

  const categoryAmounts: HouseholdCategoryBucket[] = Array.from(catMap.entries())
    .map(([category, d]) => ({
      category,
      count: d.count,
      amount: Math.round(d.expense),
      percentage: totalExpenses > 0 ? Number((d.expense / totalExpenses * 100).toFixed(2)) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const categoryPercentages = [...categoryAmounts];

  // Subcategory aggregates
  const subcategoryFrequency: HouseholdSubcategoryBucket[] = Array.from(subcatMap.entries())
    .map(([key, d]) => {
      const subcategory = key.split(':::')[1] ?? key;
      return { subcategory, category: d.category, count: d.count, amount: Math.round(d.expense) };
    })
    .sort((a, b) => b.count - a.count);

  const subcategoryAmounts: HouseholdSubcategoryBucket[] = [...subcategoryFrequency]
    .sort((a, b) => b.amount - a.amount);

  // Yearly
  const yearlyAmounts: HouseholdYearlyRecord[] = Array.from(yearlyMap.entries())
    .map(([year, d]) => ({
      year,
      expenses: Math.round(d.expenses),
      income: Math.round(d.income),
      net: Math.round(d.income - d.expenses),
      count: d.count,
    }))
    .sort((a, b) => a.year - b.year);

  // Mode distribution
  const modeTotal = records.length;
  const modeDistribution = Array.from(modeMap.entries())
    .map(([mode, count]) => ({ mode, count, percentage: Number((count / modeTotal * 100).toFixed(2)) }))
    .sort((a, b) => b.count - a.count);

  // Currency distribution
  const currencyDistribution = Array.from(currencyMap.entries())
    .map(([currency, count]) => ({ currency, count }))
    .sort((a, b) => b.count - a.count);

  // Largest transactions (top 20)
  largestTxns.sort((a, b) => b.amount - a.amount);

  return {
    totalRecords,
    dateRange: { start: minDate, end: maxDate },
    expenseCount,
    incomeCount,
    totalExpenses: Math.round(totalExpenses),
    totalIncome: Math.round(totalIncome),
    netAmount: Math.round(totalIncome - totalExpenses),
    categoryFrequency,
    categoryAmounts,
    categoryPercentages,
    subcategoryFrequency,
    subcategoryAmounts,
    yearlyAmounts,
    yearlyCounts: groupByYear(records, (r) => r.year, () => 1),
    monthlyAmounts: groupByMonth(records, (r) => r.year, (r) => r.month, (r) => r.amount),
    weekdayAmounts: groupByWeekday(records, (r) => r.weekday, (r) => r.amount),
    topSubcategories: subcategoryAmounts.slice(0, 20),
    largestTransactions: largestTxns.slice(0, 20),
    modeDistribution,
    currencyDistribution,
    incomeVsExpense: [
      { label: 'Total Expenses', value: Math.round(totalExpenses) },
      { label: 'Total Income', value: Math.round(totalIncome) },
    ],
  };
}

export function createEmptyHouseholdAnalytics(): HouseholdAnalytics {
  return {
    totalRecords: 0,
    dateRange: { start: '', end: '' },
    expenseCount: 0,
    incomeCount: 0,
    totalExpenses: 0,
    totalIncome: 0,
    netAmount: 0,
    categoryFrequency: [],
    categoryAmounts: [],
    categoryPercentages: [],
    subcategoryFrequency: [],
    subcategoryAmounts: [],
    yearlyAmounts: [],
    yearlyCounts: [],
    monthlyAmounts: [],
    weekdayAmounts: [],
    topSubcategories: [],
    largestTransactions: [],
    modeDistribution: [],
    currencyDistribution: [],
    incomeVsExpense: [],
  };
}
