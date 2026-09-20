export type StreamId = 'spotify' | 'household' | 'transactions';

export type HourRange = 'all' | 'morning' | 'afternoon' | 'evening' | 'night' | 'evening_night';
export type SortOption = 'recent' | 'oldest' | 'magnitude' | 'relevance';

export interface DiscoveryDrillDownContext {
  id: string;
  title: string;
  summary: string;
  period?: string;
  filterDescription?: string;
}

export interface ExplorerFilterState {
  stream: StreamId;
  search: string;
  year: number | 'all';
  category: string | 'all';
  subcategory: string | 'all';
  direction: 'all' | 'income' | 'expense';
  mode: string | 'all';
  state: string | 'all';
  skipped: 'all' | 'skipped' | 'completed';
  hourRange: HourRange;
  sortBy: SortOption;
  page: number;
  pageSize: number;
  discoveryDrillDown?: DiscoveryDrillDownContext;
}

export interface SupportedDiscoveryLink {
  discoveryId: string;
  title: string;
  reason: string;
}

export interface ExplorerReceipt {
  id: string;
  stream: StreamId;
  title: string;
  subtitle: string;
  date: string;
  timeFormatted?: string;
  year: number;
  hour?: number;
  category: string;
  subcategory?: string;
  amountFormatted?: string;
  amountRaw?: number;
  durationFormatted?: string;
  durationMs?: number;
  statusBadge?: string;
  metadata: { label: string; value: string }[];
  supportedDiscoveries: SupportedDiscoveryLink[];
  rawSummary: string;
}

export interface ExplorerSummaryMetrics {
  totalMatching: number;
  stream: StreamId;
  metric1: { label: string; value: string };
  metric2: { label: string; value: string };
  metric3: { label: string; value: string };
  metric4?: { label: string; value: string };
}

export interface StreamOption {
  id: StreamId;
  label: string;
  sublabel: string;
  dateRange: string;
  totalFormatted: string;
  rawTotal: number;
  accentColor: string;
}
