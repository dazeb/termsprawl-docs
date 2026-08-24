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

- The site is **live at https://docs.termsprawl.com**. Cloudflare A record
  `docs` -> `178.104.6.193`, proxied; served by Caddy on hermes-box from
  `/var/www/termsprawl-docs`; Let's Encrypt cert issued through the Cloudflare
  proxy (HTTP-01, works because Cloudflare forwards the challenge to origin).
- Current content: 10 pages — get-started (tutorial), canvas / projects /
  agents / source-control (how-tos), terminals / cloud / faq (explanation),
  nodes / shortcuts (reference), plus an index hub. Nav order in
  `content/docs/meta.json`.

## Where it's going

Keep the docs honest and current with the app. The app is actively developed
through phases (see `../termsprawl/PLAN.md`); each shipped phase should get
(and keep) accurate docs. Agents are the marquee differentiator — the agents
page should grow as that feature set matures. The docs may eventually also be
mirrored as a `/docs` path on the main domain; for now it's a dedicated
subdomain.

## Working here

- Operations live in `AGENTS.md`; the detailed pickup plan is in `PLAN.md`.
- Content is written per Diátaxis (one purpose per page) and verified against
  the app source — never against memory. If a feature isn't in `../termsprawl`,
  it isn't in the docs.
- When you add or fix a page, run `pnpm lint && pnpm build` before committing so
  the next session doesn't re-derive state we already paid for.
