import { apiFetch } from '@/portal/api/client';
import type {
  ProgramResponse,
  EnrollmentResponse,
  AssignmentResponse,
  MyProgramContext,
  ProgramHourSummary,
  OnboardingInfo,
  LedgerEntryResponse,
  FeedbackResponse,
  CreditResponse,
  CohortResponse,
  CohortEnrollmentResponse,
} from '@/portal/api/types';

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

/** POST /programs — create a new advisory program. */
export async function createProgramApi(data: Record<string, unknown>): Promise<ProgramResponse> {
  return apiFetch<ProgramResponse>('/programs', { method: 'POST', body: data });
}

/** GET /programs — list all advisory programs. */
export async function listProgramsApi(): Promise<ProgramResponse[]> {
  return apiFetch<ProgramResponse[]>('/programs', { method: 'GET' });
}

/** GET /programs/me — non-admin user-scoped dashboard payload. */
export async function getMyProgramContextApi(): Promise<MyProgramContext> {
  return apiFetch<MyProgramContext>('/programs/me', { method: 'GET' });
}

/** GET /programs/{id} — get a single advisory program by ID. */
export async function getProgramApi(id: string): Promise<ProgramResponse> {
  return apiFetch<ProgramResponse>(`/programs/${id}`, { method: 'GET' });
}

/** PATCH /programs/{id} — update an advisory program. */
export async function updateProgramApi(
  id: string,
  data: Record<string, unknown>,
): Promise<ProgramResponse> {
  return apiFetch<ProgramResponse>(`/programs/${id}`, { method: 'PATCH', body: data });
}

/** DELETE /programs/{id} — delete a program (only if 0 active users). */
export async function deleteProgramApi(id: string): Promise<void> {
  await apiFetch<void>(`/programs/${id}`, { method: 'DELETE' });
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------

/** POST /programs/{programId}/enroll — enroll a user in a program. */
export async function enrollUserApi(
  programId: string,
  data: Record<string, unknown>,
): Promise<EnrollmentResponse> {
  return apiFetch<EnrollmentResponse>(`/programs/${programId}/enroll`, {
    method: 'POST',
    body: data,
  });
}

/** GET /programs/{programId}/enrollments — list all enrollments for a program. */
export async function listEnrollmentsApi(programId: string): Promise<EnrollmentResponse[]> {
  return apiFetch<EnrollmentResponse[]>(`/programs/${programId}/enrollments`, { method: 'GET' });
}

/** PATCH /programs/{programId}/enrollments/{enrollmentId} — update enrollment status only. */
export async function updateEnrollmentApi(
  programId: string,
  enrollmentId: string,
  data: Record<string, unknown>,
): Promise<EnrollmentResponse> {
  return apiFetch<EnrollmentResponse>(
    `/programs/${programId}/enrollments/${enrollmentId}`,
    { method: 'PATCH', body: data },
  );
}

/** PATCH /programs/{programId}/enrollments/{enrollmentId}/details — update hours, pricing, contract fields. */
export async function updateEnrollmentDetailsApi(
  programId: string,
  enrollmentId: string,
  data: {
    hours_committed?: number;
    hours_used?: number;
    pricing_tier?: string;
    contract_signed?: boolean;
    invoice_sent?: boolean;
  },
): Promise<EnrollmentResponse> {
  return apiFetch<EnrollmentResponse>(
    `/programs/${programId}/enrollments/${enrollmentId}/details`,
    { method: 'PATCH', body: data },
  );
}

/** DELETE /programs/{programId}/enrollments/{enrollmentId} — hard-delete an enrollment row. */
export async function deleteEnrollmentApi(
  programId: string,
  enrollmentId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/programs/${programId}/enrollments/${enrollmentId}`,
    { method: 'DELETE' },
  );
}

// ---------------------------------------------------------------------------
// Assignments
// ---------------------------------------------------------------------------

/** POST /programs/{programId}/assignments — create a CXO↔startup assignment. */
export async function createAssignmentApi(
  programId: string,
  data: Record<string, unknown>,
): Promise<AssignmentResponse> {
  return apiFetch<AssignmentResponse>(`/programs/${programId}/assignments`, {
    method: 'POST',
    body: data,
  });
}

/** GET /programs/{programId}/assignments — list assignments for a program. */
export async function listAssignmentsApi(programId: string): Promise<AssignmentResponse[]> {
  return apiFetch<AssignmentResponse[]>(`/programs/${programId}/assignments`, { method: 'GET' });
}

/** PATCH /programs/{programId}/assignments/{assignmentId} — edit hours/status on an assignment. */
export async function updateAssignmentApi(
  programId: string,
  assignmentId: string,
  data: {
    hours_allocated?: number;
    hours_used?: number;
    status?: string;
  },
): Promise<AssignmentResponse> {
  return apiFetch<AssignmentResponse>(
    `/programs/${programId}/assignments/${assignmentId}`,
    { method: 'PATCH', body: data },
  );
}

/** DELETE /programs/{programId}/assignments/{assignmentId} — remove an assignment. */
export async function deleteAssignmentApi(
  programId: string,
  assignmentId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/programs/${programId}/assignments/${assignmentId}`,
    { method: 'DELETE' },
  );
}

// ---------------------------------------------------------------------------
// Hours
// ---------------------------------------------------------------------------

/** GET /programs/{programId}/hours — get hour summary for a program. */
export async function getProgramHoursApi(programId: string): Promise<ProgramHourSummary> {
  return apiFetch<ProgramHourSummary>(`/programs/${programId}/hours`, { method: 'GET' });
}

// ---------------------------------------------------------------------------
// Onboarding
// ---------------------------------------------------------------------------

/** GET /programs/onboarding/{token} — fetch onboarding info for a token. */
export async function getOnboardingInfoApi(token: string): Promise<OnboardingInfo> {
  return apiFetch<OnboardingInfo>(`/programs/onboarding/${token}`);
}

/** POST /programs/onboarding/{token}/profile — update onboarding profile data. */
export async function updateOnboardingProfileApi(
  token: string,
  data: Record<string, string>,
): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`/programs/onboarding/${token}/profile`, {
    method: 'POST',
    body: data,
  });
}

/** POST /programs/onboarding/{token}/complete — mark onboarding as complete. */
export async function completeOnboardingApi(
  token: string,
): Promise<{ status: string; enrollment_id: string }> {
  return apiFetch<{ status: string; enrollment_id: string }>(
    `/programs/onboarding/${token}/complete`,
    { method: 'POST' },
  );
}

/** POST /programs/onboarding/{token}/calcom-sso — get per-user Cal.com SSO URL. */
export async function getOnboardingCalcomSsoApi(
  token: string,
): Promise<{ redirect_url: string; calcom_username: string | null; expires_in: number }> {
  return apiFetch(`/programs/onboarding/${token}/calcom-sso`, { method: 'POST' });
}

export async function getLedgerApi(programId: string): Promise<LedgerEntryResponse[]> {
  return apiFetch(`/programs/${programId}/hours/ledger`);
}

export async function confirmMeetingApi(
  programId: string,
  ledgerId: string
): Promise<LedgerEntryResponse> {
  return apiFetch(`/programs/${programId}/hours/${ledgerId}/confirm`, { method: 'POST' });
}

export async function disputeMeetingApi(
  programId: string,
  ledgerId: string
): Promise<LedgerEntryResponse> {
  return apiFetch(`/programs/${programId}/hours/${ledgerId}/dispute`, { method: 'POST' });
}

export async function resolveDisputeApi(
  programId: string,
  ledgerId: string,
  data: { action: string; admin_notes?: string }
): Promise<LedgerEntryResponse> {
  return apiFetch(`/programs/${programId}/hours/${ledgerId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function submitFeedbackApi(
  ledgerEntryId: string,
  data: { rating: number; comment?: string; something_wrong?: boolean; wrong_description?: string; extra_time_offered?: number }
): Promise<FeedbackResponse> {
  return apiFetch(`/programs/feedback?ledger_entry_id=${ledgerEntryId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getPendingFeedbackApi(): Promise<LedgerEntryResponse[]> {
  return apiFetch('/programs/feedback/pending');
}

export async function issueCreditApi(
  programId: string,
  data: { startup_user_id: string; hours_credited: number; reason: string }
): Promise<CreditResponse> {
  return apiFetch(`/programs/${programId}/credits`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Cohorts
// ---------------------------------------------------------------------------

export async function listCohortsApi(programId: string): Promise<CohortResponse[]> {
  return apiFetch<CohortResponse[]>(`/programs/${programId}/cohorts`, { method: 'GET' });
}

export async function createCohortApi(programId: string, data: {
  name: string;
  slug: string;
  description?: string;
  max_participants?: number;
  starts_at?: string;
  ends_at?: string;
  admin_email?: string;
  admin_name?: string;
  admin_phone?: string;
  startup_industry?: string;
  startup_description?: string;
  startup_stage?: string;
  startup_ask?: string;
}): Promise<CohortResponse> {
  return apiFetch<CohortResponse>(`/programs/${programId}/cohorts`, { method: 'POST', body: data });
}

export async function updateCohortApi(programId: string, cohortId: string, data: {
  name?: string;
  description?: string;
  status?: string;
  starts_at?: string;
  ends_at?: string;
  max_participants?: number;
}): Promise<CohortResponse> {
  return apiFetch<CohortResponse>(`/programs/${programId}/cohorts/${cohortId}`, { method: 'PATCH', body: data });
}

export async function listCohortEnrollmentsApi(programId: string, cohortId: string): Promise<CohortEnrollmentResponse[]> {
  return apiFetch<CohortEnrollmentResponse[]>(`/programs/${programId}/cohorts/${cohortId}/enrollments`, { method: 'GET' });
}

export async function enrollUserInCohortApi(programId: string, cohortId: string, data: {
  user_email: string;
  role: string;
  user_name?: string;
  user_phone?: string;
  user_linkedin?: string;
  user_role_title?: string;
}): Promise<CohortEnrollmentResponse> {
  return apiFetch<CohortEnrollmentResponse>(`/programs/${programId}/cohorts/${cohortId}/enroll`, { method: 'POST', body: data });
}

export async function deleteCohortEnrollmentApi(
  programId: string,
  cohortId: string,
  enrollmentId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/programs/${programId}/cohorts/${cohortId}/enrollments/${enrollmentId}`,
    { method: 'DELETE' },
  );
}

export async function deleteCohortApi(
  programId: string,
  cohortId: string,
): Promise<{ deleted: boolean }> {
  return apiFetch<{ deleted: boolean }>(
    `/programs/${programId}/cohorts/${cohortId}`,
    { method: 'DELETE' },
  );
}


// ---------------------------------------------------------------------------
// Circles (renamed cohorts) — member directory
// ---------------------------------------------------------------------------

export interface CircleMemberProfile {
  user_id: string;
  enrollment_id: string;
  name: string;
  company: string | null;
  role: string | null;
  about_me: string | null;
  linkedin: string | null;
  tier: string | null;
  avatar_url: string | null;
  enrollment_role: string;
  enrollment_status: string;
}

/** List members in a circle with safe profile fields (no email/phone). */
export async function listCircleMembersApi(
  programId: string,
  circleId: string,
  q?: string,
): Promise<CircleMemberProfile[]> {
  const qs = q ? `?q=${encodeURIComponent(q)}` : '';
  return apiFetch<CircleMemberProfile[]>(
    `/programs/${programId}/circles/${circleId}/members${qs}`,
  );
}

// Invoices
export interface ProgramInvoice {
  id: string;
  program_id: string;
  enrollment_id: string | null;
  document_type: string;
  file_name: string;
  file_data: string;
  amount: number | null;
  notes: string | null;
  uploaded_by_id: string;
  created_at: string;
}

export async function listInvoicesApi(programId: string): Promise<ProgramInvoice[]> {
  return apiFetch<ProgramInvoice[]>(`/programs/${programId}/invoices`);
}

export async function uploadInvoiceApi(programId: string, data: {
  file_name: string; file_data: string; document_type?: string;
  enrollment_id?: string; amount?: number; notes?: string;
}): Promise<ProgramInvoice> {
  return apiFetch<ProgramInvoice>(`/programs/${programId}/invoices`, { method: 'POST', body: data });
}

export async function deleteInvoiceApi(programId: string, invoiceId: string): Promise<void> {
  return apiFetch<void>(`/programs/${programId}/invoices/${invoiceId}`, { method: 'DELETE' });
}
