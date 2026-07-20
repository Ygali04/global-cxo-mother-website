/**
 * Email Studio API client — compose-and-send mailer for admins.
 *
 * Matches the backend routes under `/api/admin/email-studio`:
 *   GET    /starters                 — read-only starter library
 *   GET    /compositions              — list saved customs
 *   POST   /compositions              — create a new saved template
 *   PATCH  /compositions/{id}         — update a saved template
 *   DELETE /compositions/{id}         — delete a saved template
 *   GET    /recipients?q=...          — search ecosystem users
 *   POST   /preview                   — render without dispatch
 *   POST   /send                      — compose + dispatch via Resend
 *
 * The admin JWT is auto-injected by apiFetch via tokenStorage.
 */

import { apiFetch } from '@/portal/api/client';

// ---------------------------------------------------------------------------
// Types — mirror backend Pydantic schemas in schemas/email_studio.py
// ---------------------------------------------------------------------------

export interface VariableDef {
  name: string;
  label: string;
  hint: string | null;
  default_value: string | null;
  multiline: boolean;
}

export interface StarterTemplate {
  template_key: string;
  label: string;
  description: string;
  is_wired: boolean;
  subject_template: string;
  /**
   * Inner HTML content only — h1 + paragraphs + CTA button. NO outer
   * brand chrome (no DOCTYPE, no gradient header, no footer). The
   * studio adds the chrome exactly once at render time via the backend
   * preview/send endpoints when `apply_brand_wrapper` is true.
   */
  html_body_template: string;
  variables: VariableDef[];
  /**
   * Subtitle text for the gradient header (e.g. "Program Onboarding").
   * The frontend passes this back in preview/send requests so the
   * rendered brand chrome uses the right subtitle per starter.
   */
  eyebrow: string;
  /** Footer override — starter-specific copy under the copyright line. */
  footer_note: string;
}

export interface AdminEmailComposition {
  id: string;
  name: string;
  subject_template: string;
  html_body_template: string;
  use_brand_wrapper: boolean;
  created_by_id: string | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminEmailCompositionCreate {
  name: string;
  subject_template: string;
  html_body_template: string;
  use_brand_wrapper?: boolean;
}

export interface AdminEmailCompositionUpdate {
  name?: string;
  subject_template?: string;
  html_body_template?: string;
  use_brand_wrapper?: boolean;
}

export interface RecipientUser {
  id: string;
  name: string;
  email: string;
  tier: string;
  company_affiliation: string | null;
}

export interface EmailPreviewRequest {
  subject: string;
  html_body: string;
  variables: Record<string, string>;
  apply_brand_wrapper: boolean;
  /** Optional eyebrow subtitle for the rendered chrome. Starter mode
   * passes the starter's own eyebrow; Blank mode leaves it unset and
   * the backend falls back to "From {admin name}". */
  eyebrow?: string | null;
  footer_note?: string | null;
}

export interface EmailPreviewResponse {
  subject: string;
  html_body: string;
}

export interface EmailSendRequest {
  template_source: string;              // "blank" | "starter:<key>" | "custom:<uuid>"
  subject: string;
  html_body: string;
  recipient_user_id?: string | null;
  recipient_email?: string | null;
  recipient_name?: string | null;
  apply_brand_wrapper: boolean;
  reply_to_admin: boolean;
  /** Optional eyebrow subtitle for the rendered chrome. Starter mode
   * passes the starter's own eyebrow; Blank mode leaves it unset and
   * the backend falls back to "From {admin name}". */
  eyebrow?: string | null;
  footer_note?: string | null;
}

export interface EmailSendResponse {
  queued: boolean;
  status: 'sent' | 'failed' | 'queued';
  to_email: string;
  to_name: string | null;
  message_id: string | null;
  email_queue_entry_id: string | null;
  error: string | null;
}

// ---------------------------------------------------------------------------
// Fetch functions
// ---------------------------------------------------------------------------

export async function listStartersApi(): Promise<StarterTemplate[]> {
  return apiFetch<StarterTemplate[]>('/admin/email-studio/starters', {
    method: 'GET',
  });
}

export async function listCompositionsApi(): Promise<AdminEmailComposition[]> {
  return apiFetch<AdminEmailComposition[]>('/admin/email-studio/compositions', {
    method: 'GET',
  });
}

export async function createCompositionApi(
  body: AdminEmailCompositionCreate,
): Promise<AdminEmailComposition> {
  return apiFetch<AdminEmailComposition>('/admin/email-studio/compositions', {
    method: 'POST',
    body,
  });
}

export async function updateCompositionApi(
  id: string,
  body: AdminEmailCompositionUpdate,
): Promise<AdminEmailComposition> {
  return apiFetch<AdminEmailComposition>(
    `/admin/email-studio/compositions/${id}`,
    { method: 'PATCH', body },
  );
}

export async function deleteCompositionApi(id: string): Promise<void> {
  return apiFetch<void>(`/admin/email-studio/compositions/${id}`, {
    method: 'DELETE',
  });
}

export async function searchRecipientsApi(
  query: string,
  limit = 20,
): Promise<RecipientUser[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  return apiFetch<RecipientUser[]>(
    `/admin/email-studio/recipients?${params.toString()}`,
    { method: 'GET' },
  );
}

export async function previewEmailApi(
  body: EmailPreviewRequest,
): Promise<EmailPreviewResponse> {
  return apiFetch<EmailPreviewResponse>('/admin/email-studio/preview', {
    method: 'POST',
    body,
  });
}

export async function sendEmailApi(
  body: EmailSendRequest,
): Promise<EmailSendResponse> {
  return apiFetch<EmailSendResponse>('/admin/email-studio/send', {
    method: 'POST',
    body,
  });
}
