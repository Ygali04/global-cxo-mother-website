import type { JSX } from 'react';
import { ExternalLink, RefreshCw, Share2 } from 'lucide-react';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import type { ApiMemberSessionMeetingJson } from '@/portal/api/types';
import type { MockUser } from '@/portal/data/mock/types';

function sourceLabel(source: ApiMemberSessionMeetingJson['meeting_source']): string {
  switch (source) {
    case 'teams':
      return 'Microsoft Teams';
    case 'google_meet':
      return 'Google Meet';
    case 'zoom':
      return 'Zoom';
    case 'in_person':
      return 'In person';
    case 'manual':
      return 'Manual';
    default:
      return 'Unknown source';
  }
}

function momentumClass(health: ApiMemberSessionMeetingJson['momentum_health']): string {
  switch (health) {
    case 'hot':
      return 'border-emerald-200 bg-emerald-50 text-emerald-900';
    case 'active':
      return 'border-sky-200 bg-sky-50 text-sky-900';
    case 'warming':
      return 'border-amber-200 bg-amber-50 text-amber-900';
    case 'cold':
      return 'border-slate-200 bg-slate-50 text-slate-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-600';
  }
}

function displayUser(users: MockUser[], id: string): string {
  const u = users.find((x) => x.id === id);
  return u?.name ?? `User ${id.slice(0, 8)}`;
}

export interface SessionTelemetryActions {
  onGraphSync?: (meetingId: string) => Promise<void>;
  onRefreshArtifacts?: (meetingId: string) => Promise<void>;
  actionsDisabled?: boolean;
}

export function AdminMeetingsSessionTelemetry({
  meeting,
  users,
  actions,
}: {
  meeting: ApiMemberSessionMeetingJson;
  users: MockUser[];
  actions?: SessionTelemetryActions;
}): JSX.Element {
  const parts = meeting.participants?.length
    ? meeting.participants.map((p) => p.display_name ?? displayUser(users, p.user_id))
    : [displayUser(users, meeting.organizer_user_id), displayUser(users, meeting.participant_user_id)];

  const actionLabel =
    meeting.action_items_total && meeting.action_items_total > 0
      ? `${meeting.action_items_completed ?? 0}/${meeting.action_items_total} action items`
      : 'No action items';

  const joinReady = meeting.teams_join_url_present === true;
  const joinUrl = meeting.teams_join_url;

  return (
    <div className="space-y-3 border-t border-slate-100 pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" className="font-normal capitalize">
          {sourceLabel(meeting.meeting_source ?? 'unknown')}
        </Badge>
        <Badge variant="secondary" className="font-normal">
          Transcript: {meeting.transcript_status ?? 'none'}
        </Badge>
        <Badge variant="secondary" className="font-normal">
          Notes: {meeting.notes_processing_status ?? 'idle'}
        </Badge>
        <Badge variant="secondary" className="font-normal">
          Summary: {meeting.summary_status ?? 'none'}
        </Badge>
        <Badge variant="secondary" className="font-normal">
          Graph: {meeting.graph_sync_status ?? 'idle'}
        </Badge>
        <span
          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${momentumClass(meeting.momentum_health)}`}
        >
          Momentum: {meeting.momentum_health ?? 'unknown'}
          {meeting.momentum_score != null ? ` (${meeting.momentum_score})` : ''}
        </span>
      </div>

      <div className="text-xs text-slate-600">
        <span className="font-medium text-slate-800">Participants: </span>
        {parts.join(' · ')}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span>
          <span className="font-medium text-slate-800">Teams join: </span>
          {joinReady ? 'Available' : 'Not linked'}
        </span>
        <span aria-hidden="true">
          ·
        </span>
        <span>{actionLabel}</span>
        {meeting.graph_last_synced_at ? (
          <>
            <span aria-hidden="true">
              ·
            </span>
            <span>Graph sync {new Date(meeting.graph_last_synced_at).toLocaleString()}</span>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {joinUrl ? (
          <Button size="sm" variant="outline" asChild className="h-8 gap-1">
            <a href={joinUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Open in Teams
            </a>
          </Button>
        ) : null}
        {actions?.onGraphSync ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1"
            disabled={actions.actionsDisabled}
            onClick={() => void actions.onGraphSync?.(meeting.id)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Graph sync
          </Button>
        ) : null}
        {actions?.onRefreshArtifacts ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1"
            disabled={actions.actionsDisabled}
            onClick={() => void actions.onRefreshArtifacts?.(meeting.id)}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh artifacts
          </Button>
        ) : null}
      </div>
    </div>
  );
}
