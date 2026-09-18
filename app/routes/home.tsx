import type { Route } from './+types/home';
import { redirect } from 'react-router';

export function meta(): Route.MetaDescriptors {
  return [{ title: 'termsprawl — docs', name: 'description', content: 'Docs for termsprawl, a spatial terminal manager for Linux.' }];
}

// The docs site is served at the subdomain root; send the root to the docs.
// A clientLoader redirect — rather than a rendered <Navigate> — is the
// SPA-mode-idiomatic fix for the initial-render warning: no render-time
// navigation, it runs on hydration and on client-side navigation alike. A
// server loader cannot be used here because the SPA fallback is prerendered
// from `/` and must return 200.
export function clientLoader(): never {
  throw redirect('/docs');
}

export default function Home() {
  return null;
}
