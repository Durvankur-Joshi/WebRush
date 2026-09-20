import { SpotifyAnalytics, SpotifyRawRecord, TopArtist, TopTrack, YearlyListeningMetric, MonthlyListeningMetric, ArtistEvolution } from '../types/spotify';
import { HourlyDistribution, WeekdayDistribution } from '../types/common';
import { parseCustomDate } from '../lib/formatters';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Transforms raw Spotify records into compact analytical structure.
 * Designed for offline processing so React components never touch raw arrays.
 */
export function computeSpotifyAnalytics(records: SpotifyRawRecord[]): SpotifyAnalytics {
  if (!records || records.length === 0) {
    return createEmptySpotifyAnalytics();
  }

  let minTs = records[0]?.ts || '';
  let maxTs = records[0]?.ts || '';
  let totalMs = 0;

  const artistMap = new Map<string, { ms: number; count: number; skips: number; firstSeen: string; yearMap: Map<number, number> }>();
  const trackMap = new Map<string, { artist: string; count: number; ms: number }>();
  const yearlyMap = new Map<number, { ms: number; count: number; skips: number }>();
  const monthlyMap = new Map<string, { ms: number; count: number }>();
  const hourlyCount = new Array(24).fill(0);
  const weekdayCount = new Array(7).fill(0);

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    if (!r) continue;

    // Timeframe bounds
    if (r.ts) {
      if (r.ts < minTs) minTs = r.ts;
      if (r.ts > maxTs) maxTs = r.ts;
    }

    const ms = Number(r.ms_played) || 0;
    totalMs += ms;
    const isSkipped = Boolean(r.skipped);

    // Artist aggregations
    const artist = (r.artist_name || 'Unknown Artist').trim();
    let aData = artistMap.get(artist);
    if (!aData) {
      aData = { ms: 0, count: 0, skips: 0, firstSeen: r.ts || '', yearMap: new Map() };
      artistMap.set(artist, aData);
    }
    aData.ms += ms;
    aData.count += 1;
    if (isSkipped) aData.skips += 1;
    if (r.ts && r.ts < aData.firstSeen) aData.firstSeen = r.ts;

    // Track aggregations
    const track = (r.track_name || 'Unknown Track').trim();
    const trackKey = `${track} — ${artist}`;
    let tData = trackMap.get(trackKey);
    if (!tData) {
      tData = { artist, count: 0, ms: 0 };
      trackMap.set(trackKey, tData);
    }
    tData.count += 1;
    tData.ms += ms;

    // Date parsing
    if (r.ts) {
      const dt = parseCustomDate(r.ts);
      if (!isNaN(dt.getTime())) {
        const yr = dt.getUTCFullYear();
        const hr = dt.getUTCHours();
        const wd = dt.getUTCDay();
        const ym = `${yr}-${(dt.getUTCMonth() + 1).toString().padStart(2, '0')}`;

        // Hourly & Weekday
        hourlyCount[hr] = (hourlyCount[hr] || 0) + 1;
        weekdayCount[wd] = (weekdayCount[wd] || 0) + 1;

        // Yearly
        let yData = yearlyMap.get(yr);
        if (!yData) {
          yData = { ms: 0, count: 0, skips: 0 };
          yearlyMap.set(yr, yData);
        }
        yData.ms += ms;
        yData.count += 1;
        if (isSkipped) yData.skips += 1;

        // Monthly
        let mData = monthlyMap.get(ym);
        if (!mData) {
          mData = { ms: 0, count: 0 };
          monthlyMap.set(ym, mData);
        }
        mData.ms += ms;
        mData.count += 1;

        // Artist year count for peak
        aData.yearMap.set(yr, (aData.yearMap.get(yr) || 0) + ms);
      }
    }
  }

  // Top artists (by total hours)
  const topArtists: TopArtist[] = Array.from(artistMap.entries())
    .map(([artist, data]) => ({
      artist,
      hours: Number((data.ms / (1000 * 60 * 60)).toFixed(1)),
      playCount: data.count,
      skipRate: Number((data.skips / Math.max(1, data.count)).toFixed(3)),
    }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 20);

  // Top tracks (by playCount)
  const topTracks: TopTrack[] = Array.from(trackMap.entries())
    .map(([key, data]) => {
      const trackName = key.split(' — ')[0] || key;
      return {
        track: trackName,
        artist: data.artist,
        playCount: data.count,
        hours: Number((data.ms / (1000 * 60 * 60)).toFixed(1)),
      };
    })
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 20);

  // Yearly metrics
  const yearlyListening: YearlyListeningMetric[] = Array.from(yearlyMap.entries())
    .map(([year, data]) => ({
      year,
      hours: Number((data.ms / (1000 * 60 * 60)).toFixed(1)),
      playCount: data.count,
      skipRate: Number((data.skips / Math.max(1, data.count)).toFixed(3)),
    }))
    .sort((a, b) => a.year - b.year);

  // Monthly metrics
  const monthlyListening: MonthlyListeningMetric[] = Array.from(monthlyMap.entries())
    .map(([yearMonth, data]) => ({
      yearMonth,
      hours: Number((data.ms / (1000 * 60 * 60)).toFixed(1)),
      playCount: data.count,
    }))
    .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  // Hourly distribution
  const hourlyListening: HourlyDistribution[] = hourlyCount.map((count, hour) => ({
    hour,
    count,
  }));

  // Weekday distribution
  const weekdayListening: WeekdayDistribution[] = weekdayCount.map((count, day) => ({
    day,
    dayName: WEEKDAYS[day] || `Day ${day}`,
    count,
  }));

  // Artist evolution for top 10 artists
  const artistEvolution: ArtistEvolution[] = topArtists.slice(0, 10).map((a) => {
    const rawData = artistMap.get(a.artist);
    let peakYr = 2013;
    let maxPeakMs = 0;
    if (rawData) {
      for (const [yr, yrMs] of rawData.yearMap.entries()) {
        if (yrMs > maxPeakMs) {
          maxPeakMs = yrMs;
          peakYr = yr;
        }
      }
    }
    return {
      artist: a.artist,
      firstPlayed: rawData?.firstSeen || '',
      peakYear: peakYr,
      totalHours: a.hours,
    };
  });

  return {
    totalRecords: records.length,
    dateRange: { start: minTs.slice(0, 10), end: maxTs.slice(0, 10) },
    totalListeningHours: Number((totalMs / (1000 * 60 * 60)).toFixed(1)),
    uniqueArtists: artistMap.size,
    uniqueTracks: trackMap.size,
    yearlyListening,
    monthlyListening,
    hourlyListening,
    weekdayListening,
    topArtists,
    topTracks,
    yearlySkipRates: yearlyListening.map((y) => ({ year: y.year, skipRate: y.skipRate })),
    artistEvolution,
  };
}

export function createEmptySpotifyAnalytics(): SpotifyAnalytics {
  return {
    totalRecords: 0,
    dateRange: { start: '2013-01-01', end: '2024-01-01' },
    totalListeningHours: 0,
    uniqueArtists: 0,
    uniqueTracks: 0,
    yearlyListening: [],
    monthlyListening: [],
    hourlyListening: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 })),
    weekdayListening: WEEKDAYS.map((name, i) => ({ day: i, dayName: name, count: 0 })),
    topArtists: [],
    topTracks: [],
    yearlySkipRates: [],
    artistEvolution: [],
  };
}
