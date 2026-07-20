import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminCreateProfileLinkApi,
  deleteProfileLinkApi,
  listMyProfileLinksApi,
  type LinkedProfile,
} from '@/portal/api/profileLinks';
import { getStoredAccessToken } from '@/portal/api/tokenStorage';

const PROFILE_LINKS_KEY = ['profile-links', 'me'] as const;

/** Profiles the current user can switch into via the multi-profile switcher. */
export function useMyProfileLinks() {
  return useQuery({
    queryKey: PROFILE_LINKS_KEY,
    queryFn: async () => {
      const res = await listMyProfileLinksApi();
      return res.links;
    },
    // Only fire when the user has an auth token — prevents 401 spam on
    // unauthenticated pages like /onboard/:token
    enabled: !!getStoredAccessToken(),
    // Refetched on switcher open + when admin creates a new link
    staleTime: 30_000,
  });
}

/** Admin: link two existing GCXO user accounts together. */
export function useAdminCreateProfileLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      linkedUserId,
      relationshipLabel,
    }: {
      userId: string;
      linkedUserId: string;
      relationshipLabel?: string | null;
    }) =>
      adminCreateProfileLinkApi(userId, {
        linked_user_id: linkedUserId,
        relationship_label: relationshipLabel ?? null,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PROFILE_LINKS_KEY });
    },
  });
}

/** Delete a profile link. Either side of the link can call this. */
export function useDeleteProfileLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => deleteProfileLinkApi(linkId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PROFILE_LINKS_KEY });
    },
  });
}

/** Admin: list profile links for a specific user (for badge in Members table). */
export function useUserProfileLinks(userId: string | null) {
  return useQuery({
    queryKey: ['profile-links', userId],
    queryFn: async () => {
      const { listUserProfileLinksApi } = await import('@/portal/api/profileLinks');
      const res = await listUserProfileLinksApi(userId!);
      return res.links;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

/** Admin: unified profile aggregation across all linked accounts. */
export function useUnifiedProfile(userId: string | null) {
  return useQuery({
    queryKey: ['profile-links', 'unified', userId],
    queryFn: async () => {
      const { getUnifiedProfileApi } = await import('@/portal/api/profileLinks');
      return getUnifiedProfileApi(userId!);
    },
    enabled: !!userId,
  });
}

export type { LinkedProfile };
