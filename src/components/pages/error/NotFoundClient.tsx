'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import NotFound from '@/components/pages/error';
import Wrapper from '@/layouts/Wrapper';

import EventDetail from '@/components/events/EventDetail';

const PortalApp = dynamic(() => import('@/portal/PortalApp'), { ssr: false });

/**
 * Paths owned by the client-side portal app or dynamic event detail pages.
 * Deep links with dynamic segments (e.g. /verify-login/<token>, /events/<slug>)
 * have no statically exported HTML file on some static hosts, so the host serves
 * the 404 page. When the requested path belongs to the portal or events area, we mount
 * the interactive component instead of showing a static 404 page.
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
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  if (pathname === null) return null;

  if (isPortalPath(pathname)) {
    return <PortalApp />;
  }

  if (pathname.startsWith('/events/')) {
    const parts = pathname.split('/').filter(Boolean);
    const eventSlug = parts[1];
    if (eventSlug && eventSlug !== 'page') {
      return <EventDetail slug={eventSlug} />;
    }
  }

  return (
    <Wrapper>
      <NotFound />
    </Wrapper>
  );
}
