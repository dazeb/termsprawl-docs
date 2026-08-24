# USER.md — operator context for termsprawl-docs

Concise operator identity and preferences, so a fresh Hermes session in this
repo works the way the operator expects without re-asking.

## Who you're working for

- GitHub / git identity: **dazeb** (`dazeb@users.noreply.github.com`). This repo
  is public under the `dazeb` GitHub account.
- Operator tests the termsprawl **app** from packaged AppImages, and ships docs
  that must match what's actually in the app.

## Preferences

- **Stack**: Vite + React + TS, and **pnpm** everywhere. Avoid Next.js unless
  explicitly chosen (Fumadocs is the one non-Vite exception here).
- **Docs**: Diátaxis — one clear purpose per page (tutorial / how-to / reference
  / explanation). No internals in user-facing docs.
- **Truthfulness**: document only what ships. Verify against `../termsprawl`
  source. Never fabricate a feature.
- **Verify before claim**: run the build/lint and report what actually executed.
- **Secrets**: never commit or print keys/tokens. Credentials live in
  `~/secrets/*.env` (mode 600), sourced at runtime.
- **Servers**: never start `pnpm dev` / preview servers — the operator owns
  those (port/orphan risk).
- **Repos**: project repos get their own folder with their own git repo; repo
  READMEs and status must match reality. A fresh project's pickup plan is its
  `AGENTS.md` (written only with explicit consent).
- **Live deploys**: state data-loss/downtime impact and get confirmation before
  touching a live domain; verify the result (curl, cert check, site health).
- **Other repos**: never edit or commit inside `../termsprawl` or
  `../termsprawl-web` from here.

## Style

Concise, terminal-readable, plain text over markdown decoration when talking to
the user. Sentence-case headings. No hype or sycophancy; push back when an idea
is weak.
