import { apiFetch } from '@/portal/api/client';
import type {
  ApiAvailabilityWindowCreateBody,
  ApiAvailabilityWindowJson,
  ApiGraphSyncResultJson,
  ApiLumaRecordCreateBody,
  ApiLumaRecordJson,
  ApiLumaRecordPatchBody,
  ApiMeetingActionItemCreateBody,
  ApiMeetingActionItemJson,
  ApiMeetingActionItemPatchBody,
  ApiMeetingCancellationBody,
  ApiMeetingCancellationJson,
  ApiMeetingOutcomeBody,
  ApiMeetingOutcomeJson,
  ApiMeetingRefreshArtifactsBody,
  ApiMeetingRefreshArtifactsResultJson,
  ApiMeetingRequestAcceptBody,
  ApiMeetingRequestJson,
  ApiMeetingSessionNotePatchBody,
  ApiMeetingSessionNoteBody,
  ApiMeetingSessionNoteJson,
  ApiMeetingsWebhookRenewResultJson,
  ApiMemberSessionMeetingJson,
  ApiMemberSessionMeetingsQuery,
  ApiMomentumSignalCreateBody,
  ApiMomentumSignalJson,
  ApiOnboardingCaseJson,
  ApiOnboardingCasePatchJson,
  ApiProfileNoteCreateBody,
  ApiProfileNoteJson,
  ApiScheduledMeetingJson,
  ApiTaskJson,
} from '@/portal/api/types';

export async function listTasksApi(): Promise<ApiTaskJson[]> {
  return apiFetch<ApiTaskJson[]>('/ops/tasks', { method: 'GET' });
}

export async function listOnboardingCasesApi(): Promise<ApiOnboardingCaseJson[]> {
  return apiFetch<ApiOnboardingCaseJson[]>('/ops/onboarding', { method: 'GET' });
}

export async function patchOnboardingCaseApi(
  caseId: string,
  body: ApiOnboardingCasePatchJson,
): Promise<ApiOnboardingCaseJson> {
  return apiFetch<ApiOnboardingCaseJson>(`/ops/onboarding/${caseId}`, { method: 'PATCH', body });
}

export async function patchTaskApi(taskId: string, body: Record<string, unknown>): Promise<ApiTaskJson> {
  return apiFetch<ApiTaskJson>(`/ops/tasks/${taskId}`, { method: 'PATCH', body });
}

export async function listMeetingRequestsApi(): Promise<ApiMeetingRequestJson[]> {
  return apiFetch<ApiMeetingRequestJson[]>('/ops/meeting-requests', { method: 'GET' });
}

export async function acceptMeetingRequestApi(
  requestId: string,
  body: ApiMeetingRequestAcceptBody,
): Promise<ApiScheduledMeetingJson> {
  return apiFetch<ApiScheduledMeetingJson>(`/ops/meeting-requests/${requestId}/accept`, {
    method: 'POST',
    body,
  });
}

function buildMemberSessionsQuery(query: ApiMemberSessionMeetingsQuery): string {
  const q = new URLSearchParams();
  if (query.session_filter) {
    q.set('session_filter', query.session_filter);
  }
  if (query.event_id) {
    q.set('event_id', query.event_id);
  }
  if (query.scope) {
    q.set('scope', query.scope);
  }
  if (query.search) {
    q.set('search', query.search);
  }
  if (query.page_size) {
    q.set('page_size', String(query.page_size));
  }
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Teams-first member session list with server-side filters (falls back to legacy endpoints in the hook on failure). */
export async function listMemberSessionMeetingsApi(
  query: ApiMemberSessionMeetingsQuery = {},
): Promise<ApiMemberSessionMeetingJson[]> {
  return apiFetch<ApiMemberSessionMeetingJson[]>(
    `/ops/member-sessions/meetings${buildMemberSessionsQuery(query)}`,
    { method: 'GET' },
  );
}

export async function postScheduledMeetingGraphSyncApi(meetingId: string): Promise<ApiGraphSyncResultJson> {
  return apiFetch<ApiGraphSyncResultJson>(`/ops/scheduled-meetings/${meetingId}/graph-sync`, {
    method: 'POST',
    body: {},
  });
}

export async function postScheduledMeetingRefreshArtifactsApi(
  meetingId: string,
  body?: ApiMeetingRefreshArtifactsBody,
): Promise<ApiMeetingRefreshArtifactsResultJson> {
  return apiFetch<ApiMeetingRefreshArtifactsResultJson>(
    `/ops/scheduled-meetings/${meetingId}/refresh-artifacts`,
    { method: 'POST', body: body ?? {} },
  );
}

/** Renew Teams/Graph webhook subscriptions for meeting lifecycle notifications. */
export async function postMeetingsSubscriptionsRenewApi(): Promise<ApiMeetingsWebhookRenewResultJson> {
  return apiFetch<ApiMeetingsWebhookRenewResultJson>('/ops/meetings/subscriptions/renew', {
    method: 'POST',
    body: {},
  });
}

export async function listMyScheduledMeetingsApi(): Promise<ApiScheduledMeetingJson[]> {
  return apiFetch<ApiScheduledMeetingJson[]>('/ops/scheduled-meetings/mine', { method: 'GET' });
}

export async function listScheduledMeetingsForEventApi(eventId: string): Promise<ApiScheduledMeetingJson[]> {
  return apiFetch<ApiScheduledMeetingJson[]>(`/ops/events/${eventId}/scheduled-meetings`, {
    method: 'GET',
  });
}

export async function cancelScheduledMeetingApi(
  meetingId: string,
  body: ApiMeetingCancellationBody,
): Promise<ApiMeetingCancellationJson> {
  return apiFetch<ApiMeetingCancellationJson>(`/ops/scheduled-meetings/${meetingId}/cancel`, {
    method: 'POST',
    body,
  });
}

export async function createMeetingSessionNoteApi(
  meetingId: string,
  body: ApiMeetingSessionNoteBody,
): Promise<ApiMeetingSessionNoteJson> {
  return apiFetch<ApiMeetingSessionNoteJson>(`/ops/scheduled-meetings/${meetingId}/notes`, {
    method: 'POST',
    body,
  });
}

export async function patchMeetingSessionNoteApi(
  noteId: string,
  body: ApiMeetingSessionNotePatchBody,
): Promise<ApiMeetingSessionNoteJson> {
  return apiFetch<ApiMeetingSessionNoteJson>(`/ops/meeting-session-notes/${noteId}`, {
    method: 'PATCH',
    body,
  });
}

export async function upsertMeetingOutcomeApi(
  meetingId: string,
  body: ApiMeetingOutcomeBody,
): Promise<ApiMeetingOutcomeJson> {
  return apiFetch<ApiMeetingOutcomeJson>(`/ops/scheduled-meetings/${meetingId}/outcome`, {
    method: 'PUT',
    body,
  });
}

export async function createMeetingActionItemApi(
  meetingId: string,
  body: ApiMeetingActionItemCreateBody,
): Promise<ApiMeetingActionItemJson> {
  return apiFetch<ApiMeetingActionItemJson>(`/ops/scheduled-meetings/${meetingId}/action-items`, {
    method: 'POST',
    body,
  });
}

export async function patchMeetingActionItemApi(
  itemId: string,
  body: ApiMeetingActionItemPatchBody,
): Promise<ApiMeetingActionItemJson> {
  return apiFetch<ApiMeetingActionItemJson>(`/ops/meeting-action-items/${itemId}`, {
    method: 'PATCH',
    body,
  });
}

export async function listProfileNotesApi(
  subjectKind: 'user' | 'startup',
  subjectId: string,
): Promise<ApiProfileNoteJson[]> {
  const q = new URLSearchParams({
    subject_kind: subjectKind,
    subject_id: subjectId,
  });
  return apiFetch<ApiProfileNoteJson[]>(`/ops/profile-notes?${q.toString()}`, { method: 'GET' });
}

export async function createProfileNoteApi(body: ApiProfileNoteCreateBody): Promise<ApiProfileNoteJson> {
  return apiFetch<ApiProfileNoteJson>('/ops/profile-notes', { method: 'POST', body });
}

export async function listMomentumSignalsApi(
  subjectKind: 'user' | 'startup',
  subjectId: string,
): Promise<ApiMomentumSignalJson[]> {
  const q = new URLSearchParams({
    subject_kind: subjectKind,
    subject_id: subjectId,
  });
  return apiFetch<ApiMomentumSignalJson[]>(`/ops/momentum-signals?${q.toString()}`, { method: 'GET' });
}

export async function createMomentumSignalApi(
  body: ApiMomentumSignalCreateBody,
): Promise<ApiMomentumSignalJson> {
  return apiFetch<ApiMomentumSignalJson>('/ops/momentum-signals', { method: 'POST', body });
}

export async function listAvailabilityWindowsApi(userId: string): Promise<ApiAvailabilityWindowJson[]> {
  return apiFetch<ApiAvailabilityWindowJson[]>(`/ops/users/${userId}/availability`, { method: 'GET' });
}

export async function createAvailabilityWindowApi(
  userId: string,
  body: ApiAvailabilityWindowCreateBody,
): Promise<ApiAvailabilityWindowJson> {
  return apiFetch<ApiAvailabilityWindowJson>(`/ops/users/${userId}/availability`, { method: 'POST', body });
}

export async function listLumaRecordsApi(): Promise<ApiLumaRecordJson[]> {
  return apiFetch<ApiLumaRecordJson[]>('/ops/luma-records', { method: 'GET' });
}

export async function createLumaRecordApi(body: ApiLumaRecordCreateBody): Promise<ApiLumaRecordJson> {
  return apiFetch<ApiLumaRecordJson>('/ops/luma-records', { method: 'POST', body });
}

export async function patchLumaRecordApi(
  recordId: string,
  body: ApiLumaRecordPatchBody,
): Promise<ApiLumaRecordJson> {
  return apiFetch<ApiLumaRecordJson>(`/ops/luma-records/${recordId}`, { method: 'PATCH', body });
}

export async function syncLumaRecordGuestsApi(recordId: string): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>(`/ops/luma-records/${recordId}/sync-guests`, {
    method: 'POST',
  });
}

export async function lumaProxyEventCreateApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/ops/luma/proxy/event-create', {
    method: 'POST',
    body: { payload },
  });
}

export async function lumaProxyAddGuestsApi(body: {
  event_api_id: string;
  guests: Record<string, unknown>[];
  extra?: Record<string, unknown> | null;
}): Promise<Record<string, unknown>> {
  return apiFetch<Record<string, unknown>>('/ops/luma/proxy/add-guests', { method: 'POST', body });
}

// --- Admin email queue endpoints ---

export interface EmailQueueEntry {
  id: string;
  user_id: string;
  email_type: string;
  status: string;
  created_at: string;
  sent_at?: string | null;
  attempt_count?: number;
  last_error?: string | null;
  provider_message_id?: string | null;
  user_email?: string;
  user_name?: string;
}

/** List all entries in the onboarding email queue. */
export async function listEmailQueueApi(): Promise<EmailQueueEntry[]> {
  return apiFetch<EmailQueueEntry[]>('/admin/email-queue', { method: 'GET' });
}

/** Attempt delivery for retryable email queue entries. */
export async function flushEmailQueueApi(): Promise<{
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  return apiFetch<{
    attempted: number;
    sent: number;
    failed: number;
    skipped: number;
  }>('/admin/email-queue/flush', { method: 'POST' });
}
