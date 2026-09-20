export type { DateRange, WeekdayDistribution } from './common';
export type { HouseholdAnalytics, HouseholdCategoryBucket, HouseholdSubcategoryBucket, HouseholdYearlyRecord, HouseholdLargeTransaction } from '../analytics/household';

export interface HouseholdRawRecord {
  Date: string;
  Mode: string;
  Category: string;
  Subcategory: string;
  Note: string;
  Amount: number;
  'Income/Expense': 'Income' | 'Expense' | string;
  Currency: string;
}

export interface CategoryAggregate {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}

export interface SubcategorySummary {
  subcategory: string;
  category: string;
  amount: number;
  count: number;
}

export interface YearlyFinanceMetric {
  year: number;
  expense: number;
  income: number;
  count: number;
}
