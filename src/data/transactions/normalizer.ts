import { TransactionNormalizedRecord } from './types';
import { cleanStr, safeNum } from '../parser';
import { DataQualityReport, createEmptyQuality } from '../quality';

/**
 * Parse India transaction date "M/D/YYYY H:MM" format.
 * Note: This dataset uses M/D/YYYY (US month-first), not D/M/YYYY.
 */
function parseTransactionDate(raw: string): Date | null {
  if (!raw) return null;
  const m = raw.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (!m) return null;
  const [, mon, day, yr, h = '0', min = '0'] = m;
  const d = new Date(Number(yr), Number(mon) - 1, Number(day), Number(h), Number(min));
  return isFinite(d.getTime()) ? d : null;
}

/**
 * Normalize a single India transaction row.
 * STRICTLY excludes: cc_num, first, last, street, dob, customer_id.
 * Preserves only safe aggregate-compatible fields.
 */
function normalizeTransactionRow(
  headers: string[],
  row: string[]
): TransactionNormalizedRecord | null {
  const get = (name: string) => row[headers.indexOf(name)] ?? '';

  const tsRaw = cleanStr(get('trans_date_trans_time'));
  if (!tsRaw) return null;

  const dt = parseTransactionDate(tsRaw);
  if (!dt) return null;

  const amtRaw = cleanStr(get('amt'));
  const amount = safeNum(amtRaw);
  if (amount === null || amount < 0) return null;

  const category = cleanStr(get('category')) || 'Uncategorized';
  const city = cleanStr(get('city')) || 'Unknown';
  const state = cleanStr(get('state')) || 'Unknown';
  const latRaw = safeNum(cleanStr(get('merch_lat')));
  const lngRaw = safeNum(cleanStr(get('merch_long')));

  const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

  return {
    timestamp: dt.toISOString(),
    date: dateStr,
    year: dt.getFullYear(),
    month: dt.getMonth() + 1,
    day: dt.getDate(),
    hour: dt.getHours(),
    weekday: dt.getDay(),
    category,
    amount,
    city,
    state,
    latitude: latRaw !== null && isFinite(latRaw) && Math.abs(latRaw) <= 90 ? latRaw : null,
    longitude: lngRaw !== null && isFinite(lngRaw) && Math.abs(lngRaw) <= 180 ? lngRaw : null,
  };
}

const VALID_CATEGORIES = new Set(['online_shopping', 'travel', 'entertainment', 'fitness_and_medical']);

export function normalizeTransactionRows(
  headers: string[],
  rows: string[][]
): { records: TransactionNormalizedRecord[]; quality: DataQualityReport } {
  const quality = createEmptyQuality('transactions');
  quality.totalRows = rows.length;

  const records: TransactionNormalizedRecord[] = [];
  let minDate = '';
  let maxDate = '';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 5) {
      quality.invalidRows++;
      continue;
    }

    const tsRaw = (row[headers.indexOf('trans_date_trans_time')] ?? '').trim();
    if (!tsRaw) {
      quality.missingDates++;
      quality.invalidRows++;
      continue;
    }

    const normalized = normalizeTransactionRow(headers, row);
    if (!normalized) {
      quality.invalidRows++;
      continue;
    }

    // Track missing categories
    const rawCat = (row[headers.indexOf('category')] ?? '').trim();
    if (!rawCat || !VALID_CATEGORIES.has(rawCat)) {
      quality.missingCategories++;
    }

    records.push(normalized);
    quality.validRows++;

    if (!minDate || normalized.date < minDate) minDate = normalized.date;
    if (!maxDate || normalized.date > maxDate) maxDate = normalized.date;
  }

  if (minDate && maxDate) {
    quality.dateRange = { start: minDate, end: maxDate };
  }
  if (quality.invalidRows > 0) {
    quality.warnings.push(`${quality.invalidRows} rows skipped due to malformed data.`);
  }
  if (quality.missingCategories > 0) {
    quality.warnings.push(`${quality.missingCategories} records have empty or unrecognized categories (labeled "Uncategorized").`);
  }

  return { records, quality };
}
