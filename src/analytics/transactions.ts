import { LocationAggregate, SafeTransactionRecord, TransactionAnalytics, TransactionCategoryMetric } from '../types/transactions';
import { HourlyDistribution, WeekdayDistribution } from '../types/common';
import { parseCustomDate } from '../lib/formatters';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Transforms sanitized transaction records into compact analytical metrics.
 * Operates purely on sanitized records — zero PII fields enter this pipeline.
 */
export function computeTransactionAnalytics(records: SafeTransactionRecord[]): TransactionAnalytics {
  if (!records || records.length === 0) {
    return createEmptyTransactionAnalytics();
  }

  let minDate = '';
  let maxDate = '';
  let totalAmount = 0;
  let fraudCount = 0;

  const catMap = new Map<string, { count: number; amount: number }>();
  const stateMap = new Map<string, { count: number; amount: number; cityMap: Map<string, { count: number; amount: number }> }>();
  const yearlyMap = new Map<number, { amount: number; count: number }>();
  const hourlyCount = new Array(24).fill(0);
  const weekdayCount = new Array(7).fill(0);
  const weekdayAmount = new Array(7).fill(0);

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r) continue;

    const amt = r.amount || 0;
    totalAmount += amt;
    if (r.isFraud) fraudCount++;

    // Category
    const category = r.category || 'misc';
    let cData = catMap.get(category);
    if (!cData) {
      cData = { count: 0, amount: 0 };
      catMap.set(category, cData);
    }
    cData.count += 1;
    cData.amount += amt;

    // Safe Location Aggregate (State / City)
    const state = r.state || 'Unknown';
    let stData = stateMap.get(state);
    if (!stData) {
      stData = { count: 0, amount: 0, cityMap: new Map() };
      stateMap.set(state, stData);
    }
    stData.count += 1;
    stData.amount += amt;

    const city = r.city || 'Unknown';
    let ctData = stData.cityMap.get(city);
    if (!ctData) {
      ctData = { count: 0, amount: 0 };
      stData.cityMap.set(city, ctData);
    }
    ctData.count += 1;
    ctData.amount += amt;

    // Date
    if (r.timestamp) {
      const dt = parseCustomDate(r.timestamp);
      if (!isNaN(dt.getTime())) {
        const yr = dt.getFullYear();
        const hr = dt.getHours();
        const wd = dt.getDay();
        const iso = dt.toISOString().slice(0, 10);

        if (!minDate || iso < minDate) minDate = iso;
        if (!maxDate || iso > maxDate) maxDate = iso;

        hourlyCount[hr] = (hourlyCount[hr] || 0) + 1;
        weekdayCount[wd] = (weekdayCount[wd] || 0) + 1;
        weekdayAmount[wd] = (weekdayAmount[wd] || 0) + amt;

        let yData = yearlyMap.get(yr);
        if (!yData) {
          yData = { amount: 0, count: 0 };
          yearlyMap.set(yr, yData);
        }
        yData.count += 1;
        yData.amount += amt;
      }
    }
  }

  // Category aggregates
  const categoryFrequency: TransactionCategoryMetric[] = Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      amount: Math.round(data.amount),
      percentage: Number(((data.count / Math.max(1, records.length)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count);

  const categoryAmounts: TransactionCategoryMetric[] = Array.from(catMap.entries())
    .map(([category, data]) => ({
      category,
      count: data.count,
      amount: Math.round(data.amount),
      percentage: Number(((data.amount / Math.max(1, totalAmount)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.amount - a.amount);

  // Safe Location aggregates (top states)
  const safeLocationAggregates: LocationAggregate[] = Array.from(stateMap.entries())
    .map(([state, data]) => ({
      state,
      transactionCount: data.count,
      totalAmount: Math.round(data.amount),
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 12);

  // Yearly aggregates
  const yearlyAmounts = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      amount: Math.round(data.amount),
    }))
    .sort((a, b) => a.year - b.year);

  const yearlyCounts = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      count: data.count,
    }))
    .sort((a, b) => a.year - b.year);

  // Hourly patterns
  const hourlyPatterns: HourlyDistribution[] = hourlyCount.map((count, hour) => ({
    hour,
    count,
  }));

  // Weekday patterns
  const weekdayPatterns: WeekdayDistribution[] = weekdayCount.map((count, day) => ({
    day,
    dayName: WEEKDAYS[day] || `Day ${day}`,
    count,
    value: Math.round(weekdayAmount[day] || 0),
  }));

  return {
    totalRecords: records.length,
    dateRange: { start: minDate || '2022-01-01', end: maxDate || '2024-12-31' },
    totalAmount: Math.round(totalAmount),
    fraudCount,
    fraudRate: Number(((fraudCount / Math.max(1, records.length)) * 100).toFixed(2)),
    categoryFrequency,
    categoryAmounts,
    yearlyCounts,
    yearlyAmounts,
    hourlyPatterns,
    weekdayPatterns,
    safeLocationAggregates,
  };
}

export function createEmptyTransactionAnalytics(): TransactionAnalytics {
  return {
    totalRecords: 0,
    dateRange: { start: '2022-01-01', end: '2024-12-31' },
    totalAmount: 0,
    fraudCount: 0,
    fraudRate: 0,
    categoryFrequency: [],
    categoryAmounts: [],
    yearlyCounts: [],
    yearlyAmounts: [],
    hourlyPatterns: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
    weekdayPatterns: WEEKDAYS.map((name, i) => ({ day: i, dayName: name, count: 0 })),
    safeLocationAggregates: [],
  };
}
