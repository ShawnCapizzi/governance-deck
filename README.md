# Capizzi Governance Deck

Define the spine. Diagnose reality against it. Walk the road to success met.

A governance platform built on the Capizzi Process: async-gather workshops,
convergence with perception-gap detection, versioned governance artifacts,
and a five-stage maturity roadmap per issue.

## Quick start

    npm install
    npm run dev

Open http://localhost:3000. v1 runs on an in-memory seeded session, no env
vars required. To prepare Supabase, copy .env.example to .env.local, create
a project, then run supabase/migrations/0001_init.sql followed by
supabase/seed.sql (service role).

## Verification gates (run before every commit)

    npm run gates

Gate 1 transpiles every ts/tsx file with esbuild. Gate 2 SSR-renders all
four views under Node and asserts content markers. Both must pass.

## Repo map

| Path | Purpose |
| --- | --- |
| app/page.tsx | Governance Health cockpit (home) |
| app/gather/page.tsx | Async gather flow |
| app/converge/page.tsx | Convergence and reconciliation |
| app/artifacts/page.tsx | Artifact previews with provenance |
| app/start/page.tsx | Onboarding manual with playable demo and lead-gen card |
| components/AppShell.tsx | Sidebar cockpit shell |
| components/ui.tsx | Widget (laser and glow props), chips, suit-rail card |
| components/ParticleField.tsx | Site constellation background (ported) |
| components/LaserFrame.tsx | Site comet card glint (ported) |
| components/views/ | The four view components |
| lib/deck.ts | Canonical seed data, types, suit styles |
| lib/converge.ts | Convergence engine and facilitator queue |
| lib/store.tsx | In-memory session store (SessionProvider) |
| supabase/migrations/0001_init.sql | Full schema and RLS |
| supabase/seed.sql | Canonical deck seed |
| CLAUDE.md | Production brief for Claude Code |

## Launch: exact git steps

File-to-path mapping: every file in this folder commits at the path shown
in the repo map above, from the repo root.

    git init
    git add -A
    git commit -m "feat: Governance Deck v1 (cockpit UI, convergence engine, Supabase schema, gates)"
    gh repo create governance-deck --private --source=. --remote=origin
    git push -u origin main

Then in Vercel: Add New Project, import governance-deck, framework preset
Next.js (auto-detected), no env vars needed for v1, deploy. Vercel
auto-deploys main from then on. Add the two Supabase env vars from
.env.example when production wiring begins.
