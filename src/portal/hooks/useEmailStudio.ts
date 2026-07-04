/**
 * React Query hooks for the Email Studio compose-and-send flow.
 *
 * Query keys:
 *   ['admin', 'email-studio', 'starters']            — starter library
 *   ['admin', 'email-studio', 'compositions']        — saved customs list
 *   ['admin', 'email-studio', 'recipients', query]   — user search (debounced)
 *
 * Mutations invalidate the relevant query on success. Recipient search
 * is gated with `enabled: query.length >= 2` to avoid hammering the
 * backend on every keystroke.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import {
  createCompositionApi,
  deleteCompositionApi,
  listCompositionsApi,
  listStartersApi,
  previewEmailApi,
  searchRecipientsApi,
  sendEmailApi,
  updateCompositionApi,
  type AdminEmailComposition,
  type AdminEmailCompositionCreate,
  type AdminEmailCompositionUpdate,
  type EmailPreviewRequest,
  type EmailPreviewResponse,
  type EmailSendRequest,
  type EmailSendResponse,
  type RecipientUser,
  type StarterTemplate,
} from '@/portal/api/emailStudio';

const STARTERS_KEY = ['admin', 'email-studio', 'starters'] as const;
const COMPOSITIONS_KEY = ['admin', 'email-studio', 'compositions'] as const;
const RECIPIENTS_KEY_BASE = ['admin', 'email-studio', 'recipients'] as const;

// ---------------------------------------------------------------------------
// Starters (read-only, cached for the session)
// ---------------------------------------------------------------------------

export function useStarterTemplates(): UseQueryResult<StarterTemplate[]> {
  return useQuery({
    queryKey: STARTERS_KEY,
    queryFn: listStartersApi,
    staleTime: 60 * 60 * 1000, // 1 hour — starter library is effectively immutable within a session
  });
}

// ---------------------------------------------------------------------------
// Saved compositions (CRUD)
// ---------------------------------------------------------------------------

export function useCompositions(): UseQueryResult<AdminEmailComposition[]> {
  return useQuery({
    queryKey: COMPOSITIONS_KEY,
    queryFn: listCompositionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateComposition(): UseMutationResult<
  AdminEmailComposition,
  Error,
  AdminEmailCompositionCreate
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCompositionApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: COMPOSITIONS_KEY });
    },
  });
}

export function useUpdateComposition(): UseMutationResult<
  AdminEmailComposition,
  Error,
  { id: string; body: AdminEmailCompositionUpdate }
> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }) => updateCompositionApi(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: COMPOSITIONS_KEY });
    },
  });
}

export function useDeleteComposition(): UseMutationResult<void, Error, string> {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCompositionApi,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: COMPOSITIONS_KEY });
    },
  });
}

// ---------------------------------------------------------------------------
// Recipient search (debounced query)
// ---------------------------------------------------------------------------

export function useSearchRecipients(
  query: string,
): UseQueryResult<RecipientUser[]> {
  return useQuery({
    queryKey: [...RECIPIENTS_KEY_BASE, query] as const,
    queryFn: () => searchRecipientsApi(query),
    enabled: query.trim().length >= 2, // don't query on every keystroke
    staleTime: 30 * 1000,
  });
}

// ---------------------------------------------------------------------------
// Preview + Send mutations
// ---------------------------------------------------------------------------

export function usePreviewEmail(): UseMutationResult<
  EmailPreviewResponse,
  Error,
  EmailPreviewRequest
> {
  return useMutation({
    mutationFn: previewEmailApi,
  });
}

export function useSendEmail(): UseMutationResult<
  EmailSendResponse,
  Error,
  EmailSendRequest
> {
  return useMutation({
    mutationFn: sendEmailApi,
  });
}
