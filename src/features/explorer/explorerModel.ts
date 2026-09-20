import {
  ExplorerFilterState,
  ExplorerReceipt,
  ExplorerSummaryMetrics,
  HourRange,
  StreamId,
  SupportedDiscoveryLink,
} from './explorerTypes';
import { SpotifyNormalizedRecord } from '../../data/spotify/types';
import { HouseholdNormalizedRecord } from '../../data/household/types';
import { TransactionNormalizedRecord } from '../../data/transactions/types';

// Format milliseconds to mm:ss or hh:mm
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remMinutes = minutes % 60;
    return `${hours}h ${remMinutes}m`;
  }
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

// Convert Spotify record to ExplorerReceipt
export function spotifyToReceipt(r: SpotifyNormalizedRecord, index: number): ExplorerReceipt {
  const supported: SupportedDiscoveryLink[] = [];

  // Nocturnal cadence
  if ((r.hour >= 18 && r.hour <= 23) || (r.hour >= 0 && r.hour <= 5)) {
    supported.push({
      discoveryId: 'disc-spotify-hour-concentration',
      title: 'Listening Activity Concentrated in Evening and Late-Night Hours',
      reason: `Recorded at ${String(r.hour).padStart(2, '0')}:00, within the evening/late-night window that represents 58.6% of all listening events.`,
    });
  }

  // Beatles pillar
  if (r.artistName.toLowerCase().includes('beatles')) {
    supported.push({
      discoveryId: 'disc-spotify-persistent-artist',
      title: 'Persistent Acoustic Pillar: The Beatles',
      reason: 'Part of the 13,621 stream events that establish The Beatles as the primary multi-year loyalty artist across 2016–2024.',
    });
  }

  // 2015-2016 Skip shift
  if (r.year === 2015 && r.skipped) {
    supported.push({
      discoveryId: 'disc-spotify-skip-shift',
      title: 'Fundamental Behavioral Shift in Track Skip Rate (2015–2016)',
      reason: 'Belongs to the 2015 baseline epoch where track skip rate reached 78.8% prior to the structural collapse to 3.6% in 2016.',
    });
  }

  // 2020 Zenith
  if (r.year === 2020) {
    supported.push({
      discoveryId: 'disc-spotify-peak-eras',
      title: 'Acoustic Zenith: Peak Listening Recorded in 2020',
      reason: 'Logged during the all-time peak playback year (1,234.6 total hours recorded).',
    });
  }

  const durationFmt = formatDuration(r.msPlayed);
  const timeStr = r.timestamp.includes('T') ? r.timestamp.split('T')[1]?.slice(0, 5) : `${String(r.hour).padStart(2, '0')}:00`;

  return {
    id: `spot-${index}-${r.date}`,
    stream: 'spotify',
    title: r.trackName,
    subtitle: r.artistName,
    date: r.date,
    timeFormatted: timeStr,
    year: r.year,
    hour: r.hour,
    category: r.artistName,
    subcategory: r.albumName,
    durationFormatted: durationFmt,
    durationMs: r.msPlayed,
    statusBadge: r.skipped ? 'Skipped' : 'Completed',
    metadata: [
      { label: 'Artist', value: r.artistName },
      { label: 'Album', value: r.albumName },
      { label: 'Platform', value: r.platform },
      { label: 'Playback Duration', value: durationFmt },
      { label: 'Skip Status', value: r.skipped ? 'Skipped before finish' : 'Listened to completion' },
      { label: 'Shuffle Mode', value: r.shuffle ? 'Active' : 'Off' },
      { label: 'Start Trigger', value: r.reasonStart || 'Track Done' },
      { label: 'End Trigger', value: r.reasonEnd || 'Track Done' },
    ],
    supportedDiscoveries: supported,
    rawSummary: `${r.trackName} by ${r.artistName} (${durationFmt}) on ${r.date} ${timeStr}`,
  };
}

// Convert Household record to ExplorerReceipt
export function householdToReceipt(r: HouseholdNormalizedRecord, index: number): ExplorerReceipt {
  const supported: SupportedDiscoveryLink[] = [];

  // Food dominance
  if (r.category.toLowerCase().includes('food')) {
    supported.push({
      discoveryId: 'disc-household-food-dominance',
      title: 'Food Dominates Domestic Transaction Frequency',
      reason: 'Contributes to the 36.9% share (907 records) making food the undisputed frequency anchor of manual domestic ledger tracking.',
    });
  }

  // Capital outflow vs frequency
  if (r.category.toLowerCase().includes('money transfer') || r.category.toLowerCase().includes('investment')) {
    supported.push({
      discoveryId: 'disc-household-freq-vs-impact',
      title: 'Divergence Between Frequency and Monetary Expenditure',
      reason: `High-value capital movement (INR ${r.amount.toLocaleString()}) contrasting daily micro-expenses with lump-sum obligations.`,
    });
  }

  const isExpense = r.direction === 'expense';
  const amountPrefix = isExpense ? '-₹' : '+₹';

  return {
    id: `house-${index}-${r.date}`,
    stream: 'household',
    title: r.category,
    subtitle: r.subcategory || r.note || 'Domestic Entry',
    date: r.date,
    timeFormatted: 'Logged',
    year: r.year,
    category: r.category,
    subcategory: r.subcategory,
    amountFormatted: `${amountPrefix}${r.amount.toLocaleString('en-IN')}`,
    amountRaw: isExpense ? -r.amount : r.amount,
    statusBadge: r.direction.toUpperCase(),
    metadata: [
      { label: 'Category', value: r.category },
      { label: 'Subcategory', value: r.subcategory || 'General' },
      { label: 'Flow Direction', value: r.direction.toUpperCase() },
      { label: 'Amount', value: `INR ${r.amount.toLocaleString('en-IN')}` },
      { label: 'Payment Mode', value: r.mode || 'Cash' },
      { label: 'Currency', value: r.currency || 'INR' },
      { label: 'Notes', value: r.note || 'None recorded' },
    ],
    supportedDiscoveries: supported,
    rawSummary: `${r.category} (${r.subcategory || 'General'}) — INR ${r.amount} via ${r.mode} on ${r.date}`,
  };
}

// Convert India Transaction record to ExplorerReceipt
export function transactionToReceipt(r: TransactionNormalizedRecord, index: number): ExplorerReceipt {
  const supported: SupportedDiscoveryLink[] = [];

  // Travel highest ticket size
  if (r.category.toLowerCase().includes('travel')) {
    supported.push({
      discoveryId: 'disc-txn-category-ticket-size',
      title: 'Highest Mean Ticket Size: travel',
      reason: `Travel purchase of INR ${r.amount.toLocaleString('en-IN')}. Travel represents the highest average transaction size across the 8.7K card entries (INR 5,556 avg).`,
    });
  }

  // Commercial facets balance
  if (r.category.toLowerCase().includes('online_shopping') || r.category.toLowerCase().includes('entertainment')) {
    supported.push({
      discoveryId: 'disc-txn-category-balance',
      title: 'Distinct Segmentation Across Modern Commerce Facets',
      reason: `Represents one of the primary commercial retail pillars defining modern digital card payments.`,
    });
  }

  const cleanCategory = r.category || 'Uncategorized';
  const timeStr = `${String(r.hour).padStart(2, '0')}:00`;

  return {
    id: `txn-${index}-${r.date}`,
    stream: 'transactions',
    title: cleanCategory.replace(/_/g, ' ').toUpperCase(),
    subtitle: `${r.city ? `${r.city}, ` : ''}${r.state || 'India'}`,
    date: r.date,
    timeFormatted: timeStr,
    year: r.year,
    hour: r.hour,
    category: cleanCategory,
    amountFormatted: `-₹${r.amount.toLocaleString('en-IN')}`,
    amountRaw: -r.amount,
    statusBadge: 'Verified POS',
    metadata: [
      { label: 'Category', value: cleanCategory.replace(/_/g, ' ') },
      { label: 'Amount Charged', value: `INR ${r.amount.toLocaleString('en-IN')}` },
      { label: 'State / Region', value: r.state || 'Unknown' },
      { label: 'City Aggregate', value: r.city || 'Regional' },
      { label: 'Transaction Time', value: timeStr },
      { label: 'PII Protection', value: 'Card Number & Name Redacted at Source' },
    ],
    supportedDiscoveries: supported,
    rawSummary: `${cleanCategory} purchase of INR ${r.amount} in ${r.state} on ${r.date}`,
  };
}

// Check hour range match
function matchesHour(hour: number | undefined, range: HourRange): boolean {
  if (range === 'all' || hour === undefined) return true;
  if (range === 'morning') return hour >= 6 && hour < 12;
  if (range === 'afternoon') return hour >= 12 && hour < 18;
  if (range === 'evening') return hour >= 18 && hour <= 23;
  if (range === 'night') return hour >= 0 && hour < 6;
  if (range === 'evening_night') return (hour >= 18 && hour <= 23) || (hour >= 0 && hour < 6);
  return true;
}

// Filter receipts
export function filterReceipts(
  receipts: ExplorerReceipt[],
  filter: ExplorerFilterState
): ExplorerReceipt[] {
  const q = filter.search.trim().toLowerCase();

  return receipts.filter((r) => {
    // 1. Search Query
    if (q) {
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchSub = r.subtitle.toLowerCase().includes(q);
      const matchCat = r.category.toLowerCase().includes(q);
      const matchSubcat = r.subcategory ? r.subcategory.toLowerCase().includes(q) : false;
      const matchRaw = r.rawSummary.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchCat && !matchSubcat && !matchRaw) {
        return false;
      }
    }

    // 2. Year Filter
    if (filter.year !== 'all' && r.year !== filter.year) {
      return false;
    }

    // 3. Category Filter
    if (filter.category !== 'all' && r.category.toLowerCase() !== filter.category.toLowerCase()) {
      return false;
    }

    // 4. Subcategory Filter
    if (filter.subcategory !== 'all' && r.subcategory && r.subcategory.toLowerCase() !== filter.subcategory.toLowerCase()) {
      return false;
    }

    // 5. Hour Range Filter
    if (filter.hourRange !== 'all' && !matchesHour(r.hour, filter.hourRange)) {
      return false;
    }

    // 6. Skipped Filter (Spotify)
    if (filter.stream === 'spotify' && filter.skipped !== 'all') {
      const isSkipped = r.statusBadge === 'Skipped';
      if (filter.skipped === 'skipped' && !isSkipped) return false;
      if (filter.skipped === 'completed' && isSkipped) return false;
    }

    // 7. Direction Filter (Household)
    if (filter.stream === 'household' && filter.direction !== 'all') {
      const direction = (r.statusBadge || '').toLowerCase();
      if (direction !== filter.direction) return false;
    }

    // 8. Payment Mode Filter (Household)
    if (filter.stream === 'household' && filter.mode !== 'all') {
      const modeMeta = r.metadata.find((m) => m.label === 'Payment Mode');
      if (!modeMeta || modeMeta.value.toLowerCase() !== filter.mode.toLowerCase()) {
        return false;
      }
    }

    // 9. State Filter (Transactions)
    if (filter.stream === 'transactions' && filter.state !== 'all') {
      const stateMeta = r.metadata.find((m) => m.label === 'State / Region');
      if (!stateMeta || stateMeta.value.toLowerCase() !== filter.state.toLowerCase()) {
        return false;
      }
    }

    // 10. Discovery drill-down filter if applied
    if (filter.discoveryDrillDown) {
      const hasDiscovery = r.supportedDiscoveries.some((d) => d.discoveryId === filter.discoveryDrillDown?.id);
      if (!hasDiscovery) return false;
    }

    return true;
  });
}

// Sort receipts
export function sortReceipts(receipts: ExplorerReceipt[], sortBy: ExplorerFilterState['sortBy']): ExplorerReceipt[] {
  const list = [...receipts];
  switch (sortBy) {
    case 'recent':
      return list.sort((a, b) => b.date.localeCompare(a.date));
    case 'oldest':
      return list.sort((a, b) => a.date.localeCompare(b.date));
    case 'magnitude':
      return list.sort((a, b) => {
        const valA = Math.abs(a.amountRaw ?? a.durationMs ?? 0);
        const valB = Math.abs(b.amountRaw ?? b.durationMs ?? 0);
        return valB - valA;
      });
    case 'relevance':
    default:
      return list;
  }
}

// Paginate receipts
export function paginateReceipts(
  receipts: ExplorerReceipt[],
  page: number,
  pageSize: number
): {
  items: ExplorerReceipt[];
  total: number;
  totalPages: number;
  page: number;
  startIndex: number;
  endIndex: number;
} {
  const total = receipts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const validPage = Math.min(Math.max(1, page), totalPages);
  const start = (validPage - 1) * pageSize;
  const items = receipts.slice(start, start + pageSize);

  return {
    items,
    total,
    totalPages,
    page: validPage,
    startIndex: total > 0 ? start + 1 : 0,
    endIndex: Math.min(start + pageSize, total),
  };
}

// Compute contextual summary metrics
export function computeExplorerSummary(
  filtered: ExplorerReceipt[],
  stream: StreamId
): ExplorerSummaryMetrics {
  const total = filtered.length;

  if (stream === 'spotify') {
    const totalMs = filtered.reduce((sum, r) => sum + (r.durationMs || 0), 0);
    const totalHours = totalMs / 3600000;
    const artists = new Set(filtered.map((r) => r.subtitle));
    const skippedCount = filtered.filter((r) => r.statusBadge === 'Skipped').length;
    const skipRate = total > 0 ? Number(((skippedCount / total) * 100).toFixed(1)) : 0;

    return {
      totalMatching: total,
      stream,
      metric1: { label: 'Filtered Plays', value: total.toLocaleString() },
      metric2: { label: 'Listening Hours', value: `${totalHours.toFixed(1)} hrs` },
      metric3: { label: 'Unique Artists', value: artists.size.toLocaleString() },
      metric4: { label: 'Skip Rate', value: `${skipRate}%` },
    };
  }

  if (stream === 'household') {
    let expenseSum = 0;
    let incomeSum = 0;
    filtered.forEach((r) => {
      const raw = r.amountRaw || 0;
      if (raw < 0) expenseSum += Math.abs(raw);
      else incomeSum += raw;
    });

    return {
      totalMatching: total,
      stream,
      metric1: { label: 'Matching Entries', value: total.toLocaleString() },
      metric2: { label: 'Total Expense', value: `₹${(expenseSum / 100000).toFixed(2)}L` },
      metric3: { label: 'Total Income', value: `₹${(incomeSum / 100000).toFixed(2)}L` },
      metric4: { label: 'Net Flow', value: `₹${((incomeSum - expenseSum) / 100000).toFixed(2)}L` },
    };
  }

  // Transactions
  const totalVolume = filtered.reduce((sum, r) => sum + Math.abs(r.amountRaw || 0), 0);
  const avgTicket = total > 0 ? totalVolume / total : 0;
  const catCount = new Map<string, number>();
  filtered.forEach((r) => {
    catCount.set(r.category, (catCount.get(r.category) || 0) + 1);
  });
  const dominantCat = Array.from(catCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

  return {
    totalMatching: total,
    stream,
    metric1: { label: 'Card Transactions', value: total.toLocaleString() },
    metric2: { label: 'Total Volume', value: `₹${(totalVolume / 100000).toFixed(2)}L` },
    metric3: { label: 'Dominant Facet', value: dominantCat.replace(/_/g, ' ') },
    metric4: { label: 'Avg Ticket Size', value: `₹${Math.round(avgTicket).toLocaleString('en-IN')}` },
  };
}

// Extract filter options from records
export function extractFilterOptions(receipts: ExplorerReceipt[]) {
  const years = Array.from(new Set(receipts.map((r) => r.year))).sort((a, b) => b - a);
  const categories = Array.from(new Set(receipts.map((r) => r.category))).filter(Boolean).sort();
  const subcategories = Array.from(new Set(receipts.map((r) => r.subcategory).filter(Boolean) as string[])).sort();
  const modes = Array.from(
    new Set(
      receipts
        .map((r) => r.metadata.find((m) => m.label === 'Payment Mode')?.value)
        .filter(Boolean) as string[]
    )
  ).sort();
  const states = Array.from(
    new Set(
      receipts
        .map((r) => r.metadata.find((m) => m.label === 'State / Region')?.value)
        .filter(Boolean) as string[]
    )
  ).sort();

  return { years, categories, subcategories, modes, states };
}
