import { apiFetch } from '@/portal/api/client';
import type { TimeShareRequestResponse, PricingTierResponse, StartupUsageSummary } from '@/portal/api/types';

// ---------------------------------------------------------------------------
// Time-Share Requests
// ---------------------------------------------------------------------------

export async function createTimeShareRequestApi(data: {
  program_id: string;
  recipient_id: string;
  request_type: string;
  hours_requested: number;
  message?: string;
}): Promise<TimeShareRequestResponse> {
  return apiFetch<TimeShareRequestResponse>('/timeshare/requests', { method: 'POST', body: data });
}

export async function listTimeShareRequestsApi(
  programId: string,
  status?: string,
): Promise<TimeShareRequestResponse[]> {
  const params = status ? `?status=${status}` : '';
  return apiFetch<TimeShareRequestResponse[]>(`/timeshare/programs/${programId}/requests${params}`, { method: 'GET' });
}

export async function resolveTimeShareRequestApi(
  requestId: string,
  data: { action: string; reason?: string },
): Promise<TimeShareRequestResponse> {
  return apiFetch<TimeShareRequestResponse>(`/timeshare/requests/${requestId}/resolve`, { method: 'POST', body: data });
}

// ---------------------------------------------------------------------------
// Startup Usage
// ---------------------------------------------------------------------------

export async function getStartupUsageApi(
  programId: string,
  startupUserId: string,
): Promise<StartupUsageSummary> {
  return apiFetch<StartupUsageSummary>(`/timeshare/programs/${programId}/usage/${startupUserId}`, { method: 'GET' });
}

// ---------------------------------------------------------------------------
// Pricing Tiers
// ---------------------------------------------------------------------------

export async function listPricingTiersApi(programId: string): Promise<PricingTierResponse[]> {
  return apiFetch<PricingTierResponse[]>(`/timeshare/programs/${programId}/tiers`, { method: 'GET' });
}

export async function createPricingTierApi(
  programId: string,
  data: {
    tier_name: string;
    price_per_hour: number;
    accessible_cio_types?: string[];
    max_hours?: number;
    description?: string;
  },
): Promise<PricingTierResponse> {
  return apiFetch<PricingTierResponse>(`/timeshare/programs/${programId}/tiers`, { method: 'POST', body: data });
}

export async function updatePricingTierApi(
  programId: string,
  tierId: string,
  data: {
    tier_name?: string;
    price_per_hour?: number;
    accessible_cio_types?: string[];
    max_hours?: number | null;
    description?: string;
  },
): Promise<PricingTierResponse> {
  return apiFetch<PricingTierResponse>(
    `/timeshare/programs/${programId}/tiers/${tierId}`,
    { method: 'PATCH', body: data },
  );
}

export async function deletePricingTierApi(
  programId: string,
  tierId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/timeshare/programs/${programId}/tiers/${tierId}`,
    { method: 'DELETE' },
  );
}

export async function deleteTimeShareRequestApi(
  requestId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/timeshare/requests/${requestId}`,
    { method: 'DELETE' },
  );
}
