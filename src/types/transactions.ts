export type { DateRange, HourlyDistribution, WeekdayDistribution } from './common';
export type { TransactionAnalytics, TransactionCategoryBucket, TransactionLocationBucket, TransactionAmountBucket } from '../analytics/transactions';

/**
 * Raw record interface matching CSV/JSON headers.
 * SENSITIVE FIELDS (cc_num, first, last, street, dob, customer_id)
 * MUST BE STRIPPED BY ADAPTERS BEFORE LEAVING THE DATA LAYER.
 */
export interface IndiaTransactionRawRecord {
  trans_id?: string | number;
  trans_date_trans_time?: string;
  cc_num?: string | number;
  merchant?: string;
  category?: string;
  amt?: string | number;
  first?: string;
  last?: string;
  gender?: string;
  street?: string;
  city?: string;
  state?: string;
  lat?: string | number;
  long?: string | number;
  city_pop?: string | number;
  job?: string;
  dob?: string;
  merch_lat?: string | number;
  merch_long?: string | number;
  is_fraud?: string | number;
  customer_id?: string | number;
}

/**
 * Sanitized, PII-scrubbed record safe for analytical manipulation.
 */
export interface SafeTransactionRecord {
  id: string;
  timestamp: string;
  merchant: string;
  category: string;
  amount: number;
  gender: string;
  state: string;
  city: string;
  jobCategory: string;
  isFraud: boolean;
}

export interface LocationAggregate {
  state: string;
  city?: string;
  transactionCount: number;
  totalAmount: number;
}

export interface TransactionCategoryMetric {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}
