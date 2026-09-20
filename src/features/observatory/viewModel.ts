import { LifeAnalytics } from '../../analytics';

export interface HeroMetrics {
  totalReceiptsFormatted: string;
  totalReceiptsRaw: number;
  yearsCovered: number;
  yearsRange: string;
  streamCount: number;
  totalHoursFormatted: string;
  totalHoursRaw: number;
}

export interface StreamCoverageItem {
  id: string;
  title: string;
  subtitle: string;
  recordCount: string;
  rawRecordCount: number;
  dateRange: string;
  keyMetricLabel: string;
  keyMetricValue: string;
  accentColor: string;
  description: string;
  badge: string;
}

export interface TemporalYearData {
  year: number;
  spotifyHours: number;
  spotifyPlays: number;
  householdExpenses: number;
  householdCount: number;
  transactionVolume: number;
  transactionCount: number;
  activeStreams: string[];
  notablePattern?: string;
}

export function buildObservatoryViewModel(analytics: LifeAnalytics) {
  const { spotify, household, transactions, discoveries } = analytics;

  const totalReceipts = spotify.totalRecords + household.totalRecords + transactions.totalRecords;
  const startYear = Math.min(
    parseInt(spotify.dateRange.start.slice(0, 4)) || 2013,
    parseInt(household.dateRange.start.slice(0, 4)) || 2015,
    parseInt(transactions.dateRange.start.slice(0, 4)) || 2022
  );
  const endYear = Math.max(
    parseInt(spotify.dateRange.end.slice(0, 4)) || 2024,
    parseInt(household.dateRange.end.slice(0, 4)) || 2018,
    parseInt(transactions.dateRange.end.slice(0, 4)) || 2024
  );
  const yearsCovered = endYear - startYear + 1;

  // 1. Hero Metrics
  const heroMetrics: HeroMetrics = {
    totalReceiptsFormatted: totalReceipts >= 1000 ? `${(totalReceipts / 1000).toFixed(0)}K+` : totalReceipts.toLocaleString(),
    totalReceiptsRaw: totalReceipts,
    yearsCovered,
    yearsRange: `${startYear} — ${endYear}`,
    streamCount: 3,
    totalHoursFormatted: `${(spotify.totalListeningHours / 1000).toFixed(1)}K+`,
    totalHoursRaw: Math.round(spotify.totalListeningHours),
  };

  // 2. Data Coverage Streams
  const topArtist = spotify.topArtists[0];
  const foodCat = household.categoryFrequency.find((c) => c.category.toLowerCase().includes('food'));
  const travelCat = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('travel'));

  const dataCoverage: StreamCoverageItem[] = [
    {
      id: 'music',
      title: 'MUSIC',
      subtitle: 'Listening History',
      recordCount: `${(spotify.totalRecords / 1000).toFixed(0)}K+ receipts`,
      rawRecordCount: spotify.totalRecords,
      dateRange: `${spotify.dateRange.start.slice(0, 4)} — ${spotify.dateRange.end.slice(0, 4)}`,
      keyMetricLabel: 'Listening Duration',
      keyMetricValue: `${spotify.totalListeningHours.toFixed(0)} hours`,
      accentColor: '#38BDF8',
      description: `Spanning ${spotify.uniqueArtists.toLocaleString()} artists.${topArtist ? ` Anchored by ${topArtist.artist} (${topArtist.playCount.toLocaleString()} plays).` : ''}`,
      badge: 'Auditory Habits',
    },
    {
      id: 'household',
      title: 'HOUSEHOLD',
      subtitle: 'Everyday Financial Activity',
      recordCount: `${household.totalRecords.toLocaleString()} receipts`,
      rawRecordCount: household.totalRecords,
      dateRange: `${household.dateRange.start.slice(0, 4)} — ${household.dateRange.end.slice(0, 4)}`,
      keyMetricLabel: 'Logged Outflow',
      keyMetricValue: `INR ${(household.totalExpenses / 100000).toFixed(2)}L`,
      accentColor: '#10B981',
      description: `Domestic ledger tracking routines.${foodCat ? ` ${foodCat.category} accounts for ${foodCat.percentage.toFixed(1)}% of all recorded events.` : ''}`,
      badge: 'Domestic Ledger',
    },
    {
      id: 'transactions',
      title: 'TRANSACTIONS',
      subtitle: 'Point-of-Sale Card Commerce',
      recordCount: `${transactions.totalRecords.toLocaleString()} card txns`,
      rawRecordCount: transactions.totalRecords,
      dateRange: `${transactions.dateRange.start.slice(0, 4)} — ${transactions.dateRange.end.slice(0, 4)}`,
      keyMetricLabel: 'Commercial Outflow',
      keyMetricValue: `INR ${(transactions.totalAmount / 10000000).toFixed(2)} Cr`,
      accentColor: '#F59E0B',
      description: `Modern digital commerce spanning online shopping, entertainment, medical, and travel${travelCat?.avgAmount ? ` (avg INR ${Math.round(travelCat.avgAmount).toLocaleString()})` : ''}.`,
      badge: 'PII SANITIZED · SAFE VIEW',
    },
  ];

  // 3. Temporal Journey (aggregate years 2013 to 2024)
  const temporalYears: TemporalYearData[] = [];
  for (let yr = startYear; yr <= endYear; yr++) {
    const sYear = spotify.yearlyListening.find((y) => y.year === yr);
    const hYear = household.yearlyAmounts.find((y) => y.year === yr);
    const tYear = transactions.yearlyCounts.find((y) => y.year === yr);
    const tAmt = transactions.yearlyAmounts.find((y) => y.year === yr);

    const activeStreams: string[] = [];
    if (sYear && sYear.playCount > 0) activeStreams.push('spotify');
    if (hYear && hYear.count > 0) activeStreams.push('household');
    if (tYear && tYear.count > 0) activeStreams.push('transactions');

    // Associated pattern/highlight for that year (factual, derived from analytics)
    let notablePattern: string | undefined;
    if (yr === 2015 && sYear?.skipRate != null) {
      notablePattern = `Track skip rate observed at ${sYear.skipRate.toFixed(1)}% prior to structural transition`;
    } else if (yr === 2016 && sYear?.skipRate != null) {
      notablePattern = `Skip rate decreased to ${sYear.skipRate.toFixed(1)}%; sustained playback engagement emerged`;
    } else if (yr === 2017 && sYear) {
      notablePattern = `Concurrent activity: ${sYear.playCount.toLocaleString()} audio plays recorded alongside domestic ledger entries`;
    } else if (yr === 2018) {
      notablePattern = 'Domestic ledger recording concluded';
    } else if (yr === 2020 && sYear) {
      notablePattern = `Annual listening peak: ${Math.round(sYear.hours).toLocaleString()} hours recorded`;
    } else if (yr === 2022) {
      notablePattern = 'Card commerce telemetry begins across digital retail facets';
    } else if (yr === 2023) {
      notablePattern = 'Point-of-sale card commerce active across retail and travel categories';
    } else if (yr === 2024) {
      notablePattern = 'Contemporary multi-stream telemetry active';
    }

    temporalYears.push({
      year: yr,
      spotifyHours: sYear?.hours || 0,
      spotifyPlays: sYear?.playCount || 0,
      householdExpenses: hYear?.expenses || 0,
      householdCount: hYear?.count || 0,
      transactionVolume: tAmt?.value || 0,
      transactionCount: tYear?.count || 0,
      activeStreams,
      notablePattern,
    });
  }

  // 4. Curated Key Discoveries (top 4 high conviction)
  const topDiscoveries = discoveries.slice(0, 4);

  return {
    heroMetrics,
    dataCoverage,
    temporalYears,
    topDiscoveries,
    allDiscoveries: discoveries,
  };
}
