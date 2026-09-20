import { HouseholdAnalytics } from '../../types/household';
import { DatasetMeta } from '../../types/common';
import { DATASET_METADATA } from '../../lib/constants';
import { computeHouseholdAnalytics, createEmptyHouseholdAnalytics } from '../../analytics/household';
import { HouseholdNormalizedRecord } from './types';
import { loadHouseholdData } from './loader';

export interface HouseholdAdapter {
  getMetadata(): DatasetMeta;
  loadAnalytics(): Promise<HouseholdAnalytics>;
  processRecords(records: HouseholdNormalizedRecord[]): HouseholdAnalytics;
}

export class DefaultHouseholdAdapter implements HouseholdAdapter {
  private cachedAnalytics: HouseholdAnalytics | null = null;

  getMetadata(): DatasetMeta {
    return DATASET_METADATA['household'] as DatasetMeta;
  }

  processRecords(records: HouseholdNormalizedRecord[]): HouseholdAnalytics {
    this.cachedAnalytics = computeHouseholdAnalytics(records);
    return this.cachedAnalytics;
  }

  async loadAnalytics(): Promise<HouseholdAnalytics> {
    if (this.cachedAnalytics) {
      return this.cachedAnalytics;
    }
    try {
      const { records } = await loadHouseholdData();
      this.cachedAnalytics = computeHouseholdAnalytics(records);
      return this.cachedAnalytics;
    } catch {
      return createEmptyHouseholdAnalytics();
    }
  }
}

export const householdAdapter = new DefaultHouseholdAdapter();
