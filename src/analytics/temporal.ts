/**
 * Reusable temporal analytics utilities.
 * Pure functions with no external dependencies.
 */

import { DatasetId } from '../types/common';
import { CAUSALITY_DISCLAIMER } from '../lib/constants';

export interface LabelValue {
  label: string;
  value: number;
}

export interface YearBucket {
  year: number;
  count: number;
  value: number;
}

export interface MonthBucket {
  year: number;
  month: number;
  label: string;
  count: number;
  value: number;
}

export interface HourBucket {
  hour: number;
  label: string;
  count: number;
}

export interface WeekdayBucket {
  weekday: number;
  label: string;
  count: number;
  value: number;
}

export interface TimelineEra {
  id: string;
  name: string;
  years: string;
  startYear: number;
  endYear: number;
  activeDatasets: DatasetId[];
  narrativeFocus: string;
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: 'era_discovery',
    name: 'The Acoustic Dawn',
    years: '2013 – 2014',
    startYear: 2013,
    endYear: 2014,
    activeDatasets: ['spotify'],
    narrativeFocus: 'Early digital music habits, streaming exploration, high playlist turnover.',
  },
  {
    id: 'era_domestic',
    name: 'Domestic Ledger Era',
    years: '2015 – 2018',
    startYear: 2015,
    endYear: 2018,
    activeDatasets: ['spotify', 'household'],
    narrativeFocus: 'Physical domestic expenditure tracking in parallel with long-form audio streaming.',
  },
  {
    id: 'era_bridge',
    name: 'Streaming Continuity',
    years: '2019 – 2021',
    startYear: 2019,
    endYear: 2021,
    activeDatasets: ['spotify'],
    narrativeFocus: 'Uninterrupted music consumption throughout global transitions.',
  },
  {
    id: 'era_commerce',
    name: 'Modern Multi-Facet Transact',
    years: '2022 – 2024',
    startYear: 2022,
    endYear: 2024,
    activeDatasets: ['spotify', 'transactions'],
    narrativeFocus: 'Digital POS cards, point-of-sale categorization, contemporary streaming maturation.',
  },
];

const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Group records by year, returning count and summed value. */
export function groupByYear<T>(
  records: T[],
  getYear: (r: T) => number,
  getValue: (r: T) => number
): YearBucket[] {
  const map = new Map<number, { count: number; value: number }>();
  for (const r of records) {
    const yr = getYear(r);
    if (!yr || yr < 1900 || yr > 2100) continue;
    const existing = map.get(yr) ?? { count: 0, value: 0 };
    existing.count++;
    existing.value += getValue(r);
    map.set(yr, existing);
  }
  return Array.from(map.entries())
    .map(([year, b]) => ({ year, count: b.count, value: b.value }))
    .sort((a, b) => a.year - b.year);
}

/** Group records by year-month. */
export function groupByMonth<T>(
  records: T[],
  getYear: (r: T) => number,
  getMonth: (r: T) => number,
  getValue: (r: T) => number
): MonthBucket[] {
  const map = new Map<string, { year: number; month: number; count: number; value: number }>();
  for (const r of records) {
    const yr = getYear(r);
    const mo = getMonth(r);
    if (!yr || !mo || yr < 1900) continue;
    const key = `${yr}-${String(mo).padStart(2, '0')}`;
    const existing = map.get(key) ?? { year: yr, month: mo, count: 0, value: 0 };
    existing.count++;
    existing.value += getValue(r);
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .map(([label, b]) => ({ label, year: b.year, month: b.month, count: b.count, value: b.value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Group records by hour of day (0–23). */
export function groupByHour<T>(
  records: T[],
  getHour: (r: T) => number
): HourBucket[] {
  const counts = new Array(24).fill(0) as number[];
  for (const r of records) {
    const hr = getHour(r);
    if (hr >= 0 && hr < 24) counts[hr]++;
  }
  return counts.map((count, hour) => ({
    hour,
    label: `${String(hour).padStart(2, '0')}:00`,
    count,
  }));
}

/** Group records by weekday (0=Sun, 6=Sat). */
export function groupByWeekday<T>(
  records: T[],
  getWeekday: (r: T) => number,
  getValue: (r: T) => number
): WeekdayBucket[] {
  const data: { count: number; value: number }[] = Array.from({ length: 7 }, () => ({ count: 0, value: 0 }));
  for (const r of records) {
    const wd = getWeekday(r);
    if (wd >= 0 && wd < 7) {
      data[wd]!.count++;
      data[wd]!.value += getValue(r);
    }
  }
  return data.map((d, i) => ({ weekday: i, label: WEEKDAY_LABELS[i] ?? `Day ${i}`, count: d.count, value: d.value }));
}

/** Calculate year-over-year percentage change for a metric series. */
export function calculatePercentageChange(prev: number, curr: number): number | null {
  if (prev === 0) return null;
  return Number((((curr - prev) / Math.abs(prev)) * 100).toFixed(1));
}

/** Calculate share (percentage) of a value within total. */
export function calculateShare(value: number, total: number): number {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(2));
}

/** Calculate a simple moving average over a numeric array. */
export function calculateMovingAverage(values: number[], windowSize = 3): number[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(values.length, start + windowSize);
    const window = values.slice(start, end);
    return Number((window.reduce((s, v) => s + v, 0) / window.length).toFixed(2));
  });
}

/** Detect the peak value and its index in a numeric array. */
export function detectPeak(values: number[]): { index: number; value: number } {
  if (!values.length) return { index: -1, value: 0 };
  let peakIdx = 0;
  let peakVal = values[0] ?? 0;
  for (let i = 1; i < values.length; i++) {
    if ((values[i] ?? 0) > peakVal) {
      peakVal = values[i] ?? 0;
      peakIdx = i;
    }
  }
  return { index: peakIdx, value: peakVal };
}

/**
 * Detect significant change points in a numeric series.
 * Returns indices where percentage change exceeds the threshold.
 */
export function detectChangePoint(values: number[], thresholdPct = 30): number[] {
  const changes: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const prev = values[i - 1] ?? 0;
    const curr = values[i] ?? 0;
    const pct = calculatePercentageChange(prev, curr);
    if (pct !== null && Math.abs(pct) >= thresholdPct) {
      changes.push(i);
    }
  }
  return changes;
}

/**
 * Detect persistence: items appearing in at least `minYears` distinct years.
 */
export function detectPersistence<T>(
  records: T[],
  getKey: (r: T) => string,
  getYear: (r: T) => number,
  minYears = 3
): { key: string; years: number[]; count: number }[] {
  const map = new Map<string, { years: Set<number>; count: number }>();
  for (const r of records) {
    const key = getKey(r);
    const yr = getYear(r);
    if (!key || !yr) continue;
    const existing = map.get(key) ?? { years: new Set(), count: 0 };
    existing.years.add(yr);
    existing.count++;
    map.set(key, existing);
  }
  return Array.from(map.entries())
    .filter(([, d]) => d.years.size >= minYears)
    .map(([key, d]) => ({ key, years: Array.from(d.years).sort(), count: d.count }))
    .sort((a, b) => b.years.length - a.years.length);
}

/**
 * Detect concentration: what percentage of total value is held by the top N items.
 */
export function detectConcentration(
  values: number[],
  topN = 5
): { topNShare: number; topNSum: number; total: number } {
  const sorted = [...values].sort((a, b) => b - a);
  const total = sorted.reduce((s, v) => s + v, 0);
  const topNSum = sorted.slice(0, topN).reduce((s, v) => s + v, 0);
  return { topNShare: calculateShare(topNSum, total), topNSum, total };
}

/** Calculate a trend direction from a value series. */
export function calculateTrend(values: number[]): 'rising' | 'falling' | 'stable' {
  if (values.length < 2) return 'stable';
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const pct = calculatePercentageChange(first, last);
  if (pct === null) return 'stable';
  if (pct > 10) return 'rising';
  if (pct < -10) return 'falling';
  return 'stable';
}

/**
 * Builds comparative cross-era snapshots without making false causal claims.
 */
export function buildTemporalComparisons(
  spotify: { totalRecords: number; weekdayListening?: { dayName?: string; label?: string; count: number }[] },
  household: { totalRecords: number; categoryFrequency?: { category: string }[]; weekdayPatterns?: { dayName?: string; label?: string; count: number }[] },
  transactions: { totalRecords: number; categoryFrequency?: { category: string }[] }
) {
  const comparisons = [];

  if (household.totalRecords > 0 && transactions.totalRecords > 0) {
    const topHouseholdCategory = household.categoryFrequency?.[0]?.category || 'General';
    const topTransactCategory = transactions.categoryFrequency?.[0]?.category || 'General';

    comparisons.push({
      id: 'comp-finance-methods',
      title: 'Financial Modality Transition (2015–2018 vs 2022–2024)',
      description: 'Comparative analysis of domestic expense recordkeeping vs modern automated card transactions.',
      eraA: {
        dataset: 'household' as DatasetId,
        period: '2015 – 2018',
        focusMetric: `Top Category: ${topHouseholdCategory}`,
        value: `${household.totalRecords} manual entries`,
      },
      eraB: {
        dataset: 'transactions' as DatasetId,
        period: '2022 – 2024',
        focusMetric: `Top Category: ${topTransactCategory}`,
        value: `${transactions.totalRecords} digital transactions`,
      },
      comparativeInsight:
        'Earlier period reflects intentional manual micro-ledger tracking dominated by everyday essentials, ' +
        'whereas the modern period captures automated digital commerce with broader merchant categorization.',
      causalityWarning: CAUSALITY_DISCLAIMER,
    });
  }

  if (spotify.weekdayListening && spotify.weekdayListening.length > 0 && household.weekdayPatterns && household.weekdayPatterns.length > 0) {
    const peakAudioDay = [...spotify.weekdayListening].sort((a, b) => b.count - a.count)[0];
    const peakHouseholdDay = [...household.weekdayPatterns].sort((a, b) => b.count - a.count)[0];

    comparisons.push({
      id: 'comp-weekday-rhythms',
      title: 'Weekly Temporal Behavioral Rhythms',
      description: 'Examining peak activity days across music streaming and domestic expense logging.',
      eraA: {
        dataset: 'spotify' as DatasetId,
        period: '2013 – 2024',
        focusMetric: `Peak Audio Day: ${peakAudioDay?.label || peakAudioDay?.dayName || 'Unknown'}`,
        value: `${peakAudioDay?.count || 0} plays`,
      },
      eraB: {
        dataset: 'household' as DatasetId,
        period: '2015 – 2018',
        focusMetric: `Peak Logging Day: ${peakHouseholdDay?.label || peakHouseholdDay?.dayName || 'Unknown'}`,
        value: `${peakHouseholdDay?.count || 0} entries`,
      },
      comparativeInsight:
        'Auditory consumption follows distinct weekly cadence compared to financial recordkeeping routines, ' +
        'highlighting divergent user interaction cadences across modalities.',
      causalityWarning: CAUSALITY_DISCLAIMER,
    });
  }

  return comparisons;
}
