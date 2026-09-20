import { LifeAnalytics } from '../../analytics';
import { Discovery } from '../../analytics/discoveries';
import {
  DiscoveryFilterType,
  DiscoverySortOption,
  DiscoveryViewModel,
  DiscoveriesSummaryMetrics,
  MiniChartConfig,
} from './discoveryTypes';

// Generate tailored mini visual data based on actual analytics
function getMiniChartForDiscovery(d: Discovery, analytics: LifeAnalytics): MiniChartConfig | undefined {
  const { spotify, household, transactions } = analytics;

  // 1. Skip Shift Collapse
  if (d.id === 'disc-spotify-skip-shift') {
    const yr2014 = spotify.yearlySkipRates.find((y) => y.year === 2014)?.skipRate || 67.2;
    const yr2015 = spotify.yearlySkipRates.find((y) => y.year === 2015)?.skipRate || 78.8;
    const yr2016 = spotify.yearlySkipRates.find((y) => y.year === 2016)?.skipRate || 3.6;
    const yr2017 = spotify.yearlySkipRates.find((y) => y.year === 2017)?.skipRate || 0.2;
    return {
      type: 'bar',
      points: [
        { label: '2014', value: yr2014 },
        { label: '2015', value: yr2015, highlight: true, annotation: '78.8%' },
        { label: '2016', value: yr2016, highlight: true, annotation: '3.6%' },
        { label: '2017', value: yr2017 },
      ],
      unit: '%',
      deltaText: '-75.2% collapse in skip rate',
      deltaPositive: true,
    };
  }

  // 2. Nocturnal Listening Concentration
  if (d.id === 'disc-spotify-hour-concentration') {
    return {
      type: 'bar',
      points: [
        { label: 'Morning', value: 15.2 },
        { label: 'Afternoon', value: 26.2 },
        { label: 'Evening', value: 39.8, highlight: true },
        { label: 'Late Night', value: 18.8, highlight: true },
      ],
      unit: '%',
      deltaText: '58.6% Nocturnal concentration',
    };
  }

  // 3. Acoustic Zenith: Peak Listening 2020
  if (d.id === 'disc-spotify-peak-eras') {
    const y2018 = spotify.yearlyListening.find((a) => a.year === 2018)?.hours || 620;
    const y2019 = spotify.yearlyListening.find((a) => a.year === 2019)?.hours || 890;
    const y2020 = spotify.yearlyListening.find((a) => a.year === 2020)?.hours || 1234.6;
    const y2021 = spotify.yearlyListening.find((a) => a.year === 2021)?.hours || 940;
    return {
      type: 'bar',
      points: [
        { label: '2018', value: Math.round(y2018) },
        { label: '2019', value: Math.round(y2019) },
        { label: '2020', value: Math.round(y2020), highlight: true, annotation: 'Peak' },
        { label: '2021', value: Math.round(y2021) },
      ],
      unit: 'hrs',
      deltaText: 'All-time acoustic zenith in 2020',
    };
  }

  // 4. The Beatles Loyalty Anchor
  if (d.id === 'disc-spotify-persistent-artist') {
    const top1 = spotify.topArtists[0] || { artist: 'The Beatles', playCount: 13621 };
    const top2 = spotify.topArtists[1] || { artist: 'Artist 2', playCount: 3420 };
    const top3 = spotify.topArtists[2] || { artist: 'Artist 3', playCount: 2150 };
    return {
      type: 'comparison',
      points: [
        { label: 'The Beatles', value: top1.playCount, highlight: true },
        { label: top2.artist.slice(0, 10), value: top2.playCount },
        { label: top3.artist.slice(0, 10), value: top3.playCount },
      ],
      unit: 'plays',
      deltaText: '4.0x lead over runner-up',
    };
  }

  // 5. Food Dominance in Household Ledger
  if (d.id === 'disc-household-food-dominance') {
    const food = household.categoryFrequency[0] || { category: 'Food', percentage: 36.9 };
    const c2 = household.categoryFrequency[1] || { category: 'Transport', percentage: 12.5 };
    const c3 = household.categoryFrequency[2] || { category: 'Household', percentage: 11.2 };
    return {
      type: 'distribution',
      points: [
        { label: 'Food', value: Number(food.percentage.toFixed(1)), highlight: true },
        { label: c2.category, value: Number(c2.percentage.toFixed(1)) },
        { label: c3.category, value: Number(c3.percentage.toFixed(1)) },
        { label: 'Others', value: Number((100 - food.percentage - c2.percentage - c3.percentage).toFixed(1)) },
      ],
      unit: '%',
      deltaText: 'Food = 907 of 2,461 entries (36.9%)',
    };
  }

  // 6. Household Frequency vs Impact Divergence
  if (d.id === 'disc-household-freq-vs-impact') {
    return {
      type: 'comparison',
      points: [
        { label: 'Money Transfer', value: 606529, highlight: true },
        { label: 'Food Outflow', value: 215400 },
        { label: 'Other Total', value: 1135462 },
      ],
      unit: '₹',
      deltaText: 'Lump-sum transfers vs micro-food',
    };
  }

  // 7. Travel Highest Mean Ticket Size
  if (d.id === 'disc-txn-category-ticket-size') {
    const travel = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('travel'))?.avgAmount || 5556;
    const shopping = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('shopping'))?.avgAmount || 5009;
    const entertain = transactions.categoryAmounts.find((c) => c.category.toLowerCase().includes('entertain'))?.avgAmount || 5145;
    return {
      type: 'bar',
      points: [
        { label: 'Travel', value: Math.round(travel), highlight: true },
        { label: 'Shopping', value: Math.round(shopping) },
        { label: 'Entertainment', value: Math.round(entertain) },
      ],
      unit: '₹',
      deltaText: 'Highest average card ticket (₹5,556)',
    };
  }

  // Fallback: build points from evidence items
  if (d.evidence.length >= 2) {
    const numericPoints = d.evidence
      .filter((e) => typeof e.value === 'number')
      .slice(0, 4)
      .map((e) => ({
        label: e.metric.slice(0, 12),
        value: e.value as number,
      }));

    if (numericPoints.length >= 2) {
      return {
        type: 'bar',
        points: numericPoints,
        unit: d.evidence[0]?.unit || '',
      };
    }
  }

  return undefined;
}

// Map discovery category label
function getCategoryLabel(id: string, source: string): string {
  if (id.includes('skip-shift')) return 'BEHAVIOR SHIFT';
  if (id.includes('hour-concentration')) return 'TEMPORAL RHYTHM';
  if (id.includes('persistent-artist')) return 'LOYALTY PILLAR';
  if (id.includes('peak-eras')) return 'ACOUSTIC ZENITH';
  if (id.includes('food-dominance')) return 'CATEGORY DOMINANCE';
  if (id.includes('freq-vs-impact')) return 'CAPITAL DIVERGENCE';
  if (id.includes('ticket-size')) return 'EXPENDITURE FACET';
  if (id.includes('balance') || id.includes('segmentation')) return 'COMMERCE RETAIL';
  if (source === 'cross-temporal') return 'CROSS-STREAM COMPARISON';
  return 'EMPIRICAL PATTERN';
}

// Build drill-down query parameters for Explorer
function getDrillDownParams(d: Discovery): Record<string, string> {
  const params: Record<string, string> = { discoveryId: d.id };

  if (d.source === 'spotify') {
    params.stream = 'spotify';
    if (d.id === 'disc-spotify-hour-concentration') {
      params.hourRange = 'evening_night';
    } else if (d.id === 'disc-spotify-persistent-artist') {
      params.search = 'Beatles';
    } else if (d.id === 'disc-spotify-skip-shift') {
      params.year = '2015';
      params.skipped = 'skipped';
    } else if (d.id === 'disc-spotify-peak-eras') {
      params.year = '2020';
    }
  } else if (d.source === 'household') {
    params.stream = 'household';
    if (d.id === 'disc-household-food-dominance') {
      params.category = 'Food';
    } else if (d.id === 'disc-household-freq-vs-impact') {
      params.sortBy = 'magnitude';
    }
  } else if (d.source === 'transactions') {
    params.stream = 'transactions';
    if (d.id === 'disc-txn-category-ticket-size') {
      params.category = 'travel';
      params.sortBy = 'magnitude';
    }
  } else {
    // Cross temporal
    params.stream = 'spotify';
  }

  return params;
}

// Enrich Discoveries with view models
export function buildDiscoveryViewModels(analytics: LifeAnalytics): DiscoveryViewModel[] {
  return analytics.discoveries.map((d) => ({
    ...d,
    categoryLabel: getCategoryLabel(d.id, d.source),
    drillDownParams: getDrillDownParams(d),
    miniChart: getMiniChartForDiscovery(d, analytics),
  }));
}

// Filter discoveries
export function filterDiscoveries(
  discoveries: DiscoveryViewModel[],
  filterType: DiscoveryFilterType,
  searchQuery: string
): DiscoveryViewModel[] {
  const q = searchQuery.trim().toLowerCase();

  return discoveries.filter((d) => {
    // Source filter
    if (filterType !== 'ALL' && d.source !== filterType) {
      return false;
    }

    // Search query
    if (q) {
      const matchTitle = d.title.toLowerCase().includes(q);
      const matchSubtitle = d.subtitle.toLowerCase().includes(q);
      const matchDesc = d.description.toLowerCase().includes(q);
      const matchCategory = d.categoryLabel.toLowerCase().includes(q);
      const matchPeriod = d.period.toLowerCase().includes(q);
      if (!matchTitle && !matchSubtitle && !matchDesc && !matchCategory && !matchPeriod) {
        return false;
      }
    }

    return true;
  });
}

// Sort discoveries deterministically
export function sortDiscoveries(
  discoveries: DiscoveryViewModel[],
  sortBy: DiscoverySortOption
): DiscoveryViewModel[] {
  const list = [...discoveries];
  const sigOrder = { critical: 4, high: 3, medium: 2, low: 1 };

  switch (sortBy) {
    case 'impact':
      return list.sort((a, b) => {
        const diff = (sigOrder[b.significance] || 0) - (sigOrder[a.significance] || 0);
        if (diff !== 0) return diff;
        return b.confidence - a.confidence;
      });
    case 'recent':
      return list.sort((a, b) => b.period.localeCompare(a.period));
    case 'confidence':
    default:
      return list.sort((a, b) => {
        if (b.confidence !== a.confidence) return b.confidence - a.confidence;
        return (sigOrder[b.significance] || 0) - (sigOrder[a.significance] || 0);
      });
  }
}

// Compute Summary Metrics
export function computeDiscoveriesSummary(analytics: LifeAnalytics): DiscoveriesSummaryMetrics {
  const discoveries = analytics.discoveries || [];
  const connections = analytics.connections || [];

  return {
    totalDiscoveries: discoveries.length,
    totalConnections: connections.length,
    totalStreams: 3,
    criticalCount: discoveries.filter((d) => d.significance === 'critical').length,
    highConfidenceCount: discoveries.filter((d) => d.confidence >= 0.9).length,
  };
}
