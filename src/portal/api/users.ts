import { apiFetch } from '@/portal/api/client';
import { mapApiUserToMockUser, type ApiUserJson } from '@/portal/types/auth';
import type { MockUser, UserTier } from '@/portal/data/mock/types';

export async function listUsersApi(limit = 200, offset = 0): Promise<MockUser[]> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  const raw = await apiFetch<ApiUserJson[]>(`/users?${params.toString()}`, { method: 'GET' });
  return raw.map((u) => mapApiUserToMockUser(u));
}

export interface PatchUserBody {
  name?: string;
  phone?: string;
  linkedin?: string;
  company_affiliation?: string;
  role?: string;
  about_me?: string;
  avatar_url?: string | null;
  tier?: UserTier;
  enterprise_size?: string | null;
  company_size?: string | null;
  is_student?: boolean;
  advisory_hourly_rate?: number | null;
}

export async function patchUserApi(userId: string, body: PatchUserBody): Promise<MockUser> {
  const raw = await apiFetch<ApiUserJson>(`/users/${userId}`, {
    method: 'PATCH',
    body,
  });
  return mapApiUserToMockUser(raw);
}

export async function deleteUserApi(userId: string): Promise<void> {
  await apiFetch<unknown>(`/users/${userId}`, { method: 'DELETE' });
}

// --- Admin user creation (POST /api/users) ---

export interface AdminCreateUserBody {
  email: string;
  name: string;
  phone?: string;
  linkedin?: string;
  company_affiliation?: string;
  role?: string;
  about_me?: string;
  tier: UserTier;
  advisory_hourly_rate?: number | null;
}

/** Response from POST /api/users — includes invite_token for onboarding link. */
export interface AdminCreateUserResponse extends ApiUserJson {
  invite_token?: string;
}

/**
 * Admin-only endpoint to create a user of any tier.
 * Returns the created user along with an invite_token for the onboarding link.
 */
export async function adminCreateUserApi(
  body: AdminCreateUserBody,
  opts?: { sandbox?: boolean },
): Promise<{ user: MockUser; inviteToken?: string }> {
  const url = opts?.sandbox ? '/users?sandbox=true' : '/users';
  const raw = await apiFetch<AdminCreateUserResponse>(url, { method: 'POST', body });
  return {
    user: mapApiUserToMockUser(raw),
    inviteToken: raw.invite_token,
  };
}
