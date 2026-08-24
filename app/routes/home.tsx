import type { Route } from './+types/home';
import { Navigate } from 'react-router';

export function meta({}: Route.MetaArgs) {
  return [{ title: 'termsprawl — docs', name: 'description', content: 'Docs for termsprawl, a spatial terminal manager for Linux.' }];
}

export default function Home() {
  // The docs site is served at the subdomain root; send the root to the docs.
  return <Navigate to="/docs" replace />;
}
