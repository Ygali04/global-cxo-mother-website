import type { ApiMemberSessionMeetingJson, ApiScheduledMeetingJson } from '@/portal/api/types';

const DEFAULT_SOURCE: ApiMemberSessionMeetingJson['meeting_source'] = 'unknown';
const DEFAULT_TRANSCRIPT: ApiMemberSessionMeetingJson['transcript_status'] = 'none';
const DEFAULT_NOTES: ApiMemberSessionMeetingJson['notes_processing_status'] = 'idle';
const DEFAULT_SUMMARY: ApiMemberSessionMeetingJson['summary_status'] = 'none';
const DEFAULT_GRAPH: ApiMemberSessionMeetingJson['graph_sync_status'] = 'idle';
const DEFAULT_MOMENTUM: ApiMemberSessionMeetingJson['momentum_health'] = 'unknown';

function deriveTranscriptStatus(row: ApiScheduledMeetingJson): ApiMemberSessionMeetingJson['transcript_status'] {
  const raw = (row as ApiScheduledMeetingJson & { teams_transcript_status?: string | null }).teams_transcript_status;
  switch (raw) {
    case 'fetching':
    case 'pending':
      return 'pending';
    case 'recording':
      return 'recording';
    case 'processing':
      return 'processing';
    case 'ingested':
    case 'ready':
      return 'ready';
    case 'failed':
    case 'error':
      return 'failed';
    default:
      return DEFAULT_TRANSCRIPT;
  }
}

function deriveNotesStatus(row: ApiScheduledMeetingJson): ApiMemberSessionMeetingJson['notes_processing_status'] {
  const sessionStatus = (row as ApiScheduledMeetingJson & { session_status?: string }).session_status;
  if (sessionStatus === 'notes_processing') {
    return 'processing';
  }
  if (sessionStatus === 'notes_ready') {
    return 'complete';
  }
  if (sessionStatus === 'notes_failed') {
    return 'failed';
  }
  return DEFAULT_NOTES;
}

function deriveSummaryStatus(row: ApiScheduledMeetingJson): ApiMemberSessionMeetingJson['summary_status'] {
  if ((row as ApiMemberSessionMeetingJson).outcome_present) {
    return 'published';
  }
  const sessionStatus = (row as ApiScheduledMeetingJson & { session_status?: string }).session_status;
  if (sessionStatus === 'notes_processing') {
    return 'draft';
  }
  if (sessionStatus === 'notes_failed') {
    return 'failed';
  }
  return DEFAULT_SUMMARY;
}

function deriveGraphStatus(row: ApiScheduledMeetingJson): ApiMemberSessionMeetingJson['graph_sync_status'] {
  const ext = row as ApiScheduledMeetingJson & {
    teams_graph_event_id?: string | null;
    teams_last_synced_at?: string | null;
    teams_call_record_metadata?: Record<string, unknown>;
  };
  if (typeof ext.teams_call_record_metadata?.graph_provision_error === 'string') {
    return 'error';
  }
  if (ext.teams_graph_event_id && ext.teams_last_synced_at) {
    return 'synced';
  }
  return DEFAULT_GRAPH;
}

/** Coerce partial API rows into a console-ready shape with safe defaults. */
export function normalizeMemberSessionMeeting(row: ApiScheduledMeetingJson): ApiMemberSessionMeetingJson {
  const ext = row as ApiMemberSessionMeetingJson;
  const joinPresent =
    ext.teams_join_url_present ??
    (typeof ext.teams_join_url === 'string' && ext.teams_join_url.length > 0);

  return {
    ...row,
    meeting_source: ext.meeting_source ?? DEFAULT_SOURCE,
    teams_online_meeting_id: ext.teams_online_meeting_id ?? null,
    teams_join_url: ext.teams_join_url ?? null,
    teams_join_url_present: joinPresent,
    transcript_status: ext.transcript_status ?? deriveTranscriptStatus(row),
    notes_processing_status: ext.notes_processing_status ?? deriveNotesStatus(row),
    summary_status: ext.summary_status ?? deriveSummaryStatus(row),
    graph_sync_status: ext.graph_sync_status ?? deriveGraphStatus(row),
    graph_last_synced_at:
      ext.graph_last_synced_at ??
      (ext as ApiScheduledMeetingJson & { teams_last_synced_at?: string | null }).teams_last_synced_at ??
      null,
    participants: ext.participants ?? [],
    action_items_total: ext.action_items_total ?? 0,
    action_items_completed: ext.action_items_completed ?? 0,
    momentum_health: ext.momentum_health ?? DEFAULT_MOMENTUM,
    momentum_score: ext.momentum_score ?? null,
    needs_notes: ext.needs_notes ?? false,
    outcome_present: ext.outcome_present ?? false,
    notes: ext.notes ?? [],
    outcome: ext.outcome ?? null,
    action_items: ext.action_items ?? [],
    title: ext.title ?? null,
    program_id: ext.program_id ?? null,
    program_name: ext.program_name ?? null,
    cohort_id: ext.cohort_id ?? null,
    cohort_name: ext.cohort_name ?? null,
    scheduled_hours: ext.scheduled_hours ?? null,
    attendee_reports: ext.attendee_reports ?? [],
    hours_discrepancy: ext.hours_discrepancy ?? null,
  };
}

export type SessionConsoleFilter =
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'needs_notes'
  | 'feedback_pending'
  | 'hours_escalation';

function isPastEnd(m: ApiMemberSessionMeetingJson, now: Date): boolean {
  return new Date(m.ends_at).getTime() < now.getTime();
}

function isCurrentlyInProgress(m: ApiMemberSessionMeetingJson, now: Date): boolean {
  const start = new Date(m.starts_at).getTime();
  const end = new Date(m.ends_at).getTime();
  const nowMs = now.getTime();
  return start <= nowMs && nowMs < end;
}

function hasPendingFeedback(m: ApiMemberSessionMeetingJson): boolean {
  if (!m.attendee_reports || m.attendee_reports.length === 0) return false;
  return m.attendee_reports.some(
    (r) => r.feedback_status === 'pending' || r.feedback_status === 'overdue',
  );
}

function hasOpenHoursEscalation(m: ApiMemberSessionMeetingJson): boolean {
  return m.hours_discrepancy?.escalation_status === 'pending_admin';
}

/** Client-side bucket when the list API returns `all` or legacy mine/event arrays. */
export function filterMemberSessionsByTab(
  rows: ApiMemberSessionMeetingJson[],
  tab: SessionConsoleFilter,
  now: Date = new Date(),
): ApiMemberSessionMeetingJson[] {
  return rows.filter((m) => {
    const cancelled = m.status === 'cancelled';
    const past = isPastEnd(m, now);
    const live = !cancelled && isCurrentlyInProgress(m, now);

    if (tab === 'cancelled') {
      return cancelled;
    }
    if (cancelled) {
      return false;
    }

    if (tab === 'in_progress') {
      return live;
    }

    if (tab === 'hours_escalation') {
      return hasOpenHoursEscalation(m);
    }

    if (tab === 'feedback_pending') {
      return past && hasPendingFeedback(m);
    }

    if (tab === 'upcoming') {
      // Upcoming excludes the live bucket so each session shows up in exactly one tab.
      return !past && !live;
    }

    if (tab === 'completed') {
      return past;
    }

    // needs_notes
    if (m.needs_notes === true) {
      return true;
    }
    if (!past) {
      return false;
    }
    const notesDone =
      m.notes_processing_status === 'complete' ||
      m.summary_status === 'published' ||
      m.outcome_present === true;
    return !notesDone;
  });
}
