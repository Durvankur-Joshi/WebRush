import { CategoryAggregate, HouseholdAnalytics, HouseholdRawRecord, SubcategorySummary, YearlyFinanceMetric } from '../types/household';
import { WeekdayDistribution } from '../types/common';
import { parseCustomDate } from '../lib/formatters';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Transforms raw Household transactions into structured financial analytics.
 */
export function computeHouseholdAnalytics(records: HouseholdRawRecord[]): HouseholdAnalytics {
  if (!records || records.length === 0) {
    return createEmptyHouseholdAnalytics();
  }

  let minDate = '';
  let maxDate = '';
  let expenseCount = 0;
  let incomeCount = 0;
  let totalExpenseAmount = 0;
  let totalIncomeAmount = 0;

  const catMap = new Map<string, { count: number; amount: number }>();
  const subcatMap = new Map<string, { category: string; count: number; amount: number }>();
  const yearlyMap = new Map<number, { expense: number; income: number; count: number }>();
  const weekdayCount = new Array(7).fill(0);
  const weekdayAmount = new Array(7).fill(0);

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r) continue;

    const amt = Number(r.Amount) || 0;
    const isExpense = r['Income/Expense']?.toLowerCase() === 'expense';
    const isIncome = r['Income/Expense']?.toLowerCase() === 'income';

    if (isExpense) {
      expenseCount++;
      totalExpenseAmount += amt;
    } else if (isIncome) {
      incomeCount++;
      totalIncomeAmount += amt;
    }

    // Category aggregation
    const category = (r.Category || 'Uncategorized').trim();
    let cData = catMap.get(category);
    if (!cData) {
      cData = { count: 0, amount: 0 };
      catMap.set(category, cData);
    }
    cData.count += 1;
    if (isExpense) cData.amount += amt;

    // Subcategory aggregation
    const subcat = (r.Subcategory || 'General').trim();
    const subKey = `${category}::${subcat}`;
    let sData = subcatMap.get(subKey);
    if (!sData) {
      sData = { category, count: 0, amount: 0 };
      subcatMap.set(subKey, sData);
    }
    sData.count += 1;
    if (isExpense) sData.amount += amt;

    // Date aggregation
    if (r.Date) {
      const dt = parseCustomDate(r.Date);
      if (!isNaN(dt.getTime())) {
        const yr = dt.getFullYear();
        const wd = dt.getDay();
        const iso = dt.toISOString().slice(0, 10);

        if (!minDate || iso < minDate) minDate = iso;
        if (!maxDate || iso > maxDate) maxDate = iso;

        weekdayCount[wd] = (weekdayCount[wd] || 0) + 1;
        if (isExpense) weekdayAmount[wd] = (weekdayAmount[wd] || 0) + amt;

        let yData = yearlyMap.get(yr);
        if (!yData) {
          yData = { expense: 0, income: 0, count: 0 };
          yearlyMap.set(yr, yData);
        }
        yData.count += 1;
        if (isExpense) yData.expense += amt;
        if (isIncome) yData.income += amt;
      }
    }
  }

  // Category aggregates
  const categoryFrequency: CategoryAggregate[] = Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      amount: Math.round(data.amount),
      percentage: Number(((data.count / Math.max(1, records.length)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  const categoryAmounts: CategoryAggregate[] = Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      amount: Math.round(data.amount),
      percentage: Number(((data.amount / Math.max(1, totalExpenseAmount)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top subcategories
  const topSubcategories: SubcategorySummary[] = Array.from(subcatMap.entries())
    .map(([key, data]) => {
      const subcat = key.split('::')[1] || key;
      return {
        subcategory: subcat,
        category: data.category,
        amount: Math.round(data.amount),
        count: data.count,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 15);

  // Yearly aggregates
  const yearlyAmounts: YearlyFinanceMetric[] = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      expense: Math.round(data.expense),
      income: Math.round(data.income),
      count: data.count,
    }))
    .sort((a, b) => a.year - b.year);

  // Weekday distribution
  const weekdayPatterns: WeekdayDistribution[] = weekdayCount.map((count, day) => ({
    day,
    dayName: WEEKDAYS[day] || `Day ${day}`,
    count,
    value: Math.round(weekdayAmount[day] || 0),
  }));

  return {
    totalRecords: records.length,
    dateRange: { start: minDate || '2015-01-01', end: maxDate || '2018-12-31' },
    expenseCount,
    incomeCount,
    totalExpenseAmount: Math.round(totalExpenseAmount),
    totalIncomeAmount: Math.round(totalIncomeAmount),
    categoryFrequency,
    categoryAmounts,
    yearlyAmounts,
    yearlyCounts: yearlyAmounts.map((y) => ({ year: y.year, count: y.count })),
    topSubcategories,
    weekdayPatterns,
  };
}

export function createEmptyHouseholdAnalytics(): HouseholdAnalytics {
  return {
    totalRecords: 0,
    dateRange: { start: '2015-01-01', end: '2018-12-31' },
    expenseCount: 0,
    incomeCount: 0,
    totalExpenseAmount: 0,
    totalIncomeAmount: 0,
    categoryFrequency: [],
    categoryAmounts: [],
    yearlyAmounts: [],
    yearlyCounts: [],
    topSubcategories: [],
    weekdayPatterns: WEEKDAYS.map((name, i) => ({ day: i, dayName: name, count: 0 })),
  };
}
