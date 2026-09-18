// Content-consistency gates for the docs site.
//
// The docs must describe only what the app and the Cloud service actually
// ship. These tests pin the claims that drifted (or could drift) back into
// marketing language: the alpha badge and banner, client-side/E2E encryption
// wording, an over-stated backup scope, missing published policies, and the
// incomplete agent preset list. Run with `pnpm test` (node --test).
//
// Sources for every pinned fact (app repo / service, this session):
//   - maturity: app README.md, docs/PROJECT-HEALTH.md ("Pre-1.0 · actively
//     maintained"), SECURITY.md/GOVERNANCE.md/FUNDING.md ("pre-1.0").
//   - backup scope: app src/main/cloud.ts backupNow() uploads ONE project's
//     { id, at, nodes } — the active project's canvas state, nothing else.
//   - encryption: service github-vault.mjs encryptBackup uses aes-256-gcm
//     with a per-user key derived (HMAC-SHA256) from the service master key;
//     decryptBackup serves authenticated reads.
//   - plans/billing: service index.mjs — free/pro/canvas, Stripe test mode,
//     no live key, create-only gates on POST /api/v1/backups, GET routes
//     auth-only, DELETE /api/v1/me removes the backups dir + space snapshot.
//   - agents: app src/shared/agents/config.ts AgentId list includes opencode.
//   - updates/telemetry: app src/main/index.ts fetches GitHub Releases for
//     announcements (packaged only) + electron-updater; no analytics code.
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')

function read(relativePath) {
  const absolutePath = path.join(ROOT, relativePath)
  assert.ok(fs.existsSync(absolutePath), `${relativePath} must exist`)
  return fs.readFileSync(absolutePath, 'utf8')
}

/** Prose assertions must not depend on where markdown wraps a line. */
function readFlat(relativePath) {
  return read(relativePath).replace(/\s+/g, ' ')
}

/**
 * Claims that are false for the shipped service. A page may state one only to
 * deny it, because a reviewer needs the explicit "not end-to-end" wording.
 * Each entry is [pattern, human label].
 */
const CLOUD_CLAIM_PATTERNS = [
  [/encrypted before/i, 'encrypted-before-upload claim'],
  [/\bend[-\s]?to[-\s]?end\b/i, 'end-to-end encryption claim'],
  [/\bE2E\b/, 'E2E encryption claim'],
  // Subject-aware on purpose: "one account cannot read another's data" is a
  // cross-tenant isolation fact, not a claim that the service cannot read
  // yours. Only a service/we/cloud subject making that claim is a violation.
  [/(?:service|server|cloud|we|provider)\s+(?:can(?:no|')?t|cannot|never|is unable to)\s+read/i, 'service-cannot-read claim'],
  [/(?:can(?:no|')?t|cannot|never)\s+read\s+(?:your|the user's|your own)\s+(?:data|backups?|workspace|files)/i, 'service-cannot-read claim'],
  [/your key\b/i, 'user-held-key claim'],
  [/client[-\s]side/i, 'client-side encryption claim'],
  [/whole workspace/i, 'over-stated backup scope'],
  [/delete individual backups|delete a single backup|per-backup delete/i, 'individual backup-delete claim'],
]

/** Split flattened prose into sentences for claim-by-claim checking. */
function flattenSentences(text) {
  return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/)
}

/**
 * True when the denial attaches to the claim itself rather than to anything
 * else in the sentence. A sentence-wide "is there any negation?" test is
 * defeated by ordinary phrasing: "encrypted before they leave your machine,
 * with no exceptions" contains "no" and would wrongly pass.
 */
function isDenied(sentence, claimIndex) {
  const before = sentence.slice(Math.max(0, claimIndex - 60), claimIndex)
  return /\b(?:not|no|never|nothing|isn't|doesn't|is not|are not|cannot|can't|rather than|lacks?|without)\b[^.!?]{0,20}$/i.test(
    before
  )
}

// App files users actually read on — the badge, the chrome, and the docs app.
const APP_SOURCE_FILES = [
  'app/root.tsx',
  'app/app.css',
  'app/lib/layout.shared.tsx',
  'app/lib/shared.ts',
  'app/lib/source.ts',
  'app/routes/home.tsx',
  'app/routes/not-found.tsx',
  'app/routes/docs.tsx',
  'app/components/mdx.tsx',
]

const DOC_FILES = fs
  .readdirSync(path.join(ROOT, 'content/docs'))
  .filter((name) => name.endsWith('.mdx'))
  .map((name) => `content/docs/${name}`)

// Operator-facing status files: these may name a retired claim in a clearly
// historical/status sentence ("stale", "removed", "no longer", "→"), but may
// not make the claim. They are not the user-facing site.
const STATUS_FILES = ['README.md', 'PLAN.md', 'HERMES.md']
const HISTORICAL_MARKER = /stale|removed|no longer|histor|→|former|old\b/i

// Claims that are false for the shipped product everywhere on this site.
// If one becomes true, change this list deliberately — do not soften copy.
const PROHIBITED_ANYWHERE = [
  { pattern: /\balpha\b/i, label: 'alpha maturity wording (the project is pre-1.0)' },
  { pattern: /feature[-\s]?complete/i, label: 'feature-complete claim' },
  { pattern: /0\.15\.0/, label: 'stale 0.15.0 version' },
  { pattern: /\brevenue\b/i, label: 'revenue claim (billing is in test mode)' },
  { pattern: /\bMRR\b|\bARR\b/, label: 'revenue-metric claim' },
  { pattern: /\bchecksum\b/i, label: 'checksum claim (no checksum asset ships)' },
  { pattern: /key only you hold/i, label: 'user-held-key claim' },
  { pattern: /zero[-\s]knowledge/i, label: 'zero-knowledge claim' },
  { pattern: /nothing leaves/i, label: 'no-network absolute' },
  { pattern: /\bphones? home\b/i, label: 'nothing-phones-home claim' },
]

const USER_FACING_FILES = [...APP_SOURCE_FILES, ...DOC_FILES]

test('no prohibited or stale claim strings remain in shipped source or docs', () => {
  assert.ok(DOC_FILES.length >= 15, 'the content sweep must visit the docs pages')
  for (const relative of USER_FACING_FILES) {
    const source = readFlat(relative)
    for (const { pattern, label } of PROHIBITED_ANYWHERE) {
      assert.doesNotMatch(source, pattern, `${relative} must not contain the ${label}`)
    }
  }
})

test('status files may only name a retired claim inside a historical sentence', () => {
  for (const relative of STATUS_FILES) {
    for (const line of read(relative).split('\n')) {
      for (const { pattern, label } of PROHIBITED_ANYWHERE) {
        if (pattern.test(line)) {
          assert.match(
            line,
            HISTORICAL_MARKER,
            `${relative} may only mention the ${label} in a historical sentence: "${line.trim()}"`,
          )
        }
      }
    }
  }
})

test('maturity is pre-1.0 in the nav badge, with no alpha banner', () => {
  const layout = read('app/lib/layout.shared.tsx')
  assert.match(layout, /pre-1\.0/, 'the nav badge must read pre-1.0')
  assert.doesNotMatch(layout, /\balpha\b/i, 'the nav badge must not read alpha')

  const root = read('app/root.tsx')
  assert.doesNotMatch(root, /alpha/i, 'the alpha banner must be gone from the root layout')
  assert.doesNotMatch(root, /alpha-banner/, 'the alpha banner class must not be referenced')

  const css = read('app/app.css')
  assert.doesNotMatch(css, /\balpha\b/i, 'the alpha banner styles must be removed')
})

test('the index states maturity, lists OpenCode, and links the public trust layer', () => {
  const index = readFlat('content/docs/index.mdx')
  assert.match(index, /Pre-1\.0 · actively maintained/, 'index must state the maturity plainly')
  assert.match(index, /OpenCode/, 'the Agents card must include OpenCode')

  for (const url of [
    'https://termsprawl.com/project',
    'https://termsprawl.com/funders',
    'https://github.com/dazeb/termsprawl/blob/main/SECURITY.md',
    'https://github.com/dazeb/termsprawl/blob/main/GOVERNANCE.md',
    'https://github.com/dazeb/termsprawl/blob/main/ROADMAP.md',
    'https://github.com/dazeb/termsprawl/blob/main/FUNDING.md',
    'https://github.com/dazeb/termsprawl/blob/main/docs/PROJECT-HEALTH.md',
    'https://github.com/dazeb/termsprawl/blob/main/docs/VERIFICATION.md',
  ]) {
    assert.ok(index.includes(url), `index must link ${url}`)
  }

  // Stewardship pointers only — grant-budget/work-package copy belongs to the
  // proposal, not the docs.
  assert.doesNotMatch(index, /work package|budget line|milestone (?:grant|funding)|grantee/i)
})

test('cloud.mdx describes the shipped backup scope, transport, and at-rest encryption', () => {
  const cloud = readFlat('content/docs/cloud.mdx')

  for (const [required, why] of [
    [/preview/i, 'cloud is in preview'],
    [/test mode/i, 'billing is in test mode'],
    [/no (?:real )?card is charged/i, 'no card is charged today'],
    [/active project/i, 'ordinary backup covers one active project'],
    [/HTTPS/, 'transport is HTTPS'],
    [/AES-256-GCM/, 'at-rest cipher'],
    [/at rest/i, 'encryption applies at rest'],
    [/master key/i, 'key derivation is service-master-key based'],
    [/decrypt/i, 'the service decrypts for authenticated reads'],
    [/workspace bundle/i, 'the one-file bundle is a separate thing'],
    [/snapshot/i, 'hosted canvas sync is snapshot-based'],
    [/no (?:scheduled )?automatic backup/i, 'there is no scheduled auto-backup'],
  ]) {
    assert.match(cloud, required, `cloud.mdx must state: ${why}`)
  }

  // False for the shipped service: client-side/user-held encryption, a wider
  // backup scope than the code implements, live billing, per-backup deletion.
  // A sentence may name one of these only to deny it (a reviewer needs the
  // explicit "not end-to-end" statement); a positive claim is a failure.
  //
  // The denial must attach to the claim itself. A sentence-wide "any negation
  // anywhere" test is defeated by ordinary phrasing — "encrypted before they
  // leave your machine, with no exceptions" contains "no" and would pass.
  for (const [pattern, label] of CLOUD_CLAIM_PATTERNS) {
    for (const sentence of flattenSentences(cloud)) {
      const claim = pattern.exec(sentence)
      if (!claim) continue
      assert.ok(
        isDenied(sentence, claim.index),
        `cloud.mdx must not make the ${label}: "${sentence.trim()}"`
      )
    }
  }

  // A claim added to a neighbouring page would otherwise slip past every
  // check above. Relay's genuine end-to-end wording lives in relay.mdx, so the
  // bare end-to-end patterns are scoped to cloud.mdx — here they only count
  // when the sentence is also talking about cloud backups.
  for (const relative of ['content/docs/index.mdx', 'content/docs/faq.mdx']) {
    const page = readFlat(relative)
    for (const [pattern, label] of CLOUD_CLAIM_PATTERNS) {
      if (label === 'end-to-end encryption claim') continue
      for (const sentence of flattenSentences(page)) {
        const claim = pattern.exec(sentence)
        if (!claim) continue
        assert.ok(
          isDenied(sentence, claim.index),
          `${relative} must not make the ${label}: "${sentence.trim()}"`
        )
      }
    }
  }
})

test('backup-scope claims stay honest on any page that mentions backup', () => {
  const backupPages = ['content/docs/index.mdx', 'content/docs/faq.mdx', 'content/docs/cloud.mdx']
  const CLOUD_CONTEXT = /\bbackup|backed up|cloud\b/i

  for (const relative of backupPages) {
    for (const sentence of flattenSentences(readFlat(relative))) {
      if (!CLOUD_CONTEXT.test(sentence)) continue
      if (!/\bend[-\s]?to[-\s]?end\b|\bE2E\b/i.test(sentence)) continue
      const claim = /\bend[-\s]?to[-\s]?end\b|\bE2E\b/i.exec(sentence)
      assert.ok(
        isDenied(sentence, claim.index),
        `${relative} must not call cloud backup end-to-end encrypted: "${sentence.trim()}"`
      )
    }
  }
})

test('FAQ covers telemetry, network activity, security reporting, and preview limits', () => {
  const faq = readFlat('content/docs/faq.mdx')

  assert.match(faq, /analytics/i, 'FAQ must answer the analytics question')
  assert.match(faq, /telemetry/i, 'FAQ must answer the telemetry question')
  assert.match(faq, /GitHub Releases/i, 'FAQ must name the packaged update check')
  assert.match(faq, /integrations?/i, 'FAQ must note enabled integrations make requests')
  assert.match(faq, /pre-1\.0/i, 'FAQ must state maturity')
  assert.match(faq, /preview/i, 'FAQ must state cloud preview status')
  assert.match(faq, /test mode/i, 'FAQ must state billing test mode')
  assert.match(
    faq,
    /private (?:vulnerability )?report(?:ing)?/i,
    'security reports must go to private reporting, not public issues',
  )
  assert.match(faq, /GitHub issues/i, 'ordinary bugs still go to GitHub issues')
})

test('every shipped agent preset is listed where agents are enumerated', () => {
  const agents = read('content/docs/agents.mdx')
  for (const preset of ['Claude Code', 'Codex CLI', 'Antigravity', 'Grok', 'OpenClaude', 'OpenCode', 'Custom agent']) {
    assert.match(agents, new RegExp(preset), `agents.mdx must list ${preset}`)
  }
  assert.match(agents, /Claude Code and Codex/, 'status badges must be scoped to the verified hook adapters')

  for (const relative of ['content/docs/agent-tools.mdx', 'content/docs/canvas.mdx', 'content/docs/index.mdx']) {
    assert.match(read(relative), /OpenCode/, `${relative} must include OpenCode`)
  }

  const agentTools = read('content/docs/agent-tools.mdx')
  for (const preset of ['Claude Code', 'Codex CLI', 'Antigravity', 'Grok', 'OpenClaude', 'OpenCode', 'Custom agent']) {
    assert.match(agentTools, new RegExp(`^\\| ${preset}`, 'm'), `agent-tools.mdx must have a ${preset} row`)
  }
  assert.doesNotMatch(agentTools, /OpenCode\s*\|[^\n|]*MCP/, 'OpenCode is a CLI fallback, not native MCP')

  const terminals = read('content/docs/terminals.mdx')
  assert.match(terminals, /OpenCode/, 'terminals.mdx must not narrow the preset list')
})

test('no page advertises a command palette, and no operator host details leak into docs', () => {
  const paletteFiles = DOC_FILES.filter((relative) => /command palette|Ctrl\+K/i.test(read(relative)))
  assert.ok(paletteFiles.length >= 2, 'the denial of the palette must be explicit somewhere')
  for (const relative of paletteFiles) {
    const source = read(relative)
    assert.match(
      source,
      /(?:no|not|never|isn't|doesn't|does not|without)\s[^.]{0,60}command palette|command palette[^.]{0,60}(?:no|not|never|isn't|doesn't|does not|omitted|absent)/i,
      `${relative} may only mention the command palette to say it does not exist`,
    )
  }

  for (const relative of DOC_FILES) {
    assert.doesNotMatch(
      read(relative),
      // Loopback in a self-hosting example is fine; a routable operator
      // address is not.
      /\b(?!127\.0\.0\.1\b)\d{1,3}(?:\.\d{1,3}){3}\b/,
      `${relative} must not embed operator host addresses`,
    )
  }
})
