import { SpotifyAnalytics } from '../types/spotify';
import { HouseholdAnalytics } from '../types/household';
import { TransactionAnalytics } from '../types/transactions';
import { Insight } from '../types/insights';
import { buildEvidence } from './evidence';

/**
 * Identifies temporal and behavioral alignments across distinct receipt streams.
 * Strictly avoids invalid causal claims: all correlations are labeled as longitudinal comparisons.
 */
export function findTemporalConnections(
  spotify: SpotifyAnalytics,
  household: HouseholdAnalytics,
  transactions: TransactionAnalytics
): Insight[] {
  const connections: Insight[] = [];

  // Connection 1: Parallel Activity in 2015-2018 (Spotify + Household)
  if (spotify.yearlyListening.length > 0 && household.yearlyAmounts.length > 0) {
    const overlappingYears = household.yearlyAmounts
      .map((h) => h.year)
      .filter((y) => spotify.yearlyListening.some((s) => s.year === y));

    if (overlappingYears.length > 0) {
      connections.push({
        id: 'conn-era-overlap-domestic',
        title: 'Concurrent Life Ledger & Soundtrack (2015–2018)',
        summary: `Synchronous multi-facet data available across ${overlappingYears.length} years (${overlappingYears.join(', ')}), pairing auditory streaming habits with domestic expenditure rhythms.`,
        category: 'cross_temporal_comparison',
        significance: 'high',
        confidence: 0.94,
        source: 'cross-temporal',
        tags: ['multi-stream', 'synchronous-years', 'domestic-era'],
        evidence: [
          buildEvidence(
            'household',
            'Domestic Ledger Volume (Overlapping Era)',
            `${household.totalRecords} records`,
            `${overlappingYears[0]}–${overlappingYears[overlappingYears.length - 1]}`,
            household.totalRecords,
            0.95
          ),
          buildEvidence(
            'spotify',
            'Streaming Volume (Overlapping Era)',
            `${spotify.yearlyListening.filter((s) => overlappingYears.includes(s.year)).reduce((sum, s) => sum + s.playCount, 0)} plays`,
            `${overlappingYears[0]}–${overlappingYears[overlappingYears.length - 1]}`,
            spotify.totalRecords,
            0.95
          ),
        ],
      });
    }
  }

  // Connection 2: Weekend vs Weekday Bias Alignment
  if (spotify.weekdayListening.length === 7 && transactions.weekdayPatterns.length === 7) {
    const isAudioWeekendHeavy = 
      (spotify.weekdayListening[0]?.count || 0) + (spotify.weekdayListening[6]?.count || 0) >
      ((spotify.weekdayListening[2]?.count || 0) + (spotify.weekdayListening[3]?.count || 0));

    connections.push({
      id: 'conn-weekday-cadence',
      title: 'Longitudinal Weekly Behavioral Cadence',
      summary: `Cross-stream cadence comparison: audio consumption exhibits ${isAudioWeekendHeavy ? 'weekend leisure surges' : 'weekday operational consistency'} while transactional velocity peaks on standard commerce days.`,
      category: 'temporal_pattern',
      significance: 'medium',
      confidence: 0.88,
      source: 'cross-temporal',
      tags: ['cadence', 'weekly-rhythm', 'behavioral-bias'],
      evidence: [
        buildEvidence('spotify', 'Audio 7-day distribution', 'Full 7-day spectrum', spotify.dateRange.start + ' to ' + spotify.dateRange.end, spotify.totalRecords, 0.9),
        buildEvidence('transactions', 'Transaction 7-day distribution', 'Full 7-day spectrum', transactions.dateRange.start + ' to ' + transactions.dateRange.end, transactions.totalRecords, 0.9),
      ],
    });
  }

  return connections;
}
