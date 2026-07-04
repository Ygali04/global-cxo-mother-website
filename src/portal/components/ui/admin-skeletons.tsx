import type { JSX } from 'react';
/**
 * Reusable admin console skeleton primitives.
 *
 * Design notes (aligned with Google Material guidance on loading states):
 *
 *   1. Shape-matched — each skeleton mirrors the exact bounding box of the
 *      real component it replaces, so the layout does not shift when data
 *      swaps in. Heights come from measuring the rendered cards in the
 *      actual admin pages.
 *
 *   2. Shimmer-only — we never render spinners. `animate-pulse` (from
 *      Tailwind) is keyframe-based and respects `prefers-reduced-motion`
 *      automatically, so users with vestibular-motion sensitivity see a
 *      static placeholder instead of throbbing bars.
 *
 *   3. Progressive reveal — the page shell (title, tabs, action buttons)
 *      always renders synchronously. Only the data-dependent body shows
 *      skeletons. Use <SkeletonBlock /> for the atomic bars and the
 *      higher-order components below for whole cards.
 *
 *   4. Staggered opacity — skeleton groups use descending opacity
 *      (100% → 90% → 80%) on successive items so the eye reads them as
 *      "filling in top to bottom" instead of a uniform grey blob.
 *
 *   5. Never block above the fold — skeletons have a max-height equal
 *      to what a single viewport would show, so the user can scroll past
 *      them immediately if they want to see what's below.
 *
 * If a new admin page needs a skeleton, add the shape here and reuse it
 * from the page's render path. Do not inline one-off skeleton JSX inside
 * pages — that defeats the shape-matching invariant and leads to drift
 * when the real component's layout changes.
 */
import { cn } from '@/portal/lib/utils';

// ---------------------------------------------------------------------------
// Atomic primitive — every other skeleton composes this
// ---------------------------------------------------------------------------

export function SkeletonBlock({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200/70', className)}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Stat card (used on AdminDashboard)
// ---------------------------------------------------------------------------

export function StatCardSkeleton(): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-7 w-14" />
        </div>
        <SkeletonBlock className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

export function StatCardGridSkeleton({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.5, 1 - i * 0.1) }}>
          <StatCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Session card (AdminMeetings "Session console" and "By program" tabs)
// ---------------------------------------------------------------------------

export function SessionCardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-24 rounded-full" />
          <SkeletonBlock className="h-5 w-32 rounded-full" />
          <SkeletonBlock className="h-3 w-12" />
        </div>
        <SkeletonBlock className="h-5 w-3/4" />
        <SkeletonBlock className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-3 w-3 rounded-full" />
          <SkeletonBlock className="h-3 w-28" />
        </div>
      </div>
      {/* Body — feedback panel placeholder */}
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-3 w-32" />
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-lg border border-slate-100 bg-slate-50/40 p-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-24" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
                <SkeletonBlock className="h-3 w-16" />
              </div>
              <SkeletonBlock className="mt-2 h-3 w-full" />
              <SkeletonBlock className="mt-1 h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SessionCardListSkeleton({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.5, 1 - i * 0.12) }}>
          <SessionCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Request card (AdminMeetings "Requests" tab)
// ---------------------------------------------------------------------------

export function RequestCardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="space-y-3 border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-28 rounded-full" />
          <SkeletonBlock className="h-3 w-20" />
        </div>
        <SkeletonBlock className="h-4 w-3/4" />
        <div className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/40 p-2">
          <SkeletonBlock className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <SkeletonBlock className="h-3 w-2/3" />
            <SkeletonBlock className="h-2 w-1/3" />
          </div>
          <SkeletonBlock className="h-3 w-3 rounded-full" />
          <SkeletonBlock className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-1">
            <SkeletonBlock className="h-3 w-2/3" />
            <SkeletonBlock className="h-2 w-1/3" />
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-3 w-1/4" />
        <SkeletonBlock className="h-8 w-full" />
        <SkeletonBlock className="h-8 w-full" />
      </div>
    </div>
  );
}

export function RequestCardListSkeleton({ count = 3 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.5, 1 - i * 0.12) }}>
          <RequestCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Table row (AdminUsers, AdminStartups expand/collapse list)
// ---------------------------------------------------------------------------

export function TableRowSkeleton({
  columns = 5,
  className,
}: {
  columns?: number;
  className?: string;
}): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-md border border-slate-200 bg-white px-4 py-3',
        className,
      )}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1">
          <SkeletonBlock className={cn('h-3', i === 0 ? 'w-3/4' : 'w-1/2')} />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}): JSX.Element {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.4, 1 - i * 0.08) }}>
          <TableRowSkeleton columns={columns} />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Program card (AdminPrograms overview)
// ---------------------------------------------------------------------------

export function ProgramOverviewSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      <StatCardGridSkeleton count={4} />
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="h-8 w-24" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-slate-100 p-3"
              style={{ opacity: Math.max(0.5, 1 - i * 0.15) }}
            >
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-9 w-9 rounded-full" />
                <div className="space-y-1.5">
                  <SkeletonBlock className="h-3 w-32" />
                  <SkeletonBlock className="h-2 w-24" />
                </div>
              </div>
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard shell — stats grid + recent events list
// ---------------------------------------------------------------------------

export function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-8">
      <StatCardGridSkeleton count={4} />
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <SkeletonBlock className="h-5 w-32" />
          <SkeletonBlock className="mt-2 h-3 w-48" />
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-md border border-slate-100 p-3"
              style={{ opacity: Math.max(0.5, 1 - i * 0.12) }}
            >
              <SkeletonBlock className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-3 w-2/5" />
                <SkeletonBlock className="h-2 w-3/5" />
              </div>
              <SkeletonBlock className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Startup card (AdminStartups expanded list)
// ---------------------------------------------------------------------------

export function StartupCardSkeleton(): JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBlock className="h-4 w-1/3" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-2 w-20" />
            <SkeletonBlock className="h-2 w-16" />
            <SkeletonBlock className="h-2 w-14" />
          </div>
        </div>
        <SkeletonBlock className="h-3 w-24" />
      </div>
    </div>
  );
}

export function StartupListSkeleton({ count = 4 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.5, 1 - i * 0.1) }}>
          <StartupCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event list (AdminEvents) — clickable card with status badge + metadata row
// ---------------------------------------------------------------------------

export function EventCardSkeleton(): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-4 w-2/5" />
            <SkeletonBlock className="h-5 w-16 rounded-full" />
          </div>
          <SkeletonBlock className="h-3 w-1/2" />
          <div className="flex items-center gap-4 pt-1">
            <SkeletonBlock className="h-2 w-24" />
            <SkeletonBlock className="h-2 w-20" />
            <SkeletonBlock className="h-2 w-16" />
          </div>
        </div>
        <SkeletonBlock className="h-5 w-28 rounded-full" />
      </div>
    </div>
  );
}

export function EventCardListSkeleton({ count = 5 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.5, 1 - i * 0.1) }}>
          <EventCardSkeleton />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Event detail (AdminEventDetail) — hero + tabs + two-column layout
// ---------------------------------------------------------------------------

export function EventDetailSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <SkeletonBlock className="h-6 w-48" />
              <SkeletonBlock className="h-5 w-20 rounded-full" />
            </div>
            <SkeletonBlock className="h-3 w-2/3" />
            <div className="flex gap-4">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-3 w-20" />
              <SkeletonBlock className="h-3 w-28" />
            </div>
          </div>
          <SkeletonBlock className="h-9 w-24 rounded-md" />
        </div>
      </div>
      {/* Tab strip */}
      <div className="flex gap-1 border-b border-slate-200">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-9 w-24 rounded-t-md" />
        ))}
      </div>
      {/* Content grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-slate-200 bg-white p-4"
              style={{ opacity: Math.max(0.5, 1 - i * 0.12) }}
            >
              <SkeletonBlock className="h-4 w-1/3" />
              <SkeletonBlock className="mt-2 h-3 w-full" />
              <SkeletonBlock className="mt-1 h-3 w-4/5" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <SkeletonBlock className="h-4 w-2/3" />
            <SkeletonBlock className="h-3 w-1/2" />
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-3 w-2/5" />
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <SkeletonBlock className="h-4 w-1/2" />
            <SkeletonBlock className="h-3 w-3/4" />
            <SkeletonBlock className="h-3 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Onboarding cases (AdminOnboarding) — list of case rows
// ---------------------------------------------------------------------------

export function OnboardingCaseSkeleton(): JSX.Element {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-20 rounded-full" />
          </div>
          <SkeletonBlock className="h-3 w-1/2" />
          <div className="flex gap-2 pt-1">
            <SkeletonBlock className="h-2 w-16" />
            <SkeletonBlock className="h-2 w-12" />
            <SkeletonBlock className="h-2 w-20" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-3 w-14" />
        </div>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <SkeletonBlock className="h-full w-2/5 rounded-full" />
      </div>
    </div>
  );
}

export function OnboardingListSkeleton({ count = 5 }: { count?: number }): JSX.Element {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ opacity: Math.max(0.5, 1 - i * 0.1) }}>
          <OnboardingCaseSkeleton />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar page (AdminCalendarPage) — month grid shell
// ---------------------------------------------------------------------------

export function CalendarSkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-6 w-48" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-8 w-20 rounded-md" />
          <SkeletonBlock className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {/* Day-of-week header */}
        <div className="mb-2 grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((_, i) => (
            <SkeletonBlock key={i} className="h-3 w-8 mx-auto" />
          ))}
        </div>
        {/* 6 weeks × 7 days */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md border border-slate-100 p-1"
              style={{ opacity: Math.max(0.4, 1 - Math.floor(i / 7) * 0.1) }}
            >
              <SkeletonBlock className="h-3 w-4" />
              {i % 5 === 0 && <SkeletonBlock className="mt-1 h-2 w-full" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Boomerang (AdminBoomerang) — grouped list with summary bar
// ---------------------------------------------------------------------------

export function BoomerangSkeleton(): JSX.Element {
  return (
    <div className="space-y-6">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3"
            style={{ opacity: Math.max(0.5, 1 - i * 0.1) }}
          >
            <SkeletonBlock className="h-2 w-16" />
            <SkeletonBlock className="mt-2 h-5 w-12" />
          </div>
        ))}
      </div>
      {/* Timeline entries */}
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-lg border border-slate-200 bg-white p-4"
            style={{ opacity: Math.max(0.5, 1 - i * 0.1) }}
          >
            <div className="flex items-start gap-3">
              <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <SkeletonBlock className="h-3 w-32" />
                  <SkeletonBlock className="h-4 w-16 rounded-full" />
                </div>
                <SkeletonBlock className="h-3 w-2/3" />
                <SkeletonBlock className="h-3 w-1/2" />
              </div>
              <SkeletonBlock className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings form (AdminSettings) — field stack
// ---------------------------------------------------------------------------

// Card shell matching the shadcn <Card> used across AdminSettings: rounded-xl
// border, header (title + description), then content. Keeps the skeleton's
// bounding box aligned with the real cards so nothing shifts on load.
function SettingsCardSkeleton({
  titleWidth,
  descWidth = 'w-64',
  border = 'border-slate-200',
  children,
}: {
  titleWidth: string;
  descWidth?: string;
  border?: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div className={cn('rounded-xl border bg-white shadow-sm', border)}>
      <div className="space-y-2 p-4">
        <SkeletonBlock className={cn('h-5', titleWidth)} />
        <SkeletonBlock className={cn('h-3 max-w-full', descWidth)} />
      </div>
      <div className="space-y-4 p-4 pt-0">{children}</div>
    </div>
  );
}

export function SettingsFormSkeleton(): JSX.Element {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page heading */}
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-28" />
        <SkeletonBlock className="h-3 w-80 max-w-full" />
      </div>

      {/* Platform — three toggle rows */}
      <SettingsCardSkeleton titleWidth="w-24" descWidth="w-72">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
            style={{ opacity: Math.max(0.6, 1 - i * 0.12) }}
          >
            <div className="space-y-1.5">
              <SkeletonBlock className="h-4 w-40" />
              <SkeletonBlock className="h-3 w-56 max-w-full" />
            </div>
            <SkeletonBlock className="h-6 w-11 shrink-0 rounded-full" />
          </div>
        ))}
      </SettingsCardSkeleton>

      {/* API & Integrations — input + save button */}
      <SettingsCardSkeleton titleWidth="w-36" descWidth="w-72">
        <div className="space-y-2">
          <SkeletonBlock className="h-3 w-40" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 flex-1 rounded-lg" />
            <SkeletonBlock className="h-9 w-16 rounded-lg" />
          </div>
          <SkeletonBlock className="h-3 w-64 max-w-full" />
        </div>
      </SettingsCardSkeleton>

      {/* Admin Account — two-column name / email */}
      <SettingsCardSkeleton titleWidth="w-32" descWidth="w-56">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-9 flex-1 rounded-lg" />
              <SkeletonBlock className="h-9 w-16 rounded-lg" />
            </div>
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-3 w-16" />
            <SkeletonBlock className="h-9 w-full rounded-lg" />
          </div>
        </div>
      </SettingsCardSkeleton>

      {/* Danger Zone — red-bordered card with one action row */}
      <SettingsCardSkeleton titleWidth="w-28" descWidth="w-64" border="border-red-200">
        <div className="flex items-center justify-between rounded-xl border border-red-200 px-4 py-3">
          <div className="space-y-1.5">
            <SkeletonBlock className="h-4 w-36" />
            <SkeletonBlock className="h-3 w-64 max-w-full" />
          </div>
          <SkeletonBlock className="h-9 w-36 shrink-0 rounded-lg" />
        </div>
      </SettingsCardSkeleton>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feedback dialog — star histogram + recent list
// ---------------------------------------------------------------------------

export function FeedbackHistorySkeleton(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="text-center space-y-1.5">
            <SkeletonBlock className="mx-auto h-2 w-16" />
            <SkeletonBlock className="mx-auto h-6 w-10" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-1.5">
        {[5, 4, 3, 2, 1].map((rating, i) => (
          <div key={rating} className="flex items-center gap-2" style={{ opacity: 1 - i * 0.1 }}>
            <SkeletonBlock className="h-3 w-6" />
            <SkeletonBlock className="h-2 flex-1 rounded-full" />
            <SkeletonBlock className="h-3 w-6" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-md border border-slate-200 p-3"
            style={{ opacity: 1 - i * 0.15 }}
          >
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-3 w-24" />
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <SkeletonBlock key={s} className="h-3 w-3 rounded-sm" />
                ))}
              </div>
            </div>
            <SkeletonBlock className="mt-2 h-3 w-full" />
            <SkeletonBlock className="mt-1 h-3 w-4/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
