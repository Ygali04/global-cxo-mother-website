// NEXT_PUBLIC_* vars are inlined at build time by Next.js. The Railway
// backend URL is baked in as the default so the static export works
// without any env configuration.
const rawBase =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ??
  'https://gcio-backend-production.up.railway.app/api';

export const API_BASE_URL = rawBase.replace(/\/$/, '');

/** When true and a base URL is set, login/bootstrap use HTTP instead of local mock session. */
export const USE_API_AUTH: boolean =
  (process.env.NEXT_PUBLIC_USE_API_AUTH ?? 'true') === 'true' && API_BASE_URL.length > 0;

// ---------------------------------------------------------------------------
// Cal.com — THREE distinct URLs, do not mix them up
// ---------------------------------------------------------------------------
//
// 1. CALCOM_URL (the "branded public" URL)
//    What users SEE in their address bar when visiting a booking page:
//    `https://globalcxocircle.com/cal/{username}`. This lives on the GCXO
//    brand domain — that's the whole point. The React router matches
//    `/cal/:username` and renders <CalEmbed/>, which iframes the actual
//    Cal.com backend. Users never leave globalcxocircle.com.
//    USE FOR: public booking page share URLs, anything a RECIPIENT of an
//    invitation would paste into their browser.
//
// 2. CALCOM_ADMIN_URL (the "direct admin" URL)
//    The actual Cal.com URL, bypassing the iframe entirely. Points at the
//    self-hosted Cal.com backend (Railway). This URL is opened in a new
//    tab for admin/settings flows that REQUIRE Cal.com authentication
//    (e.g. "Manage Calendar", "Connected Apps", password setup). These
//    pages set X-Frame-Options: DENY, so they CANNOT be embedded — any
//    attempt shows "refused to connect" in the browser. Opening them
//    directly in a new tab sidesteps the problem entirely.
//    USE FOR: "Manage Calendar" buttons, admin deep links, OAuth consent
//    flows, anything that needs a logged-in Cal.com session.
//
// 3. CALCOM_IFRAME_SRC (the "internal iframe source" URL)
//    The URL that <CalEmbed/> puts in its <iframe src="...">. Users NEVER
//    see this directly — it's only ever in the iframe tag, rendered from
//    inside globalcxocircle.com/cal/*. In production this is usually the
//    same value as CALCOM_ADMIN_URL (both point at Railway) but kept
//    separate so a future operator can split them if they ever need to.
//
// Never hardcode https://cal.com (the public service) anywhere.

const rawCalcomUrl = (process.env.NEXT_PUBLIC_CALCOM_URL as string | undefined)?.trim();
export const CALCOM_URL: string = (rawCalcomUrl && rawCalcomUrl.length > 0
  ? rawCalcomUrl
  : 'https://globalcxocircle.com/cal'
).replace(/\/$/, '');

const rawCalcomAdminUrl = (process.env.NEXT_PUBLIC_CALCOM_ADMIN_URL as string | undefined)?.trim();
export const CALCOM_ADMIN_URL: string = (rawCalcomAdminUrl && rawCalcomAdminUrl.length > 0
  ? rawCalcomAdminUrl
  : 'https://gcio-calcom-production.up.railway.app'
).replace(/\/$/, '');

const rawCalcomIframeSrc = (process.env.NEXT_PUBLIC_CALCOM_IFRAME_SRC as string | undefined)?.trim();
export const CALCOM_IFRAME_SRC: string = (rawCalcomIframeSrc && rawCalcomIframeSrc.length > 0
  ? rawCalcomIframeSrc
  : 'https://gcio-calcom-production.up.railway.app'
).replace(/\/$/, '');
