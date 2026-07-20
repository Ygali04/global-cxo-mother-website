import type { JSX } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  XCircle,
} from 'lucide-react';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Card, CardContent, CardHeader } from '@/portal/components/ui/card';
import type { ApiMeetingRequestJson } from '@/portal/api/types';
import type { MockUser } from '@/portal/data/mock/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function userDetail(
  users: MockUser[],
  id: string,
): { name: string; tier: string | null; company: string | null } {
  const u = users.find((x) => x.id === id);
  if (!u) return { name: `User ${id.slice(0, 8)}`, tier: null, company: null };
  return {
    name: u.name,
    tier: u.tier,
    company: u.companyAffiliation ?? null,
  };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

/**
 * Normalize a proposed_slot from either shape:
 *   { starts_at, duration_minutes }  (new format)
 *   { start, end }                    (legacy format)
 */
interface NormalizedSlot {
  startDate: Date | null;
  endDate: Date | null;
  durationMinutes: number | null;
}

function normalizeSlot(slot: Record<string, unknown>): NormalizedSlot {
  let startDate: Date | null = null;
  let endDate: Date | null = null;
  let durationMinutes: number | null = null;

  const starts = slot.starts_at ?? slot.start;
  if (typeof starts === 'string') {
    const d = new Date(starts);
    if (!Number.isNaN(d.getTime())) startDate = d;
  }

  const ends = slot.end ?? slot.ends_at;
  if (typeof ends === 'string') {
    const d = new Date(ends);
    if (!Number.isNaN(d.getTime())) endDate = d;
  }

  const rawDuration = slot.duration_minutes;
  if (typeof rawDuration === 'number') {
    durationMinutes = rawDuration;
  } else if (startDate && endDate) {
    durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
  }

  return { startDate, endDate, durationMinutes };
}

function formatSlotLong(slot: NormalizedSlot): string {
  if (!slot.startDate) return 'Unknown time';
  const dateFmt: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  };
  const timeFmt: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  return `${slot.startDate.toLocaleDateString(undefined, dateFmt)} · ${slot.startDate.toLocaleTimeString(
    undefined,
    timeFmt,
  )}`;
}

function relativeTime(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diffMs = then - now;
    const absMs = Math.abs(diffMs);
    const minutes = Math.round(absMs / 60000);
    const hours = Math.round(absMs / 3600000);
    const days = Math.round(absMs / 86400000);
    const rel = diffMs >= 0 ? 'in' : 'ago';
    const formatted =
      minutes < 60
        ? `${minutes}m`
        : hours < 24
          ? `${hours}h`
          : `${days}d`;
    return diffMs >= 0 ? `${rel} ${formatted}` : `${formatted} ${rel}`;
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Status config
// ---------------------------------------------------------------------------

type Status =
  | 'pending'
  | 'awaiting_cio_response'
  | 'accepted'
  | 'declined'
  | 'withdrawn'
  | 'unknown';

interface StatusConfig {
  label: string;
  badge: string;
  banner: string;
  icon: JSX.Element;
  description: string;
}

function resolveStatus(raw: string): Status {
  const s = raw.toLowerCase();
  if (s === 'pending' || s === 'awaiting_cio_response') return s as Status;
  if (s === 'accepted') return 'accepted';
  if (s === 'declined' || s === 'rejected') return 'declined';
  if (s === 'withdrawn' || s === 'cancelled') return 'withdrawn';
  return 'unknown';
}

function statusConfig(status: Status): StatusConfig {
  switch (status) {
    case 'pending':
    case 'awaiting_cio_response':
      return {
        label: 'Awaiting response',
        badge: 'bg-amber-50 text-amber-800 border-amber-200',
        banner: 'border-amber-200 bg-amber-50',
        icon: <Clock className="h-4 w-4 text-amber-600" />,
        description: 'Recipient has not yet accepted or declined this request.',
      };
    case 'accepted':
      return {
        label: 'Accepted',
        badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        banner: 'border-emerald-200 bg-emerald-50',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        description: 'Request accepted — session scheduled.',
      };
    case 'declined':
      return {
        label: 'Declined',
        badge: 'bg-rose-50 text-rose-800 border-rose-200',
        banner: 'border-rose-200 bg-rose-50',
        icon: <Ban className="h-4 w-4 text-rose-600" />,
        description: 'Recipient declined the meeting request.',
      };
    case 'withdrawn':
      return {
        label: 'Withdrawn',
        badge: 'bg-slate-100 text-slate-700 border-slate-200',
        banner: 'border-slate-200 bg-slate-50',
        icon: <XCircle className="h-4 w-4 text-slate-500" />,
        description: 'Requester withdrew this request.',
      };
    default:
      return {
        label: 'Unknown',
        badge: 'bg-slate-100 text-slate-600 border-slate-200',
        banner: 'border-slate-200 bg-slate-50',
        icon: <AlertCircle className="h-4 w-4 text-slate-500" />,
        description: 'Unrecognized status.',
      };
  }
}

const TIER_BADGE: Record<string, string> = {
  cxo: 'bg-amber-50 text-amber-700 border-amber-200',
  startup: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  vc: 'bg-violet-50 text-violet-700 border-violet-200',
  admin: 'bg-slate-100 text-slate-700 border-slate-200',
  dev: 'bg-slate-100 text-slate-700 border-slate-200',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function PartyTile({
  party,
  label,
}: {
  party: { name: string; tier: string | null; company: string | null };
  label: 'From' | 'To';
}): JSX.Element {
  const tierClass = party.tier ? TIER_BADGE[party.tier] ?? TIER_BADGE.admin : TIER_BADGE.admin;
  return (
    <div className="flex min-w-0 flex-1 items-start gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
        {initials(party.name) || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <p className="truncate text-sm font-semibold text-slate-900">{party.name}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1">
          {party.tier && (
            <Badge className={`border text-[9px] uppercase ${tierClass}`}>{party.tier}</Badge>
          )}
          {party.company && (
            <span className="truncate text-[11px] text-slate-500">{party.company}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ProposedSlotsList({
  slots,
}: {
  slots: Record<string, unknown>[];
}): JSX.Element | null {
  if (slots.length === 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        <Calendar className="h-3 w-3" />
        Proposed times ({slots.length})
      </p>
      <ul className="space-y-1">
        {slots.map((slot, i) => {
          const norm = normalizeSlot(slot);
          const long = formatSlotLong(norm);
          return (
            <li
              key={i}
              className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Clock className="h-3 w-3 shrink-0 text-slate-400" />
                <span className="truncate text-xs text-slate-700">{long}</span>
              </div>
              {norm.durationMinutes != null && (
                <Badge className="shrink-0 border border-slate-200 bg-slate-50 text-[10px] text-slate-600">
                  {norm.durationMinutes} min
                </Badge>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main card
// ---------------------------------------------------------------------------

export function AdminMeetingRequestCard({
  request,
  users,
  onAccept,
  canAccept,
}: {
  request: ApiMeetingRequestJson;
  users: MockUser[];
  onAccept: (req: ApiMeetingRequestJson) => void;
  canAccept: boolean;
}): JSX.Element {
  const status = resolveStatus(request.status);
  const config = statusConfig(status);
  const requester = userDetail(users, request.requester_id);
  const recipient = userDetail(users, request.recipient_id);
  const slots = request.proposed_slots ?? [];
  const message = request.message?.trim() ?? '';
  const isDeclined = status === 'declined';
  const isAccepted = status === 'accepted';
  const isPending = status === 'pending' || status === 'awaiting_cio_response';

  // Message framing changes by status:
  //   pending  → "Intent from requester"
  //   declined → "Decline reason"
  //   accepted → "Acceptance message"
  //   withdrawn → "Withdrawal note"
  const messageLabel = isDeclined
    ? 'Decline reason'
    : isAccepted
      ? 'Acceptance message'
      : status === 'withdrawn'
        ? 'Withdrawal note'
        : 'Intent from requester';

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      {/* ───────────── HEADER ───────────── */}
      <CardHeader className="space-y-3 border-b border-slate-100 bg-white pb-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`border gap-1 ${config.badge}`}>
                {config.icon}
                {config.label}
              </Badge>
              <span className="text-[11px] text-slate-400">
                Requested {relativeTime(request.created_at)}
              </span>
            </div>
            <h3 className="mt-1.5 flex items-center gap-2 text-base font-semibold text-slate-900">
              <MessageSquare className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="break-words">{request.topic}</span>
            </h3>
          </div>
        </div>

        {/* From → To party row */}
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/40 p-2">
          <PartyTile party={requester} label="From" />
          <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
          <PartyTile party={recipient} label="To" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4">
        {/* ───────────── STATUS BANNER ───────────── */}
        <div className={`flex items-start gap-3 rounded-lg border p-3 ${config.banner}`}>
          <div className="shrink-0">{config.icon}</div>
          <div className="min-w-0 flex-1">
            <p
              className={`text-sm font-semibold ${
                isDeclined
                  ? 'text-rose-900'
                  : isAccepted
                    ? 'text-emerald-900'
                    : isPending
                      ? 'text-amber-900'
                      : 'text-slate-900'
              }`}
            >
              {config.description}
            </p>
          </div>
        </div>

        {/* ───────────── MESSAGE BLOCK ───────────── */}
        {message && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              {messageLabel}
            </p>
            <blockquote
              className={`rounded-md border-l-4 px-3 py-2 text-sm leading-relaxed text-slate-700 ${
                isDeclined
                  ? 'border-rose-300 bg-rose-50/50'
                  : isAccepted
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-300 bg-slate-50/60'
              }`}
            >
              {message}
            </blockquote>
          </div>
        )}

        {/* ───────────── PROPOSED SLOTS ───────────── */}
        {slots.length > 0 && <ProposedSlotsList slots={slots} />}

        {/* ───────────── ACTION FOOTER ───────────── */}
        {isPending && (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <Button
              size="sm"
              disabled={!canAccept}
              onClick={() => onAccept(request)}
              title={canAccept ? undefined : 'Enable API auth to accept requests'}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              Accept request
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
