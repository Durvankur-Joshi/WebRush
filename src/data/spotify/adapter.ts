import { SpotifyAnalytics, SpotifyRawRecord } from '../../types/spotify';
import { DatasetMeta } from '../../types/common';
import { DATASET_METADATA } from '../../lib/constants';
import { computeSpotifyAnalytics, createEmptySpotifyAnalytics } from '../../analytics/spotify';

export interface SpotifyAdapter {
  getMetadata(): DatasetMeta;
  loadAnalytics(): Promise<SpotifyAnalytics>;
  processRawRecords(records: SpotifyRawRecord[]): SpotifyAnalytics;
}

export class DefaultSpotifyAdapter implements SpotifyAdapter {
  private cachedAnalytics: SpotifyAnalytics | null = null;

  getMetadata(): DatasetMeta {
    return DATASET_METADATA['spotify'] as DatasetMeta;
  }

  processRawRecords(records: SpotifyRawRecord[]): SpotifyAnalytics {
    this.cachedAnalytics = computeSpotifyAnalytics(records);
    return this.cachedAnalytics;
  }

  async loadAnalytics(): Promise<SpotifyAnalytics> {
    if (this.cachedAnalytics) {
      return this.cachedAnalytics;
    }
    // Returns default empty structure until preprocessed/loaded
    return createEmptySpotifyAnalytics();
  }
}

export const spotifyAdapter = new DefaultSpotifyAdapter();
