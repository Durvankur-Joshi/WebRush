/** Normalized representation of a single Spotify stream event. */
export interface SpotifyNormalizedRecord {
  timestamp: string;
  date: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  weekday: number;
  trackName: string;
  artistName: string;
  albumName: string;
  platform: string;
  msPlayed: number;
  skipped: boolean;
  reasonStart: string;
  reasonEnd: string;
  shuffle: boolean;
}

export interface SpotifyParseResult {
  records: SpotifyNormalizedRecord[];
  quality: import('../quality').DataQualityReport;
}
