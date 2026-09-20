import { DatasetId } from './common';

export type InsightCategory = 
  | 'temporal_pattern'
  | 'behavioral_shift'
  | 'financial_rhythm'
  | 'audio_signature'
  | 'cross_temporal_comparison'
  | 'anomaly';

export type SignificanceLevel = 'critical' | 'high' | 'medium' | 'low';

export interface EvidenceItem {
  id: string;
  dataset: DatasetId;
  metric: string;
  observedValue: string | number;
  baselineValue?: string | number;
  timeframe: string;
  sampleSize: number;
  confidenceScore: number;
  notes?: string;
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  category: InsightCategory;
  significance: SignificanceLevel;
  evidence: EvidenceItem[];
  source: DatasetId | 'cross-temporal';
  confidence: number; // 0.0 - 1.0
  tags: string[];
}

export interface TemporalComparison {
  id: string;
  title: string;
  description: string;
  eraA: {
    dataset: DatasetId;
    period: string;
    focusMetric: string;
    value: string | number;
  };
  eraB: {
    dataset: DatasetId;
    period: string;
    focusMetric: string;
    value: string | number;
  };
  comparativeInsight: string;
  causalityWarning: string;
}

export interface StoryChapter {
  id: string;
  era: string;
  title: string;
  subtitle: string;
  narrative: string;
  primaryDataset: DatasetId;
  keyMetrics: { label: string; value: string; detail?: string }[];
  insights: Insight[];
}
