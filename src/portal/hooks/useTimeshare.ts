import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { TimeShareRequestResponse, PricingTierResponse } from '@/portal/api/types';
import {
  createTimeShareRequestApi,
  listTimeShareRequestsApi,
  resolveTimeShareRequestApi,
  getStartupUsageApi,
  listPricingTiersApi,
  createPricingTierApi,
  updatePricingTierApi,
  deletePricingTierApi,
  deleteTimeShareRequestApi,
} from '@/portal/api/timeshare';

// ---------------------------------------------------------------------------
// Optimistic helpers (same pattern as usePrograms)
// ---------------------------------------------------------------------------

type Snapshot = { key: readonly unknown[]; data: unknown }[];

async function snap(qc: ReturnType<typeof useQueryClient>, keys: (readonly unknown[])[]) {
  const snaps: Snapshot = [];
  for (const key of keys) {
    await qc.cancelQueries({ queryKey: key });
    snaps.push({ key, data: qc.getQueryData(key) });
  }
  return snaps;
}

function rollback(qc: ReturnType<typeof useQueryClient>, snaps: Snapshot) {
  for (const s of snaps) qc.setQueryData(s.key, s.data);
}

function settle(qc: ReturnType<typeof useQueryClient>, keys: (readonly unknown[])[]) {
  for (const key of keys) void qc.invalidateQueries({ queryKey: key });
}

// ---------------------------------------------------------------------------
// Time-Share Requests
// ---------------------------------------------------------------------------

export function useTimeShareRequests(programId: string | null, status?: string) {
  return useQuery({
    queryKey: ['timeshare', 'requests', programId, status],
    queryFn: () => listTimeShareRequestsApi(programId!, status),
    enabled: !!programId,
  });
}

export function useCreateTimeShareRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTimeShareRequestApi,
    onMutate: async () => {
      const snaps = await snap(qc, [['timeshare', 'requests']]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['timeshare', 'requests'] });
    },
  });
}

export function useResolveTimeShareRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, ...body }: { requestId: string; action: string; reason?: string }) =>
      resolveTimeShareRequestApi(requestId, body),
    onMutate: async ({ requestId, action }) => {
      const allKeys = qc.getQueriesData<TimeShareRequestResponse[]>({ queryKey: ['timeshare', 'requests'] });
      const snaps: Snapshot = [];
      for (const [key, data] of allKeys) {
        await qc.cancelQueries({ queryKey: key });
        snaps.push({ key, data });
        if (Array.isArray(data)) {
          qc.setQueryData<TimeShareRequestResponse[]>(key,
            data.map((r) => r.id === requestId ? { ...r, status: action === 'approve' ? 'approved' : 'denied' } : r),
          );
        }
      }
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: (data) => {
      if (data?.program_id) {
        settle(qc, [
          ['timeshare', 'requests', data.program_id],
          ['programs', data.program_id, 'assignments'],
        ]);
      } else {
        void qc.invalidateQueries({ queryKey: ['timeshare', 'requests'] });
      }
    },
  });
}

export function useDeleteTimeShareRequest(programId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (requestId: string) => deleteTimeShareRequestApi(requestId),
    onMutate: async (requestId) => {
      const allKeys = qc.getQueriesData<TimeShareRequestResponse[]>({ queryKey: ['timeshare', 'requests', programId] });
      const snaps: Snapshot = [];
      for (const [key, data] of allKeys) {
        await qc.cancelQueries({ queryKey: key });
        snaps.push({ key, data });
        if (Array.isArray(data)) {
          qc.setQueryData<TimeShareRequestResponse[]>(key, data.filter((r) => r.id !== requestId));
        }
      }
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, [['timeshare', 'requests', programId]]),
  });
}

// ---------------------------------------------------------------------------
// Startup Usage
// ---------------------------------------------------------------------------

export function useStartupUsage(programId: string | null, startupUserId: string | null) {
  return useQuery({
    queryKey: ['timeshare', 'usage', programId, startupUserId],
    queryFn: () => getStartupUsageApi(programId!, startupUserId!),
    enabled: !!programId && !!startupUserId,
  });
}

// ---------------------------------------------------------------------------
// Pricing Tiers — optimistic
// ---------------------------------------------------------------------------

export function usePricingTiers(programId: string | null) {
  return useQuery({
    queryKey: ['timeshare', 'tiers', programId],
    queryFn: () => listPricingTiersApi(programId!),
    enabled: !!programId,
  });
}

export function useCreatePricingTier(programId: string | null) {
  const qc = useQueryClient();
  const keys = [['timeshare', 'tiers', programId] as const];
  return useMutation({
    mutationFn: (data: Parameters<typeof createPricingTierApi>[1]) =>
      createPricingTierApi(programId!, data),
    onMutate: async (data) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<PricingTierResponse[]>(keys[0], (old) => [
        ...(old ?? []),
        { id: `temp-${Date.now()}`, program_id: programId!, ...data, created_at: new Date().toISOString() } as PricingTierResponse,
      ]);
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useUpdatePricingTier(programId: string | null) {
  const qc = useQueryClient();
  const keys = [['timeshare', 'tiers', programId] as const];
  return useMutation({
    mutationFn: ({ tierId, data }: { tierId: string; data: Parameters<typeof updatePricingTierApi>[2] }) =>
      updatePricingTierApi(programId!, tierId, data),
    onMutate: async ({ tierId, data }) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<PricingTierResponse[]>(keys[0], (old) =>
        (old ?? []).map((t) => (t.id === tierId ? { ...t, ...data } as PricingTierResponse : t)),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}

export function useDeletePricingTier(programId: string | null) {
  const qc = useQueryClient();
  const keys = [['timeshare', 'tiers', programId] as const, ['programs', programId, 'enrollments'] as const];
  return useMutation({
    mutationFn: (tierId: string) => deletePricingTierApi(programId!, tierId),
    onMutate: async (tierId) => {
      const snaps = await snap(qc, keys);
      qc.setQueryData<PricingTierResponse[]>(keys[0], (old) =>
        (old ?? []).filter((t) => t.id !== tierId),
      );
      return { snaps };
    },
    onError: (_e, _v, ctx) => ctx && rollback(qc, ctx.snaps),
    onSettled: () => settle(qc, keys),
  });
}
