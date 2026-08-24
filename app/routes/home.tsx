import type { Route } from './+types/home';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { Link } from 'react-router';
import { baseOptions } from '@/lib/layout.shared';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'termsprawl — docs' },
    { name: 'description', content: 'Docs for termsprawl, a spatial terminal manager for Linux.' },
  ];
}

export default function Home() {
  return (
    <HomeLayout {...baseOptions()}>
      <div className="p-8 flex flex-col items-center justify-center text-center flex-1">
        <h1 className="text-2xl font-bold tracking-tight mb-2">termsprawl</h1>
        <p className="text-fd-muted-foreground mb-6 max-w-md">
          Your terminals, agents, and projects on one infinite canvas. Everything in
          place, nothing lost in tabs.
        </p>
        <Link
          className="text-sm bg-fd-primary text-fd-primary-foreground rounded-full font-medium px-4 py-2.5"
          to="/docs"
        >
          Open docs
        </Link>
      </div>
    </HomeLayout>
  );
}
