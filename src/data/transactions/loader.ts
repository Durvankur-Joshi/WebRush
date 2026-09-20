import { TransactionNormalizedRecord, TransactionParseResult } from './types';
import { fetchPublicCSV, parseCSV } from '../parser';
import { normalizeTransactionRows } from './normalizer';

let _cache: TransactionParseResult | null = null;
let _loading: Promise<TransactionParseResult> | null = null;

export async function loadTransactionData(): Promise<TransactionParseResult> {
  if (_cache) return _cache;
  if (_loading) return _loading;

  _loading = (async (): Promise<TransactionParseResult> => {
    const text = await fetchPublicCSV('india_transactions.csv');
    const { headers, rows } = parseCSV(text);
    const result = normalizeTransactionRows(headers, rows);
    _cache = result;
    _loading = null;
    return result;
  })();

  return _loading;
}

export function getTransactionRecordsSync(): TransactionNormalizedRecord[] {
  return _cache?.records ?? [];
}

export function clearTransactionCache(): void {
  _cache = null;
  _loading = null;
}
