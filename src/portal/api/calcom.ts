import { apiFetch } from '@/portal/api/client';
import type {
  CalcomAvailability,
  CalcomBooking,
  CalcomMeetingPreference,
  CalcomOnboardingStatus,
} from '@/portal/api/types';

/** POST /api/calcom/onboarding/start — kick off the Cal.com onboarding flow. */
export async function startCalcomOnboardingApi(): Promise<CalcomOnboardingStatus> {
  return apiFetch<CalcomOnboardingStatus>('/calcom/onboarding/start', {
    method: 'POST',
    body: {},
  });
}

/** GET /api/calcom/onboarding/status — current onboarding progress. */
export async function getCalcomOnboardingStatusApi(): Promise<CalcomOnboardingStatus> {
  return apiFetch<CalcomOnboardingStatus>('/calcom/onboarding/status', { method: 'GET' });
}

/** GET /api/calcom/availability — current availability schedule. */
export async function getCalcomAvailabilityApi(): Promise<CalcomAvailability> {
  return apiFetch<CalcomAvailability>('/calcom/availability', { method: 'GET' });
}

/** POST /api/calcom/availability — update availability schedule. */
export async function updateCalcomAvailabilityApi(
  body: CalcomAvailability,
): Promise<CalcomAvailability> {
  return apiFetch<CalcomAvailability>('/calcom/availability', { method: 'POST', body });
}

/** GET /api/calcom/meeting-preferences — current meeting type preferences. */
export async function getCalcomMeetingPreferencesApi(): Promise<CalcomMeetingPreference[]> {
  return apiFetch<CalcomMeetingPreference[]>('/calcom/meeting-preferences', { method: 'GET' });
}

/** POST /api/calcom/meeting-preferences — update meeting type preferences. */
export async function updateCalcomMeetingPreferencesApi(
  body: CalcomMeetingPreference[],
): Promise<CalcomMeetingPreference[]> {
  return apiFetch<CalcomMeetingPreference[]>('/calcom/meeting-preferences', {
    method: 'POST',
    body,
  });
}

/** GET /api/calcom/bookings — list Cal.com bookings for the current user. */
export async function getCalcomBookingsApi(): Promise<CalcomBooking[]> {
  return apiFetch<CalcomBooking[]>('/calcom/bookings', { method: 'GET' });
}


/** POST /api/calcom/sso-token — mint a one-shot JWT to land the user inside
 *  Cal.com already authenticated. Used by the "Manage Calendar" button so
 *  there's no login screen + no email verification screen.
 *
 *  The returned `redirect_url` is a fully-formed Cal.com URL with the JWT
 *  embedded — open it in a new tab and Cal.com will set its own session
 *  cookie before redirecting to /event-types. Token is valid for 60 seconds.
 */
export interface CalcomSsoTokenResponse {
  token: string;
  redirect_url: string;
  expires_in: number;
}

export async function getCalcomSsoTokenApi(asAdmin = false): Promise<CalcomSsoTokenResponse> {
  const qs = asAdmin ? '?as_admin=true' : '';
  return apiFetch<CalcomSsoTokenResponse>(`/calcom/sso-token${qs}`, { method: 'POST' });
}

// ---------------------------------------------------------------------------
// Programmatic Booking CRUD
// ---------------------------------------------------------------------------

export interface CreateBookingParams {
  organizer_gcio_user_id: string;
  attendee_gcio_user_id: string;
  start_time: string;
  end_time: string;
  event_type_slug?: string;
  program_id?: string;
  title?: string;
}

export interface BookingResult {
  booking_uid: string;
  calcom_booking_id: number;
  scheduled_meeting_id: string | null;
  title: string;
  starts_at: string;
  ends_at: string;
}

export async function createCalcomBookingApi(data: CreateBookingParams): Promise<BookingResult> {
  return apiFetch<BookingResult>('/calcom/bookings/create', { method: 'POST', body: data });
}

export async function cancelCalcomBookingApi(bookingUid: string, reason?: string): Promise<{ booking_uid: string; status: string }> {
  const params = reason ? `?reason=${encodeURIComponent(reason)}` : '';
  return apiFetch(`/calcom/bookings/${bookingUid}${params}`, { method: 'DELETE' });
}

export async function rescheduleCalcomBookingApi(
  bookingUid: string,
  data: { start_time: string; end_time: string },
): Promise<{ booking_uid: string; starts_at: string; ends_at: string }> {
  return apiFetch(`/calcom/bookings/${bookingUid}`, { method: 'PATCH', body: data });
}
