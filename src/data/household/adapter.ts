import { HouseholdAnalytics, HouseholdRawRecord } from '../../types/household';
import { DatasetMeta } from '../../types/common';
import { DATASET_METADATA } from '../../lib/constants';
import { computeHouseholdAnalytics, createEmptyHouseholdAnalytics } from '../../analytics/household';

export interface HouseholdAdapter {
  getMetadata(): DatasetMeta;
  loadAnalytics(): Promise<HouseholdAnalytics>;
  processRawRecords(records: HouseholdRawRecord[]): HouseholdAnalytics;
}

export class DefaultHouseholdAdapter implements HouseholdAdapter {
  private cachedAnalytics: HouseholdAnalytics | null = null;

  getMetadata(): DatasetMeta {
    return DATASET_METADATA['household'] as DatasetMeta;
  }

  processRawRecords(records: HouseholdRawRecord[]): HouseholdAnalytics {
    this.cachedAnalytics = computeHouseholdAnalytics(records);
    return this.cachedAnalytics;
  }

  async loadAnalytics(): Promise<HouseholdAnalytics> {
    if (this.cachedAnalytics) {
      return this.cachedAnalytics;
    }
    return createEmptyHouseholdAnalytics();
  }
}

export const householdAdapter = new DefaultHouseholdAdapter();
