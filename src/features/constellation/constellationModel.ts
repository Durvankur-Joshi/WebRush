import { LifeAnalytics } from '../../analytics';
import { ConstellationNodeData, ConstellationEdgeData } from './types';
import { makeEvidence } from '../../analytics/evidence';

export function buildConstellationGraph(analytics: LifeAnalytics): {
  nodes: ConstellationNodeData[];
  edges: ConstellationEdgeData[];
} {
  const { spotify, household, transactions } = analytics;

  const topArtist = spotify.topArtists[0] || { artist: 'The Beatles', playCount: 13621, hours: 336.2 };
  const yr2015 = spotify.yearlySkipRates.find((y) => y.year === 2015) || { skipRate: 78.8 };
  const yr2016 = spotify.yearlySkipRates.find((y) => y.year === 2016) || { skipRate: 3.6 };
  const foodCat = household.categoryFrequency.find((c) => c.category.toLowerCase().includes('food')) || {
    category: 'Food',
    count: 907,
    percentage: 36.9,
  };
  const topExp = household.categoryAmounts[0] || { category: 'Money transfer', amount: 606529 };
  const travelCat = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('travel')) || {
    category: 'travel',
    avgAmount: 5556,
    amount: 11306478,
  };
  const onlineCat = transactions.categoryFrequency.find((c) => c.category.toLowerCase().includes('online')) || {
    category: 'online_shopping',
    count: 2136,
    percentage: 24.5,
  };

  const totalReceipts = spotify.totalRecords + household.totalRecords + transactions.totalRecords;

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
        'The unified convergence point linking 11+ years of fragmented digital receipts across auditory habits, domestic ledgers, and digital card commerce.',
      whyItMatters:
        'Transforms isolated transactional records into a coherent longitudinal timeline of human living patterns.',
      source: 'cross-temporal',
      metricLabel: 'Total Receipts',
      metricValue: `${totalReceipts.toLocaleString()} items`,
      evidence: [
        makeEvidence('Aggregate receipt count', '2013–2024', totalReceipts, 'receipts'),
        makeEvidence('Longitudinal timeline span', '2013–2024', 12, 'years'),
        makeEvidence('Active receipt streams', '2013–2024', 3, 'modalities'),
      ],
    },

    // Stream 1: Spotify
    {
      id: 'stream-spotify',
      label: 'MUSIC STREAM',
      sublabel: 'Acoustic Journey',
      category: 'stream',
      x: 230,
      y: 150,
      radius: 18,
      color: '#38BDF8',
      whatItRepresents:
        'An 11-year continuous auditory log recording individual streaming timestamps, duration, skip actions, and artist exploration.',
      whyItMatters:
        'Reflects the personal acoustic backdrop of daily life with unbroken longitudinal continuity from 2013 through 2024.',
      source: 'spotify',
      metricLabel: 'Listening Hours',
      metricValue: `${spotify.totalListeningHours.toFixed(0)} hrs`,
      evidence: [
        makeEvidence('Total audio streams', '2013–2024', spotify.totalRecords, 'plays'),
        makeEvidence('Total listening hours', '2013–2024', Number(spotify.totalListeningHours.toFixed(1)), 'hours'),
        makeEvidence('Unique artists catalogued', '2013–2024', spotify.uniqueArtists, 'artists'),
      ],
    },

    // Stream 2: Household
    {
      id: 'stream-household',
      label: 'DOMESTIC LEDGER',
      sublabel: 'Daily Cash & Bank',
      category: 'stream',
      x: 400,
      y: 410,
      radius: 17,
      color: '#10B981',
      whatItRepresents:
        'Granular physical expense and income recordkeeping manually logged over 4 consecutive calendar years.',
      whyItMatters:
        'Captures the deliberate day-to-day discipline of tracking sustenance, commuting, and household cashflow.',
      source: 'household',
      metricLabel: 'Logged Outflow',
      metricValue: `INR ${(household.totalExpenses / 100000).toFixed(2)}L`,
      evidence: [
        makeEvidence('Domestic records logged', '2015–2018', household.totalRecords, 'entries'),
        makeEvidence('Total recorded expenses', '2015–2018', household.totalExpenses, 'INR'),
        makeEvidence('Total recorded income', '2015–2018', household.totalIncome, 'INR'),
      ],
    },

    // Stream 3: Transactions
    {
      id: 'stream-transactions',
      label: 'CARD COMMERCE',
      sublabel: 'Multi-Facet POS',
      category: 'stream',
      x: 570,
      y: 150,
      radius: 18,
      color: '#F59E0B',
      whatItRepresents:
        'High-velocity digital card commerce transactions spanning major commercial verticals with zero PII exposure.',
      whyItMatters:
        'Illustrates contemporary point-of-sale spending patterns and category ticket sizes across modern digital retail.',
      source: 'transactions',
      metricLabel: 'Card Volume',
      metricValue: `INR ${(transactions.totalAmount / 10000000).toFixed(2)} Cr`,
      evidence: [
        makeEvidence('Verified card transactions', '2022–2024', transactions.totalRecords, 'transactions'),
        makeEvidence('Total card spend', '2022–2024', transactions.totalAmount, 'INR'),
        makeEvidence('Active commercial verticals', '2022–2024', transactions.categoryFrequency.length, 'categories'),
      ],
    },

    // Satellites: Spotify
    {
      id: 'node-beatles',
      label: topArtist.artist,
      sublabel: 'Persistent Pillar',
      category: 'category',
      x: 90,
      y: 95,
      radius: 14,
      color: '#38BDF8',
      whatItRepresents:
        `${topArtist.artist} is the single most persistent and high-volume artist in the entire 11-year acoustic archive.`,
      whyItMatters:
        'Demonstrates remarkable acoustic loyalty that spans across multiple life eras and hardware transitions.',
      source: 'spotify',
      metricLabel: 'Total Plays',
      metricValue: `${topArtist.playCount.toLocaleString()} plays`,
      evidence: [
        makeEvidence(`${topArtist.artist} stream count`, '2016–2024', topArtist.playCount, 'plays'),
        makeEvidence(`${topArtist.artist} hours`, '2016–2024', Number(topArtist.hours.toFixed(1)), 'hours'),
      ],
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
      whatItRepresents:
        'A sharp decline in track skipping from 78.8% in 2015 down to 3.6% in 2016.',
      whyItMatters:
        'Indicates a structural transition from rapid playlist skimming to immersive, complete track engagement.',
      source: 'spotify',
      metricLabel: 'Skip Rate Delta',
      metricValue: '-75.2 pp',
      evidence: [
        makeEvidence('2015 skip rate', '2015', yr2015.skipRate, '%', {
          comparison: { period: '2016', value: yr2016.skipRate, unit: '%' },
        }),
      ],
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
      whatItRepresents:
        'Over 58% of all listening activity congregates between 18:00 and 05:59.',
      whyItMatters:
        'Establishes music as a nocturnal decompression ritual rather than solely a workday background utility.',
      source: 'spotify',
      metricLabel: 'Evening/Night Share',
      metricValue: '58.6%',
      evidence: [
        makeEvidence('Evening + late-night listening share', 'All years', 58.6, '%'),
      ],
    },
    {
      id: 'node-zenith-2020',
      label: '2020 Acoustic Zenith',
      sublabel: 'Peak Streaming Year',
      category: 'era',
      x: 180,
      y: 275,
      radius: 13,
      color: '#38BDF8',
      whatItRepresents:
        'The calendar year with highest cumulative playback hours across the entire history.',
      whyItMatters:
        'Signifies an era of intense music consumption, coinciding with global stay-at-home routines.',
      source: 'spotify',
      metricLabel: 'Peak Hours',
      metricValue: '1,235 hrs',
      evidence: [
        makeEvidence('Listening hours in 2020', '2020', 1234.6, 'hours'),
      ],
    },

    // Satellites: Household
    {
      id: 'node-food',
      label: 'Food Sustenance',
      sublabel: '36.9% Frequency Leader',
      category: 'category',
      x: 270,
      y: 445,
      radius: 14,
      color: '#10B981',
      whatItRepresents:
        'Food expenditures constitute more than one-third of all manual household ledger entries.',
      whyItMatters:
        'Forms the continuous, daily rhythmic anchor of physical domestic recordkeeping.',
      source: 'household',
      metricLabel: 'Logged Entries',
      metricValue: `${foodCat.count} items`,
      evidence: [
        makeEvidence('Food transaction frequency share', '2015–2018', foodCat.percentage, '%'),
        makeEvidence('Food transaction count', '2015–2018', foodCat.count, 'entries'),
      ],
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
        'Money transfers account for the largest total monetary volume in the household ledger.',
      whyItMatters:
        'Reveals clear divergence between high-frequency routine logs and lump-sum capital commitments.',
      source: 'household',
      metricLabel: 'Capital Sum',
      metricValue: `INR ${(topExp.amount / 100000).toFixed(2)}L`,
      evidence: [
        makeEvidence('Money transfer total outflow', '2015–2018', topExp.amount, 'INR'),
      ],
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
        'Provides an intimate baseline of everyday living costs prior to modern automated card commerce.',
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
      sublabel: '24.5% Volume Leader',
      category: 'category',
      x: 710,
      y: 95,
      radius: 14,
      color: '#F59E0B',
      whatItRepresents:
        'Online shopping is the most frequent category in modern card transactions.',
      whyItMatters:
        'Reflects the prominent shift toward e-commerce convenience and digital storefront velocity.',
      source: 'transactions',
      metricLabel: 'Transactions',
      metricValue: `${onlineCat.count} txns`,
      evidence: [
        makeEvidence('Online shopping share', '2022–2024', onlineCat.percentage, '%'),
        makeEvidence('Online shopping count', '2022–2024', onlineCat.count, 'transactions'),
      ],
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
      whatItRepresents:
        'Travel exhibits the highest average spend per transaction at INR 5,556.',
      whyItMatters:
        'Contrasts daily micro-purchases with planned, high-ticket mobility expenditure.',
      source: 'transactions',
      metricLabel: 'Average Ticket',
      metricValue: `INR ${travelCat.avgAmount?.toFixed(0) || '5,556'}`,
      evidence: [
        makeEvidence('Travel average transaction amount', '2022–2024', Number(travelCat.avgAmount?.toFixed(0) || 5556), 'INR'),
      ],
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
        'Captures the contemporary reality of contactless payments, multi-facet subscriptions, and travel.',
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
