# termsprawl-docs

The documentation site for [termsprawl](https://github.com/dazeb/termsprawl), a
spatial terminal manager for Linux. Built with
[Fumadocs](https://fumadocs.dev) on a **React Router (Vite)** SPA — no Next.js.

The docs are **live at https://docs.termsprawl.com**. This is its **own repo**,
separate from the app (`termsprawl`) and the marketing site (`termsprawl-web`).

## Commands

```bash
pnpm install        # install deps
pnpm dev            # dev server (React Router / Vite)
pnpm build          # production build into build/client (prerenders every page)
pnpm lint           # oxlint
pnpm types:check    # react-router typegen + tsc --noEmit
pnpm test           # content-consistency gates (node --test)
```

## Where the docs live

- `content/docs/*.mdx` — the documentation pages (MDX + Fumadocs components).
- `content/docs/meta.json` — the sidebar nav order and titles.
- `app/` — the React Router app (layout, routes, search, theme).

Each page is focused on one reader need: a tutorial (get started), how-tos
(canvas, projects, agents, agent tools, source control), explanation
(terminals, cloud, relay, FAQ), and reference (nodes, node links, A2A,
shortcuts, settings). Content is written from the app's real, shipped
behaviour — documented features are implemented features.

`pnpm test` enforces that at the text level: it gates the maturity label, the
published policies linked from the index, the complete agent preset list, the
cloud wording (at-rest encryption, backup scope, no per-backup delete), and the
absence of stale claims (alpha badge, end-to-end encryption, revenue,
command palette). If a claim becomes true, change the wording and the gate
deliberately.

## Deploying

The build is a static React Router SPA (`build/client`, every page
prerendered). It is **live at https://docs.termsprawl.com**: a proxied
Cloudflare A record serves it from the deployment host (see
`scripts/deploy-hermes-box.sh` for the address) at
`/var/www/termsprawl-docs` via Caddy, with an auto-issued Let's Encrypt
certificate.

Deploy with `./scripts/deploy-hermes-box.sh` — it builds, streams `build/client`
over ssh+tar, and updates its own `# BEGIN/END managed termsprawl-docs` Caddy
block (validates + reloads, restoring a backup on failure). The termsprawl-web
deploy owns a separate managed block, so the two never clash.

## Related repos

- [termsprawl](https://github.com/dazeb/termsprawl) — the app (source of truth).
  Its public trust layer (SECURITY.md, GOVERNANCE.md, ROADMAP.md, FUNDING.md,
  docs/PROJECT-HEALTH.md, docs/VERIFICATION.md) is linked from the docs index.
- [termsprawl-web](https://github.com/dazeb/termsprawl-web) — the marketing site.

## License

MIT. Docs text is written fresh — nothing is copied from other terminal-manager
projects.
