import { DatasetId } from '../types/common';
import { EvidenceItem, Insight } from '../types/insights';

/**
 * Constructs a verifiable evidence item attached to an insight.
 * Every claim made in the observatory must cite its ground-truth metric and sample size.
 */
export function buildEvidence(
  dataset: DatasetId,
  metric: string,
  observedValue: string | number,
  timeframe: string,
  sampleSize: number,
  confidenceScore = 1.0,
  baselineValue?: string | number,
  notes?: string
): EvidenceItem {
  return {
    id: `ev-${dataset}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dataset,
    metric,
    observedValue,
    baselineValue,
    timeframe,
    sampleSize,
    confidenceScore: Math.min(1, Math.max(0, confidenceScore)),
    notes,
  };
}

/**
 * Verifies that an insight contains sufficient evidence backing its claims.
 */
export function verifyInsightEvidence(insight: Insight): { isValid: boolean; reason?: string } {
  if (!insight.evidence || insight.evidence.length === 0) {
    return { isValid: false, reason: 'No evidentiary proof attached to insight.' };
  }
  for (const ev of insight.evidence) {
    if (!ev.dataset || ev.sampleSize <= 0) {
      return { isValid: false, reason: `Invalid evidence item: ${ev.id} lacks sample size or dataset citation.` };
    }
  }
  return { isValid: true };
}
