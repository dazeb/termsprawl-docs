# AGENTS.md — termsprawl-docs (docs.termsprawl.com)

**Plan of record for the termsprawl documentation site.** Read this first — it
is the pickup point for a fresh session. It carries what this repo is, how to
work in it, and how it's deployed. (PLAN.md mirrors this; AGENTS.md is
canonical.)

## What this repo is

termsprawl-docs is the **documentation site** for
[termsprawl](../termsprawl), a spatial terminal manager for Linux. It is built
with **Fumadocs** on a **React Router (Vite) SPA** — deliberately no Next.js
(the user prefers Vite). It is its own repo, separate from the app
(`../termsprawl`) and the marketing site (`../termsprawl-web`).

It is **live at https://docs.termsprawl.com**.

## Source of truth

- **App features** — read `../termsprawl` (`AGENTS.md`, `docs/FEATURES.md`,
  `PLAN.md`, `src/`) for what actually ships. The app is the source of truth.
  Never document a feature that isn't in the code.
- **Marketing site** — `../termsprawl-web` (`AGENTS.md`) carries the marketing
  narrative and the app's release/feature status (`docs/site-sync.md`).

## Tech stack

- Fumadocs (`fumadocs-core`/`fumadocs-mdx`/`fumadocs-ui` base-ui 16)
- React Router v8 SPA (`ssr: false`) + Vite, Tailwind v4, TypeScript
- Orama client-side search; Oxlint; **pnpm**
- Deployed to hermes-box via ssh+tar (no rsync/scp — CI runner is minimal)

## Commands

```bash
pnpm install       # deps (pnpm 10+ blocks esbuild build — see below)
pnpm dev           # dev server (React Router / Vite) — user owns this, don't start it
pnpm build         # production build into build/client (prerenders every page)
pnpm lint          # oxlint
pnpm types:check   # react-router typegen + tsc --noEmit
```

**pnpm gotcha**: `pnpm-workspace.yaml` has an `allowBuilds` block. esbuild's
install script is blocked by pnpm 10+ by default; if `pnpm install`/`lint`/
`build` fails with `ERR_PNPM_IGNORED_BUILDS`, ensure `allowBuilds: esbuild: true`
then reinstall. This is the classic first-run failure in this repo.

## Structure

```
app/                      # React Router app
  lib/source.ts           # Fumadocs defineDocs + loader (baseUrl = /docs)
  lib/shared.ts           # appName, /docs route, gitConfig (edit-on-GitHub links)
  lib/layout.shared.tsx   # nav title + githubUrl
  routes/docs.tsx         # docs layout (sidebar + content)
  routes/home.tsx         # / — redirects to /docs (docs served at subdomain root)
  app.css                 # brand theme (dark + lime) — see below
  components/mdx.tsx      # MDX component mapping
content/
  docs/*.mdx              # the documentation pages (MDX + Fumadocs components)
  docs/meta.json          # sidebar nav order + titles
scripts/
  deploy-hermes-box.sh    # build -> ssh+tar -> /var/www/termsprawl-docs + Caddy
  termsprawl-docs.Caddyfile

build/client/             # build output (gitignored)
```

## Brand theme

`app/app.css` pins a **dark** theme with the termsprawl lime (`#02af3e`) as the
only functional signal, on black. It overrides the Fumadocs `--color-fd-*`
Tailwind variables on `:root` and `.dark` (base-ui 16 uses Tailwind v4
CSS-first vars), and sets Geist / Geist Mono (linked in `app/root.tsx`).

## Content rules (non-negotiable)

- **Diátaxis, one purpose per page**: tutorial (get-started), how-tos (canvas,
  projects, agents, source-control), explanation (terminals, cloud, faq),
  reference (nodes, shortcuts). A page that mixes purposes loses the reader —
  link to the other quadrant instead.
- **Only document shipped features.** Verify against `../termsprawl` source
  before claiming anything. Omit what isn't built (e.g. there is **no command
  palette / Ctrl+K** — do not add it to shortcuts).
- **No internals**: the docs are user-facing. Never expose the Electron
  process model, `CorePlatform` seam, IPC channels, tmux socket paths, or React
  Flow internals. Stick to what a user does.
- **Accuracy protocol**: names, defaults, and Behaviors are read from the app
  source, never recalled. If a feature isn't in the code, don't write it.
- Global Fumadocs components need no import (`<Callout>`, `<Cards>`, `<Card>`,
  `<Steps>`, `<Step>`, `<Tabs>`, `<TypeTable>` is in `fumadocs-ui/components`).
- Frontmatter requires `title` and `description`. New pages must be added to
  `content/docs/meta.json`.

## Deploy

The site is live at `docs.termsprawl.com`, currently a **proxied** Cloudflare A
record to `178.104.6.193`, served by Caddy on hermes-box from
`/var/www/termsprawl-docs`, with a Let's Encrypt cert issued through the
Cloudflare proxy.

- Run `./scripts/deploy-hermes-box.sh` (builds, streams `build/client` via
  ssh+tar to `/var/www/termsprawl-docs`, pushes its **own** Caddy block
  `# BEGIN/END managed termsprawl-docs`, validates + reloads Caddy, with a
  backup/restore on failure).
- **Do not** touch the `# BEGIN/END managed termsprawl.com` block — that belongs
  to the termsprawl-web deploy. The two managed blocks are independent.
- The Cloudflare token that can manage the termsprawl.com zone is in
  `~/secrets/cloudflare-agentpolitico.env` (the `cloudflare-dazeb-dev.env`
  token cannot see the termsprawl.com zone). DNS change (if any): A record
  `docs` -> `178.104.6.193`, proxied.

## Guardrails

- Never start `pnpm dev` / a preview server — the user owns those.
- Never edit or commit into `../termsprawl` or `../termsprawl-web`.
- No secrets in the repo; token/credential files stay in `~/secrets`.
- Deploys to a live domain need operator confirmation; state impact and verify.
- Public repo; README and status must match reality (cross-check PLAN.md/git log).

## Next-session checklist

1. Load `fumadocs-docs-site` + `absolute-docs` skills.
2. Confirm the app's shipped feature set from `../termsprawl` (it is often
   mid-phase). Update any docs page that drifted.
3. `pnpm install && pnpm lint && pnpm build` must pass before committing.
4. If the app ships a new feature/phase, add/update its docs page + re-check
   `../termsprawl-web` (site-sync) status.
