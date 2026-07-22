"use client";

import { CARDS, SESSION_DATE } from "../../lib/deck";
import { classifyCard } from "../../lib/converge";
import { useSession } from "../../lib/store";
import { Widget } from "../ui";

export default function ArtifactsView() {
  const { responses, resolved } = useSession();

  const line = (cardId: string, label: string) => {
    const card = CARDS.find((c) => c.id === cardId)!;
    const result = classifyCard(card, responses[cardId]);
    const res = resolved[cardId];
    if (res) return "- " + label + ": " + res.value + "\n  Rationale: " + res.rationale;
    if (result.status === "agreed") return "- " + label + ": " + result.entries[0].value + " (aligned in gather)";
    return "- " + label + ": PENDING RECONCILIATION";
  };

  const decisionRights = [
    "# decision-rights.md",
    "Version: 1.0.0 (draft until every card reconciles)",
    "Session: Governance Workshop 01, async gather plus convergence",
    "Provenance: reconciled by Facilitator, " + SESSION_DATE,
    "",
    line("SIG-4", "What good looks like, decided by"),
    line("SIG-5", "Best for us now, decided by"),
    line("BND-4", "Craft-level sign-off"),
    line("TRC-2", "Rollback execution"),
  ].join("\n");

  const sig1 = classifyCard(CARDS.find((c) => c.id === "SIG-1")!, responses["SIG-1"]);
  const truthSignals = [
    "# truth-signals.md",
    "Version: 1.0.0 (draft until every card reconciles)",
    "Session: Governance Workshop 01",
    "Provenance: reconciled by Facilitator, " + SESSION_DATE,
    "",
    resolved["SIG-1"]
      ? "Adopted signal: " + resolved["SIG-1"].value + "\nRationale: " + resolved["SIG-1"].rationale
      : "Candidate signals (facilitator review pending):",
    ...(resolved["SIG-1"] ? [] : sig1.entries.map((e) => "- " + e.value + " (" + e.name + ")")),
  ].join("\n");

  return (
    <div className="space-y-4">
      <Widget eyebrow="Prove it worked" title="Generated artifacts" sub="Immutable versions">
        <p className="text-sm text-ink-2">
          Artifacts generate from reconciled and aligned cards, one file per suit. Versions are immutable. Amendments create a new version with provenance, never an overwrite. This is the rollback rule the deck teaches, enforced by the platform. Reconcile cards in Converge and watch these fill in.
        </p>
      </Widget>
      {[truthSignals, decisionRights].map((md, i) => (
        <pre key={i} className="bg-ground border border-line text-ink-2 text-xs rounded-xl p-4 overflow-x-auto whitespace-pre-wrap font-mono">{md}</pre>
      ))}
      <p className="text-sm text-ink-3">guardrails.md, rollback-rules.md, and change-protocol.md generate the same way from their suits.</p>
    </div>
  );
}
