/**
 * Normalized, PII-scrubbed representation of a single India card transaction.
 * Fields cc_num, first, last, street, dob, customer_id are NEVER included.
 */
export interface TransactionNormalizedRecord {
  timestamp: string;
  date: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  weekday: number;
  category: string;
  amount: number;
  city: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
}

export interface TransactionParseResult {
  records: TransactionNormalizedRecord[];
  quality: import('../quality').DataQualityReport;
}
