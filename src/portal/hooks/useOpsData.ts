import { useCallback, useEffect, useState } from 'react';
import { USE_API_AUTH } from '@/portal/api/config';
import { listOnboardingCasesApi, listTasksApi } from '@/portal/api/ops';
import type { ApiOnboardingCaseJson, ApiTaskJson } from '@/portal/api/types';
import { getStoredAccessToken } from '@/portal/api/tokenStorage';
import type { UserTier } from '@/portal/data/mock/types';

const OPS_TIERS: UserTier[] = ['admin', 'dev'];

export interface UseOpsDataResult {
  tasks: ApiTaskJson[];
  onboardingCases: ApiOnboardingCaseJson[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Loads `/ops/tasks` and `/ops/onboarding` when API auth is on and the viewer is admin/dev.
 * No-op (empty data) in mock mode or for non-admin users.
 */
export function useOpsData(tier: UserTier | undefined): UseOpsDataResult {
  const [tasks, setTasks] = useState<ApiTaskJson[]>([]);
  const [onboardingCases, setOnboardingCases] = useState<ApiOnboardingCaseJson[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canFetch = Boolean(
    USE_API_AUTH && tier && OPS_TIERS.includes(tier) && getStoredAccessToken(),
  );

  const refetch = useCallback(async (): Promise<void> => {
    if (!canFetch) {
      setTasks([]);
      setOnboardingCases([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [t, o] = await Promise.all([listTasksApi(), listOnboardingCasesApi()]);
      setTasks(t);
      setOnboardingCases(o);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load ops data');
      setTasks([]);
      setOnboardingCases([]);
    } finally {
      setLoading(false);
    }
  }, [canFetch]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { tasks, onboardingCases, loading, error, refetch };
}
