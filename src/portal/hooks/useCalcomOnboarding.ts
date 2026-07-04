import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelCalcomBookingApi,
  getCalcomAvailabilityApi,
  getCalcomBookingsApi,
  getCalcomMeetingPreferencesApi,
  getCalcomOnboardingStatusApi,
  startCalcomOnboardingApi,
  updateCalcomAvailabilityApi,
  updateCalcomMeetingPreferencesApi,
} from '@/portal/api/calcom';

// ---------------------------------------------------------------------------
// Query key constants
// ---------------------------------------------------------------------------

const calcomKeys = {
  onboarding: ['calcom', 'onboarding'] as const,
  availability: ['calcom', 'availability'] as const,
  meetingPreferences: ['calcom', 'meeting-preferences'] as const,
  bookings: ['calcom', 'bookings'] as const,
};

// ---------------------------------------------------------------------------
// useCalcomOnboarding
// ---------------------------------------------------------------------------

export function useCalcomOnboarding() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: calcomKeys.onboarding,
    queryFn: getCalcomOnboardingStatusApi,
  });

  const startOnboarding = useMutation({
    mutationFn: startCalcomOnboardingApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calcomKeys.onboarding });
    },
  });

  return { ...query, startOnboarding };
}

// ---------------------------------------------------------------------------
// useCalcomAvailability
// ---------------------------------------------------------------------------

export function useCalcomAvailability() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: calcomKeys.availability,
    queryFn: getCalcomAvailabilityApi,
  });

  const updateAvailability = useMutation({
    mutationFn: updateCalcomAvailabilityApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calcomKeys.availability });
      void queryClient.invalidateQueries({ queryKey: calcomKeys.onboarding });
    },
  });

  return { ...query, updateAvailability };
}

// ---------------------------------------------------------------------------
// useCalcomMeetingPreferences
// ---------------------------------------------------------------------------

export function useCalcomMeetingPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: calcomKeys.meetingPreferences,
    queryFn: getCalcomMeetingPreferencesApi,
  });

  const updatePreferences = useMutation({
    mutationFn: updateCalcomMeetingPreferencesApi,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calcomKeys.meetingPreferences });
      void queryClient.invalidateQueries({ queryKey: calcomKeys.onboarding });
    },
  });

  return { ...query, updatePreferences };
}

// ---------------------------------------------------------------------------
// useCalcomBookings
// ---------------------------------------------------------------------------

export function useCalcomBookings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: calcomKeys.bookings,
    queryFn: getCalcomBookingsApi,
  });

  const cancelBooking = useMutation({
    mutationFn: ({ bookingUid, reason }: { bookingUid: string; reason?: string }) =>
      cancelCalcomBookingApi(bookingUid, reason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: calcomKeys.bookings });
    },
  });

  return { ...query, cancelBooking };
}
