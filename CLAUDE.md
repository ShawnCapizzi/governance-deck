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

Accessibility, non-negotiable: every text token must clear WCAG AA (4.5:1)
against both #000F1F and the #04192B card-surface base. ink-3 is #8E96A3,
raised from the site's #737373 which measured 3.76 and failed. Never use
brand #6B5CFF or cobalt #4F46E5 as text or icon color on dark surfaces
(3.90 and 2.83); they are fills, rails, and borders only. Body copy is
text-sm minimum, card prompts text-base. text-xs is reserved for chips
and mono metadata labels.

Pillar segmentation: Widget derives its surface tint and eyebrow color from
its eyebrow text, so the screen segments itself by Capizzi pillar with no
per-view decisions. Listen First warm-indigo (surface-listen), Make It
Visible cobalt (surface-visible), Prove It Worked magenta (surface-proved),
Continuity teal (surface-continuity), anything else neutral. Hues follow the
Clarity Cards sticky-note coding. To add a pillar, extend PILLAR_SURFACE in
components/ui.tsx and add the matching .surface-* and .eyebrow-* rules.
All four eyebrow colors verified at or above AA on the card base.

Iconography: components/Icons.tsx is a hand-drawn geometric set on a 24
grid, 1.5 stroke, currentColor, no icon-library dependency. Shapes are
structural (rails, gates, stacks, splits) because the subject is
governance. Every Widget renders a pillar icon in a tinted tile, every
status chip carries its shape, nav items carry theirs, role kits carry a
category icon, and decision modes carry a mode icon. Add new icons to this
file rather than importing a library.

Color blocking: each Widget draws a solid 3px pillar rule across its head
and a matching tinted icon tile. That is the squint-test hierarchy, and it
is what makes the app scan as an enterprise tool rather than a page of
uniform cards. Suit rails on cards are 1.5 units wide for the same reason.

DEPTH AND LIGHT. .mesh-hero is three offset radial washes reading as light
across a surface: brand 0.32, magenta 0.10, teal 0.07. Those peaks are the
computed ceiling, where body copy holds 7.37:1. .lit adds a soft key light
to panels and .raise-1 / .raise-2 give real shadow. Critical: .lit is
suppressed under .mesh-hero, because stacked they pushed secondary text to
4.34 and the eyebrow to 4.11, both failing. Never stack two light layers on
one surface without recomputing.

NAV STAGE RAMP. The three nav groups are a sequence, not three topics, so
their rules run brand to peri to teal in stage order. Hue here encodes
ORDER, which is a fourth bounded use and does not collide with topic hue on
cards or state hue on panels. All three clear 3:1 as non-text graphics.

SUIT_COLOR IS THE SINGLE SOURCE. lib/deck.ts exports the five canonical
suit hexes and every consumer reads from it: rails, card faces, and the loop
deck. The loop deck previously duplicated the hexes, which is why darkening
Trace once fixed the rail but left the card face failing at 4.01 on white.
All five clear AA on white stock.

CARDS: TWO KINDS, DELIBERATELY DIFFERENT JOBS. The four loop cards explain
the four steps and are a sequence, so they deal in order and never shuffle.
The question deal (components/QuestionDeal) is the shuffle: it deals three
real questions from the deck and Deal three more brings up three different
ones, verified over 200 consecutive deals to never repeat the previous hand.
Without it the deck metaphor did no work, because a card that never changes
is not a deck.

THREE COLOUR SCOPES, EACH BOUNDED. Extends the one-colour rule rather than
replacing it. (1) TOPIC hue lives on question cards only: Beliefs,
Guardrails, Recovery, Change, Reality check. (2) STATE lives on panels only:
neutral, action (ember), done (teal). (3) CHROME is brand purple and lives
on navigation and identity only: the brand lockup, page header accent bars,
and the active nav wash (.nav-active, 0.18 alpha over raised, label 13.09:1,
periwinkle icon 5.83:1). A hue never crosses scopes. The earlier all-neutral
pass was correct about collisions but left the chrome with nothing, which is
what made every page read as one flat dark tone.

PAGE HEADERS. Every page opens with components/PageHeader outside the card
stack: gradient accent bar, periwinkle eyebrow, large title, and a lead
line. Pages used to open straight into six identical panels with no sense
of place. Do not restate the header title in the first widget below it.

BRAND LOCKUP. components/BrandLockup is the only approved way to render
identity: signature wordmark, gradient rule, then the product name in
tracked mono. Never render the wordmark and a plain text product name as
two loose elements; that reads as a caption, not a logo.

HELP AFFORDANCE. components/HelpButton is a persistent question mark in the
bottom right that opens a getting-started panel. White on brand purple
computes at 4.18 and fails, so the trigger is a raised surface with a
periwinkle glyph (7.06). Keep it on every app page: people testing this did
not ask to be here and will not read a manual.

OUTPUT NAMING. The output is called Decisions, and the page reads What your
team decided. Documents named the file format rather than the value.

ALIGNMENT VOCABULARY, NON-NEGOTIABLE. This product is about alignment and
clarity, never about conflict. The words disagree, disagreement, argument,
argue, conflict, and split must never appear in user-facing copy. What the
app detects is that people answered the same question differently while
each assuming the team agreed; that is an alignment gap, not a fight, and
framing it as conflict makes a neutral diagnostic feel like it assigns
fault, which discourages honest answers.

Approved vocabulary: aligned / not aligned yet (the yet matters: it is a
stage, not a verdict) / answers differ / gap / gaps to close / open
question / settled / settle an open question / where you are not aligned
yet. Nav reads Your questions, Alignment, Documents. Internal identifiers
(status divergent, counts.split, IconSplit) may keep their names; only
rendered strings are governed by this rule.

EMBER IS TWO TOKENS. --color-ember (#FF5722) is fill only: rails, bars,
rules, anywhere it is never text. --color-ember-text (#FF8A65) is for
words, and clears AA on every surface it lands on including the worst
shaded card edge (5.76:1). The single-token version failed at 4.22 on
shaded cards. Never set text in --color-ember.

CAMPAIGN PAGE (/early). Cold-traffic landing page, deliberately outside
AppShell: no sidebar, no app nav, because on a campaign page every link is
an exit. One conversion action (email capture) repeated at top and bottom,
with the demo as the only secondary path. Real credentials only as proof;
never invent logos, customer counts, or testimonials. Hero glow peaks at
0.26 alpha brand over ground, computed so body copy holds 9.46:1 at the
brightest point; all ten text surfaces verified AA. Capture writes to
early_access (migration 0004), which is INSERT-only under RLS with no
select policy, so the list cannot be read back through the public anon key.
With no database configured the form becomes a real mailto link rather than
a button that pretends to capture (honesty rule).

READABILITY TOKENS, COMPUTED NOT EYEBALLED. ink-2 is #CBD0D9 (8.6:1 on the
worst shaded card edge) and ink-3 is #A2ABBA (5.8:1 worst case). The old
values passed AA on flat panels but fell to 5.3:1 on suit shade edges,
which is why body copy read as weak. Main explanatory paragraphs are
text-base, never text-sm; text-sm is for metadata, chips, and row detail.
Question prompts are the content of a card: text-lg md:text-xl, medium
weight. Rail suit labels are 11px bold full white. If a new background is
introduced, recompute contrast against it before shipping.

VISIBLE ACTIONS RULE. Where a panel has a primary action, it renders as a
pill, never as a small text link: a text-peri link is for secondary or
row-level navigation only. The Start page leads with why the app exists
(outcomes: fewer meetings, less rework, a faster yes) and a large Start
answering pill before any explanation of mechanics. The word session never
appears in user-facing copy; the unit of work is a round.

ONE COLOR SYSTEM, NON-NEGOTIABLE. Hue means subject and only subject. The
five topic hues live on question cards alone (Beliefs, Guardrails, Recovery,
Change, Reality check). Panels carry state, never topic: neutral (nothing
required of you), action (something waits on you, ember), done (finished,
teal). A previous version tinted panels by Capizzi pillar using hues 1 to 2
degrees from the card topic hues, so purple meant two different things
depending on what it was painted on. Never reintroduce a second meaning for
a hue. Neutral should be most of what anyone sees; colour is reserved for
what needs doing.

PARTICIPATION DESIGN. Gather shows one question at a time, not a wall: a
long list reads as homework and gets abandoned. Progress, a remaining count,
and a time estimate are always visible, answered questions collapse to a
tappable line, and finishing produces an explicit done state that says what
happens next rather than dead-ending. Health names who has finished and who
the round is waiting on, which is the strongest available nudge and is fair
because it shows both sides. In live mode Gather answers as the signed-in
user and the persona switcher is hidden: letting someone answer as a
teammate would corrupt the premise. In demo mode the visitor answers from
DEMO_ME, a seat deliberately outside PERSONAS so convergence still sees five
complete answer sets while the visitor has real work to do.

HONESTY RULE FOR CONTROLS. A control must do what its label says in the
mode it is shown in. There is no email-invite backend, so live mode shows
the join code rather than an invite form; the form survives in demo mode
labelled Sample data only. If a feature is not wired, change the label or
hide the control. Do not ship a button that silently writes to local state
and looks like it worked.

SUPABASE AND MODES. The app runs in one of two modes, decided by
configuration rather than a flag. With no NEXT_PUBLIC_SUPABASE_* env vars
it runs demo mode: seeded, in-memory, nothing saved, and every route still
renders. That keeps a cold link to /start working for lead gen. With the
env vars set and a signed-in member, it runs live and persists. Never make
a code path assume Supabase exists; getBrowserClient returns null when it
does not, and every caller must handle that.

Auth is magic link. lib/supabase/client.ts (browser), lib/supabase/server.ts
(route handlers), middleware.ts (session refresh, no-ops when unconfigured),
app/auth/callback/route.ts (code exchange), /signin and /onboarding.
Migrations run in order: 0001 then 0002 then 0003. See SUPABASE_SETUP.md.

lib/db.ts is the only place that maps between app shapes and database rows.
Enum mapping is bidirectional and verified: every app value maps to a DB
value that exists in the migrations, and back without loss. If you add a
decision mode, level, or handoff reason, update both maps and the SQL enum
together.

Store writes are optimistic: local state updates first so the UI stays
responsive, then the write goes to Supabase, then refresh reconciles.

Verification note: the SSR gate stubs next/link and next/navigation because
it renders outside the Next runtime. Add a stub rather than removing a hook.

STRUCTURE AND PERMISSIONS. Organization > Program > Round. A program is a
brand, client, or initiative that a curator owns. A round is one repeatable
pass of the questions, run on a cadence, so Round 2 can be compared against
Round 1. Round replaces the earlier session naming in all user-facing copy;
the sessions table remains as the engine record that a round points at.

Four levels: Owner (full org control), Curator (runs programs and rounds,
invites, assigns, reconciles), Contributor (answers), Observer (read only,
and blocked from answering by a restrictive RLS policy, not just the UI).
lib/team.ts permissionsFor is the single source of truth; do not scatter
level checks through views.

Handoffs are governed events, not settings changes. Each records who took
over, why, when, and until when. Rows are never deleted: ending a cover
sets active false so the history survives, which is the continuity record a
new joiner reads. effectiveHolder follows the chain and is depth-capped at
8 hops so a cycle terminates; the same guard exists in SQL as
effective_holder. uncoveredPeople is the check that stops a round going
dark when someone is away with no cover.

Verification note: SSR gate markers must be single text nodes. React
inserts an HTML comment between adjacent text nodes, so a marker spanning
a JSX expression will never match.

PLAIN LANGUAGE RULE, applies to all user-facing copy. Deck vocabulary
(Signals, Bounds, Trace, Spine, suits, ranks) and internal card ids
(SIG-4, D-FIG-1) are internal only and must never appear in the working
app. A first-time user should never have to learn a taxonomy before
answering a question. Suits carry a plain label in SUIT_STYLE that says
what the card governs: Beliefs, Guardrails, Recovery, Change, Reality
check. Color still does the grouping work. Section titles are plain too:
Answer on your own time, Where you disagree, Your documents.

The physical card deck and the Capizzi Process appear in exactly one
place, the explore card at the foot of /start, framed as optional depth
for someone who wants to take this further than the app. Do not
reintroduce process branding into the working flow.

Artifacts render as paper, not UI: components/ArtifactDoc.tsx uses warm
stock (#FBFAF7) with dark ink, a ruled masthead, a draft or final status
mark, and a provenance footer. The visual break from the dark app is
deliberate, since an artifact is the thing you hand to someone. Exports are
dependency-free: .md Blob download, .png drawn to canvas at 2x for slides,
clipboard copy, and window.print (which also yields Save as PDF via the
@media print rules that strip nav, canvas, and action bars). Every paper
color verified at or above AA on the stock. Status derives from content:
any PENDING line keeps a document in draft.

Card rails carry suit identity only, never the card id. Codes like D-FIG-1
cannot wrap in a narrow rail without breaking, so ids sit in the card body.

Deck faces in-app: components/ui.tsx SuitCard carries the same anatomy as
the physical cards. The card id reads as the rank in a suit-colored rail,
the suit name runs vertically up the rail, and the suit glyph anchors the
foot. The card body takes a suit shade (.shade-signals and siblings), so a
card is identifiable by suit before its label is read.

The loop deck deals, it never shuffles. 01 through 04 is a sequence and
randomizing it would damage first-read comprehension. Cards deal in order
via .is-dealing with a per-card --deal-i delay, and Deal again replays it.
Reduced motion lands them instantly.

Roles carry heldBy, the person in the seat today. The deck still decides by
role so answers survive turnover, but a live session needs to know who to
chase. Empty heldBy renders a Seat unfilled flag. Naming a role is the most
frequent task on that page, so it sits at the top, above the kits.

Physical deck faces: components/SpineCard.tsx reproduces the Clarity Cards
Spine anatomy (white card, suit-colored rail with rank, rotated suit name,
glyph, then eyebrow, prompt, clarifier). Every dimension is a calc() off
--card-w, set on the .clarity-deck wrapper. Suit colors are the Clarity
Cards palette so both decks read as one product family.

Role kits (lib/deck.ts ROLE_KITS) are the on-ramp: pre-built role sets for
product teams, internal transformation, design system governance, and
regulated content ops. They lead the Roles page; blank-form authoring sits
at the bottom. Never let a team face an empty form first.

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
- Gate 2 (tsc --noEmit): full type check, identical to what Next runs in
  a production build. esbuild strips types without checking them, so this
  gate is what catches type errors before they reach Vercel.
- Gate 3 (scripts/gate-ssr.mjs): SSR render of all views under Node with
  content-marker assertions. Compile-clean is not sufficient.
Add markers to gate-ssr.mjs when adding views. Note: scripts/ is excluded
from tsconfig because it is gate tooling, not app code; the gates verify
themselves by running.

## Current state (v1, verified)

- Seven routes: / (Governance Health cockpit), /start (onboarding manual
  with a playable 60-second demo loop and workshop lead-gen card), /roles
  (roles, departments, async decision modes, and pairing), /gather,
  /converge, /artifacts.
- Roles are live session state, not a constant. Every decider card reads
  its options from store.roles, so editing a role changes what the team
  can choose during gather. Role carries department, decisionMode (decides
  alone, consults then decides, consensus with paired role, escalates to a
  lead), and pairedWith.
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
