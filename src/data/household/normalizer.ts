import { HouseholdNormalizedRecord } from './types';
import { cleanStr, safeNum } from '../parser';
import { DataQualityReport, createEmptyQuality } from '../quality';

/**
 * Parse a household date string.
 * Handles "DD/MM/YYYY HH:mm:ss" and "DD/MM/YYYY" formats.
 */
function parseHouseholdDate(raw: string): Date | null {
  if (!raw) return null;
  // Match "DD/MM/YYYY[ HH:MM[:SS]]"
  const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return null;
  const [, dd, mm, yyyy, h = '0', min = '0', sec = '0'] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(h), Number(min), Number(sec));
  return isFinite(d.getTime()) ? d : null;
}

function normalizeDirection(raw: string): 'income' | 'expense' | 'unknown' {
  const v = raw.trim().toLowerCase();
  if (v === 'expense') return 'expense';
  if (v === 'income') return 'income';
  return 'unknown';
}

export function normalizeHouseholdRows(
  headers: string[],
  rows: string[][]
): { records: HouseholdNormalizedRecord[]; quality: DataQualityReport } {
  const quality = createEmptyQuality('household');
  quality.totalRows = rows.length;

  const get = (row: string[], name: string) => row[headers.indexOf(name)] ?? '';

  const records: HouseholdNormalizedRecord[] = [];
  let minDate = '';
  let maxDate = '';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 6) {
      quality.invalidRows++;
      continue;
    }

    const dateRaw = cleanStr(get(row, 'Date'));
    if (!dateRaw) {
      quality.missingDates++;
      quality.invalidRows++;
      continue;
    }

    const dt = parseHouseholdDate(dateRaw);
    if (!dt) {
      quality.missingDates++;
      quality.invalidRows++;
      quality.warnings.push(`Row ${i + 2}: Unparseable date "${dateRaw}"`);
      continue;
    }

    const amtRaw = cleanStr(get(row, 'Amount'));
    const amount = safeNum(amtRaw);
    if (amount === null) {
      quality.missingAmounts++;
      quality.invalidRows++;
      continue;
    }

    const category = cleanStr(get(row, 'Category')) || 'Uncategorized';
    if (!cleanStr(get(row, 'Category'))) {
      quality.missingCategories++;
    }

    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

    const rec: HouseholdNormalizedRecord = {
      date: dateStr,
      year: dt.getFullYear(),
      month: dt.getMonth() + 1,
      weekday: dt.getDay(),
      mode: cleanStr(get(row, 'Mode')) || 'Unknown',
      category,
      subcategory: cleanStr(get(row, 'Subcategory')) || 'General',
      note: cleanStr(get(row, 'Note')),
      amount,
      direction: normalizeDirection(get(row, 'Income/Expense')),
      currency: cleanStr(get(row, 'Currency')) || 'INR',
    };

    records.push(rec);
    quality.validRows++;

    if (!minDate || dateStr < minDate) minDate = dateStr;
    if (!maxDate || dateStr > maxDate) maxDate = dateStr;
  }

  if (minDate && maxDate) {
    quality.dateRange = { start: minDate, end: maxDate };
  }
  if (quality.invalidRows > 0) {
    quality.warnings.push(`${quality.invalidRows} rows skipped due to invalid or missing data.`);
  }

  return { records, quality };
}
