import { HouseholdNormalizedRecord, HouseholdParseResult } from './types';
import { fetchPublicCSV, parseCSV } from '../parser';
import { normalizeHouseholdRows } from './normalizer';

let _cache: HouseholdParseResult | null = null;
let _loading: Promise<HouseholdParseResult> | null = null;

export async function loadHouseholdData(): Promise<HouseholdParseResult> {
  if (_cache) return _cache;
  if (_loading) return _loading;

  _loading = (async (): Promise<HouseholdParseResult> => {
    const text = await fetchPublicCSV('household_transactions.csv');
    const { headers, rows } = parseCSV(text);
    const result = normalizeHouseholdRows(headers, rows);
    _cache = result;
    _loading = null;
    return result;
  })();

  return _loading;
}

export function getHouseholdRecordsSync(): HouseholdNormalizedRecord[] {
  return _cache?.records ?? [];
}

export function clearHouseholdCache(): void {
  _cache = null;
  _loading = null;
}
