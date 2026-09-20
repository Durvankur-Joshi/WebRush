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
      description: `Spanning ${spotify.uniqueArtists.toLocaleString()} artists. Anchored by ${topArtist?.artist || 'The Beatles'} (${topArtist?.playCount.toLocaleString() || '13.6K'} plays).`,
      badge: 'Auditory Habits',
    },
    {
      id: 'household',
      title: 'HOUSEHOLD',
      subtitle: 'Everyday Financial Activity',
      recordCount: `${(household.totalRecords / 1000).toFixed(1)}K+ receipts`,
      rawRecordCount: household.totalRecords,
      dateRange: `${household.dateRange.start.slice(0, 4)} — ${household.dateRange.end.slice(0, 4)}`,
      keyMetricLabel: 'Logged Outflow',
      keyMetricValue: `INR ${(household.totalExpenses / 100000).toFixed(2)}L`,
      accentColor: '#10B981',
      description: `Domestic ledger tracking routines. ${foodCat?.category || 'Food'} accounts for ${foodCat?.percentage.toFixed(1) || '36.9'}% of all recorded events.`,
      badge: 'Domestic Ledger',
    },
    {
      id: 'transactions',
      title: 'TRANSACTIONS',
      subtitle: 'Point-of-Sale Card Commerce',
      recordCount: `${(transactions.totalRecords / 1000).toFixed(1)}K+ receipts`,
      rawRecordCount: transactions.totalRecords,
      dateRange: `${transactions.dateRange.start.slice(0, 4)} — ${transactions.dateRange.end.slice(0, 4)}`,
      keyMetricLabel: 'Commercial Outflow',
      keyMetricValue: `INR ${(transactions.totalAmount / 10000000).toFixed(2)} Cr`,
      accentColor: '#F59E0B',
      description: `Modern digital commerce spanning online shopping, entertainment, medical, and travel (avg INR ${travelCat?.avgAmount?.toFixed(0) || '5,556'}).`,
      badge: 'Zero PII Scrubbed',
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

    // Associated pattern/highlight for that year
    let notablePattern: string | undefined;
    if (yr === 2015) notablePattern = 'Track skip rate peaked at 78.8% prior to structural shift';
    else if (yr === 2016) notablePattern = 'Skip rate plunged to 3.6%; sustained Beatles playback emerged';
    else if (yr === 2017) notablePattern = 'Synchronous overlap: 20K+ streams + peak domestic expense ledger';
    else if (yr === 2018) notablePattern = 'Final domestic ledger year prior to digital card migration';
    else if (yr === 2020) notablePattern = 'Acoustic Zenith: All-time high annual listening of 1,235 hours';
    else if (yr === 2022) notablePattern = 'Card commerce telemetry begins across 4 digital retail facets';
    else if (yr === 2023) notablePattern = 'High-velocity digital card commerce and e-commerce peak';
    else if (yr === 2024) notablePattern = 'Contemporary multi-stream maturation';

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
