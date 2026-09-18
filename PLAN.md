# PLAN.md — termsprawl-docs (pickup plan)

The docs site for the termsprawl app, its own repo, built with Fumadocs on a
React Router (Vite) SPA. It is deployed at https://docs.termsprawl.com (the
subdomain root serves the docs; there is no `/docs` app). AGENTS.md in this
repo is canonical for operations; this file carries the pickup plan and the
verified-facts ledger.

## What's done

- Scaffolded Fumadocs (`create-fumadocs-app` → `react-router-spa` template,
  Orama search, Oxlint) with pnpm.
- Branded to termsprawl: dark theme, lime `#02af3e` functional signal, Geist +
  Geist Mono (see `app/app.css`). `app/lib/shared.ts` has `appName`, the
  `/docs` route, and the repo's `gitConfig`.
- 16 docs pages under `content/docs/` — index, getting-started, projects,
  canvas, terminals, nodes, node-links, agents, agent-tools, a2a,
  source-control, cloud, relay, shortcuts, settings, faq — plus `meta.json`
  nav order.
- Content documents only shipped features, verified against the app source.
  Deliberately omitted: the command palette (Ctrl+K) is not implemented.
- Maturity is **Pre-1.0 · actively maintained** — the nav badge says `pre-1.0`
  and there is no site-wide banner.
- `pnpm lint`, `pnpm types:check`, and `pnpm build` pass clean. `pnpm test`
  (`scripts/content-consistency.test.mjs`) gates the claims listed below.

## Verified facts (source of truth: ../termsprawl and ../termsprawl-web)

- Terminals run in persistent tmux sessions (detach-on-close, scrollback
  replay, "session restored" marker).
- Canvas: pan/zoom controls, drag-by-header (hover-guard on terminal body),
  box-select, Delete/Backspace, Ctrl+Z / Ctrl+Shift+Z undo/redo, mini-map, edge
  file tree, right-click menu.
- Nodes: terminal, sticky (color/color cycle/collapse/close), group
  (group/ungroup), editor (Monaco, Ctrl+S, lime-unsaved dot, markdown preview,
  image preview), diff (read-only git diff, staged/HEAD toggle), druk (TUI
  editor in project, inside tmux), chat, browser (`<webview>` guest per tab).
- Projects: folder tab, git-shareable project file, close (detach) / archive /
  delete-permanent, remote (SSH) projects, GitHub import.
- Agents: Claude Code, Codex CLI, Antigravity (preset `gemini`, resolves to
  `agy`), Grok, OpenClaude, OpenCode, plus a custom template; spawn via
  right-click → Open agent; hook-driven RUNNING / NEEDS YOU badges (verified
  for Claude Code and Codex only); Claude branch + resume + context links;
  managed accounts + permission modes in Settings; custom not enabled by
  default.
- Source control: sidebar Source control panel (needs a git folder project);
  branch + sync; push/pull/publish; stage/unstage/discard; commit; AI commit
  message via local agent CLI; branch switch/create; `gh auth login` for
  GitHub pushes.
- Cloud (service-side, ../termsprawl-web/server): GitHub device-flow sign-in;
  Free / Pro / Canvas tiers; Stripe billing wired in **test mode** (no real
  card charged); ordinary backup uploads ONE active project's canvas state
  ({ id, at, nodes }) from the signed-in desktop app; HTTPS transport;
  AES-256-GCM at rest with a per-user key derived from the service master key
  (the service decrypts for authenticated reads — not E2E, no user-held key);
  cancellation keeps existing backups listable/downloadable but stops new
  writes; account deletion removes the backups dir and the space snapshot;
  no per-backup delete endpoint. Hosted canvas spaces are live (own container
  network, idle-stop at 30 min, sync token re-minted per container start);
  managed-platform/SSH work is future with no promised date.
- Bundle vs backup vs space sync are three different things: the one-file
  workspace bundle (`core/workspace-bundle.ts`) is the spaces-sync envelope and
  works signed in or not; space sync pushes the active project's snapshot.

## Updates since first draft

- **Domain wired** (2026-08-24): `docs.termsprawl.com` is live; the docs deploy
  uses the operator's Cloudflare token from `~/secrets` (never committed) and
  deploys through `scripts/deploy-hermes-box.sh` to `/var/www/termsprawl-docs`
  with its own managed Caddy block. `app/routes/home.tsx` redirects `/` →
  `/docs`.
- The termsprawl-web deploy owns the `# BEGIN/END managed termsprawl.com`
  block; the docs deploy owns its own block — they don't clash.
- **Grant-readiness pass (2026-09-18)**: alpha badge/banner → `pre-1.0`;
  cloud.mdx rewritten against the shipped service; FAQ gained telemetry,
  network, security-report, and maturity answers; agent lists completed with
  OpenCode; public-trust links added to the index; `pnpm test` added as a
  content gate; the initial-render `<Navigate>` on `/` replaced with a
  server-safe loader redirect.

## Follow-ups

1. **Cross-check with the app** as it ships phases — keep docs aligned with
   `../termsprawl/AGENTS.md` and `docs/FEATURES.md`. When a feature ships, add/
   update its page and re-run `pnpm lint && pnpm test && pnpm build`.
2. When a claim in `scripts/content-consistency.test.mjs` becomes true (e.g.
   live billing, per-backup delete), change the docs and the gate in the same
   commit.
3. Optional: set explicit git author for commits (repo-local) to `dazeb`
   if not already.

## Verification gate

```bash
pnpm install && pnpm lint && pnpm types:check && pnpm test && pnpm build
```

All must pass before committing a content change.
