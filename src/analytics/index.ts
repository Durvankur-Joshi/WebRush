import { SpotifyAnalytics, computeSpotifyAnalytics } from './spotify';
import { HouseholdAnalytics, computeHouseholdAnalytics } from './household';
import { TransactionAnalytics, computeTransactionAnalytics } from './transactions';
import { Pattern, computeAllPatterns } from './patterns';
import { Discovery, generateDiscoveries } from './discoveries';
import { Connection, generateConnections } from './connections';
import { StoryChapter, generateStoryChapters } from './stories';
import { DataQualityReport } from '../data/quality';
import { loadSpotifyData } from '../data/spotify/loader';
import { loadHouseholdData } from '../data/household/loader';
import { loadTransactionData } from '../data/transactions/loader';
import { SpotifyParseResult } from '../data/spotify/types';
import { HouseholdParseResult } from '../data/household/types';
import { TransactionParseResult } from '../data/transactions/types';

export * from './spotify';
export * from './household';
export * from './transactions';
export * from './temporal';
export * from './patterns';
export * from './evidence';
export * from './connections';
export * from './discoveries';
export * from './stories';

/**
 * Unified LifeAnalytics data contract for LIFELINE.
 * UI components (Observatory, Explorer, Discoveries, Constellation, Story)
 * consume this compact object.
 * Raw 150k-row datasets are NEVER stored inside LifeAnalytics.
 * Zero PII fields are exposed.
 */
export interface LifeAnalytics {
  spotify: SpotifyAnalytics;
  household: HouseholdAnalytics;
  transactions: TransactionAnalytics;
  patterns: Pattern[];
  discoveries: Discovery[];
  connections: Connection[];
  stories: StoryChapter[];
  dataQuality: {
    spotify: DataQualityReport;
    household: DataQualityReport;
    transactions: DataQualityReport;
  };
}

/**
 * Pure computation function taking normalized parse results and
 * producing the complete compact LifeAnalytics structure.
 */
export function computeLifeAnalytics(
  spotifyResult: SpotifyParseResult,
  householdResult: HouseholdParseResult,
  transactionsResult: TransactionParseResult
): LifeAnalytics {
  const spotify = computeSpotifyAnalytics(spotifyResult.records);
  const household = computeHouseholdAnalytics(householdResult.records);
  const transactions = computeTransactionAnalytics(transactionsResult.records);

  const patterns = computeAllPatterns(spotify, household, transactions);
  const connections = generateConnections(spotify, household, transactions);
  const discoveries = generateDiscoveries(spotify, household, transactions, patterns, connections);
  const stories = generateStoryChapters(spotify, household, transactions, discoveries);

  return {
    spotify,
    household,
    transactions,
    patterns,
    discoveries,
    connections,
    stories,
    dataQuality: {
      spotify: spotifyResult.quality,
      household: householdResult.quality,
      transactions: transactionsResult.quality,
    },
  };
}

let _lifeAnalyticsCache: LifeAnalytics | null = null;
let _lifeAnalyticsPromise: Promise<LifeAnalytics> | null = null;

/**
 * Central entry point for analytics retrieval.
 * Computes once and caches in memory.
 * Can fast-load from precomputed JSON if available, or compute from CSV.
 */
export async function getLifeAnalytics(): Promise<LifeAnalytics> {
  if (_lifeAnalyticsCache) {
    return _lifeAnalyticsCache;
  }
  if (_lifeAnalyticsPromise) {
    return _lifeAnalyticsPromise;
  }

  _lifeAnalyticsPromise = (async (): Promise<LifeAnalytics> => {
    // 1. Attempt to fetch precomputed compact analytics if available
    try {
      if (typeof fetch !== 'undefined') {
        const precomputedRes = await fetch('/data/life_analytics.json');
        if (precomputedRes.ok) {
          const data = (await precomputedRes.json()) as LifeAnalytics;
          _lifeAnalyticsCache = data;
          _lifeAnalyticsPromise = null;
          return data;
        }
      }
    } catch {
      // Fall through to live computation
    }

    // 2. Compute from source CSV loaders
    const [spotifyResult, householdResult, transactionResult] = await Promise.all([
      loadSpotifyData(),
      loadHouseholdData(),
      loadTransactionData(),
    ]);

    const analytics = computeLifeAnalytics(spotifyResult, householdResult, transactionResult);
    _lifeAnalyticsCache = analytics;
    _lifeAnalyticsPromise = null;
    return analytics;
  })();

  return _lifeAnalyticsPromise;
}

/** Synchronously retrieve cached analytics, or null if not yet loaded. */
export function getLifeAnalyticsSync(): LifeAnalytics | null {
  return _lifeAnalyticsCache;
}

/** Invalidate cache (useful for tests or reload). */
export function clearLifeAnalyticsCache(): void {
  _lifeAnalyticsCache = null;
  _lifeAnalyticsPromise = null;
}
