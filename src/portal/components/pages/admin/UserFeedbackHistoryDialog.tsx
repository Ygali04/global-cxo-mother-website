import type { JSX } from 'react';
import { useEffect, useState } from 'react';
import { AlertTriangle, Star, X } from 'lucide-react';
import { Badge } from '@/portal/components/ui/badge';
import { Button } from '@/portal/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/portal/components/ui/dialog';
import { apiFetch } from '@/portal/api/client';
import { USE_API_AUTH } from '@/portal/api/config';
import type { ApiUserFeedbackHistory } from '@/portal/api/types';
import { FeedbackHistorySkeleton } from '@/portal/components/ui/admin-skeletons';

/**
 * Aggregate feedback history modal — shows every feedback row a user
 * has received across their sessions, with star rating distribution,
 * average rating, and flagged-concern count.
 *
 * This is the data surface that will eventually feed a recommendation
 * algorithm: admins and future ranking logic both need to see how a
 * particular CXO or startup founder is perceived across many sessions
 * rather than one card at a time.
 */
export function UserFeedbackHistoryDialog({
  open,
  userId,
  userName,
  onOpenChange,
}: {
  open: boolean;
  userId: string | null;
  userName: string | null;
  onOpenChange: (open: boolean) => void;
}): JSX.Element {
  const [data, setData] = useState<ApiUserFeedbackHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !userId || !USE_API_AUTH) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setData(null);
    void (async () => {
      try {
        const response = await apiFetch<ApiUserFeedbackHistory>(
          `/ops/users/${userId}/feedback-received`,
        );
        if (!cancelled) {
          setData(response);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load feedback history');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
          <div>
            <DialogTitle className="text-lg">
              Feedback received
              {userName ? ` · ${userName}` : ''}
            </DialogTitle>
            {data && (
              <p className="text-xs text-slate-500 mt-1">
                {data.user_tier.toUpperCase()}
                {data.user_company ? ` · ${data.user_company}` : ''}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {loading && <FeedbackHistorySkeleton />}
        {error && (
          <p className="py-8 text-center text-sm text-red-600">{error}</p>
        )}
        {!loading && !error && data && data.summary.total_feedback === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">
            No feedback received yet. When counterparties submit post-meeting ratings,
            they'll appear here.
          </p>
        )}
        {!loading && !error && data && data.summary.total_feedback > 0 && (
          <div className="space-y-4">
            {/* Aggregate stats */}
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Average</p>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-semibold text-slate-900">
                    {data.summary.average_rating?.toFixed(1) ?? '—'}
                  </span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Reviews</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">
                  {data.summary.total_feedback}
                </p>
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Flagged</p>
                <p
                  className={`mt-1 text-2xl font-semibold ${
                    data.summary.flagged_count > 0 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {data.summary.flagged_count}
                </p>
              </div>
            </div>

            {/* Rating distribution histogram */}
            <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Distribution</p>
              {([5, 4, 3, 2, 1] as const).map((rating) => {
                const count = data.summary.rating_distribution[String(rating) as '1' | '2' | '3' | '4' | '5'];
                const max = Math.max(
                  1,
                  ...Object.values(data.summary.rating_distribution),
                );
                const width = max > 0 ? (count / max) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="flex w-6 items-center gap-0.5 text-xs text-slate-600">
                      {rating}
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="absolute left-0 top-0 h-full bg-amber-400"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs text-slate-500">{count}</span>
                  </div>
                );
              })}
            </div>

            {/* Recent feedback rows */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide text-slate-500">
                Recent feedback ({Math.min(data.recent.length, 20)} of {data.summary.total_feedback})
              </p>
              <div className="max-h-80 space-y-2 overflow-y-auto">
                {data.recent.map((fb) => (
                  <div
                    key={fb.id}
                    className={`rounded-md border p-3 text-sm ${
                      fb.something_wrong
                        ? 'border-red-200 bg-red-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-slate-800">
                          {fb.submitted_by_name}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            · {fb.submitted_by_role === 'cxo' ? 'CXO' : 'Startup'}
                          </span>
                        </p>
                        {fb.submitted_at && (
                          <p className="text-xs text-slate-400">
                            {new Date(fb.submitted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <StarRow rating={fb.rating} />
                    </div>
                    {fb.comment && (
                      <p className="mt-2 text-slate-700">{fb.comment}</p>
                    )}
                    {fb.something_wrong && fb.wrong_description && (
                      <div className="mt-2 flex items-start gap-1.5 rounded border border-red-200 bg-white p-2">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                        <p className="text-xs text-red-800">{fb.wrong_description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StarRow({ rating }: { rating: number }): JSX.Element {
  return (
    <div className="flex shrink-0 gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'fill-slate-100 text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
