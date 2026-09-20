export type DatasetId = 'spotify' | 'household' | 'transactions';

export type RouteId = 'observatory' | 'explore' | 'discover' | 'story';

export type LoadingStatus = 'idle' | 'loading' | 'success' | 'error';

export interface DateRange {
  start: string;
  end: string;
}

export interface AggregateBucket {
  key: string;
  count: number;
  value?: number;
  label?: string;
  percentage?: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  count?: number;
  secondaryValue?: number;
}

export interface HourlyDistribution {
  hour: number;
  count: number;
  value?: number;
}

export interface WeekdayDistribution {
  day: number; // 0 = Sunday, 6 = Saturday
  dayName: string;
  count: number;
  value?: number;
}

export interface DatasetMeta {
  id: DatasetId;
  name: string;
  tagline: string;
  timeRange: string;
  recordCountEstimate: string;
  unit: string;
  accentColor: string;
}
