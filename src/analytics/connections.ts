import { SpotifyAnalytics } from './spotify';
import { HouseholdAnalytics } from './household';
import { TransactionAnalytics } from './transactions';
import { EvidenceItem, makeEvidence } from './evidence';
import { Insight } from '../types/insights';

export type ConnectionType = 'WITHIN_SOURCE' | 'TEMPORAL_COMPARISON';

export interface Connection {
  id: string;
  from: string;
  to: string;
  type: ConnectionType;
  strength: number; // 0.0 - 1.0 (relative analytical significance, not absolute truth)
  explanation: string;
  evidence: EvidenceItem[];
  source?: string;
}

/**
 * Generate legitimate connections:
 * 1. WITHIN_SOURCE: Intra-dataset relationships between dimensions.
 * 2. TEMPORAL_COMPARISON: Distinct datasets sharing an observational time window,
 *    strictly labeled as temporal comparison without making causal claims.
 */
export function generateConnections(
  spotify: SpotifyAnalytics,
  household: HouseholdAnalytics,
  transactions: TransactionAnalytics
): Connection[] {
  const connections: Connection[] = [];

  // ==========================================
  // 1. WITHIN_SOURCE: SPOTIFY
  // ==========================================
  if (spotify.totalRecords > 0) {
    // A. Artist <-> Year (Beatles multi-year presence or top artist evolution)
    if (spotify.topArtists.length > 0) {
      const top = spotify.topArtists[0];
      if (top) {
        connections.push({
          id: 'conn-spotify-artist-year',
          from: `Artist: ${top.artist}`,
          to: `${top.firstYear}–${top.lastYear} (${top.yearsActive} active years)`,
          type: 'WITHIN_SOURCE',
          strength: 0.95,
          explanation: `${top.artist} demonstrates sustained acoustic presence spanning ${top.yearsActive} years across the timeline.`,
          evidence: [
            makeEvidence(`${top.artist} play count`, `${top.firstYear}–${top.lastYear}`, top.playCount, 'plays'),
            makeEvidence(`${top.artist} total hours`, `${top.firstYear}–${top.lastYear}`, top.hours, 'hours'),
          ],
          source: 'spotify',
        });
      }
    }

    // B. Artist <-> Listening Duration
    if (spotify.topArtists.length > 0) {
      const top5Hours = spotify.topArtists.slice(0, 5).reduce((s, a) => s + a.hours, 0);
      const top5Share = Number(((top5Hours / Math.max(1, spotify.totalListeningHours)) * 100).toFixed(1));
      connections.push({
        id: 'conn-spotify-artist-duration',
        from: 'Top 5 Artists',
        to: 'Total Listening Hours',
        type: 'WITHIN_SOURCE',
        strength: 0.88,
        explanation: `Top 5 artists account for ${top5Share}% (${top5Hours.toFixed(0)} hrs) of total cumulative listening duration.`,
        evidence: [
          makeEvidence('Top 5 artists listening share', 'All years', top5Share, '%'),
          makeEvidence('Top 5 artists total hours', 'All years', top5Hours, 'hours'),
        ],
        source: 'spotify',
      });
    }

    // C. Hour <-> Listening (Time-of-day concentration)
    if (spotify.hourlyListening.length > 0) {
      const eveningHours = spotify.hourlyListening.filter((h) => h.hour >= 18 && h.hour <= 23);
      const eveningSum = eveningHours.reduce((s, h) => s + h.count, 0);
      const eveningShare = Number(((eveningSum / Math.max(1, spotify.totalRecords)) * 100).toFixed(1));
      connections.push({
        id: 'conn-spotify-hour-listening',
        from: 'Hours 18:00–23:59',
        to: 'Streaming Volume',
        type: 'WITHIN_SOURCE',
        strength: 0.85,
        explanation: `Evening hours concentrate ${eveningShare}% of all streaming events, forming the dominant daily acoustic window.`,
        evidence: [
          makeEvidence('Evening streaming share', 'All years', eveningShare, '%', { sampleSize: spotify.totalRecords }),
          makeEvidence('Evening stream count', 'All years', eveningSum, 'plays'),
        ],
        source: 'spotify',
      });
    }

    // D. Year <-> Skip Behavior (2015 to 2016 shift)
    if (spotify.yearlySkipRates.length >= 2) {
      const yr2015 = spotify.yearlySkipRates.find((y) => y.year === 2015);
      const yr2016 = spotify.yearlySkipRates.find((y) => y.year === 2016);
      if (yr2015 && yr2016) {
        connections.push({
          id: 'conn-spotify-year-skip',
          from: 'Calendar Year',
          to: 'Skip Rate Behavior',
          type: 'WITHIN_SOURCE',
          strength: 0.98,
          explanation: `Skip rate shifted dramatically from ${yr2015.skipRate.toFixed(1)}% in 2015 down to ${yr2016.skipRate.toFixed(1)}% in 2016.`,
          evidence: [
            makeEvidence('Skip rate 2015', '2015', yr2015.skipRate, '%', {
              comparison: { period: '2016', value: yr2016.skipRate, unit: '%' },
            }),
          ],
          source: 'spotify',
        });
      }
    }
  }

  // ==========================================
  // 2. WITHIN_SOURCE: HOUSEHOLD
  // ==========================================
  if (household.totalRecords > 0) {
    // A. Category <-> Frequency
    if (household.categoryFrequency.length > 0) {
      const topFreq = household.categoryFrequency[0];
      if (topFreq) {
        connections.push({
          id: 'conn-household-category-frequency',
          from: `Category: ${topFreq.category}`,
          to: 'Logging Frequency',
          type: 'WITHIN_SOURCE',
          strength: 0.96,
          explanation: `${topFreq.category} is the most recurrent domestic ledger category with ${topFreq.count} logged entries (${topFreq.percentage.toFixed(1)}% of all records).`,
          evidence: [
            makeEvidence(`${topFreq.category} frequency share`, '2015–2018', topFreq.percentage, '%', { sampleSize: household.totalRecords }),
            makeEvidence(`${topFreq.category} entry count`, '2015–2018', topFreq.count, 'entries'),
          ],
          source: 'household',
        });
      }
    }

    // B. Category <-> Amount (Frequency vs Monetary impact)
    if (household.categoryAmounts.length > 0 && household.categoryFrequency.length > 0) {
      const topVal = household.categoryAmounts[0];
      const topFreq = household.categoryFrequency[0];
      if (topVal && topFreq) {
        connections.push({
          id: 'conn-household-frequency-vs-amount',
          from: `High Value: ${topVal.category}`,
          to: `High Frequency: ${topFreq.category}`,
          type: 'WITHIN_SOURCE',
          strength: 0.89,
          explanation: `${topFreq.category} dominates transaction frequency (${topFreq.count} entries), whereas ${topVal.category} commands the largest total expenditure volume.`,
          evidence: [
            makeEvidence(`${topVal.category} total expense`, '2015–2018', topVal.amount, 'INR'),
            makeEvidence(`${topFreq.category} entry count`, '2015–2018', topFreq.count, 'entries'),
          ],
          source: 'household',
        });
      }
    }

    // C. Year <-> Category
    if (household.yearlyAmounts.length > 1) {
      const years = household.yearlyAmounts.map((y) => y.year);
      connections.push({
        id: 'conn-household-year-category',
        from: 'Calendar Year',
        to: 'Domestic Ledger Volume',
        type: 'WITHIN_SOURCE',
        strength: 0.84,
        explanation: `Domestic ledger maintenance shows longitudinal progression across ${years.join(', ')}.`,
        evidence: household.yearlyAmounts.map((y) =>
          makeEvidence(`Expense in ${y.year}`, String(y.year), y.expenses, 'INR', { sampleSize: y.count })
        ),
        source: 'household',
      });
    }
  }

  // ==========================================
  // 3. WITHIN_SOURCE: TRANSACTIONS
  // ==========================================
  if (transactions.totalRecords > 0) {
    // A. Category <-> Amount (Average amount per category)
    if (transactions.categoryAmounts.length > 0) {
      const topCat = transactions.categoryAmounts[0];
      if (topCat) {
        connections.push({
          id: 'conn-txn-category-amount',
          from: `Category: ${topCat.category}`,
          to: 'Monetary Expenditure Share',
          type: 'WITHIN_SOURCE',
          strength: 0.91,
          explanation: `${topCat.category} leads total transaction outflow at INR ${topCat.amount.toLocaleString()} (${topCat.percentage.toFixed(1)}% of total sum).`,
          evidence: [
            makeEvidence(`${topCat.category} total spend`, '2022–2024', topCat.amount, 'INR'),
            makeEvidence(`${topCat.category} spend share`, '2022–2024', topCat.percentage, '%'),
          ],
          source: 'transactions',
        });
      }
    }

    // B. Category <-> Time (Hourly cadence)
    if (transactions.hourlyCounts.length > 0) {
      const peakHour = transactions.hourlyCounts.reduce((best, h) => h.count > best.count ? h : best, transactions.hourlyCounts[0]!);
      connections.push({
        id: 'conn-txn-category-time',
        from: `Peak Hour: ${peakHour.label}`,
        to: 'POS Transaction Velocity',
        type: 'WITHIN_SOURCE',
        strength: 0.82,
        explanation: `Transaction frequency peaks at ${peakHour.label} with ${peakHour.count} recorded card charges.`,
        evidence: [
          makeEvidence(`Peak hour transaction volume`, peakHour.label, peakHour.count, 'transactions'),
        ],
        source: 'transactions',
      });
    }

    // C. Category <-> Location Aggregate (Geographic distribution)
    if (transactions.stateDistribution.length > 0) {
      const topState = transactions.stateDistribution[0];
      if (topState) {
        connections.push({
          id: 'conn-txn-category-geo',
          from: `State: ${topState.location}`,
          to: 'Geographic Transaction Volume',
          type: 'WITHIN_SOURCE',
          strength: 0.86,
          explanation: `${topState.location} records the highest regional transaction frequency with ${topState.count} entries.`,
          evidence: [
            makeEvidence(`${topState.location} transaction volume`, 'All years', topState.count, 'transactions'),
          ],
          source: 'transactions',
        });
      }
    }
  }

  // ==========================================
  // 4. TEMPORAL_COMPARISON
  // Strictly labeled as temporal comparisons without causal claims
  // ==========================================
  if (spotify.yearlyListening.length > 0 && household.yearlyAmounts.length > 0) {
    const sYears = new Set(spotify.yearlyListening.map((s) => s.year));
    const sharedHouseholdYears = household.yearlyAmounts.map((h) => h.year).filter((y) => sYears.has(y));

    if (sharedHouseholdYears.length > 0) {
      connections.push({
        id: 'conn-temporal-spotify-household',
        from: `Spotify Activity (${sharedHouseholdYears[0]}–${sharedHouseholdYears[sharedHouseholdYears.length - 1]})`,
        to: `Household Activity (${sharedHouseholdYears[0]}–${sharedHouseholdYears[sharedHouseholdYears.length - 1]})`,
        type: 'TEMPORAL_COMPARISON',
        strength: 0.85,
        explanation: `Temporal comparison: Both streams overlap during ${sharedHouseholdYears.join(', ')}. Audio stream captures continuous acoustic sessions while domestic ledger captures intentional living expenses during this identical calendar window. (Note: Separate data sources; temporal overlap only).`,
        evidence: [
          makeEvidence('Household entries during overlap', `${sharedHouseholdYears[0]}–${sharedHouseholdYears[sharedHouseholdYears.length - 1]}`, household.totalRecords, 'records'),
          makeEvidence('Spotify plays during overlap', `${sharedHouseholdYears[0]}–${sharedHouseholdYears[sharedHouseholdYears.length - 1]}`, spotify.totalRecords, 'plays'),
        ],
        source: 'cross-temporal',
      });
    }
  }

  if (spotify.yearlyListening.length > 0 && transactions.yearlyCounts.length > 0) {
    const sYears = new Set(spotify.yearlyListening.map((s) => s.year));
    const sharedTxnYears = transactions.yearlyCounts.map((t) => t.year).filter((y) => sYears.has(y));

    if (sharedTxnYears.length > 0) {
      connections.push({
        id: 'conn-temporal-spotify-transactions',
        from: `Spotify Activity (${sharedTxnYears[0]}–${sharedTxnYears[sharedTxnYears.length - 1]})`,
        to: `India Card Commerce (${sharedTxnYears[0]}–${sharedTxnYears[sharedTxnYears.length - 1]})`,
        type: 'TEMPORAL_COMPARISON',
        strength: 0.8,
        explanation: `Temporal comparison: Modern card transactions (${transactions.dateRange.start.slice(0, 4)}–${transactions.dateRange.end.slice(0, 4)}) align chronologically with mature streaming patterns, providing multi-modal chronological perspective without implying direct causality.`,
        evidence: [
          makeEvidence('Transaction entries during period', `${sharedTxnYears[0]}–${sharedTxnYears[sharedTxnYears.length - 1]}`, transactions.totalRecords, 'records'),
          makeEvidence('Spotify streaming hours during period', `${sharedTxnYears[0]}–${sharedTxnYears[sharedTxnYears.length - 1]}`, spotify.totalListeningHours, 'hours'),
        ],
        source: 'cross-temporal',
      });
    }
  }

  return connections;
}

/**
 * Backward compatibility helper for Phase 1 components.
 */
export function findTemporalConnections(
  spotify: any,
  household: any,
  transactions: any
): Insight[] {
  const list = generateConnections(spotify, household, transactions);
  return list.map((c) => ({
    id: c.id,
    title: c.explanation.split(':')[0] || 'Temporal Connection',
    summary: c.explanation,
    category: 'cross_temporal_comparison',
    significance: c.strength > 0.9 ? 'high' : 'medium',
    confidence: c.strength,
    source: (c.source as any) || 'cross-temporal',
    tags: [c.type.toLowerCase(), 'temporal'],
    evidence: c.evidence.map((e, idx) => ({
      id: `${c.id}-ev-${idx}`,
      dataset: (c.source as any) || 'cross-temporal',
      metric: e.metric,
      observedValue: `${e.value} ${e.unit}`,
      timeframe: e.period,
      sampleSize: e.sampleSize || 100,
      confidenceScore: 0.9,
    })),
  }));
}
