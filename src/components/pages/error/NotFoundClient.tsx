'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NotFound from '@/components/pages/error';
import Wrapper from '@/layouts/Wrapper';

const PortalApp = dynamic(() => import('@/portal/PortalApp'), { ssr: false });

/**
 * Paths owned by the client-side portal app. Deep links with dynamic
 * segments (e.g. /verify-login/<token>, /admin/events/<slug>) have no
 * statically exported HTML file, so the host serves the 404 page. When the
 * requested path belongs to the portal we mount the SPA instead of showing
 * a 404 — react-router then resolves the real URL from the address bar.
 */
const PORTAL_PREFIXES = [
  '/admin',
  '/dashboard',
  '/program-dashboard',
  '/startup-profile',
  '/settings',
  '/login',
  '/verify-login',
  '/onboard',
  '/onboarding',
  '/password-set',
  '/cal',
];

const isPortalPath = (pathname: string) =>
  PORTAL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export default function NotFoundClient() {
  // null = undecided (first render / SSG pass); render nothing to avoid a 404 flash
  const [portal, setPortal] = useState<boolean | null>(null);

  useEffect(() => {
    setPortal(isPortalPath(window.location.pathname));
  }, []);

  if (portal === null) return null;
  if (portal) return <PortalApp />;

  return (
    <Wrapper>
      <NotFound />
    </Wrapper>
  );
}
