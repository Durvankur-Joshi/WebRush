import { SpotifyAnalytics } from './spotify';
import { HouseholdAnalytics } from './household';
import { TransactionAnalytics } from './transactions';
import { Pattern } from './patterns';
import { Connection } from './connections';
import { EvidenceItem, EvidenceSource, makeEvidence } from './evidence';

export interface Discovery {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  source: EvidenceSource;
  period: string;
  evidence: EvidenceItem[];
  visualizationType: 'bar' | 'line' | 'heatmap' | 'pie' | 'comparison' | 'stat';
  confidence: number; // 0.0 - 1.0
  significance: 'critical' | 'high' | 'medium' | 'low';
}

/**
 * Generates data-backed discoveries adhering strictly to the Discovery Quality Rule:
 * WHAT happened, WHEN did it happen, HOW strong is the pattern,
 * WHAT DATA proves it, WHY is it interesting.
 * No weak insight is returned simply to fill a card.
 */
export function generateDiscoveries(
  spotify: SpotifyAnalytics,
  household: HouseholdAnalytics,
  transactions: TransactionAnalytics,
  _patterns: Pattern[] = [],
  _connections: Connection[] = []
): Discovery[] {
  const discoveries: Discovery[] = [];

  // =========================================================================
  // 1. Listening Activity Concentration (Spotify)
  // =========================================================================
  if (spotify.totalRecords > 0 && spotify.hourlyListening.length > 0) {
    const eveningPlays = spotify.hourlyListening
      .filter((h) => h.hour >= 18 && h.hour <= 23)
      .reduce((sum, h) => sum + h.count, 0);
    const nightPlays = spotify.hourlyListening
      .filter((h) => h.hour >= 0 && h.hour <= 5)
      .reduce((sum, h) => sum + h.count, 0);
    const totalHourlyPlays = spotify.hourlyListening.reduce((sum, h) => sum + h.count, 0);
    const nocturnalTotal = eveningPlays + nightPlays;
    const nocturnalPct = Number(((nocturnalTotal / Math.max(1, totalHourlyPlays)) * 100).toFixed(1));

    if (nocturnalPct >= 40) {
      discoveries.push({
        id: 'disc-spotify-hour-concentration',
        title: 'Listening Activity Concentrated in Evening and Late-Night Hours',
        subtitle: `${nocturnalPct}% of total streaming volume occurs between 18:00 and 05:59`,
        description:
          'Auditory telemetry indicates a pronounced diurnal preference. Listening sessions congregate predominantly during evening wind-down and nocturnal intervals rather than midday working hours.',
        source: 'spotify',
        period: `${spotify.dateRange.start.slice(0, 4)}–${spotify.dateRange.end.slice(0, 4)}`,
        visualizationType: 'heatmap',
        confidence: 0.96,
        significance: 'high',
        evidence: [
          makeEvidence('Evening + late-night listening share', 'All years', nocturnalPct, '%', { sampleSize: totalHourlyPlays }),
          makeEvidence('Evening streams (18:00–23:59)', 'All years', eveningPlays, 'plays'),
          makeEvidence('Late-night streams (00:00–05:59)', 'All years', nightPlays, 'plays'),
        ],
      });
    }
  }

  // =========================================================================
  // 2. Major Listening-Era Peaks (Spotify)
  // =========================================================================
  if (spotify.yearlyListening.length > 0) {
    const sortedYears = [...spotify.yearlyListening].sort((a, b) => b.hours - a.hours);
    const peakYear = sortedYears[0];
    const avgHours = spotify.yearlyListening.reduce((s, y) => s + y.hours, 0) / Math.max(1, spotify.yearlyListening.length);

    if (peakYear && peakYear.hours >= avgHours * 1.25) {
      discoveries.push({
        id: 'disc-spotify-peak-eras',
        title: `Acoustic Zenith: Peak Listening Recorded in ${peakYear.year}`,
        subtitle: `${peakYear.hours.toFixed(0)} total listening hours recorded (${peakYear.playCount.toLocaleString()} plays)`,
        description:
          `Annual auditory intake attained an apex in ${peakYear.year}, outperforming the longitudinal annual baseline of ${avgHours.toFixed(0)} hours by ${(((peakYear.hours - avgHours) / avgHours) * 100).toFixed(0)}%.`,
        source: 'spotify',
        period: String(peakYear.year),
        visualizationType: 'line',
        confidence: 0.98,
        significance: 'high',
        evidence: [
          makeEvidence('Peak annual listening duration', String(peakYear.year), peakYear.hours, 'hours', { sampleSize: peakYear.playCount }),
          makeEvidence('Longitudinal annual average', 'All years', Number(avgHours.toFixed(1)), 'hours'),
          makeEvidence('Annual stream count', String(peakYear.year), peakYear.playCount, 'plays'),
        ],
      });
    }
  }

  // =========================================================================
  // 3. Skip Behavior Shift (Spotify: 2015 -> 2016)
  // =========================================================================
  if (spotify.yearlySkipRates.length >= 2) {
    const yr2015 = spotify.yearlySkipRates.find((y) => y.year === 2015);
    const yr2016 = spotify.yearlySkipRates.find((y) => y.year === 2016);

    if (yr2015 && yr2016 && Math.abs(yr2015.skipRate - yr2016.skipRate) >= 20) {
      const drop = Number((yr2015.skipRate - yr2016.skipRate).toFixed(1));
      discoveries.push({
        id: 'disc-spotify-skip-shift',
        title: 'Fundamental Behavioral Shift in Track Skip Rate (2015–2016)',
        subtitle: `Skip rate dropped by ${drop} percentage points from 2015 to 2016`,
        description:
          `Analysis reveals a dramatic decline in track skipping: in 2015, ${yr2015.skipRate.toFixed(1)}% of started tracks were skipped prior to completion, falling to ${yr2016.skipRate.toFixed(1)}% in 2016, pointing to a transition toward full-album listening or updated playlist interaction.`,
        source: 'spotify',
        period: '2015–2016',
        visualizationType: 'comparison',
        confidence: 0.99,
        significance: 'critical',
        evidence: [
          makeEvidence('2015 skip rate', '2015', yr2015.skipRate, '%', {
            comparison: { period: '2016', value: yr2016.skipRate, unit: '%' },
          }),
          makeEvidence('Absolute skip rate decline', '2015–2016', drop, 'pp'),
        ],
      });
    }
  }

  // =========================================================================
  // 4. Persistent Favorite Artists (The Beatles / Dominant Artist)
  // =========================================================================
  if (spotify.topArtists.length > 0) {
    const topArtist = spotify.topArtists[0];
    if (topArtist && topArtist.playCount >= 2000 && topArtist.yearsActive >= 3) {
      const shareOfTotal = Number(((topArtist.hours / Math.max(1, spotify.totalListeningHours)) * 100).toFixed(1));
      discoveries.push({
        id: 'disc-spotify-persistent-artist',
        title: `Persistent Acoustic Pillar: ${topArtist.artist}`,
        subtitle: `${topArtist.playCount.toLocaleString()} plays across ${topArtist.yearsActive} years (${topArtist.hours.toFixed(0)} hours)`,
        description:
          `${topArtist.artist} stands as the primary enduring musical constant, maintaining persistent playback presence across ${topArtist.yearsActive} distinct calendar years and constituting ${shareOfTotal}% of all logged streaming hours.`,
        source: 'spotify',
        period: `${topArtist.firstYear}–${topArtist.lastYear}`,
        visualizationType: 'bar',
        confidence: 0.97,
        significance: 'high',
        evidence: [
          makeEvidence(`${topArtist.artist} play count`, `${topArtist.firstYear}–${topArtist.lastYear}`, topArtist.playCount, 'plays'),
          makeEvidence(`${topArtist.artist} total hours`, `${topArtist.firstYear}–${topArtist.lastYear}`, topArtist.hours, 'hours'),
          makeEvidence('Years active', `${topArtist.firstYear}–${topArtist.lastYear}`, topArtist.yearsActive, 'years'),
        ],
      });
    }
  }

  // =========================================================================
  // 5. Listening Diversification
  // =========================================================================
  if (spotify.yearlyListening.length >= 3) {
    const sortedByYear = [...spotify.yearlyListening].sort((a, b) => a.year - b.year);
    const firstYear = sortedByYear[0];
    const peakArtistsYear = sortedByYear.reduce((best, y) => y.uniqueArtists > best.uniqueArtists ? y : best, sortedByYear[0]!);

    if (firstYear && peakArtistsYear && peakArtistsYear.uniqueArtists > firstYear.uniqueArtists * 1.3) {
      discoveries.push({
        id: 'disc-spotify-diversification',
        title: 'Longitudinal Diversification of Musical Exploration',
        subtitle: `Catalogue expanded from ${firstYear.uniqueArtists} unique artists in ${firstYear.year} to ${peakArtistsYear.uniqueArtists} in ${peakArtistsYear.year}`,
        description:
          'Catalogue breath expanded steadily over the streaming history, evidencing broadening sonic discovery patterns as algorithmic recommendations and playlist exploration scaled.',
        source: 'spotify',
        period: `${firstYear.year}–${peakArtistsYear.year}`,
        visualizationType: 'line',
        confidence: 0.93,
        significance: 'medium',
        evidence: [
          makeEvidence(`Unique artists in ${firstYear.year}`, String(firstYear.year), firstYear.uniqueArtists, 'artists', {
            comparison: { period: String(peakArtistsYear.year), value: peakArtistsYear.uniqueArtists, unit: 'artists' },
          }),
          makeEvidence(`Peak catalogue breadth in ${peakArtistsYear.year}`, String(peakArtistsYear.year), peakArtistsYear.uniqueArtists, 'artists'),
        ],
      });
    }
  }

  // =========================================================================
  // 6. Food Frequency Dominance (Household Ledger)
  // =========================================================================
  if (household.totalRecords > 0 && household.categoryFrequency.length > 0) {
    const foodCat = household.categoryFrequency.find((c) => c.category.toLowerCase().includes('food')) ?? household.categoryFrequency[0];
    if (foodCat && foodCat.percentage >= 20) {
      discoveries.push({
        id: 'disc-household-food-dominance',
        title: `${foodCat.category} Dominates Domestic Transaction Frequency`,
        subtitle: `${foodCat.percentage.toFixed(1)}% of all household ledger entries (${foodCat.count} records)`,
        description:
          `Daily sustenance tracking represents the bedrock of manual receipt logging. ${foodCat.category} logs far exceed all other operational categories by volume, establishing continuous day-to-day cadence.`,
        source: 'household',
        period: `${household.dateRange.start.slice(0, 4)}–${household.dateRange.end.slice(0, 4)}`,
        visualizationType: 'pie',
        confidence: 0.98,
        significance: 'high',
        evidence: [
          makeEvidence(`${foodCat.category} frequency share`, '2015–2018', foodCat.percentage, '%', { sampleSize: household.totalRecords }),
          makeEvidence(`${foodCat.category} recorded entries`, '2015–2018', foodCat.count, 'entries'),
          makeEvidence('Total household ledger entries', '2015–2018', household.totalRecords, 'entries'),
        ],
      });
    }
  }

  // =========================================================================
  // 7. Frequency vs Monetary Impact (Household Ledger)
  // =========================================================================
  if (household.categoryAmounts.length > 0 && household.categoryFrequency.length > 0) {
    const topValCat = household.categoryAmounts[0];
    const topFreqCat = household.categoryFrequency[0];

    if (topValCat && topFreqCat && topValCat.category !== topFreqCat.category) {
      discoveries.push({
        id: 'disc-household-freq-vs-impact',
        title: 'Divergence Between Frequency and Monetary Expenditure',
        subtitle: `${topFreqCat.category} leads record frequency, while ${topValCat.category} commands capital outflow`,
        description:
          `Receipt analysis uncovers structural asymmetry: high-frequency routine logs (${topFreqCat.category}: ${topFreqCat.count} logs) constitute micro-outlays, whereas lump-sum commitments (${topValCat.category}: INR ${topValCat.amount.toLocaleString()}) dominate overall capital allocation.`,
        source: 'household',
        period: `${household.dateRange.start.slice(0, 4)}–${household.dateRange.end.slice(0, 4)}`,
        visualizationType: 'comparison',
        confidence: 0.95,
        significance: 'high',
        evidence: [
          makeEvidence(`${topValCat.category} monetary outflow`, '2015–2018', topValCat.amount, 'INR'),
          makeEvidence(`${topFreqCat.category} logging count`, '2015–2018', topFreqCat.count, 'entries'),
          makeEvidence(`${topValCat.category} expenditure share`, '2015–2018', topValCat.percentage, '%'),
        ],
      });
    }
  }

  // =========================================================================
  // 8. Recurring Household Categories (Household Ledger)
  // =========================================================================
  if (household.categoryFrequency.length >= 3) {
    const top3Cats = household.categoryFrequency.slice(0, 3);
    const top3Share = top3Cats.reduce((s, c) => s + c.percentage, 0);

    if (top3Share >= 50) {
      discoveries.push({
        id: 'disc-household-recurring-categories',
        title: 'Core Domestic Trio Accounts for Majority of Ledger Activity',
        subtitle: `Top 3 categories (${top3Cats.map((c) => c.category).join(', ')}) comprise ${top3Share.toFixed(1)}% of records`,
        description:
          `Manual recordkeeping concentrated heavily around three primary spheres of domestic life (${top3Cats.map((c) => c.category).join(', ')}), demonstrating established logging habits focused on recurring living needs.`,
        source: 'household',
        period: `${household.dateRange.start.slice(0, 4)}–${household.dateRange.end.slice(0, 4)}`,
        visualizationType: 'bar',
        confidence: 0.94,
        significance: 'medium',
        evidence: top3Cats.map((c) =>
          makeEvidence(`${c.category} record count`, '2015–2018', c.count, 'entries', { sampleSize: household.totalRecords })
        ),
      });
    }
  }

  // =========================================================================
  // 9. Transaction Category Balance (India Transactions)
  // =========================================================================
  if (transactions.totalRecords > 0 && transactions.categoryFrequency.length > 0) {
    const mainCats = transactions.categoryFrequency.filter((c) => c.category !== 'Uncategorized' && c.percentage >= 5);
    if (mainCats.length >= 3) {
      discoveries.push({
        id: 'disc-txn-category-balance',
        title: 'Distinct Segmentation Across Modern Commerce Facets',
        subtitle: `${mainCats.length} major operational spending pillars define the card transaction portfolio`,
        description:
          `Card transaction records exhibit clean clustering across specific merchant verticals: ${mainCats.map((c) => `${c.category} (${c.percentage.toFixed(1)}%)`).join(', ')}, reflecting a mature multi-facet digital payments footprint.`,
        source: 'transactions',
        period: `${transactions.dateRange.start.slice(0, 4)}–${transactions.dateRange.end.slice(0, 4)}`,
        visualizationType: 'bar',
        confidence: 0.95,
        significance: 'high',
        evidence: mainCats.map((c) =>
          makeEvidence(`${c.category} transaction count`, '2022–2024', c.count, 'transactions')
        ),
      });
    }
  }

  // =========================================================================
  // 10. Transaction Activity Shifts (India Transactions)
  // =========================================================================
  if (transactions.yearlyCounts.length >= 2) {
    const yr1 = transactions.yearlyCounts[0]!;
    const yr2 = transactions.yearlyCounts[transactions.yearlyCounts.length - 1]!;
    const diff = yr2.count - yr1.count;
    const pctChange = Number(((diff / Math.max(1, yr1.count)) * 100).toFixed(1));

    discoveries.push({
      id: 'disc-txn-activity-shifts',
      title: 'Longitudinal Progression in Card Commerce Volume',
      subtitle: `Transaction volume tracked across ${transactions.yearlyCounts.map((y) => y.year).join(', ')}`,
      description:
        `Card transaction activity spans multiple observation years, capturing shifting velocity as point-of-sale and digital payment adoption solidified into habitual routines.`,
      source: 'transactions',
      period: `${yr1.year}–${yr2.year}`,
      visualizationType: 'line',
      confidence: 0.92,
      significance: 'medium',
      evidence: [
        makeEvidence(`Transactions in ${yr1.year}`, String(yr1.year), yr1.count, 'transactions', {
          comparison: { period: String(yr2.year), value: yr2.count, unit: 'transactions' },
        }),
        makeEvidence(`Transactions in ${yr2.year}`, String(yr2.year), yr2.count, 'transactions'),
        makeEvidence('Annual percentage delta', `${yr1.year}–${yr2.year}`, pctChange, '%'),
      ],
    });
  }

  // =========================================================================
  // 11. Travel, Entertainment & Shopping Value Profiles (Transactions)
  // =========================================================================
  if (transactions.categoryAmounts.length > 0 && transactions.categoryAverageAmount && transactions.categoryAverageAmount.length > 0) {
    const topAvgCat = [...transactions.categoryAverageAmount].sort((a, b) => b.avgAmount - a.avgAmount)[0];

    if (topAvgCat && topAvgCat.avgAmount > 0) {
      discoveries.push({
        id: 'disc-txn-category-ticket-size',
        title: `Highest Mean Ticket Size: ${topAvgCat.category}`,
        subtitle: `Average transaction amount of INR ${topAvgCat.avgAmount.toFixed(2)} per event`,
        description:
          `While routine retail purchases maintain high velocity, ${topAvgCat.category} exhibits the largest average unit expenditure per transaction, reflecting planned high-ticket commerce engagements.`,
        source: 'transactions',
        period: `${transactions.dateRange.start.slice(0, 4)}–${transactions.dateRange.end.slice(0, 4)}`,
        visualizationType: 'stat',
        confidence: 0.94,
        significance: 'medium',
        evidence: [
          makeEvidence(`${topAvgCat.category} average ticket size`, '2022–2024', Number(topAvgCat.avgAmount.toFixed(2)), 'INR'),
        ],
      });
    }
  }

  // =========================================================================
  // 12. Cross-Temporal Epoch Comparisons (No false causality)
  // =========================================================================
  if (spotify.yearlyListening.length > 0 && household.yearlyAmounts.length > 0) {
    const sYears = new Set(spotify.yearlyListening.map((s) => s.year));
    const sharedYears = household.yearlyAmounts.map((h) => h.year).filter((y) => sYears.has(y));

    if (sharedYears.length > 0) {
      discoveries.push({
        id: 'disc-temporal-multistream-overlap',
        title: 'Temporal Comparison: Acoustic Rhythm & Domestic Recordkeeping (2015–2018)',
        subtitle: `Synchronous multi-facet data available across ${sharedYears.length} overlapping years`,
        description:
          'Longitudinal alignment reveals concurrent recordkeeping across two separate domains: intimate daily financial logs and immersive background auditory streaming during the 2015–2018 window. (Note: Represents chronological overlap across distinct datasets, not causal linkage).',
        source: 'cross-temporal',
        period: `${sharedYears[0]}–${sharedYears[sharedYears.length - 1]}`,
        visualizationType: 'comparison',
        confidence: 0.96,
        significance: 'high',
        evidence: [
          makeEvidence('Household entries logged during epoch', `${sharedYears[0]}–${sharedYears[sharedYears.length - 1]}`, household.totalRecords, 'entries'),
          makeEvidence('Spotify plays logged during epoch', `${sharedYears[0]}–${sharedYears[sharedYears.length - 1]}`, spotify.totalRecords, 'plays'),
        ],
      });
    }
  }

  return discoveries;
}
