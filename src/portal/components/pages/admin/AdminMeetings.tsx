import type { JSX } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/portal/hooks/useAuth';
import { useAdminMeetings } from '@/portal/hooks/useAdminMeetings';
import { usePrograms, useCohorts, useCohortEnrollments, useAllCohortEnrollments } from '@/portal/hooks/usePrograms';
import type { ApiMeetingRequestJson, ApiMemberSessionMeetingJson, CohortResponse } from '@/portal/api/types';
import {
  filterMemberSessionsByTab,
  type SessionConsoleFilter,
} from '@/portal/api/memberSessionMeetings';
import { apiFetch } from '@/portal/api/client';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/portal/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/portal/components/ui/dialog';
import { Input } from '@/portal/components/ui/input';
import { Label } from '@/portal/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/portal/components/ui/tabs';
import { AdminMeetingsMeetingCard } from '@/portal/components/pages/admin/AdminMeetingsMeetingCard';
import type { MeetingCardHandlers } from '@/portal/components/pages/admin/AdminMeetingsMeetingCard';
import { AdminMeetingRequestCard } from '@/portal/components/pages/admin/AdminMeetingRequestCard';
import {
  RequestCardListSkeleton,
  SessionCardListSkeleton,
} from '@/portal/components/ui/admin-skeletons';
import type { MockUser } from '@/portal/data/mock/types';
import { Textarea } from '@/portal/components/ui/textarea';
import { Search, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/portal/lib/utils';
import { resolveDisputeApi } from '@/portal/api/programs';
import { deleteSessionApi } from '@/portal/api/adminSessions';

// Inline search picker for selecting a user — replaces the Select dropdown
// which was unusable with 500+ users. Shows a search input, filters by
// name/email/company, and displays the selected user as a dismissable chip.
function UserSearchPicker({
  value,
  onChange,
  users,
  label,
  placeholder,
}: {
  value: string;
  onChange: (id: string) => void;
  users: MockUser[];
  label: string;
  placeholder: string;
}): JSX.Element {
  const [search, setSearch] = useState('');
  const selected = users.find((u) => u.id === value);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q.length === 0) return [];
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.companyAffiliation ?? '').toLowerCase().includes(q),
      )
      .slice(0, 25);
  }, [search, users]);

  if (selected) {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex items-center justify-between rounded-md border bg-slate-50 px-3 py-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{selected.name}</p>
            <p className="text-xs text-slate-500 truncate">{selected.email}{selected.companyAffiliation ? ` · ${selected.companyAffiliation}` : ''}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onChange('')}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      {search.trim().length > 0 && (
        <div className="max-h-44 overflow-y-auto rounded-md border bg-white">
          {filtered.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-slate-400">No matching users</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => { onChange(u.id); setSearch(''); }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {u.email}{u.companyAffiliation ? ` · ${u.companyAffiliation}` : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase">
                      {u.tier}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

type MeetingType = 'video' | 'phone' | 'in_person';
type MeetingProvider = 'google_meet' | 'zoom' | 'teams' | 'manual';

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: 'video', label: 'Video' },
  { value: 'phone', label: 'Phone' },
  { value: 'in_person', label: 'In Person' },
];

const MEETING_PROVIDERS: { value: MeetingProvider; label: string }[] = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'teams', label: 'Teams' },
  { value: 'manual', label: 'Manual' },
];

function _userShort(users: MockUser[], id: string): string {
  const u = users.find((x) => x.id === id);
  return u?.name ?? `User ${id.slice(0, 8)}`;
}

const SESSION_FILTERS: { id: SessionConsoleFilter; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'feedback_pending', label: 'Feedback pending' },
  { id: 'hours_escalation', label: 'Hours escalation' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'needs_notes', label: 'Needs notes' },
];

export default function AdminMeetings(): JSX.Element {
  const { user, users, events, getBackendEventIdForSlug } = useAuth();
  const canUseAdminOps = user.tier === 'admin' || user.tier === 'dev';
  const {
    consoleAccessible,
    liveOpsEnabled,
    mockMode,
    dataSource,
    loading: meetingsLoading,
    hasInitialized: meetingsInitialized,
    error: meetingsError,
    requests,
    sessionsMine,
    sessionsEvent,
    refetch: refetchMeetings,
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
  } = useAdminMeetings(user.id, user.tier);

  const [eventSlug, setEventSlug] = useState<string>(() => events[0]?.slug ?? '');
  const [sessionFilter, setSessionFilter] = useState<SessionConsoleFilter>('upcoming');
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [acceptTarget, setAcceptTarget] = useState<ApiMeetingRequestJson | null>(null);
  const [startsLocal, setStartsLocal] = useState('');
  const [endsLocal, setEndsLocal] = useState('');
  const [acceptLocation, setAcceptLocation] = useState('');
  const [acceptEventOverride, setAcceptEventOverride] = useState('');
  const [renewBusy, setRenewBusy] = useState(false);

  // Resolve dispute modal state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolveSessionId, setResolveSessionId] = useState<string | null>(null);
  const [resolveAction, setResolveAction] = useState<'confirm' | 'void'>('confirm');
  const [adminStatement, setAdminStatement] = useState('');
  const [resolveBusy, setResolveBusy] = useState(false);

  // New Session dialog state
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  const [nsOrganizer, setNsOrganizer] = useState('');
  const [nsParticipant, setNsParticipant] = useState('');
  const [nsTitle, setNsTitle] = useState('');
  const [nsStartsLocal, setNsStartsLocal] = useState('');
  const [nsEndsLocal, setNsEndsLocal] = useState('');
  const [nsLocation, setNsLocation] = useState('');
  const [nsMeetingType, setNsMeetingType] = useState<MeetingType>('video');
  const [nsProvider, setNsProvider] = useState<MeetingProvider>('google_meet');
  const [nsDescription, setNsDescription] = useState('');
  const [nsProgramId, setNsProgramId] = useState<string>('');
  const [nsCohortId, setNsCohortId] = useState<string>('');
  const [nsSubmitting, setNsSubmitting] = useState(false);

  const eventUuid = useMemo(
    () => (eventSlug ? getBackendEventIdForSlug(eventSlug) : undefined),
    [eventSlug, getBackendEventIdForSlug],
  );

  useEffect(() => {
    if (!eventSlug && events[0]?.slug) {
      setEventSlug(events[0].slug);
    }
  }, [events, eventSlug]);

  useEffect(() => {
    if (canUseAdminOps) {
      void loadEventMeetings(eventUuid);
    }
  }, [canUseAdminOps, eventUuid, loadEventMeetings]);

  const afterMutation = useCallback(async (): Promise<void> => {
    await refetchMeetings();
    if (canUseAdminOps) {
      await loadEventMeetings(eventUuid);
    }
  }, [refetchMeetings, loadEventMeetings, eventUuid, canUseAdminOps]);

  // ── Program filter (inline in session console) ────
  // Filters sessionsMine client-side by program_id. A synthetic
  // "miscellaneous" bucket collects sessions whose program_id is null.
  // IMPORTANT: these declarations must come BEFORE filteredMine which
  // references programMatcher — otherwise you hit a TDZ error in
  // production ("Cannot access 'ye' before initialization").
  const { data: programs = [] } = usePrograms();
  // Cohort data for New Session dialog circle-scoping
  const { data: nsCohorts = [] } = useCohorts(nsProgramId || null);
  const nsCohortIds = useMemo(() => (nsCohorts as CohortResponse[]).map((c) => c.id), [nsCohorts]);
  const { userCohortMap: nsUserCohortMap } = useAllCohortEnrollments(nsProgramId || null, nsCohortIds);

  const { data: nsCircleEnrollments = [] } = useCohortEnrollments(nsProgramId || null, nsCohortId || null);

  useEffect(() => {
    if (!nsCohortId || nsCircleEnrollments.length === 0) return;
    const admin = nsCircleEnrollments.find((e: any) => e.role === 'startup_admin');
    if (admin && !nsOrganizer) {
      setNsOrganizer(admin.user_id);
    }
  }, [nsCohortId, nsCircleEnrollments, nsOrganizer]);

  const nsCircleCxoUsers = useMemo((): MockUser[] => {
    if (!nsCohortId || nsCircleEnrollments.length === 0) return users;
    const cxoEnrollments = nsCircleEnrollments.filter((e: any) => e.role === 'cxo');
    const cxoIds = new Set(cxoEnrollments.map((e: any) => e.user_id));
    const matched = users.filter((u) => cxoIds.has(u.id));
    cxoEnrollments.forEach((e: any) => {
      if (!matched.find((u) => u.id === e.user_id)) {
        matched.push({
          id: e.user_id,
          name: e.user_name || e.user_email || 'Unknown',
          email: e.user_email || '',
          phone: '',
          linkedin: '',
          companyAffiliation: '',
          role: 'cxo',
          aboutMe: '',
          tier: 'cxo' as const,
          createdAt: e.created_at || '',
          updatedAt: e.created_at || '',
        });
      }
    });
    return matched;
  }, [nsCohortId, nsCircleEnrollments, users]);

  const nsOrganizerUsers = useMemo((): MockUser[] => {
    if (!nsCohortId || nsCircleEnrollments.length === 0) return users;
    const admin = nsCircleEnrollments.find((e: any) => e.role === 'startup_admin');
    if (!admin || users.find((u) => u.id === admin.user_id)) return users;
    return [
      ...users,
      {
        id: admin.user_id,
        name: admin.user_name || admin.user_email || 'Unknown',
        email: admin.user_email || '',
        phone: '',
        linkedin: '',
        companyAffiliation: '',
        role: 'startup',
        aboutMe: '',
        tier: 'startup' as const,
        createdAt: admin.created_at || '',
        updatedAt: admin.created_at || '',
      },
    ];
  }, [nsCohortId, nsCircleEnrollments, users]);

  const MISC_PROGRAM_ID = '__misc__';
  const ALL_PROGRAMS_ID = '__all__';
  const [programFilterId, setProgramFilterId] = useState<string>(ALL_PROGRAMS_ID);

  const programMatcher = useCallback(
    (m: ApiMemberSessionMeetingJson): boolean => {
      if (programFilterId === ALL_PROGRAMS_ID) return true;
      if (programFilterId === MISC_PROGRAM_ID) {
        return !m.program_id;
      }
      return m.program_id === programFilterId;
    },
    [programFilterId],
  );

  // Escalated sessions for Resolutions tab
  const escalatedMeetings = useMemo(
    () => sessionsMine.filter((m) => m.hours_discrepancy?.escalation_status === 'pending_admin'),
    [sessionsMine],
  );
  const escalatedCount = escalatedMeetings.length;

  const [sessionSearch, setSessionSearch] = useState('');

  const filteredMine = useMemo(() => {
    let list = filterMemberSessionsByTab(sessionsMine.filter(programMatcher), sessionFilter);
    if (sessionSearch.trim()) {
      const q = sessionSearch.trim().toLowerCase();
      list = list.filter((m) => {
        const names = (m.participants || []).map((p: any) => (p.display_name || '').toLowerCase()).join(' ');
        const loc = (m.location || '').toLowerCase();
        const topic = String((m as { topic?: string }).topic || '').toLowerCase();
        return names.includes(q) || loc.includes(q) || topic.includes(q);
      });
    }
    return list;
  }, [sessionsMine, sessionFilter, programMatcher, sessionSearch]);

  // ── Pagination ────
  const SESSIONS_PER_PAGE = 5;
  const [sessionPage, setSessionPage] = useState(1);
  // Reset to page 1 whenever the filter, program, or search changes
  useEffect(() => { setSessionPage(1); }, [sessionFilter, programFilterId, sessionSearch]);
  const totalSessionPages = Math.max(1, Math.ceil(filteredMine.length / SESSIONS_PER_PAGE));
  const pagedMine = filteredMine.slice(
    (sessionPage - 1) * SESSIONS_PER_PAGE,
    sessionPage * SESSIONS_PER_PAGE,
  );

  const meetingHandlers: MeetingCardHandlers = useMemo(
    () => ({
      onCancel: async (id, reason) => {
        await cancelMeeting(id, { reason: reason || null });
        await afterMutation();
      },
      onNote: async (id, body) => {
        await addNote(id, { body, note_kind: 'internal' });
        await afterMutation();
      },
      onNoteEdit: async (noteId, body) => {
        await updateNote(noteId, { body });
        await afterMutation();
      },
      onOutcome: async (id, summary) => {
        await saveOutcome(id, { summary });
        await afterMutation();
      },
      onActionItem: async (id, title) => {
        await addActionItem(id, { title });
        await afterMutation();
      },
      onActionItemEdit: async (itemId, patch) => {
        await updateActionItem(itemId, patch);
        await afterMutation();
      },
      onDelete: async (id) => {
        await deleteSessionApi(id);
        await afterMutation();
      },
    }),
    [afterMutation, addActionItem, addNote, cancelMeeting, saveOutcome, updateActionItem, updateNote],
  );

  const telemetryCallbacks = useMemo(
    () => ({
      onGraphSync: async (id: string): Promise<void> => {
        try {
          await graphSyncMeeting(id);
          toast.success('Graph sync requested');
          await afterMutation();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Graph sync failed');
        }
      },
      onRefreshArtifacts: async (id: string): Promise<void> => {
        try {
          await refreshMeetingArtifacts(id, { include_transcript: true, include_summary: true });
          toast.success('Artifact refresh requested');
          await afterMutation();
        } catch (e: unknown) {
          toast.error(e instanceof Error ? e.message : 'Refresh failed');
        }
      },
    }),
    [afterMutation, graphSyncMeeting, refreshMeetingArtifacts],
  );

  const openAccept = (req: ApiMeetingRequestJson): void => {
    setAcceptTarget(req);
    setAcceptLocation('');
    const fallbackEvent =
      req.event_id ?? eventUuid ?? events.map((e) => getBackendEventIdForSlug(e.slug)).find(Boolean) ?? '';
    setAcceptEventOverride(fallbackEvent);
    setStartsLocal('');
    setEndsLocal('');
    setAcceptOpen(true);
  };

  const submitAccept = async (): Promise<void> => {
    if (!acceptTarget) return;
    if (!startsLocal || !endsLocal) {
      toast.error('Start and end times are required');
      return;
    }
    const starts_at = new Date(startsLocal).toISOString();
    const ends_at = new Date(endsLocal).toISOString();
    const event_id =
      acceptTarget.event_id ?? (acceptEventOverride.trim() || undefined) ?? (eventUuid ?? undefined);
    try {
      await acceptRequest(acceptTarget.id, {
        starts_at,
        ends_at,
        location: acceptLocation.trim() || null,
        event_id: event_id ?? null,
      });
      toast.success('Meeting scheduled');
      setAcceptOpen(false);
      await afterMutation();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Accept failed');
    }
  };

  const onRenewWebhooks = async (): Promise<void> => {
    if (mockMode) {
      toast.message('Demo mode — webhook renewal calls the API when auth is enabled');
      return;
    }
    setRenewBusy(true);
    try {
      await renewMeetingWebhooks();
      toast.success('Webhook subscriptions renewal requested');
      await afterMutation();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Renewal failed');
    } finally {
      setRenewBusy(false);
    }
  };

  const openResolve = (session: ApiMemberSessionMeetingJson): void => {
    setResolveSessionId(session.id);
    setResolveAction('confirm');
    setAdminStatement('');
    setResolveModalOpen(true);
  };

  const handleResolve = async (): Promise<void> => {
    if (!resolveSessionId || !adminStatement.trim()) {
      toast.error('Please provide a statement of reason');
      return;
    }
    const session = sessionsMine.find((m) => m.id === resolveSessionId);
    if (!session?.program_id) {
      toast.error('Cannot resolve: session has no associated program');
      return;
    }
    // Find the ledger_entry_id from attendee reports
    const ledgerId = (session.attendee_reports?.[0] as { ledger_entry_id?: string } | undefined)?.ledger_entry_id;
    if (!ledgerId) {
      toast.error('Cannot resolve: no ledger entry found for this session');
      return;
    }
    setResolveBusy(true);
    try {
      await resolveDisputeApi(session.program_id, ledgerId, {
        action: resolveAction,
        admin_notes: adminStatement,
      });
      toast.success(`Session ${resolveAction === 'confirm' ? 'confirmed' : 'voided'}`);
      setResolveModalOpen(false);
      setAdminStatement('');
      await afterMutation();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Resolution failed');
    } finally {
      setResolveBusy(false);
    }
  };

  const openNewSession = (): void => {
    setNsOrganizer('');
    setNsParticipant('');
    setNsTitle('');
    setNsStartsLocal('');
    setNsEndsLocal('');
    setNsLocation('');
    setNsMeetingType('video');
    setNsProvider('google_meet');
    setNsDescription('');
    setNsProgramId('');
    setNsCohortId('');
    setNewSessionOpen(true);
  };

  const submitNewSession = async (): Promise<void> => {
    if (!nsOrganizer.trim() || !nsParticipant.trim()) {
      toast.error('Organizer and participant are required');
      return;
    }
    if (!nsStartsLocal || !nsEndsLocal) {
      toast.error('Start and end times are required');
      return;
    }
    const starts_at = new Date(nsStartsLocal).toISOString();
    const ends_at = new Date(nsEndsLocal).toISOString();
    setNsSubmitting(true);
    try {
      await apiFetch('/ops/scheduled-meetings', {
        method: 'POST',
        body: {
          organizer_user_id: nsOrganizer.trim(),
          participant_user_id: nsParticipant.trim(),
          title: nsTitle.trim() || 'Advisory Session',
          starts_at,
          ends_at,
          location: nsLocation.trim() || null,
          meeting_type: nsMeetingType,
          provider: nsProvider,
          event_id: eventUuid ?? null,
          description: nsDescription.trim() || null,
          program_id: nsProgramId || null,
          cohort_id: nsCohortId || null,
        },
      });
      toast.success('Session created');
      setNewSessionOpen(false);
      await afterMutation();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create session');
    } finally {
      setNsSubmitting(false);
    }
  };

  if (!consoleAccessible) {
    return (
      <div className="p-4 sm:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Member sessions</CardTitle>
            <CardDescription>
              Sign in as an admin, dev, or participating startup account to use the Teams session console.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Member session console</h1>
          <p className="mt-1 text-sm text-slate-600">
            Teams-first tracking for 1:1s: identities, join links, transcripts, notes pipeline, summaries, action items,
            and momentum. Filter by lifecycle bucket; scope by your sessions or a selected event.
          </p>
          {dataSource === 'mock' ? (
            <p className="mt-2 text-xs text-amber-800">
              Demo data — set <code className="rounded bg-amber-100 px-1">VITE_USE_API_AUTH</code> and log in for live
              Graph sync, webhooks, and mutations.
            </p>
          ) : null}
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0">
          {canUseAdminOps ? (
            <Button
              type="button"
              size="sm"
              className="flex-1 whitespace-nowrap sm:flex-none"
              disabled={!liveOpsEnabled}
              onClick={openNewSession}
            >
              New Session
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 whitespace-nowrap sm:flex-none"
            disabled={renewBusy || mockMode || !canUseAdminOps}
            onClick={() => void onRenewWebhooks()}
          >
            Renew Graph webhooks
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="flex-1 whitespace-nowrap sm:flex-none"
            disabled={meetingsLoading}
            onClick={() => void afterMutation()}
          >
            Refresh data
          </Button>
        </div>
      </div>

      {meetingsError ? (
        <p className="mb-4 text-sm text-amber-800">{meetingsError}</p>
      ) : null}

      <Tabs defaultValue="console">
        <TabsList className="flex h-auto w-full justify-start overflow-x-auto overflow-y-hidden whitespace-nowrap sm:justify-center">
          <TabsTrigger value="console" className="shrink-0">Session console</TabsTrigger>
          <TabsTrigger value="requests" className="shrink-0">Requests</TabsTrigger>
          <TabsTrigger value="resolutions" className="shrink-0">
            Resolutions
            {escalatedCount > 0 && (
              <Badge className="ml-1 bg-red-100 text-red-700">{escalatedCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="console" className="mt-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by name, topic, or location..."
                value={sessionSearch}
                onChange={(e) => setSessionSearch(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="w-full max-w-xs space-y-1">
              <Label className="text-xs text-slate-500">Program</Label>
              <Select value={programFilterId} onValueChange={setProgramFilterId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PROGRAMS_ID}>All Programs</SelectItem>
                  {[...programs]
                    .sort((a, b) => (b.cxo_count + b.startup_count) - (a.cxo_count + a.startup_count))
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.cxo_count + p.startup_count})
                      </SelectItem>
                    ))}
                  <SelectItem value={MISC_PROGRAM_ID}>
                    Miscellaneous
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {SESSION_FILTERS.map((f) => (
              <Button
                key={f.id}
                type="button"
                size="sm"
                variant={sessionFilter === f.id ? 'default' : 'outline'}
                className={`min-w-0 justify-start sm:justify-center ${
                  sessionFilter === f.id ? 'bg-navy-dark hover:bg-navy-800' : ''
                }`}
                onClick={() => setSessionFilter(f.id)}
              >
                <span className="min-w-0 truncate">{f.label}</span>
                <Badge variant="secondary" className="ml-1 shrink-0 font-normal sm:ml-2">
                  {filterMemberSessionsByTab(sessionsMine.filter(programMatcher), f.id).length}
                </Badge>
              </Button>
            ))}
          </div>
          {(!meetingsInitialized || meetingsLoading) && sessionsMine.length === 0 ? (
            <SessionCardListSkeleton count={4} />
          ) : null}
          {pagedMine.map((m, i) => (
            <div
              key={m.id}
              className="opacity-0 animate-[fadeSlideIn_0.15s_ease-out_forwards]"
              style={{ animationDelay: `${Math.min(i, 15) * 30}ms` }}
            >
              <AdminMeetingsMeetingCard
                meeting={m}
                users={users}
                handlers={meetingHandlers}
                mutationsDisabled={!(liveOpsEnabled || mockMode)}
                telemetryActions={
                  liveOpsEnabled && canUseAdminOps
                    ? telemetryCallbacks
                    : { onGraphSync: undefined, onRefreshArtifacts: undefined, actionsDisabled: true }
                }
              />
            </div>
          ))}
          {meetingsInitialized && !meetingsLoading && filteredMine.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions in this bucket.</p>
          ) : null}
          {filteredMine.length > SESSIONS_PER_PAGE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing {(sessionPage - 1) * SESSIONS_PER_PAGE + 1}–{Math.min(sessionPage * SESSIONS_PER_PAGE, filteredMine.length)} of {filteredMine.length}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={sessionPage <= 1}
                  onClick={() => setSessionPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-2 text-sm text-slate-600">
                  {sessionPage} / {totalSessionPages}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={sessionPage >= totalSessionPages}
                  onClick={() => setSessionPage((p) => Math.min(totalSessionPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4 space-y-3">
          {(!meetingsInitialized || meetingsLoading) && requests.length === 0 ? (
            <RequestCardListSkeleton count={3} />
          ) : null}
          {requests.map((req) => (
            <AdminMeetingRequestCard
              key={req.id}
              request={req}
              users={users}
              onAccept={openAccept}
              canAccept={liveOpsEnabled}
            />
          ))}
          {meetingsInitialized && !meetingsLoading && requests.length === 0 ? (
            <p className="text-sm text-slate-500">No meeting requests for your account.</p>
          ) : null}
        </TabsContent>

        <TabsContent value="resolutions" className="mt-4 space-y-4">
          {escalatedCount === 0 ? (
            <p className="text-sm text-slate-500">No sessions require admin resolution.</p>
          ) : (
            escalatedMeetings.map((m) => {
              const organizer = users.find((u) => u.id === m.organizer_user_id);
              const participant = users.find((u) => u.id === m.participant_user_id);
              const disc = m.hours_discrepancy;
              return (
                <Card key={m.id} className="border-red-200 bg-red-50/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          Hours Dispute
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {organizer?.name ?? m.organizer_user_id.slice(0, 8)} &amp; {participant?.name ?? m.participant_user_id.slice(0, 8)}
                          {' '}&middot;{' '}
                          {new Date(m.starts_at).toLocaleDateString()} {new Date(m.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {m.program_name ? ` · ${m.program_name}` : ''}
                        </CardDescription>
                      </div>
                      <Badge className="bg-red-100 text-red-700">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {disc && (
                      <div className="mb-3 grid gap-2 sm:grid-cols-3 text-sm">
                        <div>
                          <span className="text-slate-500">CIO reported:</span>{' '}
                          <span className="font-medium">{disc.cio_reported_hours}h</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Startup reported:</span>{' '}
                          <span className="font-medium">{disc.startup_reported_hours}h</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Gap:</span>{' '}
                          <span className="font-medium text-red-700">{disc.gap_hours}h</span>
                        </div>
                        {disc.reason && (
                          <div className="sm:col-span-3">
                            <span className="text-slate-500">Reason:</span>{' '}
                            <span className="text-slate-700">{disc.reason}</span>
                          </div>
                        )}
                        {disc.escalated_at && (
                          <div className="sm:col-span-3 text-xs text-slate-400">
                            Escalated {new Date(disc.escalated_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                    <Button size="sm" onClick={() => openResolve(m)}>
                      Resolve
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

      </Tabs>

      <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Session</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <UserSearchPicker
              value={nsOrganizer}
              onChange={setNsOrganizer}
              users={nsOrganizerUsers}
              label="Organizer"
              placeholder="Search by name, email, or company..."
            />
            <UserSearchPicker
              value={nsParticipant}
              onChange={setNsParticipant}
              users={nsCircleCxoUsers}
              label="Participant"
              placeholder="Search by name, email, or company..."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Program</Label>
                <Select
                  value={nsProgramId}
                  onValueChange={(v) => {
                    setNsProgramId(v);
                    setNsCohortId('');
                    setNsOrganizer('');
                    setNsParticipant('');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program..." />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {nsProgramId && (
                <div className="space-y-2">
                  <Label>Circle</Label>
                  <Select value={nsCohortId} onValueChange={(v) => { setNsCohortId(v); setNsOrganizer(''); setNsParticipant(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select circle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(nsCohorts as CohortResponse[]).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns-description">Description</Label>
              <Textarea
                id="ns-description"
                placeholder="Intent or purpose of this session..."
                value={nsDescription}
                onChange={(e) => setNsDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns-title">Title</Label>
              <Input
                id="ns-title"
                placeholder="Advisory Session"
                value={nsTitle}
                onChange={(e) => setNsTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ns-start">Start Time</Label>
                <Input
                  id="ns-start"
                  type="datetime-local"
                  value={nsStartsLocal}
                  onChange={(e) => setNsStartsLocal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ns-end">End Time</Label>
                <Input
                  id="ns-end"
                  type="datetime-local"
                  value={nsEndsLocal}
                  onChange={(e) => setNsEndsLocal(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ns-location">Location</Label>
              <Input
                id="ns-location"
                placeholder="Google Meet or URL"
                value={nsLocation}
                onChange={(e) => setNsLocation(e.target.value)}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Meeting Type</Label>
                <Select value={nsMeetingType} onValueChange={(v) => setNsMeetingType(v as MeetingType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={nsProvider} onValueChange={(v) => setNsProvider(v as MeetingProvider)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewSessionOpen(false)}>
              Cancel
            </Button>
            <Button disabled={nsSubmitting} onClick={() => void submitNewSession()}>
              {nsSubmitting ? 'Creating…' : 'Create Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Session Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={resolveAction} onValueChange={(v) => setResolveAction(v as 'confirm' | 'void')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">Confirm Hours (approve the session)</SelectItem>
                  <SelectItem value="void">Void Hours (reject and reverse)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Statement of Reason *</Label>
              <Textarea
                value={adminStatement}
                onChange={(e) => setAdminStatement(e.target.value)}
                placeholder="Explain your decision..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveModalOpen(false)}>Cancel</Button>
            <Button disabled={resolveBusy || !adminStatement.trim()} onClick={() => void handleResolve()}>
              {resolveBusy ? 'Resolving...' : resolveAction === 'confirm' ? 'Confirm Hours' : 'Void Hours'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={acceptOpen} onOpenChange={setAcceptOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept meeting request</DialogTitle>
          </DialogHeader>
          {acceptTarget?.event_id ? null : (
            <div className="space-y-2">
              <Label>Event (required if not on request)</Label>
              <Select value={acceptEventOverride} onValueChange={setAcceptEventOverride}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event UUID from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((ev) => {
                    const id = getBackendEventIdForSlug(ev.slug);
                    if (!id) return null;
                    return (
                      <SelectItem key={ev.slug} value={id}>
                        {ev.title}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="m-start">Starts</Label>
              <Input
                id="m-start"
                type="datetime-local"
                value={startsLocal}
                onChange={(e) => setStartsLocal(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-end">Ends</Label>
              <Input
                id="m-end"
                type="datetime-local"
                value={endsLocal}
                onChange={(e) => setEndsLocal(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-loc">Location (optional)</Label>
            <Input id="m-loc" value={acceptLocation} onChange={(e) => setAcceptLocation(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcceptOpen(false)}>
              Close
            </Button>
            <Button onClick={() => void submitAccept()}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
