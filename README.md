# termsprawl-docs

The documentation site for [termsprawl](https://github.com/dazeb/termsprawl), a
spatial terminal manager for Linux. Built with
[Fumadocs](https://fumadocs.dev) on a **React Router (Vite)** SPA — no Next.js.

The docs live under `/docs` and are meant to be served on the main termsprawl
domain. This is its **own repo**, separate from the app (`termsprawl`) and the
marketing site (`termsprawl-web`).

## Commands

```bash
pnpm install        # install deps
pnpm dev            # dev server (React Router / Vite)
pnpm build          # production build into build/client
pnpm lint           # oxlint
pnpm types:check    # react-router typegen + tsc --noEmit
```

## Where the docs live

- `content/docs/*.mdx` — the documentation pages (MDX + Fumadocs components).
- `content/docs/meta.json` — the sidebar nav order and titles.
- `app/` — the React Router app (layout, routes, search, theme).

Each page is focused on one reader need: a tutorial (get started), how-tos
(canvas, projects, agents, source control), explanation (terminals, cloud,
FAQ), and reference (nodes, shortcuts). Content is written from the app's real,
shipped behaviour — documented features are implemented features.

## Deploying

The build is a static React Router SPA (`build/client`). It is **not yet wired
into the live domain**. Two options when you're ready:

- **Subdomain (`docs.termsprawl.com`)** — serve `build/client` statically as the
  root of a subdomain. No base-path change needed. Recommended.
- **Subpath (`termsprawl.com/docs`)** — requires setting a Vite `base` /
  React Router `basename` of `/docs` so asset paths resolve, plus a Caddy
  `/docs/*` route with an SPA fallback.

Wire-up is a deliberate follow-up so the domain choice stays yours.

## Related repos

- [termsprawl](https://github.com/dazeb/termsprawl) — the app (source of truth).
- [termsprawl-web](https://github.com/dazeb/termsprawl-web) — the marketing site.

## License

MIT. Docs text is written fresh — nothing is copied from other terminal-manager
projects.
