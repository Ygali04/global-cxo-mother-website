import { useCallback, useEffect, useState } from 'react';
import { USE_API_AUTH } from '@/portal/api/config';
import { normalizeMemberSessionMeeting } from '@/portal/api/memberSessionMeetings';
import {
  acceptMeetingRequestApi,
  cancelScheduledMeetingApi,
  createMeetingActionItemApi,
  createMeetingSessionNoteApi,
  listMeetingRequestsApi,
  listMemberSessionMeetingsApi,
  listMyScheduledMeetingsApi,
  listScheduledMeetingsForEventApi,
  patchMeetingActionItemApi,
  patchMeetingSessionNoteApi,
  postMeetingsSubscriptionsRenewApi,
  postScheduledMeetingGraphSyncApi,
  postScheduledMeetingRefreshArtifactsApi,
  upsertMeetingOutcomeApi,
} from '@/portal/api/ops';
import type {
  ApiMeetingActionItemCreateBody,
  ApiMeetingActionItemPatchBody,
  ApiMeetingCancellationBody,
  ApiMeetingOutcomeBody,
  ApiMeetingRequestAcceptBody,
  ApiMeetingRequestJson,
  ApiMeetingRefreshArtifactsBody,
  ApiMeetingSessionNotePatchBody,
  ApiMemberSessionMeetingJson,
  ApiMeetingSessionNoteBody,
} from '@/portal/api/types';
import { getStoredAccessToken } from '@/portal/api/tokenStorage';
import { mockAdminMeetingRequests, mockAdminMemberSessions } from '@/portal/data/mock/adminMemberSessions';
import type { UserTier } from '@/portal/data/mock/types';

const SESSION_CONSOLE_TIERS: UserTier[] = ['admin', 'dev', 'startup'];

export type AdminMeetingsDataSource = 'live' | 'mock';

export interface UseAdminMeetingsResult {
  /** Admin/dev/startup can open the console (API + token, or mock mode when API is disabled). */
  consoleAccessible: boolean;
  /** Live `/ops` calls are allowed (requires API auth + token). */
  liveOpsEnabled: boolean;
  /** True when showing bundled demo sessions (API auth off, ops tier). */
  mockMode: boolean;
  dataSource: AdminMeetingsDataSource;
  loading: boolean;
  /**
   * `true` once the first load attempt has completed (success OR failure OR
   * no-op when not authorised). Until this flips, the UI should keep showing
   * skeletons instead of the "no data" empty-state placeholder — otherwise
   * a freshly-mounted console flashes "No sessions" for one render before
   * the fetch even starts, which looks like broken/missing data.
   */
  hasInitialized: boolean;
  error: string | null;
  requests: ApiMeetingRequestJson[];
  sessionsMine: ApiMemberSessionMeetingJson[];
  sessionsEvent: ApiMemberSessionMeetingJson[];
  refetch: () => Promise<void>;
  loadEventMeetings: (eventUuid: string | undefined) => Promise<void>;
  acceptRequest: (requestId: string, body: ApiMeetingRequestAcceptBody) => Promise<void>;
  cancelMeeting: (meetingId: string, body: ApiMeetingCancellationBody) => Promise<void>;
  addNote: (meetingId: string, body: ApiMeetingSessionNoteBody) => Promise<void>;
  updateNote: (noteId: string, body: ApiMeetingSessionNotePatchBody) => Promise<void>;
  saveOutcome: (meetingId: string, body: ApiMeetingOutcomeBody) => Promise<void>;
  addActionItem: (meetingId: string, body: ApiMeetingActionItemCreateBody) => Promise<void>;
  updateActionItem: (itemId: string, body: ApiMeetingActionItemPatchBody) => Promise<void>;
  graphSyncMeeting: (meetingId: string) => Promise<void>;
  refreshMeetingArtifacts: (meetingId: string, body?: ApiMeetingRefreshArtifactsBody) => Promise<void>;
  renewMeetingWebhooks: () => Promise<void>;
}

async function fetchMineSessionsLive(): Promise<ApiMemberSessionMeetingJson[]> {
  try {
    return await listMemberSessionMeetingsApi({ scope: 'mine', session_filter: 'all' });
  } catch {
    const rows = await listMyScheduledMeetingsApi();
    return rows.map((r) => normalizeMemberSessionMeeting(r));
  }
}

async function fetchEventSessionsLive(eventUuid: string): Promise<ApiMemberSessionMeetingJson[]> {
  try {
    return await listMemberSessionMeetingsApi({
      scope: 'event',
      event_id: eventUuid,
      session_filter: 'all',
    });
  } catch {
    const rows = await listScheduledMeetingsForEventApi(eventUuid);
    return rows.map((r) => normalizeMemberSessionMeeting(r));
  }
}

function upsertSessionNote(
  sessions: ApiMemberSessionMeetingJson[],
  meetingId: string,
  body: string,
): ApiMemberSessionMeetingJson[] {
  return sessions.map((session) =>
    session.id !== meetingId
      ? session
      : {
          ...session,
          notes: [
            {
              id: `note-${Date.now()}`,
              scheduled_meeting_id: meetingId,
              author_id: session.organizer_user_id,
              body,
              note_kind: 'internal',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...(session.notes ?? []),
          ],
          updated_at: new Date().toISOString(),
          needs_notes: false,
        },
  );
}

function updateSessionNote(
  sessions: ApiMemberSessionMeetingJson[],
  noteId: string,
  body: string,
): ApiMemberSessionMeetingJson[] {
  return sessions.map((session) => ({
    ...session,
    notes: (session.notes ?? []).map((note) =>
      note.id === noteId ? { ...note, body, updated_at: new Date().toISOString() } : note,
    ),
    updated_at: new Date().toISOString(),
  }));
}

function upsertSessionOutcome(
  sessions: ApiMemberSessionMeetingJson[],
  meetingId: string,
  summary: string,
): ApiMemberSessionMeetingJson[] {
  return sessions.map((session) =>
    session.id !== meetingId
      ? session
      : {
          ...session,
          outcome: {
            id: session.outcome?.id ?? `outcome-${Date.now()}`,
            scheduled_meeting_id: meetingId,
            summary,
            recorded_by_id: session.organizer_user_id,
            created_at: session.outcome?.created_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          outcome_present: true,
          summary_status: 'published',
          notes_processing_status: 'complete',
          updated_at: new Date().toISOString(),
          needs_notes: false,
        },
  );
}

function addSessionActionItem(
  sessions: ApiMemberSessionMeetingJson[],
  meetingId: string,
  title: string,
): ApiMemberSessionMeetingJson[] {
  return sessions.map((session) =>
    session.id !== meetingId
      ? session
      : {
          ...session,
          action_items: [
            ...(session.action_items ?? []),
            {
              id: `action-${Date.now()}`,
              scheduled_meeting_id: meetingId,
              title,
              assignee_user_id: null,
              due_at: null,
              status: 'open',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
          action_items_total: (session.action_items_total ?? 0) + 1,
          updated_at: new Date().toISOString(),
        },
  );
}

function patchSessionActionItem(
  sessions: ApiMemberSessionMeetingJson[],
  itemId: string,
  body: ApiMeetingActionItemPatchBody,
): ApiMemberSessionMeetingJson[] {
  return sessions.map((session) => {
    const nextItems = (session.action_items ?? []).map((item) =>
      item.id === itemId ? { ...item, ...body, updated_at: new Date().toISOString() } : item,
    );
    const actionItemsCompleted = nextItems.filter((item) => item.status === 'done').length;
    return {
      ...session,
      action_items: nextItems,
      action_items_completed: actionItemsCompleted,
      updated_at: new Date().toISOString(),
    };
  });
}

function cancelMockSession(
  sessions: ApiMemberSessionMeetingJson[],
  meetingId: string,
  reason?: string | null,
): ApiMemberSessionMeetingJson[] {
  return sessions.map((session) =>
    session.id !== meetingId
      ? session
      : {
          ...session,
          status: 'cancelled',
          session_status: 'cancelled',
          cancellation_reason: reason ?? null,
          updated_at: new Date().toISOString(),
        },
  );
}

function filterMockSessionsForUser(
  rows: ApiMemberSessionMeetingJson[],
  userId: string | undefined,
  tier: UserTier | undefined,
): ApiMemberSessionMeetingJson[] {
  if (!userId) {
    return rows;
  }
  if (tier === 'admin' || tier === 'dev') {
    return rows;
  }
  return rows.filter((row) => row.organizer_user_id === userId || row.participant_user_id === userId);
}

function filterMockRequestsForUser(
  rows: ApiMeetingRequestJson[],
  userId: string | undefined,
  tier: UserTier | undefined,
): ApiMeetingRequestJson[] {
  if (!userId) {
    return rows;
  }
  if (tier === 'admin' || tier === 'dev') {
    return rows;
  }
  return rows.filter((row) => row.requester_id === userId || row.recipient_id === userId);
}

export function useAdminMeetings(userId: string | undefined, tier: UserTier | undefined): UseAdminMeetingsResult {
  const [requests, setRequests] = useState<ApiMeetingRequestJson[]>([]);
  const [sessionsMine, setSessionsMine] = useState<ApiMemberSessionMeetingJson[]>([]);
  const [sessionsEvent, setSessionsEvent] = useState<ApiMemberSessionMeetingJson[]>([]);
  const [loading, setLoading] = useState(false);
  // `hasInitialized` is how the UI tells "fresh mount, never fetched" apart
  // from "fetch finished, got zero rows." Without this, the empty-state
  // placeholder flashes for one render on every mount before the effect
  // below even fires refetch. See `UseAdminMeetingsResult.hasInitialized`.
  const [hasInitialized, setHasInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockRequests, setMockRequests] = useState<ApiMeetingRequestJson[]>(mockAdminMeetingRequests);
  const [mockSessions, setMockSessions] = useState<ApiMemberSessionMeetingJson[]>(
    mockAdminMemberSessions.map((r) => normalizeMemberSessionMeeting(r)),
  );

  const token = getStoredAccessToken();
  const isSessionTier = Boolean(tier && SESSION_CONSOLE_TIERS.includes(tier));
  const mockMode = Boolean(isSessionTier && !USE_API_AUTH);
  const liveOpsEnabled = Boolean(USE_API_AUTH && isSessionTier && token);
  const consoleAccessible = Boolean(isSessionTier && (mockMode || liveOpsEnabled));
  const dataSource: AdminMeetingsDataSource = mockMode ? 'mock' : 'live';

  const loadMock = useCallback((): void => {
    setRequests(filterMockRequestsForUser(mockRequests, userId, tier));
    const filtered = filterMockSessionsForUser(mockSessions, userId, tier);
    setSessionsMine(filtered);
    setSessionsEvent(filtered);
    setError(null);
    setHasInitialized(true);
  }, [mockRequests, mockSessions, tier, userId]);

  const refetch = useCallback(async (): Promise<void> => {
    if (mockMode) {
      loadMock();
      return;
    }
    if (!liveOpsEnabled) {
      setRequests([]);
      setSessionsMine([]);
      setSessionsEvent([]);
      setHasInitialized(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [reqs, mine] = await Promise.all([listMeetingRequestsApi(), fetchMineSessionsLive()]);
      setRequests(reqs);
      setSessionsMine(mine.map((r) => normalizeMemberSessionMeeting(r)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load meetings');
      setRequests([]);
      setSessionsMine([]);
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  }, [liveOpsEnabled, mockMode, loadMock]);

  const loadEventMeetings = useCallback(
    async (eventUuid: string | undefined): Promise<void> => {
      if (mockMode) {
        if (!eventUuid) {
          setSessionsEvent([]);
          return;
        }
        const base = filterMockSessionsForUser(mockSessions, userId, tier);
        const filtered = base.filter((m) => m.event_id === eventUuid);
        setSessionsEvent(filtered.length ? filtered : base);
        return;
      }
      if (!liveOpsEnabled || !eventUuid) {
        setSessionsEvent([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const rows = await fetchEventSessionsLive(eventUuid);
        setSessionsEvent(rows.map((r) => normalizeMemberSessionMeeting(r)));
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load event meetings');
        setSessionsEvent([]);
      } finally {
        setLoading(false);
      }
    },
    [liveOpsEnabled, mockMode, mockSessions, tier, userId],
  );

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const acceptRequest = useCallback(
    async (requestId: string, body: ApiMeetingRequestAcceptBody): Promise<void> => {
      if (mockMode) {
        setMockRequests((current) =>
          current.map((request) =>
            request.id === requestId ? { ...request, status: 'accepted', updated_at: new Date().toISOString() } : request,
          ),
        );
        return;
      }
      await acceptMeetingRequestApi(requestId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const cancelMeeting = useCallback(
    async (meetingId: string, body: ApiMeetingCancellationBody): Promise<void> => {
      if (mockMode) {
        setMockSessions((current) => cancelMockSession(current, meetingId, body.reason));
        return;
      }
      await cancelScheduledMeetingApi(meetingId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const addNote = useCallback(
    async (meetingId: string, body: ApiMeetingSessionNoteBody): Promise<void> => {
      if (mockMode) {
        setMockSessions((current) => upsertSessionNote(current, meetingId, body.body));
        return;
      }
      await createMeetingSessionNoteApi(meetingId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const updateNote = useCallback(
    async (noteId: string, body: ApiMeetingSessionNotePatchBody): Promise<void> => {
      if (mockMode) {
        if (body.body) {
          setMockSessions((current) => updateSessionNote(current, noteId, body.body ?? ''));
        }
        return;
      }
      await patchMeetingSessionNoteApi(noteId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const saveOutcome = useCallback(
    async (meetingId: string, body: ApiMeetingOutcomeBody): Promise<void> => {
      if (mockMode) {
        setMockSessions((current) => upsertSessionOutcome(current, meetingId, body.summary));
        return;
      }
      await upsertMeetingOutcomeApi(meetingId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const addActionItem = useCallback(
    async (meetingId: string, body: ApiMeetingActionItemCreateBody): Promise<void> => {
      if (mockMode) {
        setMockSessions((current) => addSessionActionItem(current, meetingId, body.title));
        return;
      }
      await createMeetingActionItemApi(meetingId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const updateActionItem = useCallback(
    async (itemId: string, body: ApiMeetingActionItemPatchBody): Promise<void> => {
      if (mockMode) {
        setMockSessions((current) => patchSessionActionItem(current, itemId, body));
        return;
      }
      await patchMeetingActionItemApi(itemId, body);
      await refetch();
    },
    [mockMode, refetch],
  );

  const graphSyncMeeting = useCallback(
    async (meetingId: string): Promise<void> => {
      if (mockMode) {
        return;
      }
      await postScheduledMeetingGraphSyncApi(meetingId);
    },
    [mockMode],
  );

  const refreshMeetingArtifacts = useCallback(
    async (meetingId: string, body?: ApiMeetingRefreshArtifactsBody): Promise<void> => {
      if (mockMode) {
        return;
      }
      await postScheduledMeetingRefreshArtifactsApi(meetingId, body);
    },
    [mockMode],
  );

  const renewMeetingWebhooks = useCallback(async (): Promise<void> => {
    if (mockMode) {
      return;
    }
    await postMeetingsSubscriptionsRenewApi();
  }, [mockMode]);

  return {
    consoleAccessible,
    liveOpsEnabled,
    mockMode,
    dataSource,
    loading,
    hasInitialized,
    error,
    requests,
    sessionsMine,
    sessionsEvent,
    refetch,
    loadEventMeetings,
    acceptRequest,
    cancelMeeting,
    addNote,
    updateNote,
    saveOutcome,
    addActionItem,
    updateActionItem,
    graphSyncMeeting,
    refreshMeetingArtifacts,
    renewMeetingWebhooks,
  };
}
