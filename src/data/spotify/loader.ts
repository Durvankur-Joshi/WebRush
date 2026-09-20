import { SpotifyNormalizedRecord, SpotifyParseResult } from './types';
import { fetchPublicCSV, parseCSV } from '../parser';
import { normalizeSpotifyRows } from './normalizer';

let _cache: SpotifyParseResult | null = null;
let _loading: Promise<SpotifyParseResult> | null = null;

/**
 * Load, parse, and normalize the Spotify history dataset.
 * Results are cached in-memory after first load — never re-parses on subsequent calls.
 */
export async function loadSpotifyData(): Promise<SpotifyParseResult> {
  if (_cache) return _cache;
  if (_loading) return _loading;

  _loading = (async (): Promise<SpotifyParseResult> => {
    const text = await fetchPublicCSV('spotify_history.csv');
    const { headers, rows } = parseCSV(text);
    const result = normalizeSpotifyRows(headers, rows);
    _cache = result;
    _loading = null;
    return result;
  })();

  return _loading;
}

/** Returns cached records synchronously, or empty array if not yet loaded. */
export function getSpotifyRecordsSync(): SpotifyNormalizedRecord[] {
  return _cache?.records ?? [];
}

/** Clear cache (useful for testing). */
export function clearSpotifyCache(): void {
  _cache = null;
  _loading = null;
}
