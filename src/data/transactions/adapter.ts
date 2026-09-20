import { IndiaTransactionRawRecord, SafeTransactionRecord, TransactionAnalytics } from '../../types/transactions';
import { DatasetMeta } from '../../types/common';
import { DATASET_METADATA } from '../../lib/constants';
import { sanitizeIndiaTransaction } from '../../lib/sanitization';
import { computeTransactionAnalytics, createEmptyTransactionAnalytics } from '../../analytics/transactions';

export interface TransactionAdapter {
  getMetadata(): DatasetMeta;
  loadAnalytics(): Promise<TransactionAnalytics>;
  processRawRecords(records: IndiaTransactionRawRecord[]): TransactionAnalytics;
  sanitizeRecords(records: IndiaTransactionRawRecord[]): SafeTransactionRecord[];
}

export class DefaultTransactionAdapter implements TransactionAdapter {
  private cachedAnalytics: TransactionAnalytics | null = null;
  private cachedSanitizedRecords: SafeTransactionRecord[] | null = null;

  getMetadata(): DatasetMeta {
    return DATASET_METADATA['transactions'] as DatasetMeta;
  }

  sanitizeRecords(records: IndiaTransactionRawRecord[]): SafeTransactionRecord[] {
    return records.map((r, i) => sanitizeIndiaTransaction(r, i));
  }

  processRawRecords(records: IndiaTransactionRawRecord[]): TransactionAnalytics {
    const sanitized = this.sanitizeRecords(records);
    this.cachedSanitizedRecords = sanitized;
    this.cachedAnalytics = computeTransactionAnalytics(sanitized);
    return this.cachedAnalytics;
  }

  async loadAnalytics(): Promise<TransactionAnalytics> {
    if (this.cachedAnalytics) {
      return this.cachedAnalytics;
    }
    return createEmptyTransactionAnalytics();
  }

  getSanitizedSample(limit = 100): SafeTransactionRecord[] {
    return (this.cachedSanitizedRecords || []).slice(0, limit);
  }
}

export const transactionAdapter = new DefaultTransactionAdapter();
