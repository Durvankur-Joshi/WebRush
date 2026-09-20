import { useState, useEffect, useCallback } from 'react';
import { LifeAnalytics, getLifeAnalytics, clearLifeAnalyticsCache } from '../analytics';

export interface UseLifeAnalyticsReturn {
  analytics: LifeAnalytics | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useLifeAnalytics(): UseLifeAnalyticsReturn {
  const [analytics, setAnalytics] = useState<LifeAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLifeAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load LifeAnalytics:', err);
      setError(err?.message || 'Failed to calibrate observatory telemetry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const reload = useCallback(async () => {
    clearLifeAnalyticsCache();
    await loadData();
  }, [loadData]);

  return { analytics, loading, error, reload };
}
