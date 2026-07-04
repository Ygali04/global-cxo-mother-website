import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  MessageSquare,
  Star,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import type {
  ApiMeetingActionItemPatchBody,
  ApiMemberSessionMeetingJson,
  ApiSessionFeedback,
} from '@/portal/api/types';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Card, CardContent, CardHeader } from '@/portal/components/ui/card';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import { Textarea } from '@/portal/components/ui/textarea';
import type { MockUser } from '@/portal/data/mock/types';
import {
  AdminMeetingsSessionTelemetry,
  type SessionTelemetryActions,
} from '@/portal/components/pages/admin/AdminMeetingsSessionTelemetry';
import { UserFeedbackHistoryDialog } from '@/portal/components/pages/admin/UserFeedbackHistoryDialog';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTimeRange(starts: string, ends: string): string {
  try {
    const a = new Date(starts);
    const b = new Date(ends);
    const sameDay =
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    const dateFmt: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    const timeFmt: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
    };
    if (sameDay) {
      return `${a.toLocaleDateString(undefined, dateFmt)} · ${a.toLocaleTimeString(undefined, timeFmt)} → ${b.toLocaleTimeString(undefined, timeFmt)}`;
    }
    return `${a.toLocaleDateString(undefined, dateFmt)} ${a.toLocaleTimeString(undefined, timeFmt)} → ${b.toLocaleDateString(undefined, dateFmt)} ${b.toLocaleTimeString(undefined, timeFmt)}`;
  } catch {
    return `${starts} → ${ends}`;
  }
}

function durationMinutes(starts: string, ends: string): number {
  try {
    return Math.round((new Date(ends).getTime() - new Date(starts).getTime()) / 60000);
  } catch {
    return 0;
  }
}

type LifecycleLabel = 'Upcoming' | 'In progress' | 'Completed' | 'Cancelled';

function lifecycleLabel(meeting: ApiMemberSessionMeetingJson, now = new Date()): LifecycleLabel {
  if (meeting.status === 'cancelled') return 'Cancelled';
  const start = new Date(meeting.starts_at).getTime();
  const end = new Date(meeting.ends_at).getTime();
  const n = now.getTime();
  if (n < start) return 'Upcoming';
  if (n < end) return 'In progress';
  return 'Completed';
}

const LIFECYCLE_STYLES: Record<LifecycleLabel, { badge: string; dot: string }> = {
  Upcoming: {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  'In progress': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500 animate-pulse',
  },
  Completed: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  Cancelled: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
};

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

function StarRow({
  rating,
  size = 'sm',
}: {
  rating: number;
  size?: 'sm' | 'md';
}): JSX.Element {
  const dim = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${dim} ${
            n <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-100 text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

function FeedbackRow({
  fb,
  onClickName,
}: {
  fb: ApiSessionFeedback;
  onClickName: (userId: string, name: string) => void;
}): JSX.Element {
  const roleLabel = fb.role === 'cxo' ? 'CXO' : 'Startup';
  const roleClasses =
    fb.role === 'cxo'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-cyan-50 text-cyan-700 border-cyan-200';

  return (
    <div
      className={`rounded-lg border p-3 ${
        fb.something_wrong ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onClickName(fb.user_id, fb.display_name)}
              className="truncate text-sm font-semibold text-slate-900 underline-offset-2 hover:underline"
              title="View all feedback received by this user"
            >
              {fb.display_name}
            </button>
            <Badge className={`border text-[10px] ${roleClasses}`}>{roleLabel}</Badge>
          </div>
          {fb.submitted_at && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              Submitted {new Date(fb.submitted_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <StarRow rating={fb.rating} />
      </div>

      {fb.comment && (
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{fb.comment}</p>
      )}

      {fb.something_wrong && fb.wrong_description && (
        <div className="mt-2 flex items-start gap-2 rounded-md border border-red-200 bg-white p-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-red-600">
              Flagged concern
            </p>
            <p className="mt-0.5 text-xs text-red-800">{fb.wrong_description}</p>
          </div>
        </div>
      )}

      {fb.extra_time_offered != null && fb.extra_time_offered > 0 && (
        <p className="mt-2 text-xs text-emerald-700">
          + Offered {fb.extra_time_offered}h of extra advisory time
        </p>
      )}
    </div>
  );
}

function EmptyFeedbackPlaceholder({ meeting }: { meeting: ApiMemberSessionMeetingJson }): JSX.Element | null {
  const reports = meeting.attendee_reports ?? [];
  if (reports.length === 0) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {reports.map((r) => (
        <div
          key={r.user_id}
          className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-700">{r.display_name}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                {r.role === 'cio' ? 'CXO' : 'Startup'}
              </p>
            </div>
            {r.feedback_status === 'pending' && (
              <Badge className="border border-amber-200 bg-amber-50 text-[10px] text-amber-700">
                Awaiting feedback
              </Badge>
            )}
            {r.feedback_status === 'overdue' && (
              <Badge className="border border-red-200 bg-red-50 text-[10px] text-red-700">
                Overdue
              </Badge>
            )}
            {r.feedback_status === 'not_required' && (
              <Badge className="border border-slate-200 bg-white text-[10px] text-slate-500">
                —
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

export interface MeetingCardHandlers {
  onCancel: (meetingId: string, reason: string) => Promise<void>;
  onNote: (meetingId: string, body: string) => Promise<void>;
  onNoteEdit: (noteId: string, body: string) => Promise<void>;
  onOutcome: (meetingId: string, summary: string) => Promise<void>;
  onActionItem: (meetingId: string, title: string) => Promise<void>;
  onActionItemEdit: (itemId: string, patch: ApiMeetingActionItemPatchBody) => Promise<void>;
  onDelete?: (meetingId: string) => Promise<void>;
}

export function AdminMeetingsMeetingCard({
  meeting,
  users,
  handlers,
  telemetryActions,
  mutationsDisabled = false,
}: {
  meeting: ApiMemberSessionMeetingJson;
  users: MockUser[];
  handlers: MeetingCardHandlers;
  telemetryActions?: SessionTelemetryActions;
  mutationsDisabled?: boolean;
}): JSX.Element {
  const [note, setNote] = useState('');
  const [outcome, setOutcome] = useState(meeting.outcome?.summary ?? '');
  const [actionTitle, setActionTitle] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<{ id: string; name: string } | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const lifecycle = lifecycleLabel(meeting);
  const styles = LIFECYCLE_STYLES[lifecycle];
  const durationMin = durationMinutes(meeting.starts_at, meeting.ends_at);
  const cancellation = meeting.cancellation ?? null;
  const feedback = meeting.feedback ?? [];
  const hasAnyFeedback = feedback.length > 0;
  const discrepancy = meeting.hours_discrepancy;
  const isDisputed = discrepancy?.escalation_status === 'pending_admin';
  const isResolved = discrepancy?.escalation_status === 'resolved';
  const isCancelled = meeting.status === 'cancelled';

  const averageRating =
    feedback.length > 0
      ? feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length
      : null;

  const run = async (fn: () => Promise<void>): Promise<void> => {
    setBusy(true);
    try {
      await fn();
      toast.success('Saved');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  const openHistory = (userId: string, name: string): void => {
    setHistoryTarget({ id: userId, name });
    setHistoryOpen(true);
  };

  useEffect(() => {
    setOutcome(meeting.outcome?.summary ?? '');
  }, [meeting.outcome?.summary]);

  const telActions: SessionTelemetryActions | undefined = telemetryActions
    ? { ...telemetryActions, actionsDisabled: telemetryActions.actionsDisabled ?? mutationsDisabled }
    : undefined;

  return (
    <>
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {/* ───────────── HEADER ───────────── */}
        <CardHeader className="space-y-3 border-b border-slate-100 bg-white pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`border gap-1 ${styles.badge}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${styles.dot}`} />
                  {lifecycle}
                </Badge>
                {meeting.program_name && (
                  <Badge className="border border-indigo-200 bg-indigo-50 text-indigo-700">
                    {meeting.program_name}
                  </Badge>
                )}
                {meeting.cohort_name && (
                  <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px]">
                    {meeting.cohort_name}
                  </Badge>
                )}
                {durationMin > 0 && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    {durationMin} min
                  </span>
                )}
                {averageRating !== null && (
                  <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="break-words">
                  {formatDateTimeRange(meeting.starts_at, meeting.ends_at)}
                </span>
              </h3>
              {meeting.title && (
                <p className="text-sm font-medium text-slate-700">{meeting.title}</p>
              )}
              {meeting.location && (
                <a
                  href={meeting.location}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {meeting.location.length > 60 ? `${meeting.location.slice(0, 60)}…` : meeting.location}
                </a>
              )}
            </div>
            {handlers.onDelete && (
              <div className="shrink-0">
                {!confirmingDelete ? (
                  <button
                    type="button"
                    title="Delete session"
                    disabled={busy || mutationsDisabled}
                    onClick={() => setConfirmingDelete(true)}
                    className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy || mutationsDisabled}
                      onClick={() => {
                        setConfirmingDelete(false);
                        void run(async () => {
                          await handlers.onDelete!(meeting.id);
                        });
                      }}
                      className="h-7 text-xs"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setConfirmingDelete(false)}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Participants row */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            {(meeting.participants ?? []).map((p, idx) => (
              <span key={p.user_id} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openHistory(p.user_id, p.display_name ?? 'Member')}
                  className="font-medium text-slate-800 underline-offset-2 hover:underline"
                  title="View feedback history"
                >
                  {p.display_name ?? 'Member'}
                </button>
                {idx < (meeting.participants ?? []).length - 1 && (
                  <span className="text-slate-300">·</span>
                )}
              </span>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4">
          {/* ───────────── CANCELLATION BANNER ───────────── */}
          {isCancelled && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
              <Ban className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-900">Meeting cancelled</p>
                {cancellation?.cancelled_by_name && (
                  <p className="mt-0.5 text-xs text-rose-700">
                    Cancelled by {cancellation.cancelled_by_name}
                    {cancellation.created_at && (
                      <span className="text-rose-500">
                        {' '}
                        · {new Date(cancellation.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                )}
                {cancellation?.reason && (
                  <p className="mt-1.5 text-sm text-rose-800">
                    <span className="font-medium">Reason:</span> {cancellation.reason}
                  </p>
                )}
                {!cancellation?.reason && (
                  <p className="mt-1 text-xs italic text-rose-500">
                    No reason provided.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ───────────── DISCREPANCY BANNER ───────────── */}
          {discrepancy && (
            <div
              className={`rounded-lg border p-3 ${
                isDisputed
                  ? 'border-red-300 bg-red-50'
                  : isResolved
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {isDisputed ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p
                      className={`text-sm font-semibold ${
                        isDisputed ? 'text-red-900' : 'text-emerald-900'
                      }`}
                    >
                      {isDisputed ? 'Hours dispute — awaiting admin' : 'Dispute resolved'}
                    </p>
                    {isDisputed && (
                      <Badge className="border border-red-300 bg-white text-[10px] text-red-700">
                        Needs admin
                      </Badge>
                    )}
                  </div>
                  <p
                    className={`mt-0.5 text-xs ${
                      isDisputed ? 'text-red-700' : 'text-emerald-700'
                    }`}
                  >
                    {discrepancy.reported_by === 'both'
                      ? 'Both participants flagged concerns'
                      : discrepancy.reported_by === 'cio'
                        ? 'CXO flagged a concern'
                        : 'Startup flagged a concern'}
                    {discrepancy.gap_hours > 0 && ` · ${discrepancy.gap_hours}h gap`}
                  </p>
                  {discrepancy.reason && (
                    <p
                      className={`mt-2 rounded-md border p-2 text-xs leading-relaxed ${
                        isDisputed
                          ? 'border-red-200 bg-white text-red-800'
                          : 'border-emerald-200 bg-white text-emerald-800'
                      }`}
                    >
                      {discrepancy.reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ───────────── FEEDBACK PANEL ───────────── */}
          {(hasAnyFeedback || (meeting.attendee_reports?.length ?? 0) > 0) && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <MessageSquare className="-mt-0.5 mr-1 inline-block h-3.5 w-3.5" />
                  Post-meeting feedback
                </p>
                {hasAnyFeedback && (
                  <span className="text-xs text-slate-400">
                    {feedback.length} {feedback.length === 1 ? 'response' : 'responses'}
                  </span>
                )}
              </div>
              {hasAnyFeedback ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {feedback.map((fb) => (
                    <FeedbackRow key={fb.id} fb={fb} onClickName={openHistory} />
                  ))}
                </div>
              ) : (
                <EmptyFeedbackPlaceholder meeting={meeting} />
              )}
            </div>
          )}

          {/* ───────────── NOTES + OUTCOME VIEW (read-only) ───────────── */}
          {(meeting.outcome?.summary || (meeting.notes && meeting.notes.length > 0)) && (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
              {meeting.outcome?.summary && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Outcome summary
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-700">
                    {meeting.outcome.summary}
                  </p>
                </div>
              )}
              {meeting.notes && meeting.notes.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Session notes ({meeting.notes.length})
                  </p>
                  <ul className="mt-1 space-y-1">
                    {meeting.notes.slice(0, 3).map((n) => (
                      <li key={n.id} className="text-sm leading-relaxed text-slate-700">
                        • {n.body}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {meeting.action_items && meeting.action_items.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Action items ({meeting.action_items.filter((a) => a.status === 'done').length}/
                    {meeting.action_items.length} done)
                  </p>
                  <ul className="mt-1 space-y-1">
                    {meeting.action_items.map((ai) => (
                      <li
                        key={ai.id}
                        className={`flex items-center gap-2 text-sm ${
                          ai.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'
                        }`}
                      >
                        {ai.status === 'done' ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        ) : (
                          <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" />
                        )}
                        <span>{ai.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* ───────────── FOLLOW-UP ACTIONS (collapsible) ───────────── */}
          {!isCancelled && (
            <div className="rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setActionsOpen((v) => !v)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 hover:bg-slate-50"
              >
                <span>Admin actions · Add note, outcome, action item, cancel</span>
                {actionsOpen ? (
                  <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
              </button>
              {actionsOpen && (
                <div className="space-y-3 border-t border-slate-100 bg-slate-50/40 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`note-${meeting.id}`} className="text-xs">
                        Add session note
                      </Label>
                      <Textarea
                        id={`note-${meeting.id}`}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={2}
                        placeholder="Internal note visible only to admins"
                        disabled={mutationsDisabled}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        disabled={busy || !note.trim() || mutationsDisabled}
                        onClick={() =>
                          run(async () => {
                            await handlers.onNote(meeting.id, note.trim());
                            setNote('');
                          })
                        }
                      >
                        Save note
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`out-${meeting.id}`} className="text-xs">
                        Outcome summary
                      </Label>
                      <Textarea
                        id={`out-${meeting.id}`}
                        value={outcome}
                        onChange={(e) => setOutcome(e.target.value)}
                        rows={2}
                        placeholder="One-paragraph summary for CRM"
                        disabled={mutationsDisabled}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy || !outcome.trim() || mutationsDisabled}
                        onClick={() =>
                          run(async () => {
                            await handlers.onOutcome(meeting.id, outcome.trim());
                          })
                        }
                      >
                        Save outcome
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`act-${meeting.id}`} className="text-xs">
                        New action item
                      </Label>
                      <Input
                        id={`act-${meeting.id}`}
                        value={actionTitle}
                        onChange={(e) => setActionTitle(e.target.value)}
                        placeholder="Action item title"
                        disabled={mutationsDisabled}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy || !actionTitle.trim() || mutationsDisabled}
                        onClick={() =>
                          run(async () => {
                            await handlers.onActionItem(meeting.id, actionTitle.trim());
                            setActionTitle('');
                          })
                        }
                      >
                        Add action item
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`cx-${meeting.id}`} className="text-xs">
                        Cancel this meeting
                      </Label>
                      <Input
                        id={`cx-${meeting.id}`}
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Reason (required)"
                        disabled={mutationsDisabled}
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={busy || mutationsDisabled || !cancelReason.trim()}
                        onClick={() =>
                          run(async () => {
                            await handlers.onCancel(meeting.id, cancelReason.trim());
                            setCancelReason('');
                          })
                        }
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        Cancel meeting
                      </Button>
                    </div>
                  </div>
                  {meeting.notes && meeting.notes.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Edit existing notes
                      </p>
                      <div className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
                        {meeting.notes.map((item) => (
                          <EditableNoteRow
                            key={item.id}
                            noteId={item.id}
                            initialBody={item.body}
                            disabled={busy || mutationsDisabled}
                            onSave={handlers.onNoteEdit}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {meeting.action_items && meeting.action_items.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Edit action items
                      </p>
                      <div className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
                        {meeting.action_items.map((item) => (
                          <EditableActionItemRow
                            key={item.id}
                            itemId={item.id}
                            initialTitle={item.title}
                            initialStatus={item.status}
                            disabled={busy || mutationsDisabled}
                            onSave={handlers.onActionItemEdit}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ───────────── TELEMETRY (collapsible) ───────────── */}
          <div className="rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setTelemetryOpen((v) => !v)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:bg-slate-50"
            >
              <span>Telemetry · Teams / Graph sync / transcript</span>
              {telemetryOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>
            {telemetryOpen && (
              <div className="border-t border-slate-100 bg-slate-50/40 p-3">
                <AdminMeetingsSessionTelemetry
                  meeting={meeting}
                  users={users}
                  actions={telActions}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <UserFeedbackHistoryDialog
        open={historyOpen}
        userId={historyTarget?.id ?? null}
        userName={historyTarget?.name ?? null}
        onOpenChange={(v) => {
          setHistoryOpen(v);
          if (!v) setHistoryTarget(null);
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Inline editors (unchanged from the previous version)
// ---------------------------------------------------------------------------

function EditableNoteRow({
  noteId,
  initialBody,
  disabled,
  onSave,
}: {
  noteId: string;
  initialBody: string;
  disabled: boolean;
  onSave: (noteId: string, body: string) => Promise<void>;
}): JSX.Element {
  const [value, setValue] = useState(initialBody);
  useEffect(() => {
    setValue(initialBody);
  }, [initialBody]);
  return (
    <div className="space-y-1.5">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        disabled={disabled}
        className="text-sm"
      />
      <Button
        size="sm"
        variant="ghost"
        disabled={disabled || !value.trim()}
        onClick={() => void onSave(noteId, value.trim())}
      >
        Save edit
      </Button>
    </div>
  );
}

function EditableActionItemRow({
  itemId,
  initialTitle,
  initialStatus,
  disabled,
  onSave,
}: {
  itemId: string;
  initialTitle: string;
  initialStatus: string;
  disabled: boolean;
  onSave: (itemId: string, patch: ApiMeetingActionItemPatchBody) => Promise<void>;
}): JSX.Element {
  const [title, setTitle] = useState(initialTitle);
  const done = initialStatus === 'done';
  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);
  return (
    <div className="space-y-1.5">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={disabled}
        className="text-sm"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={disabled || !title.trim()}
          onClick={() => void onSave(itemId, { title: title.trim() })}
        >
          Save title
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() => void onSave(itemId, { status: done ? 'open' : 'done' })}
        >
          Mark {done ? 'open' : 'done'}
        </Button>
      </div>
    </div>
  );
}
