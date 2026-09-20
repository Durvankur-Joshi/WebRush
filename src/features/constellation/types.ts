import { EvidenceItem } from '../../analytics/evidence';

export type ConstellationNodeCategory = 'center' | 'stream' | 'category' | 'discovery' | 'era';

export interface ConstellationNodeData {
  id: string;
  label: string;
  sublabel: string;
  category: ConstellationNodeCategory;
  x: number; // 0 to 800
  y: number; // 0 to 520
  radius: number;
  color: string;
  pulse?: boolean;
  whatItRepresents: string;
  whyItMatters: string;
  evidence: EvidenceItem[];
  source: string;
  metricLabel?: string;
  metricValue?: string;
}

export interface ConstellationEdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  dashed?: boolean;
  color?: string;
  strength?: number; // 0 to 1
  isTemporalComparison?: boolean;
}
