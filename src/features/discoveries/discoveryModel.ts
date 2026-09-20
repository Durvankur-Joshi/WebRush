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
    const yr2014 = spotify.yearlySkipRates?.find((y) => y.year === 2014);
    const yr2015 = spotify.yearlySkipRates?.find((y) => y.year === 2015);
    const yr2016 = spotify.yearlySkipRates?.find((y) => y.year === 2016);
    const yr2017 = spotify.yearlySkipRates?.find((y) => y.year === 2017);

    if (yr2015 && yr2016) {
      const delta = yr2015.skipRate - yr2016.skipRate;
      return {
        type: 'bar',
        points: [
          ...(yr2014 ? [{ label: '2014', value: yr2014.skipRate }] : []),
          { label: '2015', value: yr2015.skipRate, highlight: true, annotation: `${yr2015.skipRate.toFixed(1)}%` },
          { label: '2016', value: yr2016.skipRate, highlight: true, annotation: `${yr2016.skipRate.toFixed(1)}%` },
          ...(yr2017 ? [{ label: '2017', value: yr2017.skipRate }] : []),
        ],
        unit: '%',
        deltaText: `-${Math.abs(delta).toFixed(1)}% collapse in skip rate`,
        deltaPositive: true,
      };
    }
  }

  // 2. Nocturnal Listening Concentration
  if (d.id === 'disc-spotify-hour-concentration') {
    const morning = spotify.hourlyListening.filter((h) => h.hour >= 6 && h.hour < 12).reduce((s, h) => s + h.count, 0);
    const afternoon = spotify.hourlyListening.filter((h) => h.hour >= 12 && h.hour < 18).reduce((s, h) => s + h.count, 0);
    const evening = spotify.hourlyListening.filter((h) => h.hour >= 18 && h.hour <= 23).reduce((s, h) => s + h.count, 0);
    const night = spotify.hourlyListening.filter((h) => h.hour >= 0 && h.hour < 6).reduce((s, h) => s + h.count, 0);
    const total = morning + afternoon + evening + night;

    if (total > 0) {
      const nocturnalPct = Number((((evening + night) / total) * 100).toFixed(1));
      return {
        type: 'bar',
        points: [
          { label: 'Morning', value: Number(((morning / total) * 100).toFixed(1)) },
          { label: 'Afternoon', value: Number(((afternoon / total) * 100).toFixed(1)) },
          { label: 'Evening', value: Number(((evening / total) * 100).toFixed(1)), highlight: true },
          { label: 'Late Night', value: Number(((night / total) * 100).toFixed(1)), highlight: true },
        ],
        unit: '%',
        deltaText: `${nocturnalPct}% Nocturnal concentration`,
      };
    }
  }

  // 3. Acoustic Zenith: Peak Listening
  if (d.id === 'disc-spotify-peak-eras' && spotify.yearlyListening.length > 0) {
    const peak = spotify.yearlyListening.reduce((max, y) => (y.hours > max.hours ? y : max), spotify.yearlyListening[0]);
    const sorted = [...spotify.yearlyListening].sort((a, b) => a.year - b.year);
    const recentYears = sorted.slice(-4);
    return {
      type: 'bar',
      points: recentYears.map((y) => ({
        label: String(y.year),
        value: Math.round(y.hours),
        highlight: y.year === peak.year,
        annotation: y.year === peak.year ? 'Peak' : undefined,
      })),
      unit: 'hrs',
      deltaText: `All-time acoustic zenith in ${peak.year} (${Math.round(peak.hours).toLocaleString()} hrs)`,
    };
  }

  // 4. The Beatles / Persistent Artist Loyalty Anchor
  if (d.id === 'disc-spotify-persistent-artist' && spotify.topArtists.length > 0) {
    const top1 = spotify.topArtists[0];
    const top2 = spotify.topArtists[1];
    const top3 = spotify.topArtists[2];
    const leadRatio = top2 && top2.playCount > 0 ? (top1.playCount / top2.playCount).toFixed(1) : '1.0';
    return {
      type: 'comparison',
      points: [
        { label: top1.artist.slice(0, 14), value: top1.playCount, highlight: true },
        ...(top2 ? [{ label: top2.artist.slice(0, 14), value: top2.playCount }] : []),
        ...(top3 ? [{ label: top3.artist.slice(0, 14), value: top3.playCount }] : []),
      ],
      unit: 'plays',
      deltaText: `${leadRatio}x lead over runner-up`,
    };
  }

  // 5. Food Dominance in Household Ledger
  if (d.id === 'disc-household-food-dominance' && household.categoryFrequency.length > 0) {
    const top = household.categoryFrequency.slice(0, 3);
    const otherPct = Math.max(0, 100 - top.reduce((s, c) => s + c.percentage, 0));
    const food = top[0];
    return {
      type: 'distribution',
      points: [
        { label: food.category, value: Number(food.percentage.toFixed(1)), highlight: true },
        ...top.slice(1).map((c) => ({ label: c.category, value: Number(c.percentage.toFixed(1)) })),
        ...(otherPct > 0 ? [{ label: 'Others', value: Number(otherPct.toFixed(1)) }] : []),
      ],
      unit: '%',
      deltaText: `${food.category} = ${food.count.toLocaleString()} of ${household.totalRecords.toLocaleString()} entries (${food.percentage.toFixed(1)}%)`,
    };
  }

  // 6. Household Frequency vs Impact Divergence
  if (d.id === 'disc-household-freq-vs-impact' && household.categoryAmounts.length > 0) {
    const topAmounts = household.categoryAmounts.slice(0, 3);
    return {
      type: 'comparison',
      points: topAmounts.map((c, i) => ({
        label: c.category.slice(0, 14),
        value: Math.round(c.amount),
        highlight: i === 0,
      })),
      unit: '₹',
      deltaText: 'Lump-sum capital commitments vs recurring micro-expenses',
    };
  }

  // 7. Travel Highest Mean Ticket Size
  if (d.id === 'disc-txn-category-ticket-size' && transactions.categoryAmounts.length > 0) {
    const sorted = [...transactions.categoryAmounts].sort((a, b) => (b.avgAmount || 0) - (a.avgAmount || 0)).slice(0, 3);
    const leader = sorted[0];
    return {
      type: 'bar',
      points: sorted.map((c, i) => ({
        label: c.category.slice(0, 14),
        value: Math.round(c.avgAmount || 0),
        highlight: i === 0,
      })),
      unit: '₹',
      deltaText: leader ? `Highest average card ticket (INR ${Math.round(leader.avgAmount || 0).toLocaleString()})` : undefined,
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
