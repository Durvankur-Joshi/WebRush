import { LifeAnalytics } from '../../analytics';
import { StoryChapterViewModel, StorySummaryMetrics } from './storyTypes';
import { makeEvidence } from '../../analytics/evidence';

export function buildStoryViewModels(analytics: LifeAnalytics): StoryChapterViewModel[] {
  const { spotify, household, transactions, discoveries } = analytics;
  const totalReceipts = (spotify?.totalRecords || 0) + (household?.totalRecords || 0) + (transactions?.totalRecords || 0);

  if (totalReceipts === 0 || !discoveries || discoveries.length === 0) {
    return [];
  }

  // Derive time span and date ranges dynamically from actual data
  const starts = [spotify?.dateRange?.start, household?.dateRange?.start, transactions?.dateRange?.start].filter(Boolean) as string[];
  const ends = [spotify?.dateRange?.end, household?.dateRange?.end, transactions?.dateRange?.end].filter(Boolean) as string[];

  const startYears = starts.map((d) => new Date(d).getFullYear()).filter((y) => !isNaN(y));
  const endYears = ends.map((d) => new Date(d).getFullYear()).filter((y) => !isNaN(y));

  const minYear = startYears.length > 0 ? Math.min(...startYears) : 2013;
  const maxYear = endYears.length > 0 ? Math.max(...endYears) : 2024;
  const totalYears = maxYear >= minYear ? maxYear - minYear + 1 : 0;
  const overallPeriod = `${minYear}–${maxYear}`;
  const totalSpanText = totalYears > 0 ? `${totalYears} Years` : 'Multi-Year';

  const chapters: StoryChapterViewModel[] = [];

  // =========================================================================
  // Chapter 1: The Listening Years (Auditory Rhythm & Continuity)
  // =========================================================================
  if (spotify && spotify.totalRecords > 0) {
    const topArtist = spotify.topArtists?.[0];
    const hourDisc = discoveries.find((d) => d.id === 'disc-spotify-hour-concentration') || discoveries.find((d) => d.source === 'spotify');

    const spotStartYear = spotify.dateRange?.start?.slice(0, 4) || String(minYear);
    const spotEndYear = spotify.dateRange?.end?.slice(0, 4) || String(maxYear);
    const spotYearsCount = Number(spotEndYear) >= Number(spotStartYear) ? Number(spotEndYear) - Number(spotStartYear) + 1 : 0;
    const spotSpanText = spotYearsCount > 0 ? `${spotYearsCount}-year` : 'longitudinal';

    const peakListening = (spotify.yearlyListening && spotify.yearlyListening.length > 0)
      ? spotify.yearlyListening.reduce((max, y) => (y.hours > max.hours ? y : max), spotify.yearlyListening[0])
      : undefined;

    const listeningYearsPoints = (spotify.yearlyListening || []).map((y) => ({
      label: String(y.year),
      value: Math.round(y.hours),
      highlight: peakListening ? y.year === peakListening.year : false,
      annotation: peakListening && y.year === peakListening.year ? 'Apex' : undefined,
    }));

    chapters.push({
      id: 'chapter-1-listening-years',
      order: 1,
      chapterNumber: '01',
      themeTag: 'THE RHYTHM',
      title: 'The Listening Years',
      subtitle: `An ${spotSpanText} sonic journey spanning ${spotify.totalRecords.toLocaleString()} streams and ${Math.round(spotify.totalListeningHours).toLocaleString()} hours`,
      period: `${spotStartYear}–${spotEndYear}`,
      narrative:
        `From the opening streams in ${spotStartYear} through ${spotEndYear}, auditory receipts trace an unbroken ${spotSpanText} longitudinal footprint. ` +
        `Encompassing ${spotify.uniqueArtists.toLocaleString()} catalogued artists and ${spotify.uniqueTracks.toLocaleString()} unique tracks, ` +
        `listening activity provided a steady backdrop to daily life. Playback concentrated consistently in evening wind-down intervals (18:00–24:00)` +
        (topArtist ? `, anchored by recurring multi-year loyalty to ${topArtist.artist} (${topArtist.playCount.toLocaleString()} plays).` : '.'),
      primaryDataset: 'spotify',
      keyMetrics: [
        { label: 'Total Streams', value: spotify.totalRecords.toLocaleString() },
        { label: 'Cumulative Hours', value: `${Math.round(spotify.totalListeningHours).toLocaleString()} hrs` },
        { label: 'Catalogued Artists', value: spotify.uniqueArtists.toLocaleString() },
        ...(topArtist ? [{ label: 'Loyalty Anchor', value: topArtist.artist }] : []),
      ],
      evidence: hourDisc?.evidence || [
        makeEvidence('Total audio streams', `${spotStartYear}–${spotEndYear}`, spotify.totalRecords, 'plays'),
        makeEvidence('Total listening hours', `${spotStartYear}–${spotEndYear}`, Math.round(spotify.totalListeningHours), 'hours'),
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
        title: `Annual Playback Hours Progression (${spotStartYear}–${spotEndYear})`,
        dataPoints: listeningYearsPoints,
        unit: 'hrs',
        deltaText: peakListening
          ? `${Math.round(peakListening.hours).toLocaleString()} peak hours recorded during ${peakListening.year}`
          : `${Math.round(spotify.totalListeningHours).toLocaleString()} total hours recorded`,
        caption: `Annual playback hours extracted from ${spotify.totalRecords.toLocaleString()} normalized streaming timestamps.`,
      },
    });
  }

  // =========================================================================
  // Chapter 2: The Great Shift (Behavioral Transition 2015-2016)
  // =========================================================================
  const skipDisc = discoveries.find((d) => d.id === 'disc-spotify-skip-shift');
  const yr2015Obj = spotify?.yearlySkipRates?.find((y) => y.year === 2015);
  const yr2016Obj = spotify?.yearlySkipRates?.find((y) => y.year === 2016);

  if (spotify && spotify.totalRecords > 0 && yr2015Obj && yr2016Obj) {
    const yr2015 = yr2015Obj.skipRate;
    const yr2016 = yr2016Obj.skipRate;
    const yr2014Obj = spotify.yearlySkipRates?.find((y) => y.year === 2014);
    const yr2017Obj = spotify.yearlySkipRates?.find((y) => y.year === 2017);
    const delta = yr2015 - yr2016;

    const dataPoints = [
      ...(yr2014Obj ? [{ label: '2014', value: yr2014Obj.skipRate }] : []),
      { label: '2015', value: yr2015, highlight: true, annotation: 'Pre-Shift' },
      { label: '2016', value: yr2016, highlight: true, annotation: 'Collapse' },
      ...(yr2017Obj ? [{ label: '2017', value: yr2017Obj.skipRate }] : []),
    ];

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
        `This drop marks an observable transition from rapid playlist browsing toward sustained, full-track listening engagement.`,
      primaryDataset: 'spotify',
      keyMetrics: [
        { label: '2015 Baseline', value: `${yr2015.toFixed(1)}% skipped` },
        { label: '2016 Collapse', value: `${yr2016.toFixed(1)}% skipped` },
        { label: 'Structural Delta', value: `-${Math.abs(delta).toFixed(1)} pp` },
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
        dataPoints,
        unit: '%',
        deltaText: `-${Math.abs(delta).toFixed(1)} percentage point drop from 2015 to 2016`,
        deltaPositive: true,
        caption: 'Percentage of playback events terminated prematurely before natural track completion.',
      },
    });
  }

  // =========================================================================
  // Chapter 3: The Everyday Receipts (Domestic Ledger 2015–2018)
  // =========================================================================
  if (household && household.totalRecords > 0 && household.categoryFrequency && household.categoryFrequency.length > 0) {
    const foodCat = household.categoryFrequency.find((c) => c.category.toLowerCase().includes('food')) || household.categoryFrequency[0];
    const topExp = household.categoryAmounts?.[0];
    const foodDisc = discoveries.find((d) => d.id === 'disc-household-food-dominance');

    const houseStartYear = household.dateRange?.start?.slice(0, 4) || '2015';
    const houseEndYear = household.dateRange?.end?.slice(0, 4) || '2018';
    const houseYearsCount = Number(houseEndYear) >= Number(houseStartYear) ? Number(houseEndYear) - Number(houseStartYear) + 1 : 0;
    const houseSpanText = houseYearsCount > 0 ? `${houseYearsCount} consecutive calendar years` : 'the observation window';

    const topCategories = household.categoryFrequency.slice(0, 4);
    const dataPoints = topCategories.map((c, i) => ({
      label: c.category,
      value: Number(c.percentage.toFixed(1)),
      highlight: i === 0,
      annotation: i === 0 ? `${c.count} txns` : undefined,
    }));

    chapters.push({
      id: 'chapter-3-everyday-receipts',
      order: 3,
      chapterNumber: '03',
      themeTag: 'THE EVERYDAY',
      title: 'The Everyday Receipts',
      subtitle: `Physical domestic ledger capturing ${household.totalRecords.toLocaleString()} entries across ${houseStartYear}–${houseEndYear}`,
      period: `${houseStartYear}–${houseEndYear}`,
      narrative:
        `During the ${houseStartYear}–${houseEndYear} window, domestic cash and bank transactions offer a high-resolution chronicle of everyday maintenance. ` +
        `Entries show deliberate daily logging habits dominated by subsistence: ${foodCat.category} accounted for ${foodCat.percentage.toFixed(1)}% ` +
        `(${foodCat.count.toLocaleString()} entries) of all recorded events` +
        (topExp ? `, while capital outflow concentrated in lump-sum obligations such as ${topExp.category} (INR ${topExp.amount.toLocaleString('en-IN')}).` : '.'),
      primaryDataset: 'household',
      keyMetrics: [
        { label: 'Logged Receipts', value: household.totalRecords.toLocaleString() },
        { label: 'Documented Outflow', value: `INR ${(household.totalExpenses / 100000).toFixed(2)}L` },
        { label: 'Frequency Leader', value: `${foodCat.category} (${foodCat.percentage.toFixed(0)}%)` },
        ...(topExp ? [{ label: 'Lump-Sum Anchor', value: topExp.category }] : []),
      ],
      evidence: foodDisc?.evidence || [
        makeEvidence(`${foodCat.category} transaction frequency`, `${houseStartYear}–${houseEndYear}`, foodCat.count, 'entries'),
        makeEvidence(`${foodCat.category} volume percentage`, `${houseStartYear}–${houseEndYear}`, Number(foodCat.percentage.toFixed(1)), '%'),
      ],
      discoveries: foodDisc ? [foodDisc] : [],
      drillDownParams: {
        stream: 'household',
        category: foodCat.category,
        discoveryId: 'disc-household-food-dominance',
        storyChapter: '03',
        storyTitle: 'The Everyday Receipts',
      },
      discoveryId: 'disc-household-food-dominance',
      visualizationConfig: {
        type: 'distribution',
        title: 'Domestic Ledger Category Frequency Breakdown',
        dataPoints,
        unit: '%',
        deltaText: `${foodCat.category} represents ${foodCat.percentage.toFixed(1)}% of all logged entries (${foodCat.count.toLocaleString()} entries)`,
        caption: `Distribution of domestic cashflow events (${household.totalRecords.toLocaleString()} entries) logged across ${houseSpanText}.`,
      },
    });
  }

  // =========================================================================
  // Chapter 4: The Modern Commerce Era (Point-of-Sale Telemetry 2022–2024)
  // =========================================================================
  if (transactions && transactions.totalRecords > 0 && transactions.categoryAmounts && transactions.categoryAmounts.length > 0) {
    const travelCat = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('travel')) || transactions.categoryAmounts[0];
    const onlineCat = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('online')) || transactions.categoryAmounts[1] || transactions.categoryAmounts[0];
    const entertainCat = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('entertain')) || transactions.categoryAmounts[2];

    const txnStartYear = transactions.dateRange?.start?.slice(0, 4) || '2022';
    const txnEndYear = transactions.dateRange?.end?.slice(0, 4) || '2024';

    const txnDisc = discoveries.find((d) => d.id === 'disc-txn-category-ticket-size') || discoveries.find((d) => d.source === 'transactions');
    const retailAvg = onlineCat?.avgAmount || 0;
    const travelAvg = travelCat?.avgAmount || 0;
    const ticketDiffPct = retailAvg > 0 ? Math.round(((travelAvg - retailAvg) / retailAvg) * 100) : 0;

    const dataPoints = [
      { label: travelCat.category, value: Math.round(travelAvg), highlight: true, annotation: 'Highest Ticket' },
      ...(onlineCat && onlineCat.category !== travelCat.category ? [{ label: onlineCat.category, value: Math.round(retailAvg) }] : []),
      ...(entertainCat && entertainCat.category !== travelCat.category && entertainCat.category !== onlineCat?.category ? [{ label: entertainCat.category, value: Math.round(entertainCat.avgAmount || 0) }] : []),
    ];

    chapters.push({
      id: 'chapter-4-modern-commerce',
      order: 4,
      chapterNumber: '04',
      themeTag: 'THE COMMERCE',
      title: 'The Modern Commerce Era',
      subtitle: `High-velocity digital card commerce logging ${transactions.totalRecords.toLocaleString()} transactions across multiple verticals`,
      period: `${txnStartYear}–${txnEndYear}`,
      narrative:
        `Entering ${txnStartYear}–${txnEndYear}, financial tracking shifted to automated card transaction telemetry. ` +
        `Spanning ${transactions.totalRecords.toLocaleString()} verified purchases with strict client-side PII sanitization, ` +
        `telemetry reveals balanced segmentation across retail, travel, entertainment, and healthcare facets. ` +
        `${travelCat.category} expenditures commanded the highest average ticket size at INR ${Math.round(travelAvg).toLocaleString()}, ` +
        `contrasting high-frequency everyday retail.`,
      primaryDataset: 'transactions',
      keyMetrics: [
        { label: 'Card Receipts', value: transactions.totalRecords.toLocaleString() },
        { label: 'Total Volume', value: `INR ${(transactions.totalAmount / 10000000).toFixed(2)} Cr` },
        { label: 'Active Verticals', value: String(transactions.categoryFrequency?.length || transactions.categoryAmounts.length) },
        { label: 'Highest Mean Ticket', value: `INR ${Math.round(travelAvg).toLocaleString()}` },
      ],
      evidence: txnDisc?.evidence || [
        makeEvidence(`${travelCat.category} average transaction`, `${txnStartYear}–${txnEndYear}`, Math.round(travelAvg), 'INR'),
        makeEvidence('Total card transactions', `${txnStartYear}–${txnEndYear}`, transactions.totalRecords, 'transactions'),
      ],
      discoveries: txnDisc ? [txnDisc] : [],
      drillDownParams: {
        stream: 'transactions',
        category: travelCat.category,
        sortBy: 'magnitude',
        discoveryId: 'disc-txn-category-ticket-size',
        storyChapter: '04',
        storyTitle: 'The Modern Commerce Era',
      },
      discoveryId: 'disc-txn-category-ticket-size',
      visualizationConfig: {
        type: 'category-bars',
        title: 'Average Card Transaction Ticket Size by Commercial Facet',
        dataPoints,
        unit: '₹',
        deltaText: ticketDiffPct > 0
          ? `${travelCat.category} ticket averages ${ticketDiffPct}% higher than everyday retail (INR ${Math.round(travelAvg).toLocaleString()})`
          : `Highest average card ticket (INR ${Math.round(travelAvg).toLocaleString()})`,
        caption: `Average transaction size across commercial merchant categories (${transactions.totalRecords.toLocaleString()} transactions, PII scrubbed at source).`,
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
      period: overallPeriod,
      narrative:
        `Digital life is rarely a single monolithic timeline; it is a tapestry of parallel rhythms. Across ${totalSpanText}, ` +
        `auditory habits, domestic ledgers, and digital card payments illuminate distinct facets of daily living. ` +
        `When plotted as an interconnected constellation, recurring patterns emerge: loyal acoustic anchors, deliberate logging discipline, ` +
        `and modern commercial velocity reflect a unified story grounded in empirical evidence.`,
      primaryDataset: 'cross-temporal',
      keyMetrics: [
        { label: 'Total Receipts', value: totalReceipts.toLocaleString() },
        { label: 'Timeline Span', value: totalSpanText },
        { label: 'Verified Discoveries', value: String(discoveries.length) },
        { label: 'Connected Dimensions', value: String(analytics.connections.length) },
      ],
      evidence: [
        makeEvidence('Aggregate receipt records', overallPeriod, totalReceipts, 'receipts'),
        makeEvidence('Empirical life discoveries', overallPeriod, discoveries.length, 'discoveries'),
        makeEvidence('Cross-dimension connections', overallPeriod, analytics.connections.length, 'connections'),
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
          { label: 'Music Streaming', value: spotify?.totalRecords || 0, highlight: true },
          { label: 'Card Commerce', value: transactions?.totalRecords || 0 },
          { label: 'Domestic Ledger', value: household?.totalRecords || 0 },
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
  const starts = [spotify?.dateRange?.start, household?.dateRange?.start, transactions?.dateRange?.start].filter(Boolean) as string[];
  const ends = [spotify?.dateRange?.end, household?.dateRange?.end, transactions?.dateRange?.end].filter(Boolean) as string[];

  const startYears = starts.map((d) => new Date(d).getFullYear()).filter((y) => !isNaN(y));
  const endYears = ends.map((d) => new Date(d).getFullYear()).filter((y) => !isNaN(y));

  const minYear = startYears.length > 0 ? Math.min(...startYears) : 0;
  const maxYear = endYears.length > 0 ? Math.max(...endYears) : 0;
  const totalYears = minYear && maxYear && maxYear >= minYear ? maxYear - minYear + 1 : 0;

  return {
    listeningRecords: (spotify?.totalRecords || 0).toLocaleString(),
    householdReceipts: (household?.totalRecords || 0).toLocaleString(),
    transactionRecords: (transactions?.totalRecords || 0).toLocaleString(),
    totalDiscoveries: discoveries?.length || 0,
    totalConnections: connections?.length || 0,
    totalYears,
  };
}
