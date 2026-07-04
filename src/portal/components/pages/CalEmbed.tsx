import React, { useMemo, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CALCOM_IFRAME_SRC, CALCOM_ADMIN_URL } from '@/portal/api/config';

/**
 * Renders the self-hosted Cal.com UI inside a full-viewport iframe so the
 * user's address bar stays on `globalcxocircle.com/cal/*` while the actual
 * Cal.com page is served from our self-hosted backend.
 *
 * The route is mounted as `/cal/*` (wildcard) so any subpath the user (or
 * code) constructs under /cal gets forwarded verbatim to Cal.com. This
 * means all of the following work without changes:
 *
 *   /cal                                → Cal.com root (login / landing)
 *   /cal/liamchen                       → Liam's public booking page
 *   /cal/liamchen/30min                 → a specific event type
 *   /cal/settings/my-account/calendars  → admin deep link to settings
 *   /cal/bookings?status=upcoming       → list bookings with query param
 *
 * The address bar NEVER changes. The iframe's internal HTTP request to
 * CALCOM_IFRAME_SRC is invisible to the user. Query strings on our URL
 * are forwarded so deep links keep working end-to-end.
 */
const CalEmbed: React.FC = () => {
  const params = useParams<{ '*'?: string }>();
  const subpath = (params['*'] ?? '').replace(/^\/+/, '');
  const [searchParams] = useSearchParams();
  const [showFallback, setShowFallback] = useState(false);

  const iframeSrc = useMemo(() => {
    const base = subpath.length > 0
      ? `${CALCOM_IFRAME_SRC}/${subpath}`
      : CALCOM_IFRAME_SRC;
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  }, [subpath, searchParams]);

  const titleHint = subpath.split('/')[0] || 'Cal.com';

  // Always show fallback after 6 seconds. onLoad fires even when
  // X-Frame-Options blocks the iframe (browser treats the error page
  // as a successful load), so we can't rely on it. Instead, show the
  // iframe AND the fallback overlay together — the overlay sits below
  // a successfully loaded iframe (z-index) but is visible when the
  // iframe is blank/blocked.
  React.useEffect(() => {
    const timer = setTimeout(() => setShowFallback(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const directUrl = subpath.length > 0
    ? `${CALCOM_ADMIN_URL}/${subpath}`
    : CALCOM_ADMIN_URL;

  return (
    <div className="fixed inset-0 bg-white">
      {/* Fallback sits behind the iframe — visible only when iframe is blank */}
      {showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-0">
          <div className="text-center max-w-md px-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Calendar could not load</h2>
            <p className="text-sm text-slate-500 mb-4">
              The embedded calendar is temporarily unavailable. You can access it directly instead.
            </p>
            <a
              href={directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              Open Calendar →
            </a>
          </div>
        </div>
      )}
      <iframe
        src={iframeSrc}
        title={titleHint === 'Cal.com' ? 'Cal.com' : `Book with ${titleHint}`}
        allow="clipboard-write; camera; microphone; fullscreen"
        className="relative z-10 block h-full w-full border-0"
      />
    </div>
  );
};

export default CalEmbed;
