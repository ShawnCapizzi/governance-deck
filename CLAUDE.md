# CLAUDE.md - Capizzi Governance Deck

Production brief for Claude Code. Read this whole file before touching code.

## What this is

A governance platform built on the Capizzi Process. Teams run a facilitated
workshop (leads pass, then team pass), gather answers async, converge on the
conflicts, and the session emits versioned governance artifacts. Org-defined
issues carry diagnostic cards that measure real behavior against the agreed
spine, scored on a five-stage maturity scale, rolled up into Governance Health.

Reference specs (source of truth for product behavior):
- governance-deck-architecture.md (session lifecycle, convergence, data model)
- governance-core-deck.md (canonical 23-card deck, workshop model, telemetry)
- governance-diagnostics-roadmap.md (issues, diagnostic cards, insights, stages)
- governance-growth-strategy.md (domains, solo mode, template tier)

## Stack

Next.js 15 (app router), TypeScript, Tailwind 4 (@theme tokens in
app/globals.css), Supabase, Vercel auto-deploy from main.

## Design system (do not deviate)

Tokens are locked from shawncapizzi.com and live in app/globals.css:
ground #000F1F, surface #021626, raised #061C2F, line #262626,
line-strong #404040, ink #F5F5F4, ink-2 #A3A3A3, ink-3 #737373,
brand #6B5CFF, peri #A798FF, cobalt #4F46E5, magenta #E879F9, ember #FF5722.

Rules:
- The 95/5 rule: 95 percent of every screen is ground, surface, ink, and
  hairlines. Tier 3 color is signal, not decoration.
- The peri-to-brand-to-magenta gradient appears in exactly one place: the
  Governance Health score bar. Never add a second gradient.
- Suit colors: Signals peri, Bounds cobalt, Trace brand, Spine magenta,
  Diagnostic ember. Defined once in lib/deck.ts SUIT_STYLE.
- UI grammar is the Amplenote cockpit rendered in the shawncapizzi.com
  component language: .card-surface (sheen plus top-right purple glow),
  .eyebrow (periwinkle uppercase), rounded-2xl cards, rounded-full chips,
  left rail nav, suit-rail cards, and .pill-primary (white-on-ink pill)
  for every primary action. Purple is never a button fill.
- Signature motion, ported verbatim from the site: ParticleField
  constellation behind everything, LaserFrame comet on the Governance
  Health hero and the Bring-this-to-your-org card only. Both respect
  prefers-reduced-motion. Do not add motion elsewhere.
- Typography: system sans for body, mono for card ranks, eyebrows, scores,
  and artifact previews. Production may adopt Geist and Geist Mono via
  next/font to match shawncapizzi.com; keep the roles identical.

## House rules (always apply)

- No em dashes in rendered copy. Oxford commas. Apostrophes in JSX text as
  the HTML entity for apostrophe.
- Never guess at values. Inspect the actual source first.
- Debug by tracing real data paths end to end and executing code. Never
  propose theories without reproduction.
- Track every edit in a session. A fresh file includes every prior change.
- Exact git steps with file-to-path mapping before any commit.

## Verification gates (mandatory before any commit)

npm run gates
- Gate 1 (scripts/gate-transpile.mjs): esbuild transpile of every ts/tsx.
- Gate 2 (scripts/gate-ssr.mjs): SSR render of all four views under Node
  with content-marker assertions. Compile-clean is not sufficient.
Add markers to gate-ssr.mjs when adding views.

## Current state (v1, verified)

- Five routes: / (Governance Health cockpit), /start (onboarding manual with a playable 60-second demo loop and workshop lead-gen card), /gather, /converge, /artifacts.
- In-memory session store (lib/store.tsx) seeded from lib/deck.ts. State
  survives client navigation via SessionProvider in the root layout.
- Convergence engine (lib/converge.ts): status classification, tier
  perception gaps, blind-definition alignment scoring, facilitator queue.
- Supabase schema and RLS in supabase/migrations/0001_init.sql, canonical
  seed in supabase/seed.sql. Not yet wired to the UI.

## Production backlog (in order)

1. Supabase Auth (email magic link), profile creation, org creation flow
   with owner membership bootstrap (policy exists in migration).
2. Wire the session store to Supabase: sessions, participants, responses.
   Enforce the gather-privacy rule client-side too (the RLS already blocks
   cross-participant reads while status = gathering).
3. Convergence persistence: write convergences rows with resolved_value,
   resolved_by, rationale. Escalation flag drives the Break Glass flow.
4. Artifact generation service: on reconcile-complete, render markdown per
   suit artifact_key, insert immutable artifacts rows, expose download and
   a bundled session pack. Reuse the QR-to-content pattern from Clarity Cards.
5. Extend seed to the full 23-card canonical deck from governance-core-deck.md.
6. Issues and domains CRUD, issue_scores append-only writes, Governance
   Health reads from live data instead of lib/deck.ts ISSUES.
7. Insights engine v1: alignment_score, perception_gap, practice_drift,
   trend_delta per governance-diagnostics-roadmap.md Section 4.
8. Solo mode trial skin: org of one, run-it-on-yourself onboarding.
9. Per-card telemetry per governance-core-deck.md Section 5.

## Non-goals for v1

No automated evidence integrations (Figma API, repo checks). No personal
planner features beyond the solo trial skin. No multi-deck fragmentation.
