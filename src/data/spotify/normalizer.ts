import { SpotifyNormalizedRecord } from './types';
import { cleanStr, safeBool, safeNum } from '../parser';
import { DataQualityReport, createEmptyQuality } from '../quality';

/**
 * Parse a Spotify timestamp string (UTC ISO or "YYYY-MM-DD HH:MM:SS") into Date.
 * Returns null for unparseable values.
 */
function parseSpotifyTs(ts: string): Date | null {
  if (!ts) return null;
  const d = new Date(ts.replace(' ', 'T') + (ts.includes('T') || ts.includes('+') || ts.endsWith('Z') ? '' : 'Z'));
  return isFinite(d.getTime()) ? d : null;
}

/**
 * Normalize a single Spotify CSV row into a clean record.
 * Returns null if the row is fatally malformed.
 */
function normalizeRow(
  headers: string[],
  row: string[]
): SpotifyNormalizedRecord | null {
  const get = (name: string) => row[headers.indexOf(name)] ?? '';

  const tsRaw = cleanStr(get('ts'));
  const dt = parseSpotifyTs(tsRaw);
  if (!dt) return null;

  const msPlayed = safeNum(cleanStr(get('ms_played')));
  if (msPlayed === null || msPlayed < 0) return null;

  const trackName = cleanStr(get('track_name')) || 'Unknown Track';
  const artistName = cleanStr(get('artist_name')) || 'Unknown Artist';
  const albumName = cleanStr(get('album_name')) || 'Unknown Album';
  const platform = cleanStr(get('platform')) || 'unknown';
  const skipped = safeBool(get('skipped'));
  const shuffle = safeBool(get('shuffle'));
  const reasonStart = cleanStr(get('reason_start')) || 'unknown';
  const reasonEnd = cleanStr(get('reason_end')) || 'unknown';

  return {
    timestamp: dt.toISOString(),
    date: dt.toISOString().slice(0, 10),
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
    hour: dt.getUTCHours(),
    weekday: dt.getUTCDay(),
    trackName,
    artistName,
    albumName,
    platform,
    msPlayed,
    skipped,
    shuffle,
    reasonStart,
    reasonEnd,
  };
}

export function normalizeSpotifyRows(
  headers: string[],
  rows: string[][]
): { records: SpotifyNormalizedRecord[]; quality: DataQualityReport } {
  const quality = createEmptyQuality('spotify');
  quality.totalRows = rows.length;

  const records: SpotifyNormalizedRecord[] = [];
  let minDate = '';
  let maxDate = '';

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 4) {
      quality.invalidRows++;
      continue;
    }

    const tsRaw = (row[headers.indexOf('ts')] ?? '').trim();
    if (!tsRaw) {
      quality.missingDates++;
      quality.invalidRows++;
      continue;
    }

    const normalized = normalizeRow(headers, row);
    if (!normalized) {
      quality.invalidRows++;
      continue;
    }

    records.push(normalized);
    quality.validRows++;

    if (!minDate || normalized.date < minDate) minDate = normalized.date;
    if (!maxDate || normalized.date > maxDate) maxDate = normalized.date;
  }

  if (minDate && maxDate) {
    quality.dateRange = { start: minDate, end: maxDate };
  }

  if (quality.invalidRows > 0) {
    quality.warnings.push(`${quality.invalidRows} rows skipped due to invalid timestamps or data.`);
  }

  return { records, quality };
}
