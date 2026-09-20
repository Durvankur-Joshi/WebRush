import { DateRange, WeekdayDistribution } from './common';

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

export interface HouseholdAnalytics {
  totalRecords: number;
  dateRange: DateRange;
  expenseCount: number;
  incomeCount: number;
  totalExpenseAmount: number;
  totalIncomeAmount: number;
  categoryFrequency: CategoryAggregate[];
  categoryAmounts: CategoryAggregate[];
  yearlyAmounts: YearlyFinanceMetric[];
  yearlyCounts: { year: number; count: number }[];
  topSubcategories: SubcategorySummary[];
  weekdayPatterns: WeekdayDistribution[];
}
