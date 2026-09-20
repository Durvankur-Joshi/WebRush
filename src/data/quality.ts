export interface DataQualityReport {
  dataset: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  missingDates: number;
  missingCategories: number;
  missingAmounts: number;
  duplicateRows: number;
  dateRange: { start: string; end: string } | null;
  warnings: string[];
}

export function createEmptyQuality(dataset: string): DataQualityReport {
  return {
    dataset,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    missingDates: 0,
    missingCategories: 0,
    missingAmounts: 0,
    duplicateRows: 0,
    dateRange: null,
    warnings: [],
  };
}
