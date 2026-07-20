import { toast } from 'sonner';

import { getCalcomSsoTokenApi, startCalcomOnboardingApi } from '@/portal/api/calcom';
import { CALCOM_ADMIN_URL } from '@/portal/api/config';
import { ApiError } from '@/portal/api/errors';

const TOAST_ID = 'calcom-onboard';

function openInNewTab(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

function isNotLinkedError(err: unknown): boolean {
  // apiFetch throws ApiError with a numeric `.status` when the backend
  // responds non-2xx. A 404 from POST /api/calcom/sso-token means
  // "No Cal.com account linked" — the case we want to auto-heal from.
  return err instanceof ApiError && err.status === 404;
}

/**
 * One-click "Manage Calendar" bridge. Mints a short-lived SSO JWT from the
 * GCXO backend and opens the resulting Cal.com URL in a new tab so the user
 * lands inside Cal.com already authenticated.
 *
 * Fallback ladder:
 *   1. Try `getCalcomSsoTokenApi()`. If it succeeds, open the redirect URL.
 *   2. If it fails with 404 ("no Cal.com account linked"), auto-provision
 *      via `startCalcomOnboardingApi()` and retry the SSO mint once.
 *   3. If either the auto-provision or the retry fails, open the bare
 *      `CALCOM_ADMIN_URL` so the button still does *something* useful, and
 *      surface a toast so the user knows SSO is unavailable.
 *
 * Sibling unit B4 fixes this server-side (SSO endpoint auto-heals on miss);
 * this client-side ladder is belt-and-suspenders for users hitting an older
 * backend that hasn't shipped B4 yet.
 */
/**
 * Admin-specific: SSO into the shared GCXO admin Cal.com account.
 * Uses as_admin=true so the backend mints a token for calcom_user_id=1
 * regardless of which GCXO user is logged in.
 */
export async function openAdminCalendar(): Promise<void> {
  try {
    const { redirect_url } = await getCalcomSsoTokenApi(true);
    openInNewTab(redirect_url);
    return;
  } catch (err) {
    console.warn('Cal.com admin SSO failed, falling back to login', err);
    toast.info('Opening calendar login — sign in with info@globalciocircle.com.', { id: TOAST_ID });
    openInNewTab(`${CALCOM_ADMIN_URL}/auth/login`);
  }
}

export async function openManageCalendar(): Promise<void> {
  try {
    const { redirect_url } = await getCalcomSsoTokenApi();
    openInNewTab(redirect_url);
    return;
  } catch (err) {
    if (!isNotLinkedError(err)) {
      console.warn('Cal.com SSO failed, falling back to login', err);
      toast.info('Opening calendar login — sign in with your GCXO email.', { id: TOAST_ID });
      openInNewTab(`${CALCOM_ADMIN_URL}/auth/login`);
      return;
    }
  }

  // Auto-provision path
  toast.loading('Setting up your calendar — one moment…', { id: TOAST_ID });
  try {
    await startCalcomOnboardingApi();
    const { redirect_url } = await getCalcomSsoTokenApi();
    toast.success('Calendar ready', { id: TOAST_ID });
    openInNewTab(redirect_url);
  } catch (err) {
    console.warn('Cal.com auto-provision failed', err);
    toast.info('Opening calendar login — sign in with your GCXO email.', { id: TOAST_ID });
    openInNewTab(`${CALCOM_ADMIN_URL}/auth/login`);
  }
}
