# HERMES.md — termsprawl-docs origin & direction

*Hermes: read this to understand why this repo exists and where it's going. For
operational rules (commands, structure, deploy, content rules), read AGENTS.md
in this repo.*

## Why this repo exists

termsprawl has a marketing site (termsprawl-web) and a docs need. The docs are
built here, in their own repo, with **Fumadocs** — but on **React Router
(Vite)**, not Next.js, because the operator's stack preference is Vite + React +
TS + pnpm. Keeping docs in their own repo means the docs deploy independently of
the marketing site and the app, so either can ship without the other.

The docs are **user-facing**: they tell a developer what termsprawl does and
how to use it. They deliberately do **not** expose the internals (Electron
process model, the `CorePlatform` seam, IPC channels, tmux socket paths, React
Flow wiring). Those belong to the app repo's AGENTS.md, not here.

## Relationship to the other repos

- **../termsprawl** — the app. The source of truth for every documented
  feature. The docs must only describe what this repo actually ships.
- **../termsprawl-web** — the marketing site (termsprawl.com). The docs are a
  different audience and a different deploy; they share only the brand (lime
  `#02af3e` on black) and the app's real capabilities.

## Where it is (live)

- The site is **live at https://docs.termsprawl.com**. A proxied Cloudflare A
  record (`docs`) reaches the deployment host; served by Caddy from
  `/var/www/termsprawl-docs` with a Let's Encrypt cert issued through the
  Cloudflare proxy (HTTP-01, works because Cloudflare forwards the challenge
  to origin). The deploy script and AGENTS.md carry the host details.
- Current content: index hub (get-started tutorial, projects / canvas /
  agents / agent-tools / source-control how-tos, terminals / cloud / relay /
  faq explanation, nodes / node-links / a2a / shortcuts / settings
  reference). Nav order in `content/docs/meta.json`.

## Where it's going

Keep the docs honest and current with the app. The app is actively developed
through phases (see `../termsprawl/PLAN.md`); each shipped phase should get
(and keep) accurate docs. The project is **pre-1.0 and actively maintained**,
and the docs say exactly that — no stronger maturity claim than the code
supports. Agents are the marquee differentiator — the agents page should grow
as that feature set matures. The docs are a dedicated subdomain
(`docs.termsprawl.com`), separate from the marketing site and the app.

The public trust layer lives in the app repo (SECURITY.md, GOVERNANCE.md,
ROADMAP.md, FUNDING.md, docs/PROJECT-HEALTH.md, docs/VERIFICATION.md); the docs
index links it, and `pnpm test` fails if those links go missing.

## Working here

- Operations live in `AGENTS.md`; the detailed pickup plan is in `PLAN.md`.
- Content is written per Diátaxis (one purpose per page) and verified against
  the app source — never against memory. If a feature isn't in `../termsprawl`,
  it isn't in the docs.
- When you add or fix a page, run `pnpm lint && pnpm build` before committing so
  the next session doesn't re-derive state we already paid for.
