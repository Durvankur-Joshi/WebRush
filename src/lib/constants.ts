import { DatasetMeta, RouteId } from '../types/common';

export const APP_NAME = 'LIFELINE';
export const APP_TAGLINE = 'Your Life, In Receipts';
export const APP_DESCRIPTION = 'An interactive personal-data observatory discovering meaningful patterns and stories from fragmented digital receipts.';

export const DATASET_METADATA: Record<string, DatasetMeta> = {
  spotify: {
    id: 'spotify',
    name: 'Spotify Streaming History',
    tagline: '11-Year Auditory Footprint',
    timeRange: '2013 – 2024',
    recordCountEstimate: '149,860 streams',
    unit: 'hours',
    accentColor: '#10B981', // Emerald
  },
  household: {
    id: 'household',
    name: 'Daily Household Ledger',
    tagline: 'Domestic Financial Micro-Journal',
    timeRange: '2015 – 2018',
    recordCountEstimate: '2,461 records',
    unit: 'INR',
    accentColor: '#38BDF8', // Celestial Cyan
  },
  transactions: {
    id: 'transactions',
    name: 'Multi-Facet Card Transact',
    tagline: 'Modern Digital Commerce Stream',
    timeRange: '2022 – 2024',
    recordCountEstimate: '8,725 transactions',
    unit: 'INR',
    accentColor: '#F59E0B', // Amber
  },
};

export const NAVIGATION_ROUTES: { id: RouteId; label: string; description: string; icon: string }[] = [
  {
    id: 'observatory',
    label: 'Observatory',
    description: 'Macro overview of all receipt streams across time',
    icon: 'Compass',
  },
  {
    id: 'explore',
    label: 'Explorer',
    description: 'Sanitized multi-dimensional receipt inspector',
    icon: 'Search',
  },
  {
    id: 'discover',
    label: 'Discoveries',
    description: 'Algorithmic pattern recognition and anomalies',
    icon: 'Sparkles',
  },
  {
    id: 'story',
    label: 'Story',
    description: 'Synthesized life narrative backed by evidentiary receipts',
    icon: 'BookOpen',
  },
];

export const CAUSALITY_DISCLAIMER = 
  'Datasets span differing eras (Spotify: 2013–2024, Household: 2015–2018, India: 2022–2024) without a shared identity key. ' +
  'Comparisons reflect longitudinal temporal shifts and comparative analysis, not direct causal claims.';
