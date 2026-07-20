/**
 * Sandbox API client — onboarding test harness (Spec 01).
 *
 * Backend routes under `/api/admin/sandbox`:
 *   POST /walk-onboarding  — fire a sandbox onboarding email
 *   GET  /runs              — list recent sandbox runs
 *   GET  /runs/{id}         — detail of a specific run
 */

import { apiFetch } from '@/portal/api/client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalkOnboardingRequest {
  flow: 'cxo' | 'startup' | 'vc';
  target_email?: string;
  recipient?: string; // "self" (default) or "info@globalcxocircle.com"
}

export interface WalkOnboardingResponse {
  run_id: string;
  email_type: string;
  sent_to: string;
  status: string;
}

export interface SandboxRunSummary {
  id: string;
  email_type: string;
  status: string;
  sent_to: string;
  original_to: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export function walkOnboardingApi(body: WalkOnboardingRequest) {
  return apiFetch<WalkOnboardingResponse>('/admin/sandbox/walk-onboarding', {
    method: 'POST',
    body,
  });
}

export function listSandboxRunsApi(limit = 50, offset = 0) {
  return apiFetch<SandboxRunSummary[]>(
    `/admin/sandbox/runs?limit=${limit}&offset=${offset}`,
  );
}

export function getSandboxRunApi(runId: string) {
  return apiFetch<SandboxRunSummary>(`/admin/sandbox/runs/${runId}`);
}
