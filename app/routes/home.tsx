import type { Route } from './+types/home';
import { replace } from 'react-router';

export function meta(): Route.MetaDescriptors {
  return [{ title: 'termsprawl — docs', name: 'description', content: 'Docs for termsprawl, a spatial terminal manager for Linux.' }];
}

// The docs site is served at the subdomain root; send the root to the docs.
// A clientLoader redirect — rather than a rendered <Navigate> — is the
// SPA-mode-idiomatic fix for the initial-render warning: no render-time
// navigation, it runs on hydration and on client-side navigation alike. A
// server loader cannot be used here because the SPA fallback is prerendered
// from `/` and must return 200.
//
// replace, not redirect: a plain redirect pushes `/docs` over `/`, so Back
// returns to `/`, which redirects forward again — the visitor can never leave
// the site backwards. `replace` keeps the entry count stable.
export function clientLoader(): never {
  throw replace('/docs');
}

// Redirecting routes hydrate with no data, so react-router would otherwise
// render its default "Loading…" shell and log a hydration tip before the
// redirect resolves. There is nothing to show for a redirect.
export function HydrateFallback() {
  return null;
}

export default function Home() {
  return null;
}
