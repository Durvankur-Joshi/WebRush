import { IndiaTransactionRawRecord, SafeTransactionRecord } from '../types/transactions';

/**
 * Strips raw card numbers, personal names, street addresses, dates of birth,
 * and internal customer identifiers from India transaction data.
 */
export function sanitizeIndiaTransaction(raw: IndiaTransactionRawRecord, fallbackIndex = 0): SafeTransactionRecord {
  // Normalize ID (never expose raw internal customer_id or raw cc_num)
  const safeId = raw.trans_id 
    ? `TXN-${String(raw.trans_id).replace(/[^0-9a-zA-Z_-]/g, '')}` 
    : `TXN-${fallbackIndex.toString().padStart(6, '0')}`;

  // Sanitize merchant: strip "fraud_" prefix if present
  const merchantClean = sanitizeMerchant(raw.merchant);

  // Normalize timestamp
  const timestamp = raw.trans_date_trans_time?.trim() || '';

  // Safe numerical amount
  const amount = safeParseNumber(raw.amt, 0);

  // Safe geographical data (state & city are safe aggregates, street is scrubbed)
  const state = raw.state?.trim() || 'Unknown State';
  const city = raw.city?.trim() || 'Unknown City';

  // Job category (safe classification)
  const jobCategory = raw.job?.trim() || 'General';

  // Fraud flag
  const isFraud = String(raw.is_fraud).trim() === '1' || String(raw.is_fraud).trim() === '1.0';

  // Demographic aggregate
  const gender = raw.gender?.trim() || 'U';

  return {
    id: safeId,
    timestamp,
    merchant: merchantClean,
    category: raw.category?.trim() || 'misc_pos',
    amount,
    gender,
    state,
    city,
    jobCategory,
    isFraud,
  };
}

/**
 * Cleans raw merchant name, removing artificial prefixes and whitespace.
 */
export function sanitizeMerchant(raw?: string): string {
  if (!raw || typeof raw !== 'string') return 'Unknown Merchant';
  return raw
    .replace(/^fraud_/i, '')
    .trim() || 'Unknown Merchant';
}

/**
 * Safely parse numeric values from strings/numbers with boundary checking.
 */
export function safeParseNumber(val: unknown, fallback = 0): number {
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? fallback : val;
  }
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) || !isFinite(parsed) ? fallback : parsed;
  }
  return fallback;
}

/**
 * Scrubs potential card numbers, phone numbers, or email addresses from text notes.
 */
export function scrubPIIFromString(input: string): string {
  if (!input) return '';
  return input
    // Scrub 12-19 digit card numbers with potential hyphens/spaces
    .replace(/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED CARD]')
    // Scrub 10-digit mobile numbers
    .replace(/\b(?:\+91|0)?[6-9]\d{9}\b/g, '[REDACTED PHONE]')
    // Scrub emails
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED EMAIL]');
}

/**
 * Safe identifier anonymizer.
 */
export function maskIdentifier(id: string): string {
  if (!id || id.length <= 4) return '***';
  return `${id.slice(0, 2)}***${id.slice(-2)}`;
}
