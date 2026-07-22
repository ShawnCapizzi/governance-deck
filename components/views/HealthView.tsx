"use client";

// The cockpit. Amplenote dashboard grammar applied to governance:
// score hero (the one place the brand gradient lives), a Facilitator
// queue modeled on the goal-coach pattern, then one widget per issue
// with a five-stage maturity strip.

import Link from "next/link";
import { CARDS, ISSUES, STAGES } from "../../lib/deck";
import { classifyCard, openWork } from "../../lib/converge";
import { useSession } from "../../lib/store";
import { Widget, Chip, StatusChip, GapChip } from "../ui";
import { WordmarkWatermark } from "../Wordmark";

export default function HealthView() {
  const { responses, resolved } = useSession();
  const overall = Math.round(
    (ISSUES.reduce((acc, i) => acc + Math.min(i.stage / i.target, 1), 0) / ISSUES.length) * 100
  );
  const queue = openWork(CARDS, responses, resolved).slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Widget eyebrow="Prove it worked" title="Governance Health" sub="Workshop 01" className="md:col-span-2" laser>
        <WordmarkWatermark className="-right-6 -bottom-4 w-64 md:w-80 text-ink opacity-[0.045]" />
        <div className="flex items-end justify-between gap-4">
          <p className="text-sm text-ink-2 max-w-md">
            Progress of every active issue toward its target stage. Success met when all issues hold at or above target. Diagnostics re-run on cadence, and the deltas are the road.
          </p>
          <p className="font-mono text-4xl text-ink leading-none">{overall}%</p>
        </div>
        <div className="mt-4 h-2 rounded-full bg-ground border border-line overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-peri via-brand to-magenta" style={{ width: overall + "%" }} />
        </div>
      </Widget>

      <Widget eyebrow="Converge" title="Facilitator queue" sub={queue.length + " open"} className="md:col-span-2">
        {queue.length === 0 ? (
          <p className="text-sm text-ink-2">Every card is aligned or reconciled. The spine holds.</p>
        ) : (
          <div className="divide-y divide-line">
            {queue.map(({ card, result }) => (
              <div key={card.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-sm text-ink">{card.prompt}</p>
                <p className="text-sm text-ink-2 mt-1">
                  {result.gap
                    ? "Leads and team answered differently. Reconcile before it hardens into two realities."
                    : "Answers split in gather. The named decider resolves with a documented rationale."}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Chip tone="neutral">{card.id}</Chip>
                  <StatusChip status={result.status} resolved={false} />
                  {result.gap && <Chip tone="magenta">gap</Chip>}
                  <Chip tone={result.gap ? "ember" : "neutral"}>priority {result.gap ? "9/10" : "6/10"}</Chip>
                  <Link href="/converge" className="text-xs text-peri hover:text-ink ml-auto">
                    Open in Converge &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </Widget>

      {ISSUES.map((issue) => {
        const diags = CARDS.filter((c) => c.issueId === issue.id)
          .map((c) => ({ card: c, result: classifyCard(c, responses[c.id]) }));
        const gaps = diags.filter((d) => d.result.gap);
        const alignCard = diags.find((d) => d.result.alignment != null);
        return (
          <Widget key={issue.id} eyebrow={issue.domain} title={issue.title} sub={"Target: " + STAGES[issue.target - 1]}>
            <p className="text-sm text-ink-2 mb-4">{issue.problem}</p>
            <div className="flex gap-1 mb-3">
              {STAGES.map((s, idx) => {
                const n = idx + 1;
                const filled = n <= issue.stage;
                const isTarget = n === issue.target;
                return (
                  <div key={s} className="flex-1 min-w-0">
                    <div className={"h-2 rounded " + (filled ? "bg-brand" : "bg-ground border border-line") + (isTarget ? " ring-2 ring-ember" : "")} />
                    <p className={"text-[10px] mt-1 truncate " + (filled ? "text-ink-2" : "text-ink-3")}>{s}</p>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Chip>Stage {issue.stage} of target {issue.target}</Chip>
              {issue.stage > issue.prevStage
                ? <Chip tone="peri">Up from stage {issue.prevStage} last cadence</Chip>
                : <Chip>Holding since last cadence</Chip>}
              {gaps.map((g) => <GapChip key={g.card.id} gap={g.result.gap} />)}
              {alignCard && <Chip tone="cobalt">Definition alignment: {alignCard.result.alignment}/100</Chip>}
            </div>
          </Widget>
        );
      })}
    </div>
  );
}
