# PLAN.md — termsprawl-docs (pickup plan)

The docs site for the termsprawl app, its own repo, built with Fumadocs on a
React Router (Vite) SPA. Served under `/docs`. This plan is the pickup point
for a fresh session — AGENTS.md is added only with explicit consent.

## What's done

- Scaffolded Fumadocs (`create-fumadocs-app` → `react-router-spa` template,
  Orama search, Oxlint) with pnpm.
- Branded to termsprawl: dark theme, lime `#02af3e` functional signal, Geist +
  Geist Mono (see `app/app.css`). `app/lib/shared.ts` has `appName`, `/docs`
  route, and the repo's `gitConfig`.
- Wrote 10 docs pages under `content/docs/` (`index`, `getting-started`,
  `canvas`, `terminals`, `projects`, `nodes`, `agents`, `source-control`,
  `cloud`, `shortcuts`, `faq`) + `meta.json` nav order.
- Content documents only shipped features, verified against the app source.
  Deliberately omitted: the command palette (Ctrl+K) is not implemented.
- `pnpm build` passes (all pages prerendered). `pnpm lint` passes (2 template
  `no-empty-pattern` warnings on `meta()` signatures — benign, framework
  pattern).

## Verified facts (source of truth: ../termsprawl)

- Terminals run in persistent tmux sessions (detach-on-close, scrollback
  replay, "session restored" marker).
- Canvas: pan/zoom controls, drag-by-header (hover-guard on terminal body),
  box-select, Delete/Backspace, Ctrl+Z / Ctrl+Shift+Z undo/redo, mini-map, edge
  file tree, right-click menu.
- Nodes: terminal, sticky (color/color cycle/collapse/close), group
  (group/ungroup), editor (Monaco, Ctrl+S, lime-unsaved dot, markdown preview,
  image preview), diff (read-only git diff, staged/HEAD toggle), druk (TUI
  editor in project, inside tmux).
- Projects: folder tab, git-shareable project file, close (detach) / archive /
  delete-permanent, remote (SSH) projects.
- Agents: Claude Code / Codex CLI / Gemini CLI / Grok + custom; spawn via
  right-click → Open agent; hook-driven RUNNING / NEEDS YOU badges; Claude
  branch + resume + context links; managed accounts + permission modes in
  Settings; custom not enabled by default.
- Source control: menu → source control (needs a git folder project); branch +
  sync; push/pull/publish; stage/unstage/discard; commit; AI commit message via
  local agent CLI; branch switch/create; `gh auth login` for GitHub pushes.
- Cloud: GitHub device-flow sign-in; Back up now (manual — no auto-backup yet);
  encrypted server-side with your key; Free/Pro plan tiers shown in Settings.

## Updates since first draft

- **Domain wired** (2026-08-24): `docs.termsprawl.com` is live. Cloudflare
  A record `docs` -> 178.104.6.193 (proxied) via the token in
  `~/secrets/cloudflare-agentpolitico.env` (the `cloudflare-dazeb-dev.env`
  token cannot see the termsprawl.com zone). Deployed by
  `scripts/deploy-hermes-box.sh` to `/var/www/termsprawl-docs`, managed Caddy
  block `# BEGIN/END managed termsprawl-docs`, LE cert issued through the
  Cloudflare proxy. `app/routes/home.tsx` redirects `/` -> `/docs`.
- The termsprawl-web deploy owns the `# BEGIN/END managed termsprawl.com`
  block; the docs deploy owns its own block — they don't clash.

## Follow-ups

1. ~~**Domain wiring (user decision)**~~ — done; see above.
2. **Add `AGENTS.md`** for this repo once the user consents (currently gated;
   plan lives here in PLAN.md).
3. **Cross-check with the app** as it ships phases — keep docs aligned with
   `../termsprawl/AGENTS.md` and `docs/FEATURES.md`. When a feature ships, add/
   update its page and re-run `pnpm build`.
4. Optional: set explicit git author for commits (repo-local) to `dazeb`
   if not already.

## Verification gate

```bash
pnpm install && pnpm lint && pnpm build
```

All must pass before committing a content change.
