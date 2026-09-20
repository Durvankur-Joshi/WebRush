import { SpotifyAnalytics } from '../types/spotify';
import { HouseholdAnalytics } from '../types/household';
import { TransactionAnalytics } from '../types/transactions';
import { Insight } from '../types/insights';
import { buildEvidence } from './evidence';

/**
 * Discovers statistical patterns within individual datasets.
 * Every generated insight must be strictly grounded in computed analytical evidence.
 */
export function detectPatterns(
  spotify: SpotifyAnalytics,
  household: HouseholdAnalytics,
  transactions: TransactionAnalytics
): Insight[] {
  const insights: Insight[] = [];

  // Pattern 1: Spotify Audio Concentration (Top Artists Dominance)
  if (spotify.topArtists.length >= 3 && spotify.totalListeningHours > 0) {
    const top3Hours = spotify.topArtists.slice(0, 3).reduce((sum, a) => sum + a.hours, 0);
    const top3Ratio = Number(((top3Hours / spotify.totalListeningHours) * 100).toFixed(1));

    insights.push({
      id: 'pattern-spotify-concentration',
      title: 'Acoustic Gravitational Anchor',
      summary: `Top 3 artists account for ${top3Ratio}% of all recorded listening time (${top3Hours.toFixed(0)} of ${spotify.totalListeningHours.toFixed(0)} hours).`,
      category: 'audio_signature',
      significance: top3Ratio > 30 ? 'high' : 'medium',
      confidence: 0.98,
      source: 'spotify',
      tags: ['artist-concentration', 'listening-habits', 'repetition'],
      evidence: [
        buildEvidence(
          'spotify',
          'Top 3 Artists Hours Concentration',
          `${top3Ratio}%`,
          spotify.dateRange.start + ' to ' + spotify.dateRange.end,
          spotify.totalRecords,
          0.99,
          '33.3% expected baseline',
          `Artists: ${spotify.topArtists.slice(0, 3).map((a) => a.artist).join(', ')}`
        ),
      ],
    });
  }

  // Pattern 2: Household Expenditure Regularity
  if (household.categoryAmounts.length > 0 && household.totalExpenseAmount > 0) {
    const topCat = household.categoryAmounts[0];
    if (topCat) {
      insights.push({
        id: 'pattern-household-primacy',
        title: `Financial Cornerstone: ${topCat.category}`,
        summary: `${topCat.category} forms the largest domestic capital outflow, claiming ${topCat.percentage}% of total logged expenses.`,
        category: 'financial_rhythm',
        significance: 'high',
        confidence: 0.95,
        source: 'household',
        tags: ['expense-primacy', 'domestic-budget', 'category-dominance'],
        evidence: [
          buildEvidence(
            'household',
            `${topCat.category} Share of Expenses`,
            `${topCat.percentage}%`,
            household.dateRange.start + ' to ' + household.dateRange.end,
            household.totalRecords,
            0.96,
            '20% uniform distribution',
            `Total category expenditure: ₹${topCat.amount.toLocaleString('en-IN')}`
          ),
        ],
      });
    }
  }

  // Pattern 3: Card Transaction Fraud Anomaly Rate
  if (transactions.totalRecords > 0) {
    insights.push({
      id: 'pattern-card-fraud-integrity',
      title: 'Digital POS Anomaly Footprint',
      summary: `Flagged fraudulent anomalies represent ${transactions.fraudRate}% (${transactions.fraudCount} out of ${transactions.totalRecords.toLocaleString()} transactions).`,
      category: 'anomaly',
      significance: transactions.fraudCount > 0 ? 'high' : 'low',
      confidence: 0.99,
      source: 'transactions',
      tags: ['anomaly-detection', 'pos-security', 'risk-profile'],
      evidence: [
        buildEvidence(
          'transactions',
          'Flagged Fraud Ratio',
          `${transactions.fraudRate}%`,
          transactions.dateRange.start + ' to ' + transactions.dateRange.end,
          transactions.totalRecords,
          0.99,
          '<1% standard fraud threshold',
          `Clean records: ${transactions.totalRecords - transactions.fraudCount}`
        ),
      ],
    });
  }

  return insights;
}
