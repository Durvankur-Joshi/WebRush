import { EvidenceItem } from '../../analytics/evidence';
import { Discovery } from '../../analytics/discoveries';

export type StoryVisualizationType =
  | 'area-trend'
  | 'before-after'
  | 'category-bars'
  | 'distribution'
  | 'constellation-summary';

export interface StoryDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
  annotation?: string;
  detail?: string;
}

export interface StoryVisualizationConfig {
  type: StoryVisualizationType;
  title: string;
  dataPoints: StoryDataPoint[];
  unit?: string;
  deltaText?: string;
  deltaPositive?: boolean;
  caption?: string;
}

export interface StoryChapterViewModel {
  id: string;
  order: number;
  chapterNumber: string; // e.g. "01", "02"
  title: string;
  themeTag: string; // e.g. "THE RHYTHM", "THE SHIFT", "THE EVERYDAY"
  subtitle: string;
  period: string;
  narrative: string;
  primaryDataset: 'spotify' | 'household' | 'transactions' | 'cross-temporal';
  keyMetrics: { label: string; value: string; detail?: string }[];
  evidence: EvidenceItem[];
  discoveries: Discovery[];
  drillDownParams: Record<string, string>;
  discoveryId?: string;
  visualizationConfig?: StoryVisualizationConfig;
}

export interface StorySummaryMetrics {
  listeningRecords: string;
  householdReceipts: string;
  transactionRecords: string;
  totalDiscoveries: number;
  totalConnections: number;
  totalYears: number;
}
