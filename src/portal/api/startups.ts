import { apiFetch } from '@/portal/api/client';
import type { ApiStartupJson, ApiUserStartupLinkJson } from '@/portal/api/types';
import { mapApiStartupLinkToMock, mapApiStartupToMock } from '@/portal/api/mappers';
import type { MockStartupProfile, MockUserStartupLink } from '@/portal/data/mock/types';

export async function listStartupsApi(limit = 200): Promise<MockStartupProfile[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const raw = await apiFetch<ApiStartupJson[]>(`/startups?${params.toString()}`, { method: 'GET' });
  return raw.map(mapApiStartupToMock);
}

export async function createStartupApi(body: {
  company_name: string;
  company_website: string;
  company_domain: string;
  description: string;
  logo_url?: string | null;
}): Promise<MockStartupProfile> {
  const raw = await apiFetch<ApiStartupJson>('/startups', { method: 'POST', body });
  return mapApiStartupToMock(raw);
}

export async function patchStartupApi(
  startupId: string,
  body: {
    company_name?: string;
    company_website?: string;
    description?: string;
    logo_url?: string | null;
    is_verified?: boolean;
  },
): Promise<MockStartupProfile> {
  const raw = await apiFetch<ApiStartupJson>(`/startups/${startupId}`, {
    method: 'PATCH',
    body,
  });
  return mapApiStartupToMock(raw);
}

export async function listStartupLinksApi(startupId: string): Promise<MockUserStartupLink[]> {
  const raw = await apiFetch<ApiUserStartupLinkJson[]>(`/startups/${startupId}/links`, {
    method: 'GET',
  });
  return raw.map(mapApiStartupLinkToMock);
}

export async function createStartupLinkApi(body: {
  user_id: string;
  startup_id: string;
  link_role: 'manager' | 'member' | 'founder' | 'proxy';
}): Promise<MockUserStartupLink> {
  const raw = await apiFetch<ApiUserStartupLinkJson>('/startups/links', {
    method: 'POST',
    body,
  });
  return mapApiStartupLinkToMock(raw);
}

export async function deleteStartupLinkApi(linkId: string): Promise<void> {
  await apiFetch<void>(`/startups/links/${linkId}`, { method: 'DELETE' });
}

/**
 * Composite-pair fallback that removes a link by (startup_id, user_id).
 * Useful when the frontend doesn't have a link primary key on hand — the
 * underlying DB has a UNIQUE(user_id, startup_id) constraint so the pair is
 * guaranteed to identify at most one link.
 */
export async function deleteStartupMemberApi(
  startupId: string,
  userId: string,
): Promise<void> {
  await apiFetch<void>(`/startups/${startupId}/members/${userId}`, {
    method: 'DELETE',
  });
}

export async function deleteStartupProfileApi(startupId: string): Promise<void> {
  await apiFetch<void>(`/startups/${startupId}`, { method: 'DELETE' });
}

export async function updateStartupMemberRoleApi(
  startupId: string,
  userId: string,
  linkRole: string,
): Promise<{ id: string; user_id: string; startup_id: string; link_role: string }> {
  return apiFetch(`/startups/${startupId}/members/${userId}/role`, {
    method: 'PATCH',
    body: { link_role: linkRole },
  });
}
