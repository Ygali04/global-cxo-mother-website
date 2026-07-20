/**
 * Admin Sessions API client (Spec 06 — Session Console Overhaul).
 *
 * Backend routes under `/api/admin/sessions`:
 *   GET    /                    — paginated sessions with filters
 *   PATCH  /{meeting_id}        — inline session edit
 *   GET    /program-assignments — picker for new-session dialog
 */

import { apiFetch } from '@/portal/api/client';

export interface SessionListItem {
  id: string;
  organizer_user_id: string;
  participant_user_id: string;
  organizer_name: string | null;
  participant_name: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: string;
  session_status: string;
  meeting_type: string | null;
  startup_id: string | null;
  program_name: string | null;
  created_at: string | null;
}

export interface PaginatedSessions {
  items: SessionListItem[];
  total: number;
  next_page: number | null;
}

export interface SessionFilters {
  page?: number;
  page_size?: number;
  status_filter?: string;
  since?: string;
  until?: string;
  q?: string;
}

export interface ProgramAssignmentPickerItem {
  id: string;
  program_id: string;
  program_name: string;
  cxo_user_id: string;
  cxo_name: string;
  startup_user_id: string;
  startup_name: string;
}

export function listAdminSessionsApi(filters: SessionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', String(filters.page));
  if (filters.page_size) params.set('page_size', String(filters.page_size));
  if (filters.status_filter) params.set('status_filter', filters.status_filter);
  if (filters.since) params.set('since', filters.since);
  if (filters.until) params.set('until', filters.until);
  if (filters.q) params.set('q', filters.q);
  const qs = params.toString();
  return apiFetch<PaginatedSessions>(`/admin/sessions${qs ? `?${qs}` : ''}`);
}

export function patchAdminSessionApi(meetingId: string, body: Record<string, unknown>) {
  return apiFetch<SessionListItem>(`/admin/sessions/${meetingId}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteSessionApi(meetingId: string): Promise<void> {
  await apiFetch(`/admin/sessions/${meetingId}`, { method: 'DELETE' });
}

export function listProgramAssignmentsPickerApi(q?: string) {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiFetch<ProgramAssignmentPickerItem[]>(`/admin/sessions/program-assignments${qs}`);
}
