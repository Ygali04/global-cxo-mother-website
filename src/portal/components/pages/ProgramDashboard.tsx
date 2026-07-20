import React, { useCallback, useMemo, useState } from 'react';
import { Calendar, Clock, ExternalLink, MessageSquare, Search, Users } from 'lucide-react';
import ProgramCalendar from '@/portal/components/ProgramCalendar';
import { toast } from 'sonner';
import { useAuth } from '@/portal/hooks/useAuth';
import { useCanSeeFinancials } from '@/portal/hooks/useFinancialAccess';
import { useMyProgram, usePendingFeedback, useSubmitFeedback } from '@/portal/hooks/usePrograms';
import {
  useTimeShareRequests,
  useStartupUsage,
  useResolveTimeShareRequest,
  usePricingTiers,
} from '@/portal/hooks/useTimeshare';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/portal/components/ui/card';
import { Badge } from '@/portal/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/portal/components/ui/dialog';
import { Button } from '@/portal/components/ui/button';
import { Input } from '@/portal/components/ui/input';
import { Progress } from '@/portal/components/ui/progress';
import { Textarea } from '@/portal/components/ui/textarea';
import TimeShareRequestDialog from '@/portal/components/TimeShareRequestDialog';
import BookSessionModal from '@/portal/components/BookSessionModal';
import MemberProfileModal from '@/portal/components/MemberProfileModal';
import type { EnrollmentResponse, AssignmentResponse, TimeShareRequestResponse, PricingTierResponse, UpcomingSession } from '@/portal/api/types';
import { createTimeShareRequestApi } from '@/portal/api/timeshare';
import { openManageCalendar } from '@/portal/lib/calcomBridge';

const TIER_STYLES: Record<string, string> = {
  startup: 'bg-blue-100 text-blue-700',
  cxo: 'bg-purple-100 text-purple-700',
  vc: 'bg-green-100 text-green-700',
  admin: 'bg-orange-100 text-orange-700',
  dev: 'bg-red-100 text-red-700',
};

const REQUEST_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
};

const SESSION_STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-green-100 text-green-700',
  completed: 'bg-slate-100 text-slate-700',
  cancelled: 'bg-red-100 text-red-700',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function AdvisoryCircleCard({
  assignments,
  userId,
  userTier,
  onRequestNewPartner,
  partnerSessionHours,
  allSessions,
  partners,
}: {
  assignments: AssignmentResponse[];
  userId: string;
  userTier: string;
  onRequestNewPartner: () => void;
  partnerSessionHours: Record<string, { completed: number; scheduled: number }>;
  allSessions: import('@/portal/api/types').UpcomingSession[];
  partners: import('@/portal/api/types').MyProgramPartner[];
}): React.ReactElement {
  const myPairings = assignments.filter(
    (a) => a.cxo_user_id === userId || a.startup_user_id === userId,
  );

  // Derive session-based partners when no assignment records exist
  const sessionPartners = React.useMemo(() => {
    if (myPairings.length > 0) return []; // assignments take priority
    const partnerMap = new Map<string, { name: string; company: string }>();
    for (const s of allSessions) {
      const pid = s.organizer_user_id === userId ? s.participant_user_id : s.organizer_user_id;
      if (!partnerMap.has(pid)) {
        const pName = s.organizer_user_id === userId ? s.participant_name : s.organizer_name;
        const matched = partners.find(p => p.user_id === pid);
        partnerMap.set(pid, {
          name: pName ?? matched?.name ?? 'Unknown',
          company: matched?.company ?? '',
        });
      }
    }
    return Array.from(partnerMap.entries()).map(([id, info]) => ({ id, ...info }));
  }, [myPairings.length, allSessions, userId, partners]);

  const hasData = myPairings.length > 0 || sessionPartners.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">My Advisory Circle</CardTitle>
        <Button size="sm" variant="outline" onClick={onRequestNewPartner}>
          Request New Partner
        </Button>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <p className="text-sm text-gray-500 py-4 text-center">No pairings yet.</p>
        ) : myPairings.length > 0 ? (
          <div className="divide-y">
            {myPairings.map((a) => {
              const isCxo = userTier === 'cxo';
              const partnerId = isCxo ? a.startup_user_id : a.cxo_user_id;
              const partnerName = isCxo ? (a.startup_name ?? 'Unknown') : (a.cxo_name ?? 'Unknown');
              const partnerCompany = isCxo ? (a.startup_company ?? '') : (a.cxo_company ?? '');
              const sessionHrs = partnerSessionHours[partnerId];
              const completedHrs = sessionHrs?.completed ?? 0;
              const scheduledHrs = sessionHrs?.scheduled ?? 0;
              const totalAllocated = a.hours_allocated || 40;
              const completedPct = totalAllocated > 0 ? Math.min((completedHrs / totalAllocated) * 100, 100) : 0;
              const scheduledPct = totalAllocated > 0 ? Math.min((scheduledHrs / totalAllocated) * 100, 100 - completedPct) : 0;

              return (
                <div key={a.id} className="py-3 space-y-1.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-navy-dark">{partnerName}</p>
                      {partnerCompany && (
                        <p className="text-xs text-gray-500">{partnerCompany}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round((completedHrs + scheduledHrs) * 10) / 10} / {totalAllocated}h
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden flex">
                    {completedPct > 0 && (
                      <div className="h-full bg-green-500" style={{ width: `${completedPct}%` }} />
                    )}
                    {scheduledPct > 0 && (
                      <div className="h-full bg-yellow-400" style={{ width: `${scheduledPct}%` }} />
                    )}
                  </div>
                  {(completedHrs > 0 || scheduledHrs > 0) && (
                    <div className="flex gap-3 text-[10px] text-gray-400">
                      {completedHrs > 0 && <span>{Math.round(completedHrs * 10) / 10}h completed</span>}
                      {scheduledHrs > 0 && <span>{Math.round(scheduledHrs * 10) / 10}h scheduled</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback: derive from sessions when no assignment records */
          <div className="divide-y">
            {sessionPartners.map((sp) => {
              const sessionHrs = partnerSessionHours[sp.id];
              const completedHrs = sessionHrs?.completed ?? 0;
              const scheduledHrs = sessionHrs?.scheduled ?? 0;
              const totalHrs = Math.round((completedHrs + scheduledHrs) * 10) / 10;

              return (
                <div key={sp.id} className="py-3 space-y-1.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-navy-dark">{sp.name}</p>
                      {sp.company && <p className="text-xs text-gray-500">{sp.company}</p>}
                    </div>
                    <span className="text-xs text-gray-500">{totalHrs}h</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden flex">
                    {completedHrs > 0 && (
                      <div className="h-full bg-green-500" style={{ width: `${totalHrs > 0 ? (completedHrs / totalHrs) * 100 : 0}%` }} />
                    )}
                    {scheduledHrs > 0 && (
                      <div className="h-full bg-yellow-400" style={{ width: `${totalHrs > 0 ? (scheduledHrs / totalHrs) * 100 : 0}%` }} />
                    )}
                  </div>
                  <div className="flex gap-3 text-[10px] text-gray-400">
                    {completedHrs > 0 && <span>{Math.round(completedHrs * 10) / 10}h completed</span>}
                    {scheduledHrs > 0 && <span>{Math.round(scheduledHrs * 10) / 10}h scheduled</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TimeShareBalanceCard({
  userTier,
  enrollment,
  startupUsage,
  programInProgress,
  sessionHours,
}: {
  userTier: string;
  enrollment: EnrollmentResponse | undefined;
  startupUsage: { hours_used: number; hours_remaining: number; max_hours: number; warning: boolean } | undefined;
  programInProgress: boolean;
  sessionHours: { completed: number; scheduled: number };
}): React.ReactElement {
  const isStartup = userTier === 'startup';

  const totalHours = isStartup
    ? (startupUsage?.max_hours ?? enrollment?.hours_committed ?? 40)
    : (enrollment?.hours_committed ?? 40);

  const completedHrs = sessionHours.completed;
  const scheduledHrs = sessionHours.scheduled;
  const remainingHrs = Math.max(totalHours - completedHrs - scheduledHrs, 0);

  const completedPct = totalHours > 0 ? Math.min((completedHrs / totalHours) * 100, 100) : 0;
  const scheduledPct = totalHours > 0 ? Math.min((scheduledHrs / totalHours) * 100, 100 - completedPct) : 0;
  const showWarning = programInProgress && (completedHrs + scheduledHrs) / Math.max(totalHours, 1) < 0.25;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Time-Share Balance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 3-segment bar: green (completed) | yellow (scheduled) | gray (remaining) */}
        <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden flex">
          {completedPct > 0 && (
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${completedPct}%` }}
            />
          )}
          {scheduledPct > 0 && (
            <div
              className="h-full bg-yellow-400 transition-all"
              style={{ width: `${scheduledPct}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            Completed: {completedHrs}h
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-yellow-400" />
            Scheduled: {scheduledHrs}h
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-200" />
            Remaining: {remainingHrs}h
          </span>
        </div>

        <p className="text-sm text-gray-700">
          {isStartup
            ? `${completedHrs + scheduledHrs} / ${totalHours} hours received`
            : `${completedHrs + scheduledHrs} / ${totalHours} hours contributed`}
        </p>
        {showWarning && (
          <p className="text-sm text-amber-600 font-medium">
            You are below 25% usage — consider scheduling more sessions.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function UpcomingSessionsCard({
  sessions,
  userId,
}: {
  sessions: UpcomingSession[] | undefined;
  userId: string;
}): React.ReactElement {
  const hasSessions = sessions && sessions.length > 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Upcoming Sessions
          {hasSessions && (
            <Badge variant="secondary" className="ml-1">{sessions.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasSessions ? (
          <div className="space-y-2">
            {sessions.map((s) => {
              const isOrganizer = s.organizer_user_id === userId;
              const partnerName = isOrganizer
                ? (s.participant_name ?? 'Unknown')
                : (s.organizer_name ?? 'Unknown');
              const statusLabel = s.status.charAt(0).toUpperCase() + s.status.slice(1);

              return (
                <div key={s.id} className="rounded-md border p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-navy-dark">
                      {s.title ?? 'Advisory Session'}
                    </p>
                    <Badge className={SESSION_STATUS_STYLES[s.status] ?? 'bg-gray-100 text-gray-700'}>
                      {statusLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    with {partnerName}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(s.starts_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' \u2013 '}
                      {new Date(s.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">View and manage your sessions in Cal.com.</p>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => void openManageCalendar()}
          className="flex items-center gap-2"
        >
          Manage Calendar
          <ExternalLink size={14} />
        </Button>
      </CardContent>
    </Card>
  );
}

function PendingRequestsCard({
  requests,
  userId,
  onResolve,
}: {
  requests: TimeShareRequestResponse[];
  userId: string;
  onResolve: (requestId: string, action: 'accept' | 'deny') => void | Promise<void>;
}): React.ReactElement {
  const incoming = requests.filter((r) => r.recipient_id === userId && r.status === 'pending');
  const outgoing = requests.filter((r) => r.requester_id === userId);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Pending Requests</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {incoming.length === 0 && outgoing.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-2">No pending requests.</p>
        )}

        {incoming.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Incoming
            </p>
            <div className="divide-y">
              {incoming.map((r) => (
                <div key={r.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                  <div>
                    <p className="text-sm font-medium text-navy-dark">
                      {r.requester_company || r.requester_name || 'Unknown'}
                    </p>
                    {r.requester_company && r.requester_name && (
                      <p className="text-xs text-gray-400">{r.requester_name}</p>
                    )}
                    <p className="text-xs text-gray-500">{r.hours_requested} hours requested</p>
                    {r.message && (
                      <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{r.message}&rdquo;</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onResolve(r.id, 'accept')}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onResolve(r.id, 'deny')}>
                      Deny
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {outgoing.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Outgoing
            </p>
            <div className="divide-y">
              {outgoing.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-navy-dark">
                      {r.recipient_company || r.recipient_name || 'Unknown'}
                    </p>
                    {r.recipient_company && r.recipient_name && (
                      <p className="text-xs text-gray-400">{r.recipient_name}</p>
                    )}
                    <p className="text-xs text-gray-500">{r.hours_requested} hours</p>
                  </div>
                  <Badge className={REQUEST_STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-700'}>
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FinancesCard({
  pricingTiers,
  enrollment,
}: {
  pricingTiers: PricingTierResponse[];
  enrollment: EnrollmentResponse | undefined;
}): React.ReactElement {
  const tierName = enrollment?.pricing_tier ?? null;
  const matchedTier = pricingTiers.find((t) => t.tier_name === tierName);
  const hoursUsed = enrollment?.hours_used ?? 0;

  // Membership pricing constants
  const INCLUDED_HOURS = 10;
  const MIN_CXO_RATE = 500;
  const MAX_CXO_RATE = 2000;
  const hoursRemaining = Math.max(INCLUDED_HOURS - hoursUsed, 0);
  const overageHours = Math.max(hoursUsed - INCLUDED_HOURS, 0);
  const estimatedOverageCost = matchedTier
    ? overageHours * matchedTier.price_per_hour
    : overageHours > 0
      ? overageHours * MIN_CXO_RATE
      : null;
  const usagePct = Math.min((hoursUsed / INCLUDED_HOURS) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Finances</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Membership tier */}
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Membership</span>
            {tierName && (
              <Badge className="bg-indigo-100 text-indigo-700">{tierName}</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">$10,000 + 0.25% equity</p>
        </div>

        {/* Included hours usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Included Hours</span>
            <span className="font-medium text-gray-900">
              {Math.min(hoursUsed, INCLUDED_HOURS)} / {INCLUDED_HOURS} hrs used
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${usagePct >= 100 ? 'bg-red-500' : usagePct >= 75 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${usagePct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {hoursRemaining > 0
              ? `${hoursRemaining} free hours remaining`
              : 'All included hours used'}
          </p>
        </div>

        {/* Per-hour rates after free hours */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-1.5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            After included hours
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">CxO rate range</span>
            <span className="font-medium">${MIN_CXO_RATE} – ${MAX_CXO_RATE}/hr</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Existing connections: per-hour fee only. New connections: per-hour fee + connection fee.
          </p>
        </div>

        {/* Overage cost if applicable */}
        {overageHours > 0 && estimatedOverageCost !== null && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <p className="text-sm text-amber-800">
              Overage: {overageHours} hrs beyond included allowance
            </p>
            <p className="text-sm font-semibold text-amber-900">
              Estimated additional cost: ${estimatedOverageCost.toFixed(2)}
              {matchedTier && (
                <span className="font-normal text-amber-700">
                  {' '}({overageHours} hrs x ${matchedTier.price_per_hour.toFixed(2)}/hr)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Payment action — Coming Soon */}
        <div className="relative inline-flex w-full">
          <Button disabled className="w-full opacity-60">
            Manage Billing
          </Button>
          <span className="absolute -top-2 -right-2 rounded-full bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5">
            Coming Soon
          </span>
        </div>

        <a
          href="mailto:admin@globalcio.io"
          className="text-sm text-blue-600 hover:underline"
        >
          Contact admin for billing
        </a>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ProgramDashboard: React.FC = () => {
  const { user } = useAuth();
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [bookingTarget, setBookingTarget] = useState<{ calcomUsername: string; name: string; email?: string } | null>(null);
  const [profilePartner, setProfilePartner] = useState<import('@/portal/api/types').MyProgramPartner | null>(null);
  const [startupProfileCompany, setStartupProfileCompany] = useState<{ company: string; members: import('@/portal/api/types').MyProgramPartner[] } | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackEntryId, setFeedbackEntryId] = useState<string | null>(null);

  // Single user-scoped call replaces usePrograms + useEnrollments + useAssignments,
  // which are all admin-gated and would return empty for regular users.
  const { data: myProgramContext, isLoading: programLoading } = useMyProgram();
  const activeProgram = myProgramContext?.program ?? null;
  const programId = activeProgram?.id ?? null;
  const myEnrollment = myProgramContext?.enrollment ?? undefined;
  const assignments = myProgramContext?.assignments ?? [];
  const upcomingSessions = myProgramContext?.upcoming_sessions;
  const allSessions = myProgramContext?.all_sessions ?? [];

  // Compute per-partner hours from actual sessions
  const partnerSessionHours = useMemo(() => {
    const map: Record<string, { completed: number; scheduled: number }> = {};
    for (const s of allSessions) {
      const partnerId = s.organizer_user_id === user.id ? s.participant_user_id : s.organizer_user_id;
      if (!map[partnerId]) map[partnerId] = { completed: 0, scheduled: 0 };
      const hrs = s.scheduled_hours ?? ((new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 3600000);
      if (s.status === 'completed') {
        map[partnerId].completed += hrs;
      } else {
        map[partnerId].scheduled += hrs;
      }
    }
    return map;
  }, [allSessions, user.id]);

  // Total hours from sessions for the balance card
  const sessionHoursTotals = useMemo(() => {
    let completed = 0;
    let scheduled = 0;
    for (const s of allSessions) {
      const hrs = s.scheduled_hours ?? ((new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime()) / 3600000);
      if (s.status === 'completed') completed += hrs;
      else scheduled += hrs;
    }
    return { completed: Math.round(completed * 10) / 10, scheduled: Math.round(scheduled * 10) / 10 };
  }, [allSessions]);

  // Timeshare endpoints are NOT admin-gated, so these work for regular users.
  const { data: requests = [] } = useTimeShareRequests(programId);

  const { data: startupUsage } = useStartupUsage(
    user.tier === 'startup' ? programId : null,
    user.tier === 'startup' ? user.id : null,
  );

  // Financial visibility — only the startup manager (+ admin/dev) sees
  // pricing tier names, prices, and the Finances card. Regular startup
  // members get pricing_tier = null from the backend anyway, but we also
  // refuse to fetch pricing tiers to avoid leaking them through the cache.
  const canSeeFinancials = useCanSeeFinancials();
  const { data: pricingTiers = [] } = usePricingTiers(canSeeFinancials ? programId : null);

  const resolveRequest = useResolveTimeShareRequest();

  const { data: pendingFeedback = [] } = usePendingFeedback();
  const submitFeedback = useSubmitFeedback();

  const programInProgress =
    activeProgram?.status === 'active' &&
    !!activeProgram.starts_at &&
    new Date(activeProgram.starts_at) <= new Date();

  const availablePartners = useMemo(
    () =>
      (myProgramContext?.partners ?? []).map((p) => ({
        id: p.user_id,
        name: p.name ?? 'Unknown',
        company: p.company ?? '',
        tier: p.role === 'cxo' ? 'cxo' : 'startup',
      })),
    [myProgramContext?.partners],
  );

  const connections = useMemo(() => {
    if (!assignments || !user) return [];
    return assignments
      .filter(a => a.hours_used > 0 || a.status === 'active' || a.status === 'completed')
      .map(a => {
        const isUserCxo = a.cxo_user_id === user.id;
        return {
          id: a.id,
          userId: isUserCxo ? a.startup_user_id : a.cxo_user_id,
          name: isUserCxo ? (a.startup_name ?? 'Unknown') : (a.cxo_name ?? 'Unknown'),
          company: isUserCxo ? (a.startup_company ?? '') : (a.cxo_company ?? ''),
          hoursShared: a.hours_used,
          role: isUserCxo ? 'startup' : 'cxo',
        };
      });
  }, [assignments, user]);

  const filteredPartners = useMemo(() => {
    if (!myProgramContext?.partners) return [];
    if (!memberSearch.trim()) return myProgramContext.partners;
    const q = memberSearch.toLowerCase();
    return myProgramContext.partners.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.company?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q)
    );
  }, [myProgramContext?.partners, memberSearch]);

  const myCalendarEvents = useMemo(() => {
    const events: Array<{ id: string; date: string; title: string; duration: number; status: string; participants: string[] }> = [];
    // Add upcoming sessions from ScheduledMeetings
    const sessions = myProgramContext?.upcoming_sessions ?? [];
    for (const s of sessions) {
      const durationMs = new Date(s.ends_at).getTime() - new Date(s.starts_at).getTime();
      events.push({
        id: s.id,
        date: s.starts_at,
        title: s.title || 'Advisory Session',
        duration: Math.round(durationMs / 60000),
        status: s.status,
        participants: [s.organizer_name, s.participant_name].filter(Boolean) as string[],
      });
    }
    // Add assignment-based events for pairings without explicit sessions
    if (assignments) {
      for (const a of assignments) {
        if (a.hours_used > 0 || a.status === 'active') {
          events.push({
            id: a.id,
            date: a.created_at,
            title: `${a.cxo_name || 'CxO'} \u2194 ${a.startup_name || 'Startup'}`,
            duration: (a.hours_allocated || 4) * 60,
            status: a.status === 'completed' ? 'completed' : 'scheduled',
            participants: [a.cxo_name, a.startup_name].filter(Boolean) as string[],
          });
        }
      }
    }
    return events;
  }, [assignments, myProgramContext?.upcoming_sessions]);

  const handleRequestSession = useCallback(
    async (conn: { userId: string; name: string }) => {
      if (!activeProgram) return;
      try {
        await createTimeShareRequestApi({
          program_id: activeProgram.id,
          recipient_id: conn.userId,
          request_type: 'session',
          hours_requested: activeProgram.hours_per_pairing || 4,
          message: `Follow-up session request from ${user.name}`,
        });
        toast.success(`Session request sent to ${conn.name}`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to send request');
      }
    },
    [activeProgram, user.name],
  );

  const roleLabel = myEnrollment?.role === 'cxo' ? 'CxO' : 'Startup';

  const handleResolve = useCallback(
    async (requestId: string, action: 'accept' | 'deny') => {
      try {
        await resolveRequest.mutateAsync({ requestId, action });
        toast.success(action === 'accept' ? 'Request approved' : 'Request denied');
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to resolve request');
      }
    },
    [resolveRequest],
  );

  const handleRequestSessionFromCircle = useCallback(
    async (partner: { user_id: string; name: string | null }) => {
      if (!activeProgram || !partner.user_id) return;
      try {
        await createTimeShareRequestApi({
          program_id: activeProgram.id,
          recipient_id: partner.user_id,
          request_type: 'session',
          hours_requested: activeProgram.hours_per_pairing || 4,
          message: `Session request from ${user.name}`,
        });
        toast.success(`Session request sent to ${partner.name}`);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to send request');
      }
    },
    [activeProgram, user.name],
  );

  const handleSubmitFeedback = useCallback(async () => {
    if (!feedbackEntryId || feedbackRating === 0) {
      toast.error('Please provide a rating');
      return;
    }
    try {
      await submitFeedback.mutateAsync({
        ledgerEntryId: feedbackEntryId,
        rating: feedbackRating,
        comment: feedbackComment || undefined,
      });
      toast.success('Feedback submitted!');
      setFeedbackEntryId(null);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit');
    }
  }, [feedbackEntryId, feedbackRating, feedbackComment, submitFeedback]);

  if (programLoading && !myProgramContext) {
    return (
      <div className="min-h-screen">
        <section className="pt-24 pb-10 bg-gradient-to-br from-bg-dark via-white to-bg-light">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-64 rounded-md bg-slate-200 animate-pulse" />
              <div className="h-6 w-16 rounded-full bg-slate-200 animate-pulse" />
            </div>
            <div className="mt-2 h-4 w-32 rounded bg-slate-200 animate-pulse" />
          </div>
        </section>
        <section className="py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 md:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm space-y-4"
                style={{ opacity: Math.max(0.5, 1 - i * 0.12) }}
              >
                <div className="flex items-center justify-between">
                  <div className="h-5 w-36 rounded bg-slate-200 animate-pulse" />
                  <div className="h-8 w-8 rounded-md bg-slate-200 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                </div>
                <div className="h-9 w-full rounded-md bg-slate-200 animate-pulse" />
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!programId) {
    return (
      <div className="min-h-screen">
        <section className="pt-24 pb-10 bg-gradient-to-br from-bg-dark via-white to-bg-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-dark mb-2">Program Dashboard</h1>
            <p className="text-gray-500">You are not enrolled in any program yet.</p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="pt-24 pb-10 bg-gradient-to-br from-bg-dark via-white to-bg-light">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold text-navy-dark">
              {activeProgram?.name}
            </h1>
            {myEnrollment && (
              <Badge className={TIER_STYLES[user.tier] ?? 'bg-gray-100 text-gray-700'}>
                {roleLabel}
              </Badge>
            )}
          </div>
          <p className="text-gray-600 mt-1">Program Dashboard</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Pending Session Feedback */}
          {pendingFeedback.length > 0 && (
            <Card className="mb-6 border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-amber-600" />
                  Pending Session Feedback
                  <Badge className="bg-amber-100 text-amber-700">{pendingFeedback.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingFeedback.map((entry) => (
                  <div key={entry.id} className="rounded-lg border bg-white p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">Session — {entry.scheduled_duration || 60}min</p>
                        <p className="text-xs text-slate-500">{entry.cxo_name || entry.startup_name || 'Participant'}</p>
                      </div>
                      {feedbackEntryId !== entry.id && (
                        <Button size="sm" variant="outline" onClick={() => setFeedbackEntryId(entry.id)}>Give Feedback</Button>
                      )}
                    </div>
                    {feedbackEntryId === entry.id && (
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button key={s} onClick={() => setFeedbackRating(s)} className={`text-2xl ${s <= feedbackRating ? 'text-amber-400' : 'text-slate-200'}`}>&#9733;</button>
                          ))}
                        </div>
                        <Textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} placeholder="How was the session?" rows={2} />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => { setFeedbackEntryId(null); setFeedbackRating(0); setFeedbackComment(''); }}>Cancel</Button>
                          <Button size="sm" disabled={feedbackRating === 0} onClick={handleSubmitFeedback}>Submit</Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdvisoryCircleCard
              assignments={assignments}
              userId={user.id}
              userTier={user.tier}
              onRequestNewPartner={() => setRequestDialogOpen(true)}
              partnerSessionHours={partnerSessionHours}
              allSessions={allSessions}
              partners={myProgramContext?.partners ?? []}
            />

            {/* My Connections */}
            {connections.length > 0 && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    My Connections
                    <Badge variant="secondary" className="ml-1">{connections.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {connections.map((conn) => (
                      <div key={conn.id} className="flex items-center gap-3 rounded-lg border p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                          {conn.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{conn.name}</p>
                          <p className="text-xs text-slate-500 truncate">{conn.company}</p>
                          <p className="text-xs text-slate-400">{conn.hoursShared}h shared</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="shrink-0 text-xs"
                          onClick={() => handleRequestSession(conn)}
                        >
                          Book Again
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <TimeShareBalanceCard
              userTier={user.tier}
              enrollment={myEnrollment}
              startupUsage={startupUsage}
              programInProgress={programInProgress}
              sessionHours={sessionHoursTotals}
            />

            <UpcomingSessionsCard sessions={upcomingSessions} userId={user.id} />

            <PendingRequestsCard
              requests={requests}
              userId={user.id}
              onResolve={handleResolve}
            />
          </div>

          {/* Finances card: startup managers only (+ admin/dev).
              Regular startup members never see pricing tiers or estimated
              cost — they're deliberately invisible. */}
          {user.tier === 'startup' && canSeeFinancials && (
            <FinancesCard pricingTiers={pricingTiers} enrollment={myEnrollment} />
          )}

          {/* Calendar — always visible */}
          <div className="mt-6">
            <ProgramCalendar events={myCalendarEvents} title="My Sessions Calendar" />
          </div>

          {/* Members in Your Circle */}
          {activeProgram && filteredPartners.length > 0 && (
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Members in Your Circle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, company, or role..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {(() => {
                  // Group startup partners by company, show CxOs individually
                  const cxoPartners = filteredPartners.filter(p => p.role === 'cxo');
                  const startupPartners = filteredPartners.filter(p => p.role !== 'cxo');
                  const startupGroups = new Map<string, typeof startupPartners>();
                  for (const p of startupPartners) {
                    const key = p.company || 'Unknown Startup';
                    const group = startupGroups.get(key) ?? [];
                    group.push(p);
                    startupGroups.set(key, group);
                  }

                  return (
                    <div className="space-y-3">
                      {/* CxO Advisors — individual cards */}
                      {cxoPartners.length > 0 && (
                        <>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">CxO Advisors ({cxoPartners.length})</h4>
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {cxoPartners.map((partner) => {
                              const hasBooked = connections.some(c => c.userId === partner.user_id);
                              const pHrs = partnerSessionHours[partner.user_id];
                              const completedH = pHrs?.completed ?? 0;
                              const scheduledH = pHrs?.scheduled ?? 0;
                              const totalH = completedH + scheduledH;
                              return (
                                <div key={partner.user_id} className="rounded-lg border p-4 hover:shadow-sm transition-shadow">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <button className="font-medium text-sm text-left text-blue-700 hover:underline" onClick={() => setProfilePartner(partner)}>{partner.name}</button>
                                      {partner.company && <p className="text-xs text-slate-400">{partner.company}</p>}
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 text-[10px]">CxO</Badge>
                                  </div>
                                  {totalH > 0 && (
                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                                      <Clock className="h-3 w-3" />
                                      <span>{Math.round(completedH * 10) / 10}h completed</span>
                                      {scheduledH > 0 && <span className="text-yellow-600">· {Math.round(scheduledH * 10) / 10}h scheduled</span>}
                                    </div>
                                  )}
                                  {partner.calcom_username ? (
                                    <Button size="sm" className="mt-3 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setBookingTarget({ calcomUsername: partner.calcom_username!, name: partner.name || '' })}>
                                      {hasBooked ? 'Book Another Session' : 'Book First Session'}
                                    </Button>
                                  ) : (
                                    <Button size="sm" variant="outline" className="mt-3 w-full text-xs" onClick={() => handleRequestSessionFromCircle(partner)}>
                                      {hasBooked ? 'Book Another Session' : 'Book First Session'}
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}

                      {/* Startup Companies — grouped accordion blocks (hidden from startup users) */}
                      {startupGroups.size > 0 && user.tier !== 'startup' && (
                        <>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mt-4">Startup Companies ({startupGroups.size})</h4>
                          <div className="space-y-2">
                            {Array.from(startupGroups.entries()).map(([company, members]) => {
                              // Use team slug for startup booking (team page, not individual)
                              const teamSlug = members.find(m => m.calcom_team_slug)?.calcom_team_slug;
                              const hasBookedBefore = connections.some(c => c.company === company);
                              // Aggregate session hours across all members of this startup
                              let companyCompleted = 0;
                              let companyScheduled = 0;
                              for (const m of members) {
                                const mHrs = partnerSessionHours[m.user_id];
                                if (mHrs) { companyCompleted += mHrs.completed; companyScheduled += mHrs.scheduled; }
                              }
                              const companyTotalH = Math.round((companyCompleted + companyScheduled) * 10) / 10;
                              return (
                                <details key={company} className="group rounded-lg border hover:shadow-sm transition-shadow">
                                  <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-xs font-bold text-cyan-700">
                                        {company.slice(0, 2).toUpperCase()}
                                      </div>
                                      <div>
                                        <button className="font-medium text-sm text-blue-700 hover:underline text-left" onClick={(e) => { e.preventDefault(); setStartupProfileCompany({ company, members }); }}>{company}</button>
                                        <p className="text-xs text-slate-500">
                                          {members.length} member{members.length !== 1 ? 's' : ''}
                                          {companyTotalH > 0 && <span className="ml-2 text-slate-400">· {companyTotalH}h</span>}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {teamSlug && (
                                        <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white" onClick={(e) => { e.preventDefault(); setBookingTarget({ calcomUsername: `team/${teamSlug}`, name: company }); }}>
                                          {hasBookedBefore ? 'Book Another Session' : 'Book First Session'}
                                        </Button>
                                      )}
                                      <Badge className="bg-cyan-100 text-cyan-700 text-[10px]">Startup</Badge>
                                      <span className="text-slate-400 text-xs group-open:rotate-180 transition-transform">▼</span>
                                    </div>
                                  </summary>
                                  <div className="border-t px-4 pb-4 pt-3">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                      {members.map((m) => (
                                        <div key={m.user_id} className="flex items-center gap-3 rounded-md bg-slate-50 p-3">
                                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                                            {m.name?.charAt(0) || '?'}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <button className="text-sm font-medium truncate text-blue-700 hover:underline text-left" onClick={() => setProfilePartner(m)}>{m.name}</button>
                                            <p className="text-xs text-slate-400">{m.role}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </details>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Member profile modal */}
      <MemberProfileModal
        open={!!profilePartner}
        onOpenChange={(open) => { if (!open) setProfilePartner(null); }}
        partner={profilePartner}
      />

      {/* Startup profile modal */}
      <Dialog open={!!startupProfileCompany} onOpenChange={(open) => { if (!open) setStartupProfileCompany(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 font-bold text-lg">
                {startupProfileCompany?.company.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="text-lg">{startupProfileCompany?.company}</span>
                <Badge className="ml-2 bg-cyan-100 text-cyan-700 text-[10px]">Startup</Badge>
              </div>
            </DialogTitle>
          </DialogHeader>
          {startupProfileCompany && (() => {
            const firstMember = startupProfileCompany.members[0];
            const website = firstMember?.startup_website;
            const description = firstMember?.startup_description;
            const logoUrl = firstMember?.startup_logo_url;
            return (
              <div className="space-y-4 pt-2">
                {/* Logo + Website */}
                {logoUrl && (
                  <div className="flex justify-center">
                    <img src={logoUrl} alt={startupProfileCompany.company} className="h-16 w-16 rounded-lg object-contain border" />
                  </div>
                )}
                {website && (
                  <div className="flex gap-2 text-sm">
                    <span className="text-slate-400 w-20 shrink-0">Website</span>
                    <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate flex items-center gap-1">
                      {website.replace(/^https?:\/\//, '')}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                )}

                {/* About the company */}
                {description && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">About</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
                  </div>
                )}

              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Book session modal (Cal.com embed) */}
      <BookSessionModal
        open={!!bookingTarget}
        onOpenChange={(open) => { if (!open) setBookingTarget(null); }}
        calcomUsername={bookingTarget?.calcomUsername ?? ''}
        attendeeName={user.name}
        attendeeEmail={user.email}
        onBookingConfirmed={() => {
          toast.success('Session booked! It will appear in your upcoming sessions.');
          setBookingTarget(null);
        }}
      />

      {/* Time-share request dialog */}
      <TimeShareRequestDialog
        open={requestDialogOpen}
        onOpenChange={setRequestDialogOpen}
        programId={programId}
        currentUser={{ id: user.id, tier: user.tier, name: user.name }}
        availablePartners={availablePartners}
        hoursAlreadyUsed={startupUsage?.hours_used ?? myEnrollment?.hours_used ?? 0}
      />
    </div>
  );
};

export default ProgramDashboard;
