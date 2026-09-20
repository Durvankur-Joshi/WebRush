export type EvidenceSource = 'spotify' | 'household' | 'transactions' | 'cross-temporal';

export interface EvidenceComparison {
  period: string;
  value: number;
  unit: string;
}

export interface EvidenceItem {
  metric: string;
  period: string;
  value: number;
  unit: string;
  comparison?: EvidenceComparison;
  sampleSize?: number;
  notes?: string;

  // Compatibility fields for cross-referencing / legacy Insight contracts
  id?: string;
  dataset?: string;
  observedValue?: string | number;
  timeframe?: string;
  confidenceScore?: number;
}

export interface EvidenceBundle {
  source: EvidenceSource;
  items: EvidenceItem[];
}

export function makeEvidence(
  metric: string,
  period: string,
  value: number,
  unit: string,
  opts: { comparison?: EvidenceComparison; sampleSize?: number; notes?: string } = {}
): EvidenceItem {
  return {
    metric,
    period,
    value: typeof value === 'number' ? Number(value.toFixed(2)) : value,
    unit,
    observedValue: `${typeof value === 'number' ? Number(value.toFixed(2)) : value} ${unit}`,
    timeframe: period,
    ...opts,
  };
}

export function buildEvidence(
  dataset: string,
  metric: string,
  observedValue: string | number,
  timeframe: string,
  sampleSize?: number,
  confidenceScore?: number,
  notes?: string
): EvidenceItem {
  const numVal = typeof observedValue === 'number' ? observedValue : parseFloat(String(observedValue)) || 0;
  return {
    id: `ev-${Math.random().toString(36).slice(2, 8)}`,
    dataset,
    metric,
    period: timeframe,
    timeframe,
    value: numVal,
    unit: String(observedValue).replace(/^[0-9.,\s]+/, '').trim() || 'count',
    observedValue,
    sampleSize,
    confidenceScore: confidenceScore ?? 0.9,
    notes,
  };
}

export function makeBundle(source: EvidenceSource, items: EvidenceItem[]): EvidenceBundle {
  return { source, items };
}
