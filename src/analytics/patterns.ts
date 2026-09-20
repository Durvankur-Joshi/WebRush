import { SpotifyAnalytics } from './spotify';
import { HouseholdAnalytics } from './household';
import { TransactionAnalytics } from './transactions';
import { EvidenceItem, EvidenceSource, makeEvidence } from './evidence';
import { detectChangePoint } from './temporal';

export type PatternType = 'TREND' | 'SHIFT' | 'CONCENTRATION' | 'PERSISTENCE' | 'ANOMALY' | 'RHYTHM' | 'COMPARISON';

export interface Pattern {
  id: string;
  type: PatternType;
  title: string;
  summary: string;
  source: EvidenceSource;
  significance: 'critical' | 'high' | 'medium' | 'low';
  evidence: EvidenceItem[];
  period: string;
}

function spotifyPatterns(s: SpotifyAnalytics): Pattern[] {
  const patterns: Pattern[] = [];
  if (!s.totalRecords) return patterns;

  // 1. Listening era peaks
  const peakYear = s.yearlyListening.reduce((best, y) =>
    y.hours > (best?.hours ?? 0) ? y : best, s.yearlyListening[0]);
  if (peakYear) {
    patterns.push({
      id: 'spotify-peak-year',
      type: 'TREND',
      title: `Peak Listening Year: ${peakYear.year}`,
      summary: `${peakYear.year} records the highest single-year listening duration at ${peakYear.hours.toFixed(0)} hours (${peakYear.playCount.toLocaleString()} plays).`,
      source: 'spotify',
      significance: 'high',
      period: String(peakYear.year),
      evidence: [makeEvidence('Listening hours', String(peakYear.year), peakYear.hours, 'hours', { sampleSize: peakYear.playCount })],
    });
  }

  // 2. Night vs. daytime listening
  const eveningHours = s.hourlyListening.filter((h) => h.hour >= 18 && h.hour <= 23);
  const nightHours = s.hourlyListening.filter((h) => h.hour >= 0 && h.hour <= 5);
  const totalPlays = s.hourlyListening.reduce((sum, h) => sum + h.count, 0);
  const eveningPlays = eveningHours.reduce((sum, h) => sum + h.count, 0);
  const nightPlays = nightHours.reduce((sum, h) => sum + h.count, 0);
  const lateNightShare = Number(((eveningPlays + nightPlays) / Math.max(1, totalPlays) * 100).toFixed(1));

  if (lateNightShare > 35) {
    patterns.push({
      id: 'spotify-night-listening',
      type: 'RHYTHM',
      title: 'Evening & Late-Night Listening Concentration',
      summary: `${lateNightShare}% of all streaming activity occurs during evening (18:00–23:59) and late-night (00:00–05:59) hours.`,
      source: 'spotify',
      significance: lateNightShare > 50 ? 'high' : 'medium',
      period: `${s.dateRange.start.slice(0, 4)}–${s.dateRange.end.slice(0, 4)}`,
      evidence: [
        makeEvidence('Evening + late-night listening share', 'All years', lateNightShare, '%', { sampleSize: totalPlays }),
        makeEvidence('Evening plays (18:00–23:59)', 'All years', eveningPlays, 'plays'),
        makeEvidence('Late-night plays (00:00–05:59)', 'All years', nightPlays, 'plays'),
      ],
    });
  }

  // 3. Skip behavior shift
  const yearlySkips = s.yearlySkipRates.filter((y) => y.year >= 2013);
  const skipValues = yearlySkips.map((y) => y.skipRate);
  const changeIdxs = detectChangePoint(skipValues, 40);
  if (changeIdxs.length > 0) {
    const idx = changeIdxs[0]!;
    const prevYear = yearlySkips[idx - 1];
    const currYear = yearlySkips[idx];
    if (prevYear && currYear) {
      const diff = currYear.skipRate - prevYear.skipRate;
      patterns.push({
        id: 'spotify-skip-shift',
        type: 'SHIFT',
        title: `Major Skip Behavior Shift: ${prevYear.year}→${currYear.year}`,
        summary: `Skip rate changed from ${prevYear.skipRate.toFixed(1)}% in ${prevYear.year} to ${currYear.skipRate.toFixed(1)}% in ${currYear.year} — a ${Math.abs(diff).toFixed(1)} percentage point ${diff > 0 ? 'increase' : 'decrease'}.`,
        source: 'spotify',
        significance: 'high',
        period: `${prevYear.year}–${currYear.year}`,
        evidence: [
          makeEvidence('Skip rate', String(prevYear.year), prevYear.skipRate, '%', { sampleSize: s.yearlySkippedCounts.find((y) => y.year === prevYear.year)?.total }),
          makeEvidence('Skip rate', String(currYear.year), currYear.skipRate, '%', {
            sampleSize: s.yearlySkippedCounts.find((y) => y.year === currYear.year)?.total,
            comparison: { period: String(prevYear.year), value: prevYear.skipRate, unit: '%' },
          }),
        ],
      });
    }
  }

  // 4. Artist dominance
  if (s.topArtists.length > 0) {
    const top1 = s.topArtists[0]!;
    const top3PlayCount = s.topArtists.slice(0, 3).reduce((sum, a) => sum + a.playCount, 0);
    const top3Share = Number((top3PlayCount / Math.max(1, s.totalRecords) * 100).toFixed(1));
    patterns.push({
      id: 'spotify-artist-dominance',
      type: 'CONCENTRATION',
      title: `Dominant Artist: ${top1.artist}`,
      summary: `${top1.artist} leads with ${top1.playCount.toLocaleString()} plays. The top 3 artists collectively account for ${top3Share}% of total streaming activity.`,
      source: 'spotify',
      significance: top3Share > 25 ? 'high' : 'medium',
      period: `${top1.firstYear}–${top1.lastYear}`,
      evidence: [
        makeEvidence('Play count', `${top1.firstYear}–${top1.lastYear}`, top1.playCount, 'plays', { sampleSize: s.totalRecords }),
        makeEvidence('Top 3 artists share', 'All years', top3Share, '%'),
      ],
    });
  }

  // 5. Artist persistence
  const persistentArtists = s.topArtists.filter((a) => a.yearsActive >= 5).slice(0, 3);
  if (persistentArtists.length > 0) {
    patterns.push({
      id: 'spotify-artist-persistence',
      type: 'PERSISTENCE',
      title: `${persistentArtists.length} Artists Active Across 5+ Years`,
      summary: `${persistentArtists.map((a) => a.artist).join(', ')} appear consistently across at least 5 years of the listening record.`,
      source: 'spotify',
      significance: 'medium',
      period: `${s.dateRange.start.slice(0, 4)}–${s.dateRange.end.slice(0, 4)}`,
      evidence: persistentArtists.map((a) =>
        makeEvidence(`${a.artist} active years`, `${a.firstYear}–${a.lastYear}`, a.yearsActive, 'years', { sampleSize: a.playCount })
      ),
    });
  }

  // 6. Listening diversification
  const diversYears = s.yearlyListening.filter((y) => y.uniqueArtists > 0);
  if (diversYears.length >= 2) {
    const firstYr = diversYears[0]!;
    const lastYr = diversYears[diversYears.length - 1]!;
    const artistsGrowth = Number(((lastYr.uniqueArtists - firstYr.uniqueArtists) / Math.max(1, firstYr.uniqueArtists) * 100).toFixed(1));
    if (Math.abs(artistsGrowth) > 20) {
      patterns.push({
        id: 'spotify-diversification',
        type: 'TREND',
        title: artistsGrowth > 0 ? 'Expanding Artist Catalogue' : 'Narrowing Artist Focus',
        summary: `Unique artists per year changed from ${firstYr.uniqueArtists} (${firstYr.year}) to ${lastYr.uniqueArtists} (${lastYr.year}), a ${Math.abs(artistsGrowth)}% ${artistsGrowth > 0 ? 'increase' : 'decrease'}.`,
        source: 'spotify',
        significance: 'medium',
        period: `${firstYr.year}–${lastYr.year}`,
        evidence: [
          makeEvidence('Unique artists', String(firstYr.year), firstYr.uniqueArtists, 'artists'),
          makeEvidence('Unique artists', String(lastYr.year), lastYr.uniqueArtists, 'artists'),
        ],
      });
    }
  }

  // 7. Platform evolution
  if (s.platformDistribution.length > 1) {
    const top = s.platformDistribution[0]!;
    if (top.percentage > 60) {
      patterns.push({
        id: 'spotify-platform-dominance',
        type: 'CONCENTRATION',
        title: `Platform Concentration: ${top.platform}`,
        summary: `${top.platform} accounts for ${top.percentage}% of all listening sessions across the full dataset period.`,
        source: 'spotify',
        significance: 'low',
        period: `${s.dateRange.start.slice(0, 4)}–${s.dateRange.end.slice(0, 4)}`,
        evidence: [makeEvidence(`${top.platform} session share`, 'All years', top.percentage, '%', { sampleSize: top.count })],
      });
    }
  }

  return patterns;
}

function householdPatterns(h: HouseholdAnalytics): Pattern[] {
  const patterns: Pattern[] = [];
  if (!h.totalRecords) return patterns;

  // 1. Most frequent category
  const topFreqCat = h.categoryFrequency[0];
  if (topFreqCat) {
    patterns.push({
      id: 'household-freq-primacy',
      type: 'CONCENTRATION',
      title: `Transaction Frequency Leader: ${topFreqCat.category}`,
      summary: `${topFreqCat.category} accounts for the highest transaction frequency at ${topFreqCat.percentage}% of all ledger entries.`,
      source: 'household',
      significance: topFreqCat.percentage > 30 ? 'high' : 'medium',
      period: `${h.dateRange.start.slice(0, 4)}–${h.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Transaction frequency', 'All years', topFreqCat.percentage, '%', { sampleSize: topFreqCat.count })],
    });
  }

  // 2. Highest-value category
  const topAmtCat = h.categoryAmounts[0];
  if (topAmtCat && topAmtCat.amount > 0) {
    patterns.push({
      id: 'household-amount-primacy',
      type: 'CONCENTRATION',
      title: `Highest Expenditure Category: ${topAmtCat.category}`,
      summary: `${topAmtCat.category} represents ${topAmtCat.percentage}% of total recorded expenditures (₹${topAmtCat.amount.toLocaleString('en-IN')}).`,
      source: 'household',
      significance: 'high',
      period: `${h.dateRange.start.slice(0, 4)}–${h.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Expenditure share', 'All years', topAmtCat.percentage, '%', { sampleSize: topAmtCat.count })],
    });
  }

  // 3. Frequency vs monetary divergence
  if (topFreqCat && topAmtCat && topFreqCat.category !== topAmtCat.category) {
    patterns.push({
      id: 'household-freq-vs-amount',
      type: 'COMPARISON',
      title: 'Frequency vs. Monetary Value Divergence',
      summary: `The most frequent category ("${topFreqCat.category}") differs from the highest-expenditure category ("${topAmtCat.category}"), indicating high-frequency small transactions vs. low-frequency large outlays.`,
      source: 'household',
      significance: 'medium',
      period: `${h.dateRange.start.slice(0, 4)}–${h.dateRange.end.slice(0, 4)}`,
      evidence: [
        makeEvidence(`${topFreqCat.category} frequency`, 'All years', topFreqCat.percentage, '%'),
        makeEvidence(`${topAmtCat.category} expenditure`, 'All years', topAmtCat.percentage, '% of spend'),
      ],
    });
  }

  // 4. Investment categories appear
  const investmentCats = ['Investment', 'Equity Mutual Fund A', 'Public Provident Fund', 'Recurring Deposit', 'Fixed Deposit'];
  const investmentTotal = h.categoryAmounts
    .filter((c) => investmentCats.some((ic) => c.category.toLowerCase().includes(ic.toLowerCase())))
    .reduce((sum, c) => sum + c.amount, 0);
  const investmentPct = Number((investmentTotal / Math.max(1, h.totalExpenses) * 100).toFixed(1));
  if (investmentPct > 5) {
    patterns.push({
      id: 'household-investment-activity',
      type: 'TREND',
      title: 'Investment-Oriented Financial Activity',
      summary: `Investment-related categories (mutual funds, PPF, RD, FD) account for ${investmentPct}% of recorded outflows — indicating systematic savings/investment activity during this period.`,
      source: 'household',
      significance: 'medium',
      period: `${h.dateRange.start.slice(0, 4)}–${h.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Investment share of outflows', 'All years', investmentPct, '%', { sampleSize: h.expenseCount })],
    });
  }

  // 5. Year-over-year spending change
  if (h.yearlyAmounts.length >= 2) {
    const yrAmounts = h.yearlyAmounts.filter((y) => y.expenses > 0);
    for (let i = 1; i < yrAmounts.length; i++) {
      const prev = yrAmounts[i - 1]!;
      const curr = yrAmounts[i]!;
      if (prev.expenses > 0) {
        const pct = Number(((curr.expenses - prev.expenses) / prev.expenses * 100).toFixed(1));
        if (Math.abs(pct) >= 30) {
          patterns.push({
            id: `household-spending-shift-${prev.year}-${curr.year}`,
            type: 'SHIFT',
            title: `${Math.abs(pct)}% Spending ${pct > 0 ? 'Increase' : 'Decrease'}: ${prev.year}→${curr.year}`,
            summary: `Recorded expenses ${pct > 0 ? 'increased' : 'decreased'} from ₹${prev.expenses.toLocaleString('en-IN')} (${prev.year}) to ₹${curr.expenses.toLocaleString('en-IN')} (${curr.year}).`,
            source: 'household',
            significance: Math.abs(pct) >= 50 ? 'high' : 'medium',
            period: `${prev.year}–${curr.year}`,
            evidence: [
              makeEvidence('Total expenses', String(prev.year), prev.expenses, 'INR'),
              makeEvidence('Total expenses', String(curr.year), curr.expenses, 'INR', {
                comparison: { period: String(prev.year), value: prev.expenses, unit: 'INR' },
              }),
            ],
          });
        }
      }
    }
  }

  return patterns;
}

function transactionPatterns(t: TransactionAnalytics): Pattern[] {
  const patterns: Pattern[] = [];
  if (!t.totalRecords) return patterns;

  // 1. Dominant category by frequency
  const topFreqCat = t.categoryFrequency[0];
  if (topFreqCat) {
    patterns.push({
      id: 'txn-category-frequency-leader',
      type: 'CONCENTRATION',
      title: `Transaction Frequency Leader: ${topFreqCat.category}`,
      summary: `${topFreqCat.category} is the most common transaction category at ${topFreqCat.percentage}% of all recorded transactions (${topFreqCat.count.toLocaleString()} entries).`,
      source: 'transactions',
      significance: topFreqCat.percentage > 40 ? 'high' : 'medium',
      period: `${t.dateRange.start.slice(0, 4)}–${t.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Category frequency share', 'All years', topFreqCat.percentage, '%', { sampleSize: topFreqCat.count })],
    });
  }

  // 2. Average transaction amount by category
  const highValueCat = [...t.categoryAmounts].sort((a, b) => b.avgAmount - a.avgAmount)[0];
  if (highValueCat && highValueCat.category !== 'Uncategorized') {
    patterns.push({
      id: 'txn-high-avg-amount',
      type: 'COMPARISON',
      title: `Highest Average Transaction: ${highValueCat.category}`,
      summary: `${highValueCat.category} records the highest average transaction value at ₹${highValueCat.avgAmount.toLocaleString('en-IN')} per transaction.`,
      source: 'transactions',
      significance: 'medium',
      period: `${t.dateRange.start.slice(0, 4)}–${t.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Average transaction amount', 'All years', highValueCat.avgAmount, 'INR', { sampleSize: highValueCat.count })],
    });
  }

  // 3. Missing category volume
  if (t.missingCategoryCount > 0) {
    const missingPct = Number((t.missingCategoryCount / Math.max(1, t.totalRecords) * 100).toFixed(1));
    patterns.push({
      id: 'txn-missing-categories',
      type: 'ANOMALY',
      title: `${missingPct}% Records Without Category`,
      summary: `${t.missingCategoryCount.toLocaleString()} of ${t.totalRecords.toLocaleString()} transactions have no assigned category label, representing ${missingPct}% data coverage gaps.`,
      source: 'transactions',
      significance: missingPct > 10 ? 'high' : 'medium',
      period: `${t.dateRange.start.slice(0, 4)}–${t.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Missing category count', 'All years', t.missingCategoryCount, 'records', { sampleSize: t.totalRecords })],
    });
  }

  // 4. Time-of-day pattern
  const dayHours = t.hourlyCounts.filter((h) => h.hour >= 9 && h.hour <= 18);
  const dayCount = dayHours.reduce((s, h) => s + h.count, 0);
  const totalCount = t.hourlyCounts.reduce((s, h) => s + h.count, 0);
  const dayPct = Number((dayCount / Math.max(1, totalCount) * 100).toFixed(1));
  if (totalCount > 0) {
    patterns.push({
      id: 'txn-time-of-day',
      type: 'RHYTHM',
      title: `${dayPct}% Transactions During Business Hours (09:00–18:00)`,
      summary: `Business hours (09:00–18:00) account for ${dayPct}% of all recorded card transactions, indicating predominant daytime commercial activity.`,
      source: 'transactions',
      significance: 'low',
      period: `${t.dateRange.start.slice(0, 4)}–${t.dateRange.end.slice(0, 4)}`,
      evidence: [makeEvidence('Business-hours transaction share', 'All years', dayPct, '%', { sampleSize: dayCount })],
    });
  }

  // 5. Geographic concentration
  if (t.stateDistribution.length > 0) {
    const top3States = t.stateDistribution.slice(0, 3);
    const top3Count = top3States.reduce((s, st) => s + st.count, 0);
    const top3Pct = Number((top3Count / Math.max(1, t.totalRecords) * 100).toFixed(1));
    patterns.push({
      id: 'txn-geo-concentration',
      type: 'CONCENTRATION',
      title: `Geographic Concentration: Top 3 States`,
      summary: `${top3States.map((s) => s.location).join(', ')} collectively account for ${top3Pct}% of all card transactions by volume.`,
      source: 'transactions',
      significance: top3Pct > 50 ? 'medium' : 'low',
      period: `${t.dateRange.start.slice(0, 4)}–${t.dateRange.end.slice(0, 4)}`,
      evidence: top3States.map((s) =>
        makeEvidence(`${s.location} transaction count`, 'All years', s.count, 'transactions')
      ),
    });
  }

  return patterns;
}

export function computeAllPatterns(
  spotify: SpotifyAnalytics,
  household: HouseholdAnalytics,
  transactions: TransactionAnalytics
): Pattern[] {
  return [
    ...spotifyPatterns(spotify),
    ...householdPatterns(household),
    ...transactionPatterns(transactions),
  ];
}
