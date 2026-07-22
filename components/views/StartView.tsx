"use client";

// Onboarding manual with a playable demo. Three jobs: the manual when
// teaching teams, the self-serve aha for lead gen, and the pitch page.
// The demo uses the real convergence engine on one real card, with
// teammates pre-seeded so the perception gap always fires.

import { useState } from "react";
import Link from "next/link";
import { CARDS } from "../../lib/deck";
import { classifyCard } from "../../lib/converge";
import { Widget, Chip, StatusChip, GapChip } from "../ui";

const DEMO_SEED: Record<string, string> = {
  p1: "Creative Director",
  p2: "Creative Director",
  p4: "Brand Owner",
  p5: "Brand Owner",
};
const STEPS = ["Answer", "See the split", "Reconcile", "Artifact"];

const LOOP = [
  { n: "01", name: "Gather", copy: "Everyone answers on their own time. Answers stay private until convergence, so nobody anchors on the first voice." },
  { n: "02", name: "Converge", copy: "Aligned cards settle themselves. Only the conflicts need attention, and each gets reconciled with a written rationale." },
  { n: "03", name: "Health", copy: "Every governance issue climbs a five-stage road from Ad hoc to Self-correcting. The deltas each cadence are the progress." },
  { n: "04", name: "Artifacts", copy: "Sessions emit versioned markdown artifacts. Amendments create new versions with provenance, never an overwrite." },
];

const ROLES_INFO = [
  { name: "Facilitator", copy: "Runs the session, reconciles split cards with a rationale, and publishes the artifacts." },
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
      <Widget eyebrow="Start here" title="How the deck works" sub="Two minutes, start to spine">
        <p className="text-sm text-ink-2 mb-4 max-w-2xl">
          The Governance Deck turns the uncomfortable conversations every team avoids into a repeatable loop. You answer cards, the system finds where your team actually disagrees, a named decider settles it on the record, and the decisions become living documents your whole org can fall in line with.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LOOP.map((l) => (
            <div key={l.n} className="bg-ground border border-line rounded-lg p-3">
              <p className="font-mono text-[11px] text-ink-3">{l.n}</p>
              <p className="text-sm text-ink mt-0.5">{l.name}</p>
              <p className="text-xs text-ink-2 mt-1">{l.copy}</p>
            </div>
          ))}
        </div>
      </Widget>

      <Widget eyebrow="Listen first" title="Try the loop" sub="One card, 60 seconds" glow>
        <div className="flex flex-wrap gap-2 mb-4">
          {STEPS.map((s, i) => (
            <Chip key={s} tone={i === step ? "brand" : i < step ? "peri" : "neutral"}>{i + 1}. {s}</Chip>
          ))}
        </div>

        {step === 0 && (
          <div>
            <p className="text-sm text-ink mb-1">{demoCard.prompt}</p>
            <p className="text-xs text-ink-3 mb-3">Four teammates already answered async. Their answers are hidden from you, and yours is hidden from them. Pick honestly.</p>
            <div className="flex flex-wrap gap-2">
              {(demoCard.options || []).map((opt) => (
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
                <div key={e.personaId} className="flex gap-3 text-sm">
                  <span className="font-mono text-xs text-ink-3 w-24 shrink-0 pt-0.5">
                    {e.personaId === "p3" ? "You" : e.name} &middot; {e.tier}
                  </span>
                  <span className={e.personaId === "p3" ? "text-ink" : "text-ink-2"}>{e.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-ink-2 mb-4 max-w-xl">
              This is the moment most teams never see. Leads believe one thing, the team believes another, and both sides think everyone agrees. Left alone, this hardens into two realities. The deck catches it while it is still just a card.
            </p>
            <button onClick={() => setStep(2)} className="pill-primary px-5 py-2.5 text-sm">
              Reconcile it
            </button>
          </div>
        )}

        {step === 2 && result && (
          <div className="space-y-2">
            <p className="text-xs text-ink-3">You are the facilitator now. Adopt an answer or write the resolved value, then record the rationale. The rationale becomes provenance.</p>
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
              That is the whole loop. A disagreement your team did not know it had is now a documented decision with a name and a reason attached. The full session does this across five suits and emits one artifact per suit.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/gather" className="pill-primary px-5 py-2.5 text-sm">Run the full session</Link>
              <Link href="/" className="text-sm text-peri hover:text-ink">See Governance Health &rarr;</Link>
              <button onClick={() => { setStep(0); setPick(""); setResValue(""); }} className="text-sm text-ink-3 hover:text-ink-2">Replay</button>
            </div>
          </div>
        )}
      </Widget>

      <div className="grid gap-4 md:grid-cols-2">
        <Widget eyebrow="Make it visible" title="Who does what">
          <div className="divide-y divide-line">
            {ROLES_INFO.map((r) => (
              <div key={r.name} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-ink">{r.name}</p>
                <p className="text-xs text-ink-2 mt-0.5">{r.copy}</p>
              </div>
            ))}
          </div>
        </Widget>

        <Widget eyebrow="Prove it worked" title="Set your team up for success">
          <div className="divide-y divide-line">
            {SETUP.map((s) => (
              <div key={s.n} className="py-3 first:pt-0 last:pb-0 flex gap-3">
                <span className="font-mono text-xs text-ink-3 pt-0.5">{s.n}</span>
                <div>
                  <p className="text-sm text-ink">{s.name}</p>
                  <p className="text-xs text-ink-2 mt-0.5">{s.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      <Widget eyebrow="The Capizzi Process" title="Bring this to your org" laser>
        <p className="text-sm text-ink-2 mb-4 max-w-2xl">
          This app is the digital half of the Capizzi Governance Deck, a facilitated workshop that sets your team&apos;s spine in one session and measures it every cadence after. Run it yourself with the demo session, or bring in the facilitator who built it. Built by Shawn Capizzi on the Capizzi Process: Listen First, Make It Visible, Prove It Worked.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a href="https://www.shawncapizzi.com" className="pill-primary px-5 py-2.5 text-sm">Book a workshop</a>
          <Link href="/gather" className="text-sm text-peri hover:text-ink">Or run the demo session first &rarr;</Link>
        </div>
      </Widget>
    </div>
  );
}
