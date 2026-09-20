import { SpotifyNormalizedRecord } from '../data/spotify/types';
import {
  groupByYear,
  groupByMonth,
  groupByHour,
  groupByWeekday,
  YearBucket,
  MonthBucket,
  HourBucket,
  WeekdayBucket,
} from './temporal';

export interface SpotifyTopArtist {
  artist: string;
  playCount: number;
  hours: number;
  skipRate: number;
  firstYear: number;
  lastYear: number;
  yearsActive: number;
}

export interface SpotifyTopTrack {
  track: string;
  artist: string;
  playCount: number;
  hours: number;
}

export interface SpotifyTopAlbum {
  album: string;
  artist: string;
  playCount: number;
}

export interface SpotifyYearlyRecord {
  year: number;
  playCount: number;
  hours: number;
  skipCount: number;
  skipRate: number;
  uniqueArtists: number;
  uniqueTracks: number;
}

export interface SpotifyPlatformBucket {
  platform: string;
  count: number;
  percentage: number;
}

export interface SpotifyDistBucket {
  label: string;
  value: number;
}

export interface SpotifyArtistYearData {
  artist: string;
  yearly: { year: number; hours: number; playCount: number }[];
}

export interface SpotifyHeatmapCell {
  hour: number;
  weekday: number;
  count: number;
}

export interface SpotifyAnalytics {
  totalRecords: number;
  dateRange: { start: string; end: string };
  uniqueArtists: number;
  uniqueTracks: number;
  uniqueAlbums: number;
  totalListeningMilliseconds: number;
  totalListeningHours: number;
  averageListeningMinutes: number;
  yearlyListening: SpotifyYearlyRecord[];
  monthlyListening: MonthBucket[];
  hourlyListening: HourBucket[];
  weekdayListening: WeekdayBucket[];
  platformDistribution: SpotifyPlatformBucket[];
  topArtists: SpotifyTopArtist[];
  topTracks: SpotifyTopTrack[];
  topAlbums: SpotifyTopAlbum[];
  yearlyRecordCounts: YearBucket[];
  yearlySkipRates: { year: number; skipRate: number }[];
  yearlySkippedCounts: { year: number; skipped: number; total: number }[];
  shuffleDistribution: { label: string; value: number }[];
  reasonStartDistribution: SpotifyDistBucket[];
  reasonEndDistribution: SpotifyDistBucket[];
  artistEvolution: SpotifyArtistYearData[];
  trackEvolution: { track: string; artist: string; yearly: { year: number; playCount: number }[] }[];
  listeningHeatmap: SpotifyHeatmapCell[];
}

export function computeSpotifyAnalytics(records: SpotifyNormalizedRecord[]): SpotifyAnalytics {
  if (!records || records.length === 0) return createEmptySpotifyAnalytics();

  let totalMs = 0;
  let minDate = '';
  let maxDate = '';

  const artistMap = new Map<string, {
    ms: number; count: number; skips: number;
    firstYear: number; lastYear: number;
    yearSet: Set<number>; yearMs: Map<number, number>; yearCount: Map<number, number>;
  }>();

  const trackMap = new Map<string, { artist: string; count: number; ms: number }>();
  const albumMap = new Map<string, { artist: string; count: number }>();
  const yearMap = new Map<number, { ms: number; count: number; skips: number; artists: Set<string>; tracks: Set<string> }>();
  const platformMap = new Map<string, number>();
  const reasonStartMap = new Map<string, number>();
  const reasonEndMap = new Map<string, number>();
  let shuffleTrue = 0;
  let shuffleFalse = 0;
  const heatmapMap = new Map<string, number>();

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r) continue;

    if (!minDate || r.date < minDate) minDate = r.date;
    if (!maxDate || r.date > maxDate) maxDate = r.date;

    totalMs += r.msPlayed;

    // Artist aggregation
    const artist = r.artistName;
    let aData = artistMap.get(artist);
    if (!aData) {
      aData = { ms: 0, count: 0, skips: 0, firstYear: r.year, lastYear: r.year, yearSet: new Set(), yearMs: new Map(), yearCount: new Map() };
      artistMap.set(artist, aData);
    }
    aData.ms += r.msPlayed;
    aData.count++;
    if (r.skipped) aData.skips++;
    if (r.year < aData.firstYear) aData.firstYear = r.year;
    if (r.year > aData.lastYear) aData.lastYear = r.year;
    aData.yearSet.add(r.year);
    aData.yearMs.set(r.year, (aData.yearMs.get(r.year) ?? 0) + r.msPlayed);
    aData.yearCount.set(r.year, (aData.yearCount.get(r.year) ?? 0) + 1);

    // Track aggregation
    const trackKey = `${r.trackName}|||${artist}`;
    let tData = trackMap.get(trackKey);
    if (!tData) {
      tData = { artist, count: 0, ms: 0 };
      trackMap.set(trackKey, tData);
    }
    tData.count++;
    tData.ms += r.msPlayed;

    // Album aggregation
    const albumKey = `${r.albumName}|||${artist}`;
    let alData = albumMap.get(albumKey);
    if (!alData) {
      alData = { artist, count: 0 };
      albumMap.set(albumKey, alData);
    }
    alData.count++;

    // Yearly aggregation
    let yData = yearMap.get(r.year);
    if (!yData) {
      yData = { ms: 0, count: 0, skips: 0, artists: new Set(), tracks: new Set() };
      yearMap.set(r.year, yData);
    }
    yData.ms += r.msPlayed;
    yData.count++;
    if (r.skipped) yData.skips++;
    yData.artists.add(artist);
    yData.tracks.add(trackKey);

    // Platform
    platformMap.set(r.platform, (platformMap.get(r.platform) ?? 0) + 1);

    // Reason start/end
    reasonStartMap.set(r.reasonStart, (reasonStartMap.get(r.reasonStart) ?? 0) + 1);
    reasonEndMap.set(r.reasonEnd, (reasonEndMap.get(r.reasonEnd) ?? 0) + 1);

    // Shuffle
    if (r.shuffle) shuffleTrue++; else shuffleFalse++;

    // Heatmap
    const hKey = `${r.hour}:${r.weekday}`;
    heatmapMap.set(hKey, (heatmapMap.get(hKey) ?? 0) + 1);
  }

  const totalRecords = records.length;

  // Yearly records
  const yearlyListening: SpotifyYearlyRecord[] = Array.from(yearMap.entries())
    .map(([year, d]) => ({
      year,
      playCount: d.count,
      hours: Number((d.ms / 3600000).toFixed(2)),
      skipCount: d.skips,
      skipRate: Number((d.skips / Math.max(1, d.count) * 100).toFixed(2)),
      uniqueArtists: d.artists.size,
      uniqueTracks: d.tracks.size,
    }))
    .sort((a, b) => a.year - b.year);

  // Top artists (by play count)
  const topArtists: SpotifyTopArtist[] = Array.from(artistMap.entries())
    .map(([artist, d]) => ({
      artist,
      playCount: d.count,
      hours: Number((d.ms / 3600000).toFixed(2)),
      skipRate: Number((d.skips / Math.max(1, d.count) * 100).toFixed(2)),
      firstYear: d.firstYear,
      lastYear: d.lastYear,
      yearsActive: d.yearSet.size,
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 30);

  // Top tracks (by play count)
  const topTracks: SpotifyTopTrack[] = Array.from(trackMap.entries())
    .map(([key, d]) => {
      const trackName = key.split('|||')[0] ?? key;
      return {
        track: trackName,
        artist: d.artist,
        playCount: d.count,
        hours: Number((d.ms / 3600000).toFixed(2)),
      };
    })
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 30);

  // Top albums
  const topAlbums: SpotifyTopAlbum[] = Array.from(albumMap.entries())
    .map(([key, d]) => {
      const albumName = key.split('|||')[0] ?? key;
      return { album: albumName, artist: d.artist, playCount: d.count };
    })
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 20);

  // Platform distribution
  const platformTotal = records.length;
  const platformDistribution: SpotifyPlatformBucket[] = Array.from(platformMap.entries())
    .map(([platform, count]) => ({
      platform,
      count,
      percentage: Number((count / platformTotal * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);

  // Monthly listening
  const monthlyListening = groupByMonth(
    records,
    (r) => r.year,
    (r) => r.month,
    (r) => r.msPlayed / 3600000
  ).map((m) => ({ ...m, value: Number(m.value.toFixed(2)) }));

  // Hourly listening
  const hourlyListening = groupByHour(records, (r) => r.hour);

  // Weekday listening
  const weekdayListening = groupByWeekday(records, (r) => r.weekday, (r) => r.msPlayed);

  // Reason distributions
  const toDistBuckets = (map: Map<string, number>): SpotifyDistBucket[] =>
    Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);

  // Artist evolution (top 10 by total play count)
  const artistEvolution: SpotifyArtistYearData[] = topArtists.slice(0, 10).map((a) => {
    const rawData = artistMap.get(a.artist)!;
    const yearly = Array.from(rawData.yearMs.entries())
      .map(([year, ms]) => ({
        year,
        hours: Number((ms / 3600000).toFixed(2)),
        playCount: rawData.yearCount.get(year) ?? 0,
      }))
      .sort((a, b) => a.year - b.year);
    return { artist: a.artist, yearly };
  });

  // Track evolution (top 10 tracks across years)
  const trackEvolution = Array.from(trackMap.entries())
    .map(([key, d]) => {
      const trackName = key.split('|||')[0] ?? key;
      return { track: trackName, artist: d.artist, playCount: d.count };
    })
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 10)
    .map(({ track, artist }) => {
      const perYear = new Map<number, number>();
      for (const r of records) {
        if (r.trackName === track && r.artistName === artist) {
          perYear.set(r.year, (perYear.get(r.year) ?? 0) + 1);
        }
      }
      return {
        track,
        artist,
        yearly: Array.from(perYear.entries())
          .map(([year, playCount]) => ({ year, playCount }))
          .sort((a, b) => a.year - b.year),
      };
    });

  // Heatmap
  const listeningHeatmap: SpotifyHeatmapCell[] = Array.from(heatmapMap.entries()).map(([key, count]) => {
    const [hr, wd] = key.split(':').map(Number);
    return { hour: hr ?? 0, weekday: wd ?? 0, count };
  });

  return {
    totalRecords,
    dateRange: { start: minDate, end: maxDate },
    uniqueArtists: artistMap.size,
    uniqueTracks: trackMap.size,
    uniqueAlbums: albumMap.size,
    totalListeningMilliseconds: totalMs,
    totalListeningHours: Number((totalMs / 3600000).toFixed(2)),
    averageListeningMinutes: Number(((totalMs / 60000) / Math.max(1, totalRecords)).toFixed(2)),
    yearlyListening,
    monthlyListening,
    hourlyListening,
    weekdayListening,
    platformDistribution,
    topArtists,
    topTracks,
    topAlbums,
    yearlyRecordCounts: groupByYear(records, (r) => r.year, () => 1),
    yearlySkipRates: yearlyListening.map((y) => ({ year: y.year, skipRate: y.skipRate })),
    yearlySkippedCounts: yearlyListening.map((y) => ({ year: y.year, skipped: y.skipCount, total: y.playCount })),
    shuffleDistribution: [
      { label: 'Shuffle On', value: shuffleTrue },
      { label: 'Shuffle Off', value: shuffleFalse },
    ],
    reasonStartDistribution: toDistBuckets(reasonStartMap),
    reasonEndDistribution: toDistBuckets(reasonEndMap),
    artistEvolution,
    trackEvolution,
    listeningHeatmap,
  };
}

export function createEmptySpotifyAnalytics(): SpotifyAnalytics {
  return {
    totalRecords: 0,
    dateRange: { start: '', end: '' },
    uniqueArtists: 0,
    uniqueTracks: 0,
    uniqueAlbums: 0,
    totalListeningMilliseconds: 0,
    totalListeningHours: 0,
    averageListeningMinutes: 0,
    yearlyListening: [],
    monthlyListening: [],
    hourlyListening: [],
    weekdayListening: [],
    platformDistribution: [],
    topArtists: [],
    topTracks: [],
    topAlbums: [],
    yearlyRecordCounts: [],
    yearlySkipRates: [],
    yearlySkippedCounts: [],
    shuffleDistribution: [],
    reasonStartDistribution: [],
    reasonEndDistribution: [],
    artistEvolution: [],
    trackEvolution: [],
    listeningHeatmap: [],
  };
}
