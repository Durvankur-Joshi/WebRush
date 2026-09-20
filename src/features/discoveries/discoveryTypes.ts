import { Discovery } from '../../analytics/discoveries';

export type DiscoveryFilterType = 'ALL' | 'spotify' | 'household' | 'transactions' | 'cross-temporal';

export type DiscoverySortOption = 'confidence' | 'impact' | 'recent';

export interface MiniChartDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
  annotation?: string;
}

export interface MiniChartConfig {
  type: 'bar' | 'comparison' | 'distribution' | 'stat';
  points: MiniChartDataPoint[];
  unit?: string;
  baseline?: number;
  deltaText?: string;
  deltaPositive?: boolean;
}

export interface DiscoveryViewModel extends Discovery {
  categoryLabel: string;
  drillDownParams: Record<string, string>;
  miniChart?: MiniChartConfig;
}

export interface DiscoveriesSummaryMetrics {
  totalDiscoveries: number;
  totalConnections: number;
  totalStreams: number;
  criticalCount: number;
  highConfidenceCount: number;
}
