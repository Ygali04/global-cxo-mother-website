import { apiFetch } from '@/portal/api/client';

export interface LinkedProfile {
  id: string;
  linked_user_id: string;
  linked_user_name: string;
  linked_user_email: string;
  linked_user_tier: string;
  linked_user_company: string | null;
  relationship_label: string | null;
  created_at: string;
}

export interface LinkedProfilesResponse {
  links: LinkedProfile[];
}

/** GET /users/me/profile-links — list profiles the current user can switch into. */
export async function listMyProfileLinksApi(): Promise<LinkedProfilesResponse> {
  return apiFetch<LinkedProfilesResponse>('/users/me/profile-links', { method: 'GET' });
}

/** POST /users/{user_id}/profile-links — admin links two users together. */
export async function adminCreateProfileLinkApi(
  userId: string,
  body: { linked_user_id: string; relationship_label?: string | null },
): Promise<LinkedProfile> {
  return apiFetch<LinkedProfile>(`/users/${userId}/profile-links`, {
    method: 'POST',
    body,
  });
}

/** DELETE /users/profile-links/{link_id} — remove a profile link. */
export async function deleteProfileLinkApi(linkId: string): Promise<void> {
  await apiFetch<unknown>(`/users/profile-links/${linkId}`, { method: 'DELETE' });
}

/** POST /auth/switch-profile — swap session into a linked profile. */
export interface SwitchProfileResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    email: string;
    name: string;
    [k: string]: unknown;
  };
}

export async function switchProfileApi(targetUserId: string): Promise<SwitchProfileResponse> {
  return apiFetch<SwitchProfileResponse>('/auth/switch-profile', {
    method: 'POST',
    body: { target_user_id: targetUserId },
  });
}

// ---------------------------------------------------------------------------
// Unified profile (Spec 03)
// ---------------------------------------------------------------------------

export interface UnifiedProfileResponse {
  user_ids: string[];
  users: Array<{
    id: string;
    name: string;
    email: string;
    tier: string;
    company_affiliation: string | null;
    avatar_url: string | null;
    created_at: string | null;
  }>;
  sessions: Array<{
    id: string;
    cxo_user_id: string | null;
    startup_user_id: string | null;
    scheduled_for: string | null;
    session_status: string | null;
  }>;
  program_enrollments: Array<{
    id: string;
    program_id: string;
    user_id: string;
    role: string;
    status: string;
    created_at: string | null;
  }>;
  event_registrations: Array<{
    id: string;
    event_id: string;
    user_id: string | null;
    email: string;
    registered_at: string | null;
  }>;
  audit_log: Array<{
    id: string;
    actor_id: string | null;
    action: string;
    target_type: string;
    target_id: string | null;
    created_at: string | null;
  }>;
}

/** GET /users/{id}/unified — admin aggregated view across linked profiles. */
export async function getUnifiedProfileApi(userId: string): Promise<UnifiedProfileResponse> {
  return apiFetch<UnifiedProfileResponse>(`/users/${userId}/unified`);
}

/** GET /users/{user_id}/profile-links — admin: list links for a specific user. */
export async function listUserProfileLinksApi(userId: string): Promise<LinkedProfilesResponse> {
  return apiFetch<LinkedProfilesResponse>(`/users/${userId}/profile-links`);
}
