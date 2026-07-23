"use client";

// Onboarding manual with a playable demo. Three jobs: the manual when
// teaching teams, the self-serve aha for lead gen, and the pitch page.
// The demo uses the real convergence engine on one real card, with
// teammates pre-seeded so the perception gap always fires.

import { useEffect, useState } from "react";
import Link from "next/link";
import { CARDS } from "../../lib/deck";
import { classifyCard } from "../../lib/converge";
import { Widget, Chip, StatusChip, GapChip } from "../ui";
import { SpineCard, SpineCardData } from "../SpineCard";
import { IconTransformation } from "../Icons";
import { useSession } from "../../lib/store";

const DEMO_SEED: Record<string, string> = {
  p1: "Creative Director",
  p2: "Creative Director",
  p4: "Brand Owner",
  p5: "Brand Owner",
};
const STEPS = ["Answer", "See where it stands", "Reconcile", "Artifact"];

const LOOP: SpineCardData[] = [
  { rank: "01", suit: "Answer", color: "#6355BB", glyph: "\u25C6",
    eyebrow: "Everyone, on their own time", prompt: "Gather",
    clarifier: "Each person answers privately. Nobody sees anyone else's answer, so nobody anchors on the loudest voice." },
  { rank: "02", suit: "Resolve", color: "#42499E", glyph: "\u25A0",
    eyebrow: "Only where answers differ", prompt: "Converge",
    clarifier: "Matching answers settle themselves. Only the real gaps need attention, and each is settled on the record." },
  { rank: "03", suit: "Track", color: "#AC64B4", glyph: "\u25B2",
    eyebrow: "Measured every cycle", prompt: "Health",
    clarifier: "Each problem climbs five stages, from no agreed rule to a team that corrects itself without you." },
  { rank: "04", suit: "Share", color: "#1B6D68", glyph: "\u2726",
    eyebrow: "Yours to keep and send", prompt: "Documents",
    clarifier: "Your decisions become dated documents you can download, drop into a deck, or hand to someone new." },
];

const ROLES_INFO = [
  { name: "Facilitator", copy: "Runs the round, settles open questions with a reason on record, and publishes the documents." },
  { name: "Leads", copy: "Run the deep pass first. They set the spine: truth signals, decision rights, and guardrails." },
  { name: "Team", copy: "Run the second pass. They pressure-test the spine against daily reality, which is where perception gaps surface." },
];

const SETUP = [
  { n: "1", name: "Name the decider roles", copy: "Roles, not people. The deck asks who decides, so the answer has to survive turnover." },
  { n: "2", name: "Invite by tier", copy: "Leads first, then the wider team. The two passes are what expose the gap between belief and practice." },
  { n: "3", name: "Pick your first issue", copy: "One real, nagging problem. Broken components, overwritten files, or a word the team defines five ways." },
  { n: "4", name: "Set the cadence", copy: "Diagnostics re-run quarterly or per engagement. The trend line is the product." },
];

export default function StartView() {
  const { roles } = useSession();
  // The loop deals in order and is never shuffled: 01 through 04 is a
  // sequence, and randomizing it would damage first-read comprehension.
  const [dealKey, setDealKey] = useState(0);
  const [dealing, setDealing] = useState(false);
  useEffect(() => {
    setDealing(true);
    const t = setTimeout(() => setDealing(false), 1100);
    return () => clearTimeout(t);
  }, [dealKey]);
  const demoCard = CARDS.find((c) => c.id === "SIG-4")!;
  const [step, setStep] = useState(0);
  const [pick, setPick] = useState("");
  const [resValue, setResValue] = useState("");
  const [rationale, setRationale] = useState("Craft calls stay with the Creative Director, with the Brand Owner consulted.");
  const result = pick ? classifyCard(demoCard, { ...DEMO_SEED, p3: pick }) : null;

  const artifactMd = [
    "# decision-rights.md",
    "Version: 1.0.0",
    "Provenance: reconciled by You, rationale on record",
    "",
    "- What good looks like, decided by: " + resValue,
    "  Rationale: " + rationale,
  ].join("\n");

  return (
    <div className="grid gap-4">
      <Widget eyebrow="Start here" title="Run smarter, together" sub="Why this exists" glow>
        <p className="text-base text-ink-2 max-w-2xl mb-5 leading-relaxed">
          Most teams lose speed to the same thing: decisions nobody actually made. Everyone assumes there is alignment on who decides what, until something breaks and it turns out there never was. This app asks those questions directly, shows exactly where your team is aligned and where it is not, settles the open ones on the record, and turns the answers into documents your whole business can run on.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-line bg-ground/60 p-4">
            <p className="text-base text-ink font-medium tracking-tight">Fewer meetings</p>
            <p className="text-base text-ink-2 mt-1">Everyone answers on their own time. No calendar hunt, no room, no anchoring on the loudest voice.</p>
          </div>
          <div className="rounded-xl border border-line bg-ground/60 p-4">
            <p className="text-base text-ink font-medium tracking-tight">Less rework</p>
            <p className="text-base text-ink-2 mt-1">Gaps show up at the start, not in launch week when they are expensive.</p>
          </div>
          <div className="rounded-xl border border-line bg-ground/60 p-4">
            <p className="text-base text-ink font-medium tracking-tight">A faster yes</p>
            <p className="text-base text-ink-2 mt-1">Settled decisions stop being reopened, so work moves and stays moved.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/gather" className="pill-primary px-6 py-3 text-base">Start answering</Link>
          <a href="#try" className="px-5 py-2.5 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
            Watch it work in 60 seconds
          </a>
        </div>
      </Widget>

      <Widget eyebrow="Start here" title="How it works" sub="Four steps, on your schedule">
        <p className="text-base text-ink-2 mb-4 max-w-2xl">
          You answer questions privately, the app finds where your answers differ, a named decider settles each one with a reason attached, and the decisions become dated documents anyone new can pick up and follow.
        </p>
        <div className="clarity-deck flex flex-wrap justify-center gap-4 md:gap-5 pt-2 pb-1">
          {LOOP.map((card, i) => (
            <SpineCard key={card.rank + "-" + dealKey} card={card}
              tilt={[-2.5, 1.5, -1.5, 2.5][i]} dealIndex={i} dealing={dealing} />
          ))}
        </div>
        <div className="flex justify-center pt-4">
          <button onClick={() => setDealKey((k) => k + 1)}
            className="text-sm text-peri hover:text-ink inline-flex items-center gap-2">
            <IconTransformation size={15} />
            Deal again
          </button>
        </div>
      </Widget>

      <div id="try" className="scroll-mt-6">
      <Widget eyebrow="Try it" title="Try the loop" sub="One card, 60 seconds" glow>
        <div className="flex flex-wrap gap-2 mb-4">
          {STEPS.map((s, i) => (
            <Chip key={s} tone={i === step ? "brand" : i < step ? "peri" : "neutral"}>{i + 1}. {s}</Chip>
          ))}
        </div>

        {step === 0 && (
          <div>
            <p className="text-sm text-ink mb-1">{demoCard.prompt}</p>
            <p className="text-sm text-ink-3 mb-3">Four teammates already answered async. Their answers are hidden from you, and yours is hidden from them. Pick honestly.</p>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => r.title).map((opt) => (
                <button key={opt} onClick={() => setPick(opt)}
                  className={"px-3 py-1.5 rounded-full text-sm border " +
                    (pick === opt ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
                  {opt}
                </button>
              ))}
            </div>
            <button disabled={!pick} onClick={() => setStep(1)}
              className="mt-4 pill-primary px-5 py-2.5 text-sm disabled:opacity-40">
              Submit and reveal the team
            </button>
          </div>
        )}

        {step === 1 && result && (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusChip status={result.status} resolved={false} />
              <GapChip gap={result.gap} />
            </div>
            <div className="space-y-1.5 mb-3">
              {result.entries.map((e) => (
                <div key={e.personaId} className="flex gap-3 text-sm md:text-base">
                  <span className="font-mono text-xs text-ink-3 w-24 shrink-0 pt-0.5">
                    {e.personaId === "p3" ? "You" : e.name} &middot; {e.tier}
                  </span>
                  <span className={e.personaId === "p3" ? "text-ink" : "text-ink-2"}>{e.value}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-ink-2 mb-4 max-w-xl">
              This is the moment most teams never see. Leads believe one thing, the team believes another, and both sides think everyone agrees. Left alone, this hardens into two realities. The deck catches it while it is still just a card.
            </p>
            <button onClick={() => setStep(2)} className="pill-primary px-5 py-2.5 text-sm">
              Reconcile it
            </button>
          </div>
        )}

        {step === 2 && result && (
          <div className="space-y-2">
            <p className="text-sm text-ink-3">You are the facilitator now. Adopt an answer or write the resolved value, then record the rationale. The rationale becomes provenance.</p>
            <div className="flex flex-wrap gap-2">
              {[...new Set(result.entries.map((e) => e.value))].map((v) => (
                <button key={v} onClick={() => setResValue(v)}
                  className={"px-2.5 py-1 rounded-full text-xs border " +
                    (resValue === v ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
                  Adopt: {v}
                </button>
              ))}
            </div>
            <input value={resValue} onChange={(e) => setResValue(e.target.value)} placeholder="Resolved value"
              className="w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
            <input value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Rationale (required)"
              className="w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
            <button disabled={!resValue || !rationale} onClick={() => setStep(3)}
              className="pill-primary px-5 py-2.5 text-sm disabled:opacity-40">
              Reconcile
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <pre className="bg-ground border border-line text-ink-2 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono mb-3">{artifactMd}</pre>
            <p className="text-sm text-ink-2 mb-4 max-w-xl">
              That is the whole loop. A gap your team did not know it had is now a documented decision with a name and a reason attached. A full round does this across every question area and produces one document per area.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/gather" className="pill-primary px-5 py-2.5 text-sm">Start answering for real</Link>
              <Link href="/" className="text-sm text-peri hover:text-ink">See Governance Health &rarr;</Link>
              <button onClick={() => { setStep(0); setPick(""); setResValue(""); }} className="text-sm text-ink-3 hover:text-ink-2">Replay</button>
            </div>
          </div>
        )}
      </Widget>

      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Widget eyebrow="Who does what" title="Who does what">
          <div className="divide-y divide-line">
            {ROLES_INFO.map((r) => (
              <div key={r.name} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-ink">{r.name}</p>
                <p className="text-sm text-ink-2 mt-0.5">{r.copy}</p>
              </div>
            ))}
          </div>
        </Widget>

        <Widget eyebrow="Getting set up" title="Set your team up for success">
          <div className="divide-y divide-line">
            {SETUP.map((s) => (
              <div key={s.n} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                <span className="font-mono text-xs text-ink-3 pt-0.5">{s.n}</span>
                <div>
                  <p className="text-sm text-ink">{s.name}</p>
                  <p className="text-sm text-ink-2 mt-0.5">{s.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      <Widget eyebrow="Going further" title="Bring this to your org" laser>
        <p className="text-base text-ink-2 mb-4 max-w-2xl">
          You can run everything here on your own. When a team needs to go wider than the app, there is a facilitated version: a printed card deck and a workshop that works through the same questions in a room, plus the broader method behind it. Worth exploring only if you want to take this further than the app.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/gather" className="pill-primary px-5 py-2.5 text-sm">Start a round</Link>
          <a href="https://www.shawncapizzi.com" className="px-5 py-2.5 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
            Explore the workshop and card deck
          </a>
        </div>
        <p className="text-xs text-ink-3 mt-4">
          Built by Shawn Capizzi. The method behind it is the Capizzi Process: listen first, make it visible, prove it worked.
        </p>
      </Widget>
    </div>
  );
}
