'use client';

import dynamic from 'next/dynamic';

// The portal is a fully client-side app (auth, react-query, react-router);
// SSR is disabled so the static export ships only the mount shell.
const PortalApp = dynamic(() => import('@/portal/PortalApp'), { ssr: false });

export default function Page() {
  return <PortalApp />;
}
