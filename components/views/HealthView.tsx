"use client";

// The cockpit. Amplenote dashboard grammar applied to governance:
// score hero (the one place the brand gradient lives), a Facilitator
// queue modeled on the goal-coach pattern, then one widget per issue
// with a five-stage maturity strip.

import Link from "next/link";
import { CARDS, ISSUES, STAGES, PERSONAS, DEMO_ME } from "../../lib/deck";
import { classifyCard, openWork } from "../../lib/converge";
import { useSession } from "../../lib/store";
import { Widget, Chip, StatusChip, GapChip } from "../ui";
import { WordmarkWatermark } from "../Wordmark";
import { IconSystem, IconArtifacts, IconListen, IconSplit, IconAligned, IconHealth } from "../Icons";

const DOMAIN_ICON: Record<string, (p: { size?: number }) => React.ReactElement> = {
  "Design Ops": IconSystem,
  "Content Ops": IconArtifacts,
  Strategy: IconListen,
};

export default function HealthView() {
  const { responses, resolved, mode, people } = useSession();
  const roster = mode === "live"
    ? people.map((p) => ({ id: p.id, name: p.name }))
    : [DEMO_ME, ...PERSONAS].map((p) => ({ id: p.id, name: p.name }));
  const progress = roster.map((p) => {
    const n = CARDS.filter((c) => (responses[c.id] || {})[p.id]).length;
    return { ...p, answered: n, done: n === CARDS.length };
  });
  const finished = progress.filter((p) => p.done);
  const waiting = progress.filter((p) => !p.done);
  const overall = Math.round(
    (ISSUES.reduce((acc, i) => acc + Math.min(i.stage / i.target, 1), 0) / ISSUES.length) * 100
  );
  const queue = openWork(CARDS, responses, resolved).slice(0, 3);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Widget eyebrow="Progress" title="Governance Health" sub="Workshop 01" className="md:col-span-2" laser icon={<IconHealth size={19} />}>
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

      <Widget eyebrow="Progress" title={waiting.length === 0 ? "Everyone has answered" : "Waiting on " + waiting.length}
        sub={finished.length + " of " + roster.length + " done"}
        tone={waiting.length === 0 ? "done" : "action"}
        icon={waiting.length === 0 ? <IconAligned size={19} /> : <IconSplit size={19} />}
        className="md:col-span-2">
        <p className="text-sm text-ink-2 mb-4 max-w-2xl">
          {waiting.length === 0
            ? "Every person has finished their questions, so nothing is blocked. What is left is settling the ones where the team disagreed."
            : "A round cannot be settled until everyone has answered, because a missing voice looks the same as agreement. These people still have questions open."}
        </p>
        <div className="flex flex-wrap gap-2">
          {waiting.map((p) => (
            <Chip key={p.id} tone="ember">{p.name}: {CARDS.length - p.answered} left</Chip>
          ))}
          {finished.map((p) => (
            <Chip key={p.id} tone="peri" icon={<IconAligned size={13} />}>{p.name}</Chip>
          ))}
        </div>
      </Widget>

      <Widget eyebrow="Needs you" title="Where the team disagreed" sub={queue.length + " open"}
        tone={queue.length ? "action" : "done"} icon={<IconSplit size={19} />} className="md:col-span-2">
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
                  <Link href="/converge" className="text-sm text-peri hover:text-ink ml-auto">
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
          <Widget key={issue.id} eyebrow={issue.domain} title={issue.title} sub={"Target: " + STAGES[issue.target - 1]}
            icon={(() => { const I = DOMAIN_ICON[issue.domain] ?? IconSystem; return <I size={19} />; })()}>
            <p className="text-sm text-ink-2 mb-4">{issue.problem}</p>
            <div className="flex gap-1 mb-3">
              {STAGES.map((s, idx) => {
                const n = idx + 1;
                const filled = n <= issue.stage;
                const isTarget = n === issue.target;
                return (
                  <div key={s} className="flex-1 min-w-0">
                    <div className={"h-2.5 rounded-sm " + (filled ? "bg-magenta/80" : "bg-ground border border-line") + (isTarget ? " ring-2 ring-ember ring-offset-1 ring-offset-transparent" : "")} />
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
