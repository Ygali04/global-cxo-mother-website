import { useCallback, useEffect, useState } from 'react';
import { USE_API_AUTH } from '@/portal/api/config';
import { apiFetch } from '@/portal/api/client';
import {
  createMeetingSessionNoteApi,
  listMeetingRequestsApi,
  listMyScheduledMeetingsApi,
  patchMeetingSessionNoteApi,
  upsertMeetingOutcomeApi,
} from '@/portal/api/ops';
import type {
  ApiMeetingRequestJson,
  ApiScheduledMeetingJson,
} from '@/portal/api/types';
import { getStoredAccessToken } from '@/portal/api/tokenStorage';

export interface UseMyMeetingsResult {
  meetings: ApiScheduledMeetingJson[];
  requests: ApiMeetingRequestJson[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createRequest: (topic: string, proposedSlots: Record<string, unknown>[]) => Promise<void>;
  addNote: (meetingId: string, body: string) => Promise<void>;
  editNote: (noteId: string, body: string) => Promise<void>;
  saveOutcome: (meetingId: string, summary: string) => Promise<void>;
}

export function useMyMeetings(): UseMyMeetingsResult {
  const [meetings, setMeetings] = useState<ApiScheduledMeetingJson[]>([]);
  const [requests, setRequests] = useState<ApiMeetingRequestJson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = getStoredAccessToken();
  const liveEnabled = Boolean(USE_API_AUTH && token);

  const refetch = useCallback(async (): Promise<void> => {
    if (!liveEnabled) {
      setMeetings([]);
      setRequests([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [reqs, mine] = await Promise.all([
        listMeetingRequestsApi(),
        listMyScheduledMeetingsApi(),
      ]);
      setRequests(reqs);
      setMeetings(mine);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions');
      setRequests([]);
      setMeetings([]);
    } finally {
      setLoading(false);
    }
  }, [liveEnabled]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  const createRequest = useCallback(
    async (topic: string, proposedSlots: Record<string, unknown>[]): Promise<void> => {
      await apiFetch('/ops/meeting-requests', {
        method: 'POST',
        body: { topic, proposed_slots: proposedSlots },
      });
      await refetch();
    },
    [refetch],
  );

  const addNote = useCallback(
    async (meetingId: string, body: string): Promise<void> => {
      await createMeetingSessionNoteApi(meetingId, { body, note_kind: 'internal' });
      await refetch();
    },
    [refetch],
  );

  const editNote = useCallback(
    async (noteId: string, body: string): Promise<void> => {
      await patchMeetingSessionNoteApi(noteId, { body });
      await refetch();
    },
    [refetch],
  );

  const saveOutcome = useCallback(
    async (meetingId: string, summary: string): Promise<void> => {
      await upsertMeetingOutcomeApi(meetingId, { summary });
      await refetch();
    },
    [refetch],
  );

  return {
    meetings,
    requests,
    loading,
    error,
    refetch,
    createRequest,
    addNote,
    editNote,
    saveOutcome,
  };
}
