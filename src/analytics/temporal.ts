import { DatasetId } from '../types/common';
import { SpotifyAnalytics } from '../types/spotify';
import { HouseholdAnalytics } from '../types/household';
import { TransactionAnalytics } from '../types/transactions';
import { TemporalComparison } from '../types/insights';
import { CAUSALITY_DISCLAIMER } from '../lib/constants';

export interface TimelineEra {
  id: string;
  name: string;
  years: string;
  startYear: number;
  endYear: number;
  activeDatasets: DatasetId[];
  narrativeFocus: string;
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: 'era_discovery',
    name: 'The Acoustic Dawn',
    years: '2013 – 2014',
    startYear: 2013,
    endYear: 2014,
    activeDatasets: ['spotify'],
    narrativeFocus: 'Early digital music habits, streaming exploration, high playlist turnover.',
  },
  {
    id: 'era_domestic',
    name: 'Domestic Ledger Era',
    years: '2015 – 2018',
    startYear: 2015,
    endYear: 2018,
    activeDatasets: ['spotify', 'household'],
    narrativeFocus: 'Physical domestic expenditure tracking in parallel with long-form audio streaming.',
  },
  {
    id: 'era_bridge',
    name: 'Streaming Continuity',
    years: '2019 – 2021',
    startYear: 2019,
    endYear: 2021,
    activeDatasets: ['spotify'],
    narrativeFocus: 'Uninterrupted music consumption throughout global transitions.',
  },
  {
    id: 'era_commerce',
    name: 'Modern Multi-Facet Transact',
    years: '2022 – 2024',
    startYear: 2022,
    endYear: 2024,
    activeDatasets: ['spotify', 'transactions'],
    narrativeFocus: 'Digital POS cards, point-of-sale categorization, contemporary streaming maturation.',
  },
];

/**
 * Builds comparative cross-era snapshots without making false causal claims.
 */
export function buildTemporalComparisons(
  spotify: SpotifyAnalytics,
  household: HouseholdAnalytics,
  transactions: TransactionAnalytics
): TemporalComparison[] {
  const comparisons: TemporalComparison[] = [];

  // Comparison 1: Financial Ledger Methods (2015-2018 cash/bank vs 2022-2024 modern POS)
  if (household.totalRecords > 0 && transactions.totalRecords > 0) {
    const topHouseholdCategory = household.categoryFrequency[0]?.category || 'General';
    const topTransactCategory = transactions.categoryFrequency[0]?.category || 'General';

    comparisons.push({
      id: 'comp-finance-methods',
      title: 'Financial Modality Transition (2015–2018 vs 2022–2024)',
      description: 'Comparative analysis of domestic expense recordkeeping vs modern automated card transactions.',
      eraA: {
        dataset: 'household',
        period: '2015 – 2018',
        focusMetric: `Top Category: ${topHouseholdCategory}`,
        value: `${household.totalRecords} manual entries`,
      },
      eraB: {
        dataset: 'transactions',
        period: '2022 – 2024',
        focusMetric: `Top Category: ${topTransactCategory}`,
        value: `${transactions.totalRecords} digital transactions`,
      },
      comparativeInsight: 
        'Earlier period reflects intentional manual micro-ledger tracking dominated by everyday essentials, ' +
        'whereas the modern period captures automated digital commerce with broader merchant categorization.',
      causalityWarning: CAUSALITY_DISCLAIMER,
    });
  }

  // Comparison 2: Weekday Activity Rhythms across datasets
  if (spotify.weekdayListening.length > 0 && household.weekdayPatterns.length > 0) {
    // Peak audio day
    const peakAudioDay = [...spotify.weekdayListening].sort((a, b) => b.count - a.count)[0];
    const peakHouseholdDay = [...household.weekdayPatterns].sort((a, b) => b.count - a.count)[0];

    comparisons.push({
      id: 'comp-weekday-rhythms',
      title: 'Weekly Temporal Behavioral Rhythms',
      description: 'Examining peak activity days across music streaming and domestic expense logging.',
      eraA: {
        dataset: 'spotify',
        period: '2013 – 2024',
        focusMetric: `Peak Audio Day: ${peakAudioDay?.dayName || 'Unknown'}`,
        value: `${peakAudioDay?.count || 0} plays`,
      },
      eraB: {
        dataset: 'household',
        period: '2015 – 2018',
        focusMetric: `Peak Logging Day: ${peakHouseholdDay?.dayName || 'Unknown'}`,
        value: `${peakHouseholdDay?.count || 0} entries`,
      },
      comparativeInsight:
        'Auditory consumption follows distinct weekly cadence compared to financial recordkeeping routines, ' +
        'highlighting divergent user interaction cadences across modalities.',
      causalityWarning: CAUSALITY_DISCLAIMER,
    });
  }

  return comparisons;
}
