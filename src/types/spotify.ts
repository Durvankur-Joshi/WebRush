import { DateRange, HourlyDistribution, WeekdayDistribution } from './common';

export interface SpotifyRawRecord {
  spotify_track_uri: string;
  ts: string;
  platform: string;
  ms_played: number;
  track_name: string;
  artist_name: string;
  album_name: string;
  reason_start: string;
  reason_end: string;
  shuffle: boolean;
  skipped: boolean;
}

export interface TopArtist {
  artist: string;
  hours: number;
  playCount: number;
  skipRate: number;
}

export interface TopTrack {
  track: string;
  artist: string;
  playCount: number;
  hours: number;
}

export interface YearlyListeningMetric {
  year: number;
  hours: number;
  playCount: number;
  skipRate: number;
}

export interface MonthlyListeningMetric {
  yearMonth: string;
  hours: number;
  playCount: number;
}

export interface ArtistEvolution {
  artist: string;
  firstPlayed: string;
  peakYear: number;
  totalHours: number;
}

export interface SpotifyAnalytics {
  totalRecords: number;
  dateRange: DateRange;
  totalListeningHours: number;
  uniqueArtists: number;
  uniqueTracks: number;
  yearlyListening: YearlyListeningMetric[];
  monthlyListening: MonthlyListeningMetric[];
  hourlyListening: HourlyDistribution[];
  weekdayListening: WeekdayDistribution[];
  topArtists: TopArtist[];
  topTracks: TopTrack[];
  yearlySkipRates: { year: number; skipRate: number }[];
  artistEvolution: ArtistEvolution[];
}
