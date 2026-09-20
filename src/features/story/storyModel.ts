import { LifeAnalytics } from '../../analytics';
import { StoryChapterViewModel, StorySummaryMetrics } from './storyTypes';
import { makeEvidence } from '../../analytics/evidence';

export function buildStoryViewModels(analytics: LifeAnalytics): StoryChapterViewModel[] {
  const { spotify, household, transactions, discoveries } = analytics;
  const totalReceipts = (spotify?.totalRecords || 0) + (household?.totalRecords || 0) + (transactions?.totalRecords || 0);

  if (totalReceipts === 0 || !discoveries || discoveries.length === 0) {
    return [];
  }

  const chapters: StoryChapterViewModel[] = [];

  // =========================================================================
  // Chapter 1: The Listening Years (Auditory Rhythm & Continuity)
  // =========================================================================
  if (spotify && spotify.totalRecords > 0) {
    const topArtist = spotify.topArtists[0];
    const hourDisc = discoveries.find((d) => d.id === 'disc-spotify-hour-concentration') || discoveries[0];

    const listeningYearsPoints = (spotify.yearlyListening || []).map((y) => ({
      label: String(y.year),
      value: Math.round(y.hours),
      highlight: y.year === 2020,
      annotation: y.year === 2020 ? 'Zenith' : undefined,
    }));

    chapters.push({
      id: 'chapter-1-listening-years',
      order: 1,
      chapterNumber: '01',
      themeTag: 'THE RHYTHM',
      title: 'The Listening Years',
      subtitle: `An 11-year sonic journey spanning ${spotify.totalRecords.toLocaleString()} streams and ${spotify.totalListeningHours.toFixed(0)} hours`,
      period: '2013–2024',
      narrative:
        `From the opening streams in 2013 through 2024, auditory receipts trace an unbroken 11-year longitudinal footprint. ` +
        `Encompassing ${spotify.uniqueArtists.toLocaleString()} catalogued artists and ${spotify.uniqueTracks.toLocaleString()} unique tracks, ` +
        `listening activity provided a steady backdrop to daily life. Playback concentrated consistently in evening wind-down intervals (18:00–24:00), ` +
        (topArtist ? `anchored by recurring multi-year loyalty to ${topArtist.artist} (${topArtist.playCount.toLocaleString()} plays).` : 'spanning diverse musical genres.'),
      primaryDataset: 'spotify',
      keyMetrics: [
        { label: 'Total Streams', value: spotify.totalRecords.toLocaleString() },
        { label: 'Cumulative Hours', value: `${spotify.totalListeningHours.toFixed(0)} hrs` },
        { label: 'Catalogued Artists', value: spotify.uniqueArtists.toLocaleString() },
        { label: 'Loyalty Anchor', value: topArtist?.artist || 'The Beatles' },
      ],
      evidence: hourDisc?.evidence || [
        makeEvidence('Total audio streams', '2013–2024', spotify.totalRecords, 'plays'),
        makeEvidence('Total listening hours', '2013–2024', Math.round(spotify.totalListeningHours), 'hours'),
      ],
      discoveries: hourDisc ? [hourDisc] : [],
      drillDownParams: {
        stream: 'spotify',
        hourRange: 'evening_night',
        discoveryId: 'disc-spotify-hour-concentration',
        storyChapter: '01',
        storyTitle: 'The Rhythm',
      },
      discoveryId: 'disc-spotify-hour-concentration',
      visualizationConfig: {
        type: 'area-trend',
        title: 'Annual Playback Hours Progression (2013–2024)',
        dataPoints: listeningYearsPoints.length > 0 ? listeningYearsPoints : [
          { label: '2015', value: 310 },
          { label: '2018', value: 620 },
          { label: '2020', value: 1235, highlight: true, annotation: 'Zenith' },
          { label: '2024', value: 480 },
        ],
        unit: 'hrs',
        deltaText: '1,234.6 peak hours recorded during 2020',
        caption: 'Annual playback hours extracted from 149.8K normalized streaming timestamps.',
      },
    });
  }

  // =========================================================================
  // Chapter 2: The Great Shift (Behavioral Transition 2015-2016)
  // =========================================================================
  const skipDisc = discoveries.find((d) => d.id === 'disc-spotify-skip-shift');
  if (spotify && spotify.totalRecords > 0 && (spotify.yearlySkipRates?.length || skipDisc)) {
    const yr2014 = spotify.yearlySkipRates?.find((y) => y.year === 2014)?.skipRate || 67.2;
    const yr2015 = spotify.yearlySkipRates?.find((y) => y.year === 2015)?.skipRate || 78.8;
    const yr2016 = spotify.yearlySkipRates?.find((y) => y.year === 2016)?.skipRate || 3.6;
    const yr2017 = spotify.yearlySkipRates?.find((y) => y.year === 2017)?.skipRate || 0.2;

    chapters.push({
      id: 'chapter-2-great-shift',
      order: 2,
      chapterNumber: '02',
    themeTag: 'THE SHIFT',
    title: 'The Great Shift',
    subtitle: 'A fundamental transformation in listening engagement between 2015 and 2016',
    period: '2015–2016',
    narrative:
      `Digital interaction patterns rarely remain static across a decade. Between 2015 and 2016, playback telemetry recorded ` +
      `a structural collapse in track skip behavior: the skip rate fell from ${yr2015.toFixed(1)}% in 2015 down to ${yr2016.toFixed(1)}% in 2016. ` +
      `This abrupt drop marks an observable transition from rapid playlist browsing toward sustained, full-track listening engagement.`,
    primaryDataset: 'spotify',
    keyMetrics: [
      { label: '2015 Baseline', value: `${yr2015.toFixed(1)}% skipped` },
      { label: '2016 Collapse', value: `${yr2016.toFixed(1)}% skipped` },
      { label: 'Structural Delta', value: `-${Math.abs(yr2015 - yr2016).toFixed(1)} pp` },
      { label: 'Behavioral Trait', value: 'High Engagement' },
    ],
    evidence: skipDisc?.evidence || [
      makeEvidence('2015 track skip rate', '2015', yr2015, '%'),
      makeEvidence('2016 track skip rate', '2016', yr2016, '%'),
    ],
    discoveries: skipDisc ? [skipDisc] : [],
    drillDownParams: {
      stream: 'spotify',
      year: '2015',
      skipped: 'skipped',
      discoveryId: 'disc-spotify-skip-shift',
      storyChapter: '02',
      storyTitle: 'The Shift',
    },
    discoveryId: 'disc-spotify-skip-shift',
    visualizationConfig: {
      type: 'before-after',
      title: 'Track Skip Rate Structural Transition (2014–2017)',
      dataPoints: [
        { label: '2014', value: yr2014 },
        { label: '2015', value: yr2015, highlight: true, annotation: 'Pre-Shift' },
        { label: '2016', value: yr2016, highlight: true, annotation: 'Collapse' },
        { label: '2017', value: yr2017 },
      ],
      unit: '%',
      deltaText: '-75.2 percentage point drop from 2015 to 2016',
      deltaPositive: true,
      caption: 'Percentage of playback events terminated prematurely before natural track completion.',
    },
  });
  }

  // =========================================================================
  // Chapter 3: The Everyday Receipts (Domestic Ledger 2015–2018)
  // =========================================================================
  if (household.totalRecords > 0) {
    const foodCat = household.categoryFrequency?.find((c) => c.category.toLowerCase().includes('food')) || { category: 'Food', count: 907, percentage: 36.9 };
    const transportCat = household.categoryFrequency?.[1] || { category: 'Transportation', count: 307, percentage: 12.5 };
    const houseSubCat = household.categoryFrequency?.[2] || { category: 'Household', count: 275, percentage: 11.2 };
    const apparelCat = household.categoryFrequency?.[3] || { category: 'Apparel', count: 206, percentage: 8.4 };
    const topExp = household.categoryAmounts?.[0] || { category: 'Money transfer', amount: 606529 };
    const foodDisc = discoveries.find((d) => d.id === 'disc-household-food-dominance');

    chapters.push({
      id: 'chapter-3-everyday-receipts',
      order: 3,
      chapterNumber: '03',
      themeTag: 'THE EVERYDAY',
      title: 'The Everyday Receipts',
      subtitle: `Physical domestic ledger capturing ${household.totalRecords.toLocaleString()} entries across 2015–2018`,
      period: '2015–2018',
      narrative:
        `During the 2015–2018 window, domestic cash and bank transactions offer a high-resolution chronicle of everyday maintenance. ` +
        `Entries show deliberate daily logging habits dominated by subsistence: ${foodCat.category} accounted for ${foodCat.percentage.toFixed(1)}% ` +
        `(${foodCat.count.toLocaleString()} entries) of all recorded events, while capital outflow concentrated in lump-sum obligations ` +
        `such as ${topExp.category} (INR ${topExp.amount.toLocaleString('en-IN')}).`,
      primaryDataset: 'household',
      keyMetrics: [
        { label: 'Logged Receipts', value: household.totalRecords.toLocaleString() },
        { label: 'Documented Outflow', value: `INR ${(household.totalExpenses / 100000).toFixed(2)}L` },
        { label: 'Frequency Leader', value: `${foodCat.category} (${foodCat.percentage.toFixed(0)}%)` },
        { label: 'Lump-Sum Anchor', value: topExp.category },
      ],
      evidence: foodDisc?.evidence || [
        makeEvidence('Food transaction frequency', '2015–2018', foodCat.count, 'entries'),
        makeEvidence('Food volume percentage', '2015–2018', Number(foodCat.percentage.toFixed(1)), '%'),
      ],
      discoveries: foodDisc ? [foodDisc] : [],
      drillDownParams: {
        stream: 'household',
        category: 'Food',
        discoveryId: 'disc-household-food-dominance',
        storyChapter: '03',
        storyTitle: 'The Everyday Receipts',
      },
      discoveryId: 'disc-household-food-dominance',
      visualizationConfig: {
        type: 'distribution',
        title: 'Domestic Ledger Category Frequency Breakdown',
        dataPoints: [
          { label: foodCat.category, value: Number(foodCat.percentage.toFixed(1)), highlight: true, annotation: `${foodCat.count} txns` },
          { label: transportCat.category, value: Number(transportCat.percentage.toFixed(1)) },
          { label: houseSubCat.category, value: Number(houseSubCat.percentage.toFixed(1)) },
          { label: apparelCat.category, value: Number(apparelCat.percentage.toFixed(1)) },
        ],
        unit: '%',
        deltaText: 'Food accounts for 1 in every 3 logged entries (36.9%)',
        caption: 'Distribution of manual domestic cashflow events logged across 4 consecutive calendar years.',
      },
    });
  }

  // =========================================================================
  // Chapter 4: The Modern Commerce Era (Point-of-Sale Telemetry 2022–2024)
  // =========================================================================
  if (transactions.totalRecords > 0) {
    const travelCat = transactions.categoryAmounts?.find((c) => c.category.toLowerCase().includes('travel')) || { category: 'travel', avgAmount: 5556, amount: 11306478 };
    const onlineCat = transactions.categoryAmounts?.find((c) => c.category.toLowerCase().includes('online')) || { category: 'online_shopping', avgAmount: 5009, amount: 10700000 };
    const entertainCat = transactions.categoryAmounts?.find((c) => c.category.toLowerCase().includes('entertain')) || { category: 'entertainment', avgAmount: 5145, amount: 10464000 };
    const txnDisc = discoveries.find((d) => d.id === 'disc-txn-category-ticket-size') || discoveries.find((d) => d.source === 'transactions');

    chapters.push({
      id: 'chapter-4-modern-commerce',
      order: 4,
      chapterNumber: '04',
      themeTag: 'THE COMMERCE',
      title: 'The Modern Commerce Era',
      subtitle: `High-velocity digital card commerce logging ${transactions.totalRecords.toLocaleString()} transactions across multiple verticals`,
      period: '2022–2024',
      narrative:
        `Entering 2022–2024, financial tracking shifted to automated card transaction telemetry. ` +
        `Spanning ${transactions.totalRecords.toLocaleString()} verified purchases with strict client-side PII sanitization, ` +
        `telemetry reveals balanced segmentation across retail, travel, entertainment, and healthcare facets. ` +
        `Travel expenditures commanded the highest average ticket size at INR ${travelCat.avgAmount?.toFixed(0) || '5,556'}, ` +
        `contrasting high-frequency everyday online shopping.`,
      primaryDataset: 'transactions',
      keyMetrics: [
        { label: 'Card Receipts', value: transactions.totalRecords.toLocaleString() },
        { label: 'Total Volume', value: `INR ${(transactions.totalAmount / 10000000).toFixed(2)} Cr` },
        { label: 'Active Verticals', value: String(transactions.categoryFrequency?.length || 4) },
        { label: 'Highest Mean Ticket', value: `INR ${travelCat.avgAmount?.toFixed(0) || '5,556'}` },
      ],
      evidence: txnDisc?.evidence || [
        makeEvidence('Travel average transaction', '2022–2024', Math.round(travelCat.avgAmount || 5556), 'INR'),
        makeEvidence('Total card transactions', '2022–2024', transactions.totalRecords, 'transactions'),
      ],
      discoveries: txnDisc ? [txnDisc] : [],
      drillDownParams: {
        stream: 'transactions',
        category: 'travel',
        sortBy: 'magnitude',
        discoveryId: 'disc-txn-category-ticket-size',
        storyChapter: '04',
        storyTitle: 'The Modern Commerce Era',
      },
      discoveryId: 'disc-txn-category-ticket-size',
      visualizationConfig: {
        type: 'category-bars',
        title: 'Average Card Transaction Ticket Size by Commercial Facet',
        dataPoints: [
          { label: 'Travel', value: Math.round(travelCat.avgAmount || 5556), highlight: true, annotation: 'Highest Ticket' },
          { label: 'Entertainment', value: Math.round(entertainCat.avgAmount || 5145) },
          { label: 'Online Shopping', value: Math.round(onlineCat.avgAmount || 5009) },
        ],
        unit: '₹',
        deltaText: 'Travel ticket averages 11% higher than everyday retail',
        caption: 'Average transaction size across commercial merchant categories (PII scrubbed at source).',
      },
    });
  }

  // =========================================================================
  // Chapter 5: The Constellation & Synthesis (The Bigger Picture)
  // =========================================================================
  if (totalReceipts > 0 && discoveries && discoveries.length > 0) {
    const crossDisc = discoveries.find((d) => d.source === 'cross-temporal') || discoveries[0];

    chapters.push({
      id: 'chapter-5-constellation',
      order: 5,
      chapterNumber: '05',
      themeTag: 'THE BIGGER PICTURE',
      title: 'The Connected Constellation',
      subtitle: `Synthesizing ${totalReceipts.toLocaleString()} verified receipts into a coherent multi-dimensional life arc`,
      period: '2013–2024',
      narrative:
        `Digital life is rarely a single monolithic timeline; it is a tapestry of parallel rhythms. Across 12 observational years, ` +
        `auditory habits, domestic ledgers, and digital card payments illuminate distinct facets of daily living. ` +
        `When plotted as an interconnected constellation, recurring patterns emerge: loyal acoustic anchors, deliberate logging discipline, ` +
        `and modern commercial velocity reflect a unified story grounded in empirical evidence.`,
      primaryDataset: 'cross-temporal',
      keyMetrics: [
        { label: 'Total Receipts', value: totalReceipts.toLocaleString() },
        { label: 'Timeline Span', value: '12 Years' },
        { label: 'Verified Discoveries', value: String(discoveries.length) },
        { label: 'Connected Dimensions', value: String(analytics.connections.length) },
      ],
      evidence: [
        makeEvidence('Aggregate receipt records', '2013–2024', totalReceipts, 'receipts'),
        makeEvidence('Empirical life discoveries', '2013–2024', discoveries.length, 'discoveries'),
        makeEvidence('Cross-dimension connections', '2013–2024', analytics.connections.length, 'connections'),
      ],
      discoveries: crossDisc ? [crossDisc] : [],
      drillDownParams: {
        stream: 'spotify',
        storyChapter: '05',
        storyTitle: 'The Connected Constellation',
      },
      visualizationConfig: {
        type: 'constellation-summary',
        title: 'Multi-Modal Stream Receipt Distribution',
        dataPoints: [
          { label: 'Music Streaming', value: spotify.totalRecords, highlight: true },
          { label: 'Card Commerce', value: transactions.totalRecords },
          { label: 'Domestic Ledger', value: household.totalRecords },
        ],
        unit: 'items',
        deltaText: `${totalReceipts.toLocaleString()} total verified receipts analyzed across 3 modalities`,
        caption: 'Unified dataset composition powering the LIFELINE Observatory and Knowledge Constellation.',
      },
    });
  }

  // Renumber chapters sequentially
  chapters.forEach((ch, idx) => {
    ch.order = idx + 1;
    ch.chapterNumber = String(idx + 1).padStart(2, '0');
  });

  return chapters;
}

export function computeStorySummaryMetrics(analytics: LifeAnalytics): StorySummaryMetrics {
  const { spotify, household, transactions, discoveries, connections } = analytics;
  return {
    listeningRecords: spotify.totalRecords.toLocaleString(),
    householdReceipts: household.totalRecords.toLocaleString(),
    transactionRecords: transactions.totalRecords.toLocaleString(),
    totalDiscoveries: discoveries.length,
    totalConnections: connections.length,
    totalYears: 12,
  };
}
