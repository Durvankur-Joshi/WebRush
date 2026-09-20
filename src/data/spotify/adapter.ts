import { SpotifyAnalytics } from '../../types/spotify';
import { DatasetMeta } from '../../types/common';
import { DATASET_METADATA } from '../../lib/constants';
import { computeSpotifyAnalytics, createEmptySpotifyAnalytics } from '../../analytics/spotify';
import { SpotifyNormalizedRecord } from './types';
import { loadSpotifyData } from './loader';

export interface SpotifyAdapter {
  getMetadata(): DatasetMeta;
  loadAnalytics(): Promise<SpotifyAnalytics>;
  processRecords(records: SpotifyNormalizedRecord[]): SpotifyAnalytics;
}

export class DefaultSpotifyAdapter implements SpotifyAdapter {
  private cachedAnalytics: SpotifyAnalytics | null = null;

  getMetadata(): DatasetMeta {
    return DATASET_METADATA['spotify'] as DatasetMeta;
  }

  processRecords(records: SpotifyNormalizedRecord[]): SpotifyAnalytics {
    this.cachedAnalytics = computeSpotifyAnalytics(records);
    return this.cachedAnalytics;
  }

  async loadAnalytics(): Promise<SpotifyAnalytics> {
    if (this.cachedAnalytics) {
      return this.cachedAnalytics;
    }
    try {
      const { records } = await loadSpotifyData();
      this.cachedAnalytics = computeSpotifyAnalytics(records);
      return this.cachedAnalytics;
    } catch {
      return createEmptySpotifyAnalytics();
    }
  }
}

export const spotifyAdapter = new DefaultSpotifyAdapter();
