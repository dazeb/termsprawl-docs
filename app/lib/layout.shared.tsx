import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      // JSX supported
      title: (
        <>
          {appName}
          <span className="rounded-full bg-fd-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-fd-primary">
            alpha
          </span>
        </>
      ),
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
