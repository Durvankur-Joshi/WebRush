import { LifeAnalytics } from '../../analytics';
import { ConstellationNodeData, ConstellationEdgeData } from './types';
import { makeEvidence } from '../../analytics/evidence';

export function buildConstellationGraph(analytics: LifeAnalytics): {
  nodes: ConstellationNodeData[];
  edges: ConstellationEdgeData[];
} {
  const { spotify, household, transactions } = analytics;

  const topArtist = spotify.topArtists?.[0];
  const yr2015 = spotify.yearlySkipRates?.find((y) => y.year === 2015);
  const yr2016 = spotify.yearlySkipRates?.find((y) => y.year === 2016);
  const peakYear = (spotify.yearlyListening && spotify.yearlyListening.length > 0)
    ? spotify.yearlyListening.reduce((max, y) => (y.hours > max.hours ? y : max), spotify.yearlyListening[0])
    : undefined;

  const foodCat = household.categoryFrequency?.find((c) => c.category.toLowerCase().includes('food')) || household.categoryFrequency?.[0];
  const topExp = household.categoryAmounts?.[0];
  const travelCat = transactions.categoryAmounts?.find((c) => c.category.toLowerCase().includes('travel')) || transactions.categoryAmounts?.[0];
  const onlineCat = transactions.categoryFrequency?.find((c) => c.category.toLowerCase().includes('online')) || transactions.categoryFrequency?.[0];

  const eveningPlays = spotify.hourlyListening
    .filter((h) => h.hour >= 18 && h.hour <= 23)
    .reduce((sum, h) => sum + h.count, 0);
  const nightPlays = spotify.hourlyListening
    .filter((h) => h.hour >= 0 && h.hour <= 5)
    .reduce((sum, h) => sum + h.count, 0);
  const totalHourlyPlays = spotify.hourlyListening.reduce((sum, h) => sum + h.count, 0);
  const nocturnalPct = totalHourlyPlays > 0 ? Number((((eveningPlays + nightPlays) / totalHourlyPlays) * 100).toFixed(1)) : 0;
  const skipDelta = yr2015 && yr2016 ? yr2015.skipRate - yr2016.skipRate : 0;

  const totalReceipts = (spotify?.totalRecords || 0) + (household?.totalRecords || 0) + (transactions?.totalRecords || 0);

  const nodes: ConstellationNodeData[] = [
    // Center Node
    {
      id: 'node-life',
      label: 'LIFELINE',
      sublabel: 'Macro Observatory Core',
      category: 'center',
      x: 400,
      y: 260,
      radius: 22,
      color: '#38BDF8',
      pulse: true,
      whatItRepresents:
        'The unified convergence point linking longitudinal digital receipts across auditory habits, domestic ledgers, and digital card commerce.',
      whyItMatters:
        'Transforms isolated transactional records into a coherent longitudinal timeline of human living patterns.',
      source: 'cross-temporal',
      metricLabel: 'Total Receipts',
      metricValue: `${totalReceipts.toLocaleString()} items`,
      evidence: [
        makeEvidence('Aggregate multi-stream receipts', 'All periods', totalReceipts, 'records'),
        makeEvidence('Multi-modal data streams', 'All periods', 3, 'streams'),
        makeEvidence('Verified algorithmic discoveries', 'All periods', analytics.discoveries.length, 'discoveries'),
      ],
    },

    // Stream Anchors
    {
      id: 'stream-spotify',
      label: 'Music Stream',
      sublabel: 'Auditory History',
      category: 'stream',
      x: 200,
      y: 150,
      radius: 17,
      color: '#38BDF8',
      whatItRepresents:
        'Streaming history detailing timestamps, tracks, artists, and playback duration.',
      whyItMatters:
        'Serves as the longest temporal baseline spanning over a decade of continuous daily listening telemetry.',
      source: 'spotify',
      metricLabel: 'Streams',
      metricValue: `${spotify.totalRecords.toLocaleString()} plays`,
      evidence: [
        makeEvidence('Spotify total play count', '2013–2024', spotify.totalRecords, 'plays'),
        makeEvidence('Spotify unique tracks', '2013–2024', spotify.uniqueTracks, 'tracks'),
        makeEvidence('Total listening hours', '2013–2024', Math.round(spotify.totalListeningHours), 'hours'),
      ],
    },
    {
      id: 'stream-household',
      label: 'Domestic Ledger',
      sublabel: 'Physical Accounting',
      category: 'stream',
      x: 400,
      y: 390,
      radius: 17,
      color: '#10B981',
      whatItRepresents:
        'Manual cashflow entries recording granular everyday domestic transactions.',
      whyItMatters:
        'Captures deliberate, conscious personal accounting habits prior to widespread contactless payment adoption.',
      source: 'household',
      metricLabel: 'Entries',
      metricValue: `${household.totalRecords.toLocaleString()} txns`,
      evidence: [
        makeEvidence('Household ledger entries', '2015–2018', household.totalRecords, 'entries'),
        makeEvidence('Household total logged outflow', '2015–2018', household.totalExpenses, 'INR'),
      ],
    },
    {
      id: 'stream-transactions',
      label: 'Card Commerce',
      sublabel: 'Point-of-Sale POS',
      category: 'stream',
      x: 600,
      y: 160,
      radius: 17,
      color: '#F59E0B',
      whatItRepresents:
        'High-velocity card transaction records with sanitized merchant verticals.',
      whyItMatters:
        'Illustrates contemporary multi-channel spending velocity with zero PII exposure.',
      source: 'transactions',
      metricLabel: 'Purchases',
      metricValue: `${transactions.totalRecords.toLocaleString()} txns`,
      evidence: [
        makeEvidence('Card transaction volume', '2022–2024', transactions.totalRecords, 'transactions'),
        makeEvidence('Card commerce turnover', '2022–2024', transactions.totalAmount, 'INR'),
      ],
    },

    // Satellites: Spotify
    {
      id: 'node-top-artist',
      label: topArtist?.artist || 'Top Artist',
      sublabel: 'Enduring Loyalty Anchor',
      category: 'category',
      x: 80,
      y: 110,
      radius: 14,
      color: '#60A5FA',
      whatItRepresents: topArtist
        ? `The single most streamed artist across multi-year listening, totaling ${topArtist.playCount.toLocaleString()} playback events.`
        : 'Primary multi-year loyalty artist.',
      whyItMatters:
        'Represents acoustic consistency across temporal transitions in the observation period.',
      source: 'spotify',
      metricLabel: 'Streams',
      metricValue: topArtist ? `${topArtist.playCount.toLocaleString()} plays` : '0 plays',
      evidence: topArtist ? [
        makeEvidence(`${topArtist.artist} stream count`, 'All years', topArtist.playCount, 'plays'),
        makeEvidence(`${topArtist.artist} hours`, 'All years', Number(topArtist.hours.toFixed(1)), 'hours'),
      ] : [],
    },
    {
      id: 'node-skip-shift',
      label: 'Skip Behavior Shift',
      sublabel: '2015–2016 Transition',
      category: 'discovery',
      x: 230,
      y: 45,
      radius: 14,
      color: '#EC4899',
      whatItRepresents: yr2015 && yr2016
        ? `A sharp decline in track skipping from ${yr2015.skipRate.toFixed(1)}% in 2015 down to ${yr2016.skipRate.toFixed(1)}% in 2016.`
        : 'A structural drop in track skip rate.',
      whyItMatters:
        'Indicates an observable transition from rapid playlist skimming to sustained, complete track engagement.',
      source: 'spotify',
      metricLabel: 'Skip Rate Delta',
      metricValue: yr2015 && yr2016 ? `-${Math.abs(skipDelta).toFixed(1)} pp` : '0 pp',
      evidence: yr2015 && yr2016 ? [
        makeEvidence('2015 skip rate', '2015', yr2015.skipRate, '%', {
          comparison: { period: '2016', value: yr2016.skipRate, unit: '%' },
        }),
      ] : [],
    },
    {
      id: 'node-night-listening',
      label: 'Nocturnal Cadence',
      sublabel: 'Evening Concentration',
      category: 'discovery',
      x: 110,
      y: 220,
      radius: 13,
      color: '#818CF8',
      whatItRepresents: nocturnalPct > 0
        ? `${nocturnalPct}% of all listening activity congregates between 18:00 and 05:59.`
        : 'Listening activity congregates predominantly in evening and nocturnal hours.',
      whyItMatters:
        'Observed temporal concentration highlights consistent evening and nocturnal listening intervals.',
      source: 'spotify',
      metricLabel: 'Evening/Night Share',
      metricValue: `${nocturnalPct}%`,
      evidence: [
        makeEvidence('Evening + late-night listening share', 'All years', nocturnalPct, '%'),
      ],
    },
    {
      id: 'node-zenith-2020',
      label: peakYear ? `${peakYear.year} Acoustic Zenith` : 'Acoustic Zenith',
      sublabel: 'Peak Streaming Year',
      category: 'era',
      x: 180,
      y: 275,
      radius: 13,
      color: '#38BDF8',
      whatItRepresents:
        'The calendar year with highest cumulative playback hours across the entire history.',
      whyItMatters:
        'Recorded the highest annual cumulative playback hours across the observation window.',
      source: 'spotify',
      metricLabel: 'Peak Hours',
      metricValue: peakYear ? `${Math.round(peakYear.hours).toLocaleString()} hrs` : '0 hrs',
      evidence: peakYear ? [
        makeEvidence(`Listening hours in ${peakYear.year}`, String(peakYear.year), Number(peakYear.hours.toFixed(1)), 'hours'),
      ] : [],
    },

    // Satellites: Household
    {
      id: 'node-food',
      label: 'Food Sustenance',
      sublabel: foodCat ? `${foodCat.percentage.toFixed(1)}% Frequency Leader` : 'Frequency Leader',
      category: 'category',
      x: 270,
      y: 445,
      radius: 14,
      color: '#10B981',
      whatItRepresents:
        'Food expenditures constitute the primary volume share of manual household ledger entries.',
      whyItMatters:
        'Forms the continuous, daily rhythmic anchor of physical domestic recordkeeping.',
      source: 'household',
      metricLabel: 'Logged Entries',
      metricValue: foodCat ? `${foodCat.count.toLocaleString()} items` : '0 items',
      evidence: foodCat ? [
        makeEvidence(`${foodCat.category} transaction frequency share`, '2015–2018', foodCat.percentage, '%'),
        makeEvidence(`${foodCat.category} transaction count`, '2015–2018', foodCat.count, 'entries'),
      ] : [],
    },
    {
      id: 'node-money-transfer',
      label: 'Capital Outflow',
      sublabel: 'Highest Monetary Weight',
      category: 'category',
      x: 530,
      y: 445,
      radius: 14,
      color: '#10B981',
      whatItRepresents:
        'Large transfers account for the highest total monetary volume in the domestic ledger.',
      whyItMatters:
        'Reveals clear divergence between high-frequency routine logs and lump-sum capital commitments.',
      source: 'household',
      metricLabel: 'Capital Sum',
      metricValue: topExp ? `INR ${(topExp.amount / 100000).toFixed(2)}L` : 'INR 0L',
      evidence: topExp ? [
        makeEvidence(`${topExp.category} total outflow`, '2015–2018', topExp.amount, 'INR'),
      ] : [],
    },
    {
      id: 'node-household-era',
      label: 'Domestic Era',
      sublabel: '2015–2018 Ledger',
      category: 'era',
      x: 400,
      y: 485,
      radius: 11,
      color: '#34D399',
      whatItRepresents:
        'The physical ledger window spanning four years of intentional domestic accounting.',
      whyItMatters:
        'Provides a baseline of everyday living costs prior to modern automated card commerce.',
      source: 'household',
      metricLabel: 'Years Logged',
      metricValue: '4 Years',
      evidence: [
        makeEvidence('Ledger recordkeeping span', '2015–2018', 4, 'years'),
      ],
    },

    // Satellites: Transactions
    {
      id: 'node-online-shopping',
      label: 'Digital Shopping',
      sublabel: onlineCat ? `${onlineCat.percentage.toFixed(1)}% Volume Leader` : 'Volume Leader',
      category: 'category',
      x: 710,
      y: 95,
      radius: 14,
      color: '#F59E0B',
      whatItRepresents:
        'Online shopping is the most frequent category in modern card transactions.',
      whyItMatters:
        'Reflects recurring e-commerce transactions across digital storefronts.',
      source: 'transactions',
      metricLabel: 'Transactions',
      metricValue: onlineCat ? `${onlineCat.count.toLocaleString()} txns` : '0 txns',
      evidence: onlineCat ? [
        makeEvidence(`${onlineCat.category} share`, '2022–2024', onlineCat.percentage, '%'),
        makeEvidence(`${onlineCat.category} count`, '2022–2024', onlineCat.count, 'transactions'),
      ] : [],
    },
    {
      id: 'node-travel-ticket',
      label: 'Travel Outflows',
      sublabel: 'Highest Avg Ticket',
      category: 'category',
      x: 700,
      y: 220,
      radius: 14,
      color: '#F59E0B',
      whatItRepresents: travelCat
        ? `Travel exhibits the highest average spend per transaction at INR ${Math.round(travelCat.avgAmount || 0).toLocaleString()}.`
        : 'High-ticket expenditure category in card commerce.',
      whyItMatters:
        'Contrasts daily micro-purchases with higher ticket mobility expenditure.',
      source: 'transactions',
      metricLabel: 'Average Ticket',
      metricValue: travelCat ? `INR ${Math.round(travelCat.avgAmount || 0).toLocaleString()}` : 'INR 0',
      evidence: travelCat ? [
        makeEvidence('Travel average transaction amount', '2022–2024', Math.round(travelCat.avgAmount || 0), 'INR'),
      ] : [],
    },
    {
      id: 'node-card-era',
      label: 'Digital POS Era',
      sublabel: '2022–2024 Commerce',
      category: 'era',
      x: 625,
      y: 275,
      radius: 11,
      color: '#FCD34D',
      whatItRepresents:
        'Two continuous years of high-velocity card transactions with safe geographic aggregates.',
      whyItMatters:
        'Captures contemporary card payment telemetry across multiple commercial verticals.',
      source: 'transactions',
      metricLabel: 'Date Span',
      metricValue: '2022–2024',
      evidence: [
        makeEvidence('Card commerce temporal span', '2022–2024', 2, 'years'),
      ],
    },
  ];

  const edges: ConstellationEdgeData[] = [
    // Core Backbone
    { id: 'edge-life-spotify', source: 'node-life', target: 'stream-spotify', color: '#38BDF8', strength: 0.95 },
    { id: 'edge-life-household', source: 'node-life', target: 'stream-household', color: '#10B981', strength: 0.9 },
    { id: 'edge-life-transactions', source: 'node-life', target: 'stream-transactions', color: '#F59E0B', strength: 0.9 },

    // Spotify Tree
    { id: 'edge-spotify-beatles', source: 'stream-spotify', target: 'node-beatles', color: '#38BDF8', strength: 0.88 },
    { id: 'edge-spotify-skip', source: 'stream-spotify', target: 'node-skip-shift', color: '#EC4899', strength: 0.95 },
    { id: 'edge-spotify-night', source: 'stream-spotify', target: 'node-night-listening', color: '#818CF8', strength: 0.8 },
    { id: 'edge-spotify-zenith', source: 'stream-spotify', target: 'node-zenith-2020', color: '#38BDF8', strength: 0.85 },

    // Household Tree
    { id: 'edge-household-food', source: 'stream-household', target: 'node-food', color: '#10B981', strength: 0.92 },
    { id: 'edge-household-transfer', source: 'stream-household', target: 'node-money-transfer', color: '#10B981', strength: 0.85 },
    { id: 'edge-household-era', source: 'stream-household', target: 'node-household-era', color: '#34D399', strength: 0.8 },

    // Transactions Tree
    { id: 'edge-transactions-online', source: 'stream-transactions', target: 'node-online-shopping', color: '#F59E0B', strength: 0.88 },
    { id: 'edge-transactions-travel', source: 'stream-transactions', target: 'node-travel-ticket', color: '#F59E0B', strength: 0.86 },
    { id: 'edge-transactions-era', source: 'stream-transactions', target: 'node-card-era', color: '#FCD34D', strength: 0.8 },

    // Cross-Temporal Comparisons (Strictly labeled without false causality)
    {
      id: 'edge-comparison-domestic',
      source: 'node-zenith-2020',
      target: 'node-household-era',
      dashed: true,
      color: '#64748B',
      label: 'Temporal Comparison',
      isTemporalComparison: true,
      strength: 0.65,
    },
    {
      id: 'edge-comparison-commerce',
      source: 'node-card-era',
      target: 'node-life',
      dashed: true,
      color: '#64748B',
      label: 'Temporal Comparison',
      isTemporalComparison: true,
      strength: 0.65,
    },
  ];

  return { nodes, edges };
}
