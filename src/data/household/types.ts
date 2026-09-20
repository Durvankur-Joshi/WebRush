/** Normalized representation of a household transaction entry. */
export interface HouseholdNormalizedRecord {
  date: string;
  year: number;
  month: number;
  weekday: number;
  mode: string;
  category: string;
  subcategory: string;
  note: string;
  amount: number;
  direction: 'income' | 'expense' | 'unknown';
  currency: string;
}

export interface HouseholdParseResult {
  records: HouseholdNormalizedRecord[];
  quality: import('../quality').DataQualityReport;
}
