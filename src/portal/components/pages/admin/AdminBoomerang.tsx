import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import {
  DollarSign,
  Handshake,
  Network,
  Radar,
  Send,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/portal/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/portal/components/ui/dialog';
import FadedScroll from '@/portal/components/ui/faded-scroll';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/portal/components/ui/hover-card';
import { Input } from '@/portal/components/ui/input';
import { Progress } from '@/portal/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/portal/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/portal/components/ui/sheet';
import { Switch } from '@/portal/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/portal/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/portal/components/ui/tabs';
import {
  boomerangActivityLog,
  boomerangCandidates,
  boomerangCxoContributions,
  boomerangDeals,
  boomerangExportLog,
  boomerangIntroductions,
  boomerangSyncState,
  boomerangTargetAccounts,
  boomerangWebhookReceipts,
  type BoomerangCandidate,
  type BoomerangCxoContribution,
  type BoomerangExportLogEntry,
  type BoomerangIntroduction,
  type BoomerangTargetAccount,
  type IntroStage,
  type SignalHealth,
} from '@/portal/data/mock/boomerang';
import { mockStartups, mockUserStartupLinks } from '@/portal/data/mock/startups';
import { mockUsers } from '@/portal/data/mock/users';
import type { MockStartupProfile, MockUser } from '@/portal/data/mock/types';

// ─── Helpers ─────────────────────────────────────────────────────────────

function formatRelativeTime(iso: string): string {
  const now = new Date('2026-04-02T10:00:00Z').getTime(); // deterministic "now" for demo stability
  const then = new Date(iso).getTime();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMo = Math.round(diffDay / 30);
  return `${diffMo}mo ago`;
}

function formatUsd(n: number): string {
  if (n === 0) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function healthBadgeClass(h: SignalHealth): string {
  switch (h) {
    case 'hot':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'active':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'warming':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'cold':
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function stageBadgeClass(stage: IntroStage): string {
  switch (stage) {
    case 'queued':
      return 'bg-slate-100 text-slate-700';
    case 'sent':
      return 'bg-blue-100 text-blue-700';
    case 'accepted':
      return 'bg-indigo-100 text-indigo-700';
    case 'declined':
      return 'bg-rose-100 text-rose-700';
    case 'meeting_scheduled':
      return 'bg-cyan-100 text-cyan-700';
    case 'meeting_completed':
      return 'bg-teal-100 text-teal-700';
    case 'pilot':
      return 'bg-amber-100 text-amber-700';
    case 'closed_won':
      return 'bg-emerald-100 text-emerald-700';
    case 'closed_lost':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function stageLabel(stage: IntroStage): string {
  return stage.replace(/_/g, ' ');
}

function startupById(startupId: string): MockStartupProfile | undefined {
  return mockStartups.find((s) => s.id === startupId);
}

function founderForStartup(startupId: string): MockUser | undefined {
  const link = mockUserStartupLinks.find(
    (l) => l.startupId === startupId && l.role === 'founder',
  );
  return link ? mockUsers.find((u) => u.id === link.userId) : undefined;
}

function targetById(id: string): BoomerangTargetAccount | undefined {
  return boomerangTargetAccounts.find((t) => t.id === id);
}

function userById(id: string): MockUser | undefined {
  return mockUsers.find((u) => u.id === id);
}

// ─── Stat card ───────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: string;
}

function StatCard({ label, value, icon, tone }: StatCardProps): JSX.Element {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="min-h-[1.75rem] text-[11px] font-medium uppercase leading-tight tracking-wide text-slate-500">
            {label}
          </p>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
            {icon}
          </div>
        </div>
        <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────

function TargetAccountsDialog({ candidate }: { candidate: BoomerangCandidate }): JSX.Element {
  const startup = startupById(candidate.startupId);
  const targets = boomerangTargetAccounts.filter((t) => t.startupId === candidate.startupId);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View accounts
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{startup?.companyName ?? 'Startup'} — target accounts</DialogTitle>
          <DialogDescription>
            {targets.length} enterprise targets exported to Boomerang. All LinkedIn URLs
            are publicly-observable and match the data contract in{' '}
            <code className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-xs">
              docs/features/boomerang-integration.md
            </code>
            .
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>LinkedIn</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-medium text-slate-900">{t.companyName}</p>
                    <p className="text-xs text-slate-500">
                      {t.industry} · {t.geography}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{t.contactName}</p>
                    <p className="text-xs text-slate-500">{t.contactTitle}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={healthBadgeClass(t.health)}>
                      {t.signalScore !== null ? `${t.signalScore} · ${t.health}` : 'unscored'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <a
                      href={t.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block max-w-[140px] truncate text-xs text-blue-600 hover:underline"
                    >
                      {t.linkedinUrl.replace('https://linkedin.com/in/', '')}
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IntroductionCard({
  intro,
  onOpen,
}: {
  intro: BoomerangIntroduction;
  onOpen: (i: BoomerangIntroduction) => void;
}): JSX.Element {
  const target = targetById(intro.targetAccountId);
  const startup = startupById(intro.startupId);
  const cxo = userById(intro.referrerCxoId);
  const daysInStage = Math.max(
    0,
    Math.round(
      (new Date('2026-04-02T10:00:00Z').getTime() -
        new Date(intro.stageEnteredAt).getTime()) /
        (1000 * 60 * 60 * 24),
    ),
  );
  return (
    <button
      type="button"
      onClick={() => onOpen(intro)}
      className="w-full rounded-md border bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="truncate text-sm font-semibold text-slate-900">{startup?.companyName}</p>
      <p className="mt-0.5 truncate text-xs text-slate-600">
        → {target?.contactName} ({target?.companyName})
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wide text-slate-400">
          {cxo?.name.split(' ')[0] ?? 'CxO'}
        </span>
        <span className="text-[10px] text-slate-400">{daysInStage}d</span>
      </div>
    </button>
  );
}

function IntroductionDetailSheet({
  open,
  intro,
  onOpenChange,
}: {
  open: boolean;
  intro: BoomerangIntroduction | null;
  onOpenChange: (o: boolean) => void;
}): JSX.Element | null {
  if (!intro) return null;
  const target = targetById(intro.targetAccountId);
  const startup = startupById(intro.startupId);
  const cxo = userById(intro.referrerCxoId);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-[420px] sm:max-w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {startup?.companyName}
            <Badge className={stageBadgeClass(intro.stage)}>{stageLabel(intro.stage)}</Badge>
          </SheetTitle>
          <SheetDescription>
            Introduction {intro.id} · {intro.templateKey} ·{' '}
            {intro.isFreeIntro ? 'free intro' : 'paid intro'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Target
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{target?.contactName}</p>
            <p className="text-xs text-slate-500">
              {target?.contactTitle} · {target?.companyName}
            </p>
            <p className="text-xs text-slate-400">
              {target?.industry} · {target?.geography}
            </p>
            <a
              href={target?.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-blue-600 hover:underline"
            >
              {target?.linkedinUrl}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Referrer
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">{cxo?.name}</p>
            <p className="text-xs text-slate-500">
              {cxo?.role} · {cxo?.companyAffiliation}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Signal strength
            </p>
            {target?.signalScore !== null && target?.signalScore !== undefined ? (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className={healthBadgeClass(target.health)}>
                  {target.signalScore} · {target.health}
                </Badge>
                <span className="text-xs text-slate-500">
                  {target.shortestPathHops}-hop via{' '}
                  {userById(target.shortestPathCxoId ?? '')?.name.split(' ')[0] ?? '—'}
                </span>
              </div>
            ) : (
              <p className="mt-1 text-xs text-slate-400">Not yet scored.</p>
            )}
          </div>
          {intro.notes && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </p>
              <p className="mt-1 text-sm text-slate-700">{intro.notes}</p>
            </div>
          )}
          {intro.outcomeSummary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Outcome
              </p>
              <p className="mt-1 text-sm text-slate-700">{intro.outcomeSummary}</p>
            </div>
          )}
          {intro.meetingScheduledAt && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Meeting
              </p>
              <p className="mt-1 text-sm text-slate-700">
                Scheduled for {new Date(intro.meetingScheduledAt).toLocaleString()}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Timeline
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Entered <strong>{stageLabel(intro.stage)}</strong>{' '}
              {formatRelativeTime(intro.stageEnteredAt)}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────

const KANBAN_STAGES: IntroStage[] = [
  'queued',
  'sent',
  'accepted',
  'meeting_scheduled',
  'meeting_completed',
  'pilot',
];

export default function AdminBoomerang(): JSX.Element {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stageFilter, setStageFilter] = useState<IntroStage | 'all'>('all');
  const [openIntro, setOpenIntro] = useState<BoomerangIntroduction | null>(null);

  // Intentionally no `catalogHydrated` gate here. AdminBoomerang renders
  // entirely from static mock data (`boomerangCandidates`, `boomerangDeals`,
  // etc.), so there is no asynchronous phase where a skeleton would be
  // truthful. An earlier version wrapped the body in a
  // `if (!catalogHydrated) return <BoomerangSkeleton />` early return,
  // which triggered React error #310 ("Rendered more hooks than during
  // the previous render") the moment the catalog finished hydrating —
  // the first render short-circuited before the `useMemo` calls below,
  // the second render ran all 5 of them, and React's positional hook
  // bookkeeping blew up. When this page grows real API wiring, add the
  // loading gate back as conditional JSX *below* all hook calls, or
  // lift the hooks into an inner component so the outer shell can gate
  // safely.

  // KPI values
  const readyCount = boomerangCandidates.filter((c) => c.status === 'exported').length;
  const targetsExported = boomerangCandidates.reduce(
    (acc, c) => acc + c.targetAccountIds.length,
    0,
  );
  const activeIntros = boomerangIntroductions.filter(
    (i) => i.stage !== 'closed_won' && i.stage !== 'closed_lost' && i.stage !== 'declined',
  ).length;
  const freeUsed = boomerangCandidates.reduce((acc, c) => acc + c.freeIntrosUsed, 0);
  const freeLimit = boomerangCandidates.reduce(
    (acc, c) => (c.status === 'exported' ? acc + c.freeIntrosLimit : acc),
    0,
  );
  const pipelineValue = boomerangDeals
    .filter((d) => d.stage === 'pilot' || d.stage === 'closed_won')
    .reduce((acc, d) => acc + d.dealValueUsd, 0);
  const lastSync = formatRelativeTime(boomerangSyncState.lastSyncAt);

  // Funnel counts
  const funnelCounts = useMemo(() => {
    const counts: Record<IntroStage, number> = {
      queued: 0,
      sent: 0,
      accepted: 0,
      declined: 0,
      meeting_scheduled: 0,
      meeting_completed: 0,
      pilot: 0,
      closed_won: 0,
      closed_lost: 0,
    };
    boomerangIntroductions.forEach((i) => {
      counts[i.stage] += 1;
    });
    return counts;
  }, []);
  const funnelTotal = boomerangIntroductions.length;

  // Filtered candidates
  const filteredCandidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return boomerangCandidates.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (q.length > 0) {
        const startup = startupById(c.startupId);
        const founder = founderForStartup(c.startupId);
        const haystack = `${startup?.companyName ?? ''} ${founder?.name ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [search, statusFilter]);

  // Signal heatmap rows
  const heatmapRows = useMemo(() => {
    return boomerangCandidates
      .filter((c) => c.status === 'exported')
      .map((c) => {
        const targets = boomerangTargetAccounts
          .filter((t) => t.startupId === c.startupId)
          .slice()
          .sort((a, b) => (b.signalScore ?? -1) - (a.signalScore ?? -1))
          .slice(0, 8);
        return { candidate: c, targets };
      });
  }, []);

  const topOpportunities = useMemo(() => {
    return [...boomerangTargetAccounts]
      .filter((t) => t.signalScore !== null)
      .sort((a, b) => (b.signalScore ?? 0) - (a.signalScore ?? 0))
      .slice(0, 20);
  }, []);

  const kanbanByStage = useMemo(() => {
    const map: Record<IntroStage, BoomerangIntroduction[]> = {
      queued: [],
      sent: [],
      accepted: [],
      declined: [],
      meeting_scheduled: [],
      meeting_completed: [],
      pilot: [],
      closed_won: [],
      closed_lost: [],
    };
    boomerangIntroductions.forEach((i) => map[i.stage].push(i));
    return map;
  }, []);

  const mobileFilteredIntros =
    stageFilter === 'all'
      ? boomerangIntroductions
      : boomerangIntroductions.filter((i) => i.stage === stageFilter);

  const weightedPipeline = boomerangDeals.reduce(
    (acc, d) => acc + d.dealValueUsd * d.probability,
    0,
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Boomerang</h1>
          </div>
          <p className="max-w-2xl text-sm text-slate-500">
            GCXO → Boomerang outbound referral integration. Ready startups are exported
            with their target enterprise accounts; Boomerang returns signal scores,
            introduction status, and pipeline updates.
          </p>
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => toast.info('Mocked — wire to /v1/candidates resync in phase 2')}
        >
          <Send className="h-4 w-4" />
          Trigger full re-sync
        </Button>
      </div>

      {/* KPI stat grid */}
      <div className="mb-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          label="Ready Startups"
          value={String(readyCount)}
          icon={<Radar className="h-4 w-4 text-indigo-600" />}
          tone="bg-indigo-100"
        />
        <StatCard
          label="Targets Exported"
          value={String(targetsExported)}
          icon={<Send className="h-4 w-4 text-blue-600" />}
          tone="bg-blue-100"
        />
        <StatCard
          label="Active Intros"
          value={String(activeIntros)}
          icon={<Handshake className="h-4 w-4 text-cyan-600" />}
          tone="bg-cyan-100"
        />
        <StatCard
          label="Free Intros Used"
          value={`${freeUsed} / ${freeLimit}`}
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
          tone="bg-amber-100"
        />
        <StatCard
          label="Pipeline Value"
          value={formatUsd(pipelineValue)}
          icon={<DollarSign className="h-4 w-4 text-emerald-600" />}
          tone="bg-emerald-100"
        />
        <StatCard
          label="Last Sync"
          value={lastSync}
          icon={<ShieldCheck className="h-4 w-4 text-slate-600" />}
          tone="bg-slate-100"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="candidates">Referral Candidates</TabsTrigger>
          <TabsTrigger value="signals">Signal Scores</TabsTrigger>
          <TabsTrigger value="pipeline">Introductions Pipeline</TabsTrigger>
          <TabsTrigger value="deals">Deal Flow</TabsTrigger>
          <TabsTrigger value="cxo">CxO Contributions</TabsTrigger>
          <TabsTrigger value="exports">Export History</TabsTrigger>
          <TabsTrigger value="integration">Integration Status</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">What Boomerang is doing right now</CardTitle>
              <CardDescription>
                A one-screen narrative of the active integration, derived from mock fixtures.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-semibold">{readyCount} startups are Ready.</span>{' '}
                  NexarAI has used 8/10 free intros and is leading with 7 active warm threads
                  (Bosch Rexroth pilot signed at $240K).
                </li>
                <li>
                  <span className="font-semibold">Richard Huang</span> (CIO, TechInnovate) has
                  contributed 6 introductions this cycle — the most of any CxO in Cohort A.
                </li>
                <li>
                  <span className="font-semibold">1 enterprise deal closed won:</span>{' '}
                  CypherShield ↔ DBS at $95K ARR, bridged by Catherine Dubois.
                </li>
                <li>
                  <span className="font-semibold">PayBridge ↔ HSBC pilot active:</span> $180K
                  deal, 60% probability, signed for 3 corridors over 8 weeks.
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline funnel</CardTitle>
              <CardDescription>
                {funnelTotal} total introductions across all stages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-8 w-full overflow-hidden rounded-md border">
                {KANBAN_STAGES.map((stage) => {
                  const count = funnelCounts[stage];
                  const width = funnelTotal > 0 ? (count / funnelTotal) * 100 : 0;
                  if (count === 0) return null;
                  return (
                    <HoverCard key={stage}>
                      <HoverCardTrigger asChild>
                        <div
                          className={`flex items-center justify-center border-r last:border-r-0 ${stageBadgeClass(stage)}`}
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-[11px] font-semibold">{count}</span>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-48">
                        <p className="text-xs font-semibold capitalize">{stageLabel(stage)}</p>
                        <p className="text-xs text-slate-500">
                          {count} intro{count === 1 ? '' : 's'} · {width.toFixed(0)}%
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                {KANBAN_STAGES.map((stage) => (
                  <div key={stage} className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${stageBadgeClass(stage).split(' ').find((c) => c.startsWith('bg-')) ?? ''}`}
                    />
                    <span className="capitalize">
                      {stageLabel(stage)} ({funnelCounts[stage]})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {boomerangActivityLog.slice(0, 8).map((e) => (
                  <li key={e.id} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      {e.icon === 'send' && <Send className="h-3 w-3" />}
                      {e.icon === 'handshake' && <Handshake className="h-3 w-3" />}
                      {e.icon === 'dollar' && <DollarSign className="h-3 w-3" />}
                      {e.icon === 'radar' && <Radar className="h-3 w-3" />}
                      {e.icon === 'shield' && <ShieldCheck className="h-3 w-3" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700">
                        <span className="font-medium text-slate-900">{e.actor}</span> {e.verb}{' '}
                        <span className="font-medium">{e.subject}</span>
                        {e.context && <span className="text-slate-500"> — {e.context}</span>}
                      </p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(e.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Referral Candidates */}
        <TabsContent value="candidates" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                placeholder="Search by startup or founder…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="exported">Exported</SelectItem>
                <SelectItem value="ready">Ready (not exported)</SelectItem>
                <SelectItem value="not_ready">Not ready</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Startup</TableHead>
                    <TableHead>Founder</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Targets</TableHead>
                    <TableHead>Free intros</TableHead>
                    <TableHead>Signal coverage</TableHead>
                    <TableHead>Last exported</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.map((c) => {
                    const startup = startupById(c.startupId);
                    const founder = founderForStartup(c.startupId);
                    const targets = boomerangTargetAccounts.filter(
                      (t) => t.startupId === c.startupId,
                    );
                    const scored = targets.filter((t) => t.signalScore !== null).length;
                    const coverage = targets.length > 0 ? (scored / targets.length) * 100 : 0;
                    return (
                      <TableRow key={c.startupId}>
                        <TableCell className="font-medium text-slate-900">
                          {startup?.companyName ?? c.startupId}
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {founder?.name ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {c.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {c.targetAccountIds.length}
                            </span>
                            <div className="hidden gap-1 lg:flex">
                              {targets.slice(0, 3).map((t) => (
                                <span
                                  key={t.id}
                                  className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                                >
                                  {t.companyName.split(' ')[0]}
                                </span>
                              ))}
                              {targets.length > 3 && (
                                <span className="text-[10px] text-slate-400">
                                  +{targets.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="min-w-[120px]">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(c.freeIntrosUsed / c.freeIntrosLimit) * 100}
                              className="h-2 w-20"
                            />
                            <span className="text-xs text-slate-500">
                              {c.freeIntrosUsed}/{c.freeIntrosLimit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              coverage >= 80
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                : coverage >= 40
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-slate-200 bg-slate-50 text-slate-500'
                            }
                          >
                            {coverage.toFixed(0)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500">
                          {c.lastExportedAt ? formatRelativeTime(c.lastExportedAt) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {c.targetAccountIds.length > 0 ? (
                            <TargetAccountsDialog candidate={c} />
                          ) : (
                            <span className="text-xs text-slate-400">No targets</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Signal Scores */}
        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Signal heatmap</CardTitle>
              <CardDescription>
                Top 8 target accounts per startup, color-coded by Boomerang signal health.
                Hover any cell for score + shortest-path details.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <FadedScroll className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 z-10 bg-white">Startup</TableHead>
                      {Array.from({ length: 8 }).map((_, i) => (
                        <TableHead key={i} className="text-center text-xs">
                          Target {i + 1}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heatmapRows.map(({ candidate, targets }) => {
                      const startup = startupById(candidate.startupId);
                      return (
                        <TableRow key={candidate.startupId}>
                          <TableCell className="sticky left-0 z-10 bg-white font-medium">
                            {startup?.companyName}
                          </TableCell>
                          {Array.from({ length: 8 }).map((_, i) => {
                            const t = targets[i];
                            if (!t) {
                              return (
                                <TableCell
                                  key={i}
                                  className="text-center text-xs text-slate-300"
                                >
                                  —
                                </TableCell>
                              );
                            }
                            const cxo = userById(t.shortestPathCxoId ?? '');
                            return (
                              <TableCell key={t.id} className="text-center">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <button
                                      type="button"
                                      className={`w-full rounded px-2 py-1 text-xs font-semibold ${healthBadgeClass(t.health)}`}
                                    >
                                      {t.signalScore ?? '—'}
                                    </button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-64">
                                    <p className="text-sm font-semibold">{t.companyName}</p>
                                    <p className="text-xs text-slate-500">
                                      {t.contactName} · {t.contactTitle}
                                    </p>
                                    <div className="mt-2 space-y-1 text-xs text-slate-600">
                                      <p>
                                        Score: <strong>{t.signalScore ?? 'unscored'}</strong> (
                                        {t.health})
                                      </p>
                                      <p>
                                        Strength:{' '}
                                        <strong>
                                          {'★'.repeat(t.connectionStrength)}
                                          {'☆'.repeat(5 - t.connectionStrength)}
                                        </strong>
                                      </p>
                                      <p>
                                        Path: {t.shortestPathHops}-hop via {cxo?.name ?? '—'}
                                      </p>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </FadedScroll>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Top 20 highest-scoring opportunities</CardTitle>
              <CardDescription>
                Boomerang-ranked introductions by signal score across all startups.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Startup</TableHead>
                    <TableHead>Target company</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Strength</TableHead>
                    <TableHead>Shortest path</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topOpportunities.map((t) => {
                    const startup = startupById(t.startupId);
                    const cxo = userById(t.shortestPathCxoId ?? '');
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{startup?.companyName}</TableCell>
                        <TableCell>
                          <p className="text-sm">{t.companyName}</p>
                          <p className="text-xs text-slate-500">{t.industry}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          <p>{t.contactName}</p>
                          <p className="text-xs text-slate-500">{t.contactTitle}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={healthBadgeClass(t.health)}>
                            {t.signalScore}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {'★'.repeat(t.connectionStrength)}
                          <span className="text-slate-300">
                            {'★'.repeat(5 - t.connectionStrength)}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {t.shortestPathHops}-hop via {cxo?.name.split(' ')[0] ?? '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Introductions Pipeline */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="hidden lg:grid lg:grid-cols-6 lg:gap-3">
            {KANBAN_STAGES.map((stage) => (
              <div key={stage} className="flex flex-col rounded-md border bg-slate-50 p-2">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase ${stageBadgeClass(stage)}`}
                  >
                    {stageLabel(stage)}
                  </span>
                  <span className="text-[10px] text-slate-500">{kanbanByStage[stage].length}</span>
                </div>
                <div className="flex max-h-[520px] flex-col gap-2 overflow-y-auto">
                  {kanbanByStage[stage].length === 0 ? (
                    <p className="px-1 py-4 text-center text-xs text-slate-300">Empty</p>
                  ) : (
                    kanbanByStage[stage].map((intro) => (
                      <IntroductionCard key={intro.id} intro={intro} onOpen={setOpenIntro} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 lg:hidden">
            <Select
              value={stageFilter}
              onValueChange={(v) => setStageFilter(v as IntroStage | 'all')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {KANBAN_STAGES.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {stageLabel(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="space-y-2">
              {mobileFilteredIntros.map((intro) => (
                <IntroductionCard key={intro.id} intro={intro} onOpen={setOpenIntro} />
              ))}
            </div>
          </div>

          <IntroductionDetailSheet
            open={openIntro !== null}
            intro={openIntro}
            onOpenChange={(o) => !o && setOpenIntro(null)}
          />
        </TabsContent>

        {/* Tab 5: Deal Flow */}
        <TabsContent value="deals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline by stage</CardTitle>
              <CardDescription>
                Weighted pipeline value: <strong>{formatUsd(weightedPipeline)}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Startup</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead className="text-right">Deal value</TableHead>
                    <TableHead className="text-right">Probability</TableHead>
                    <TableHead className="text-right">Weighted</TableHead>
                    <TableHead className="text-right">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boomerangDeals.map((d) => {
                    const startup = startupById(d.startupId);
                    const target = targetById(d.targetAccountId);
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium">{startup?.companyName}</TableCell>
                        <TableCell className="text-sm">{target?.companyName ?? '—'}</TableCell>
                        <TableCell>
                          <Badge className={stageBadgeClass(d.stage)}>
                            {stageLabel(d.stage)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatUsd(d.dealValueUsd)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-slate-600">
                          {(d.probability * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatUsd(d.dealValueUsd * d.probability)}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500">
                          {formatRelativeTime(d.lastUpdateAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: CxO Contributions */}
        <TabsContent value="cxo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Referrer leaderboard</CardTitle>
              <CardDescription>
                Multi-hop network value contributed by each CxO in the active cohort.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CxO</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Startups supported</TableHead>
                    <TableHead className="text-right">Intros made</TableHead>
                    <TableHead className="text-right">Accepted</TableHead>
                    <TableHead className="text-right">Meetings booked</TableHead>
                    <TableHead className="text-right">Pipeline attributed</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...boomerangCxoContributions]
                    .sort((a, b) => b.introsMade - a.introsMade)
                    .map((c: BoomerangCxoContribution) => {
                      const user = userById(c.cxoUserId);
                      return (
                        <TableRow key={c.cxoUserId}>
                          <TableCell>
                            <p className="font-medium text-slate-900">{user?.name}</p>
                            <p className="text-xs text-slate-500">{user?.role}</p>
                          </TableCell>
                          <TableCell className="text-sm">{user?.companyAffiliation}</TableCell>
                          <TableCell className="text-right">{c.startupsSupported}</TableCell>
                          <TableCell className="text-right font-medium">
                            {c.introsMade}
                          </TableCell>
                          <TableCell className="text-right">{c.introsAccepted}</TableCell>
                          <TableCell className="text-right">{c.meetingsBooked}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatUsd(c.pipelineAttributedUsd)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Network className="h-4 w-4 text-slate-400" />
                Multi-hop network graph
              </CardTitle>
              <CardDescription>
                Visualize the shortest-path bridges from each startup to its target contacts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50">
                <div className="text-center">
                  <Network className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-2 text-sm text-slate-500">
                    Coming in phase 2 — will reuse <code>ProgramGraph.tsx</code>.
                  </p>
                  <Button size="sm" variant="outline" className="mt-3" disabled>
                    View graph
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Export History */}
        <TabsContent value="exports" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Kind</TableHead>
                    <TableHead>Startup</TableHead>
                    <TableHead className="text-right">Payload</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Idempotency key</TableHead>
                    <TableHead>Triggered by</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boomerangExportLog.map((e: BoomerangExportLogEntry) => {
                    const startup = e.startupId ? startupById(e.startupId) : null;
                    const actor = userById(e.triggeredByUserId);
                    const statusColor =
                      e.httpStatus >= 200 && e.httpStatus < 300
                        ? 'bg-emerald-100 text-emerald-700'
                        : e.httpStatus >= 400 && e.httpStatus < 500
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700';
                    return (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs text-slate-500">
                          {formatRelativeTime(e.timestamp)}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs">{e.kind}</code>
                        </TableCell>
                        <TableCell className="text-sm">
                          {startup?.companyName ?? <span className="text-slate-400">—</span>}
                        </TableCell>
                        <TableCell className="text-right text-xs text-slate-500">
                          {e.payloadBytes} B
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor}>{e.httpStatus}</Badge>
                          {e.errorMessage && (
                            <p className="mt-1 text-[10px] text-rose-600">{e.errorMessage}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <code className="text-[10px] text-slate-400">
                            {e.idempotencyKey.slice(0, 18)}…
                          </code>
                        </TableCell>
                        <TableCell className="text-sm">{actor?.name ?? e.triggeredByUserId}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 8: Integration Status */}
        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connection</CardTitle>
              <CardDescription>
                Operational health of the GCXO ↔ Boomerang link.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2 text-sm md:grid-cols-2">
                <div className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-slate-500">Environment</span>
                  <Badge variant="outline" className="capitalize">
                    {boomerangSyncState.environment}
                  </Badge>
                </div>
                <div className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-slate-500">Base URL</span>
                  <code className="text-xs">{boomerangSyncState.baseUrlMasked}</code>
                </div>
                <div className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-slate-500">Auth mode</span>
                  <span className="uppercase">{boomerangSyncState.authMode}</span>
                </div>
                <div className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-slate-500">Webhook secret</span>
                  <span>
                    {boomerangSyncState.webhookSecretConfigured ? (
                      <Badge className="bg-emerald-100 text-emerald-700">configured</Badge>
                    ) : (
                      <Badge className="bg-rose-100 text-rose-700">missing</Badge>
                    )}
                  </span>
                </div>
                <div className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-slate-500">Last handshake</span>
                  <span className="text-xs text-slate-600">
                    {formatRelativeTime(boomerangSyncState.lastHandshakeAt)}
                  </span>
                </div>
                <div className="flex justify-between rounded-md border px-3 py-2">
                  <span className="text-slate-500">Consecutive failures</span>
                  <span>{boomerangSyncState.consecutiveFailures}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Webhook receipts</CardTitle>
              <CardDescription>
                Last 10 inbound webhooks from Boomerang. Mirrors the{' '}
                <code>CalcomWebhookNotification</code> rendering pattern.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Received</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boomerangWebhookReceipts.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="text-xs text-slate-500">
                        {formatRelativeTime(w.receivedAt)}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{w.eventType}</code>
                      </TableCell>
                      <TableCell className="text-sm">{w.payloadSummary}</TableCell>
                      <TableCell>
                        {w.processed ? (
                          <Badge className="bg-emerald-100 text-emerald-700">processed</Badge>
                        ) : (
                          <>
                            <Badge className="bg-rose-100 text-rose-700">failed</Badge>
                            {w.error && (
                              <p className="mt-1 text-[10px] text-rose-600">{w.error}</p>
                            )}
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature flags</CardTitle>
              <CardDescription>
                Read-only in phase 1. Flip via backend config in phase 2+.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">boomerang.export.enabled</p>
                  <p className="text-xs text-slate-500">Outbound startup/target exports.</p>
                </div>
                <Switch checked={boomerangSyncState.featureFlags.exportEnabled} disabled />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">boomerang.inbound_webhooks.enabled</p>
                  <p className="text-xs text-slate-500">
                    Accept signal/intro/deal updates from Boomerang.
                  </p>
                </div>
                <Switch
                  checked={boomerangSyncState.featureFlags.inboundWebhooksEnabled}
                  disabled
                />
              </div>
              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">boomerang.paid_intros.enabled</p>
                  <p className="text-xs text-slate-500">Unlock paid intros beyond the free 10.</p>
                </div>
                <Switch checked={boomerangSyncState.featureFlags.paidIntrosEnabled} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
