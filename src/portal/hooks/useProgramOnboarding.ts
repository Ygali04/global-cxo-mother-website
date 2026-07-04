import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getOnboardingInfoApi,
  updateOnboardingProfileApi,
  completeOnboardingApi,
} from '@/portal/api/programs';

export function useOnboardingInfo(token: string) {
  return useQuery({
    queryKey: ['onboarding', token],
    queryFn: () => getOnboardingInfoApi(token),
    enabled: !!token,
  });
}

export function useUpdateOnboardingProfile(token: string) {
  return useMutation({
    mutationFn: (data: Record<string, string>) => updateOnboardingProfileApi(token, data),
  });
}

export function useCompleteOnboarding(token: string) {
  return useMutation({
    mutationFn: () => completeOnboardingApi(token),
  });
}
