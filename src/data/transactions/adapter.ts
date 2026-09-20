import { TransactionAnalytics } from '../../types/transactions';
import { DatasetMeta } from '../../types/common';
import { DATASET_METADATA } from '../../lib/constants';
import { computeTransactionAnalytics, createEmptyTransactionAnalytics } from '../../analytics/transactions';
import { TransactionNormalizedRecord } from './types';
import { loadTransactionData } from './loader';

export interface TransactionAdapter {
  getMetadata(): DatasetMeta;
  loadAnalytics(): Promise<TransactionAnalytics>;
  processRecords(records: TransactionNormalizedRecord[]): TransactionAnalytics;
}

export class DefaultTransactionAdapter implements TransactionAdapter {
  private cachedAnalytics: TransactionAnalytics | null = null;

  getMetadata(): DatasetMeta {
    return DATASET_METADATA['transactions'] as DatasetMeta;
  }

  processRecords(records: TransactionNormalizedRecord[]): TransactionAnalytics {
    this.cachedAnalytics = computeTransactionAnalytics(records);
    return this.cachedAnalytics;
  }

  async loadAnalytics(): Promise<TransactionAnalytics> {
    if (this.cachedAnalytics) {
      return this.cachedAnalytics;
    }
    try {
      const { records } = await loadTransactionData();
      this.cachedAnalytics = computeTransactionAnalytics(records);
      return this.cachedAnalytics;
    } catch {
      return createEmptyTransactionAnalytics();
    }
  }
}

export const transactionAdapter = new DefaultTransactionAdapter();
