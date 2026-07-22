"use client";

import { useState } from "react";
import { CARDS, Resolution } from "../../lib/deck";
import { classifyCard } from "../../lib/converge";
import { useSession } from "../../lib/store";
import { SuitCard, StatusChip, GapChip, Chip } from "../ui";

export default function ConvergeView() {
  const { responses, resolved, reconcile } = useSession();
  const [drafts, setDrafts] = useState<Record<string, Resolution>>({});
  const results = CARDS.map((c) => ({ card: c, result: classifyCard(c, responses[c.id]) }));
  const counts = {
    aligned: results.filter((r) => r.result.status === "agreed" && !resolved[r.card.id]).length,
    split: results.filter((r) => r.result.status === "divergent" && !resolved[r.card.id]).length,
    review: results.filter((r) => r.result.status === "review" && !resolved[r.card.id]).length,
    reconciled: Object.keys(resolved).length,
  };

  return (
    <div className="space-y-4">
      <div className="bg-surface rounded-xl border border-line p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-3 mb-1">Make it visible</p>
        <p className="text-xs text-ink-2 mb-3">
          Convergence. Aligned cards settle on their own. Split and review cards are the real governance work: the named decider reconciles each with a documented rationale. Only the conflicts need a room.
        </p>
        <div className="flex flex-wrap gap-2">
          <Chip tone="peri">{counts.aligned} aligned</Chip>
          <Chip tone="ember">{counts.split} split</Chip>
          <Chip tone="cobalt">{counts.review} in review</Chip>
          <Chip tone="brand">{counts.reconciled} reconciled</Chip>
        </div>
      </div>
      {results.map(({ card, result }) => {
        const res = resolved[card.id];
        const draft = drafts[card.id] || { value: "", rationale: "" };
        const needsWork = !res && (result.status === "divergent" || result.status === "review");
        const uniqueValues = [...new Set(result.entries.map((e) => e.value))];
        return (
          <SuitCard key={card.id} card={card}>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <StatusChip status={result.status} resolved={!!res} />
              <GapChip gap={result.gap} />
              {result.alignment != null && <Chip tone="cobalt">Alignment score: {result.alignment}/100</Chip>}
            </div>
            <div className="space-y-1.5 mb-3">
              {result.entries.map((e) => (
                <div key={e.personaId} className="flex gap-3 text-sm">
                  <span className="font-mono text-xs text-ink-3 w-24 shrink-0 pt-0.5">{e.name} &middot; {e.tier}</span>
                  <span className="text-ink-2">{e.value}</span>
                </div>
              ))}
            </div>
            {res && (
              <div className="bg-brand/10 border border-brand/40 rounded-lg p-3 text-sm">
                <p className="text-ink"><span className="font-mono text-xs text-peri">RESOLVED:</span> {res.value}</p>
                <p className="text-ink-2 text-xs mt-1">Rationale: {res.rationale}</p>
              </div>
            )}
            {needsWork && (
              <div className="border-t border-line pt-3 space-y-2">
                <p className="text-xs text-ink-3">Facilitator: adopt an answer or write the resolved value, then record the rationale.</p>
                <div className="flex flex-wrap gap-2">
                  {uniqueValues.map((v) => (
                    <button key={v} onClick={() => setDrafts({ ...drafts, [card.id]: { ...draft, value: v } })}
                      className={"px-2.5 py-1 rounded-full text-xs border " +
                        (draft.value === v ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
                      Adopt: {v.length > 48 ? v.slice(0, 48) + "..." : v}
                    </button>
                  ))}
                </div>
                <input value={draft.value}
                  onChange={(e) => setDrafts({ ...drafts, [card.id]: { ...draft, value: e.target.value } })}
                  placeholder="Resolved value"
                  className="w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
                <input value={draft.rationale}
                  onChange={(e) => setDrafts({ ...drafts, [card.id]: { ...draft, rationale: e.target.value } })}
                  placeholder="Rationale (required, becomes provenance)"
                  className="w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
                <button disabled={!draft.value || !draft.rationale}
                  onClick={() => reconcile(card.id, draft)}
                  className="pill-primary px-5 py-2.5 text-sm disabled:opacity-40">
                  Reconcile
                </button>
              </div>
            )}
          </SuitCard>
        );
      })}
    </div>
  );
}
