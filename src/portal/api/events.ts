import { apiFetch } from '@/portal/api/client';
import type {
  ApiEventDeleteImpactJson,
  ApiEventDeleteResultJson,
  ApiEventJson,
  ApiEventRegistrationJson,
} from '@/portal/api/types';
import {
  mapApiEventToEventDetail,
  mapApiRegistrationToMock,
  mapVisibilityFromApi,
  mapVisibilityToApi,
} from '@/portal/api/mappers';
import type { EventDetail } from '@/portal/data/EventsData';
import type { MockEventRegistration } from '@/portal/data/mock/types';

export async function listEventsApi(limit = 100): Promise<ApiEventJson[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiFetch<ApiEventJson[]>(`/events?${params.toString()}`, { method: 'GET' });
}

export async function getEventBySlugApi(slug: string): Promise<ApiEventJson> {
  return apiFetch<ApiEventJson>(`/events/by-slug/${encodeURIComponent(slug)}`, { method: 'GET' });
}

export async function listEventRegistrationsApi(
  eventId: string,
  eventSlug: string,
): Promise<MockEventRegistration[]> {
  const raw = await apiFetch<ApiEventRegistrationJson[]>(`/events/${eventId}/registrations`, {
    method: 'GET',
  });
  return raw.map((r) => mapApiRegistrationToMock(r, eventSlug));
}

async function getEventSlugForId(eventId: string): Promise<string | null> {
  try {
    const ev = await apiFetch<ApiEventJson>(`/events/${eventId}`, { method: 'GET' });
    return ev.slug;
  } catch {
    return null;
  }
}

export async function createEventRegistrationApi(
  eventUuid: string,
  body: { event_id: string; startup_id?: string | null },
): Promise<MockEventRegistration> {
  const raw = await apiFetch<ApiEventRegistrationJson>(`/events/${eventUuid}/registrations`, {
    method: 'POST',
    body,
  });
  const slug = (await getEventSlugForId(eventUuid)) ?? eventUuid;
  return mapApiRegistrationToMock(raw, slug);
}

export async function createEventApi(body: Record<string, unknown>): Promise<{
  event: EventDetail;
  raw: ApiEventJson;
}> {
  const raw = await apiFetch<ApiEventJson>('/events', { method: 'POST', body });
  return {
    raw,
    event: mapApiEventToEventDetail(raw, 0),
  };
}

export async function patchEventApi(eventUuid: string, body: Record<string, unknown>): Promise<EventDetail> {
  const raw = await apiFetch<ApiEventJson>(`/events/${eventUuid}`, {
    method: 'PATCH',
    body,
  });
  return mapApiEventToEventDetail(raw, 0);
}

export async function getEventDeleteImpactApi(eventUuid: string): Promise<ApiEventDeleteImpactJson> {
  return apiFetch<ApiEventDeleteImpactJson>(`/events/${eventUuid}/delete-impact`, {
    method: 'GET',
  });
}

export async function deleteEventApi(eventUuid: string): Promise<ApiEventDeleteResultJson> {
  return apiFetch<ApiEventDeleteResultJson>(`/events/${eventUuid}`, {
    method: 'DELETE',
  });
}

export function mergeRegistrationCounts(events: EventDetail[], registrations: MockEventRegistration[]): EventDetail[] {
  const countBySlug = new Map<string, number>();
  registrations.forEach((r) => {
    countBySlug.set(r.eventId, (countBySlug.get(r.eventId) ?? 0) + 1);
  });
  return events.map((ev) => ({
    ...ev,
    attendees: `${countBySlug.get(ev.slug) ?? 0} registration(s)`,
  }));
}

export { mapVisibilityFromApi, mapVisibilityToApi };
