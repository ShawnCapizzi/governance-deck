"use client";

// Answering. In live mode you answer as yourself and the persona switcher
// is gone: letting a signed-in person answer as someone else would corrupt
// the whole point, which is finding out what each person actually thinks.
//
// Participation design: one question is in focus at a time. A wall of
// fourteen questions reads as homework and gets abandoned; one question
// with visible progress gets finished. Answered questions collapse to a
// single line you can reopen.

import { useMemo, useState } from "react";
import Link from "next/link";
import { CARDS, FREQ, PERSONAS, DEMO_ME } from "../../lib/deck";
import { useSession } from "../../lib/store";
import { SuitCard, Widget, Chip } from "../ui";
import { PageHeader } from "../PageHeader";
import { IconDecidesAlone, IconAligned, IconSplit } from "../Icons";

export default function GatherView() {
  const { responses, setResponse, roles, mode, user, people, round } = useSession();
  const live = mode === "live";
  const noRound = live && !round;
  const sealed = live && round?.status !== "gathering";
  const [demoPersona, setDemoPersona] = useState(DEMO_ME.id);
  const [openId, setOpenId] = useState<string | null>(null);

  const whoId = live && user ? user.id : demoPersona;
  const me = live ? people.find((p) => p.id === whoId) : [DEMO_ME, ...PERSONAS].find((p) => p.id === demoPersona);
  const myName = me?.name ?? "You";
  const myTeam = live ? (me as { team?: string } | undefined)?.team ?? "" : (me as { tier?: string } | undefined)?.tier ?? "";

  const answeredIds = useMemo(
    () => new Set(CARDS.filter((c) => (responses[c.id] || {})[whoId]).map((c) => c.id)),
    [responses, whoId]
  );
  const remaining = CARDS.filter((c) => !answeredIds.has(c.id));
  const pct = Math.round((answeredIds.size / CARDS.length) * 100);
  const current = openId
    ? CARDS.find((c) => c.id === openId)
    : remaining[0];
  const done = remaining.length === 0;

  const optionsFor = (card: (typeof CARDS)[number]) =>
    card.type === "frequency" ? FREQ
      : card.type === "binary" ? ["Yes", "No"]
      : roles.map((r) => r.title);

  const answer = (cardId: string, value: string) => {
    setResponse(cardId, whoId, value);
    if (openId === cardId) setOpenId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader eyebrow="Run it" title="Your questions" lead="Answer on your own schedule. Nobody sees your answers until everyone has finished." />

      {noRound && (
        <Widget eyebrow="Run it" title="No round is open yet" tone="neutral" icon={<IconSplit size={19} />}>
          <p className="text-base text-ink-2 max-w-2xl mb-4">
            Questions are asked inside a round, which is one pass through the deck that you can run again next quarter and compare. A curator opens the first one.
          </p>
          <Link href="/team" className="pill-primary px-5 py-2.5 text-base">Open a round</Link>
        </Widget>
      )}

      {sealed && (
        <Widget eyebrow="Run it" title="This round has closed for answers" tone="done" icon={<IconAligned size={19} />}>
          <p className="text-base text-ink-2 max-w-2xl mb-4">
            Gathering is finished, so answers can no longer be changed. Every answer is now visible to the whole team, which is the point: you can see where you already agree and where you do not.
          </p>
          <Link href="/converge" className="pill-primary px-5 py-2.5 text-base">See where you stand</Link>
        </Widget>
      )}

      {!noRound && !sealed && (
      <Widget
        eyebrow="Progress"
        title={done ? "You are done" : remaining.length + (remaining.length === 1 ? " question left" : " questions left")}
        sub={answeredIds.size + " of " + CARDS.length}
        tone={done ? "done" : "action"}
        icon={done ? <IconAligned size={19} /> : <IconSplit size={19} />}
      >
        {done ? (
          <div>
            <p className="text-base text-ink-2 mb-4 max-w-2xl">
              Every question has your answer on it. Nothing else is needed from you right now. Once your teammates finish, whoever is settling open questions will work through the ones where answers differed, and the decisions become documents everyone can read.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/converge" className="pill-primary px-5 py-2.5 text-sm">See where the team stands</Link>
              <button onClick={() => setOpenId(CARDS[0].id)} className="text-sm text-peri hover:text-ink">
                Change an answer
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-base text-ink-2 mb-4 max-w-2xl">
              Answer honestly and briefly. A few words is a real answer. Nobody sees what you wrote until everyone has finished, so there is nothing to gain by matching what you think the room wants.
            </p>
            <div className="h-2 rounded-full bg-ground border border-line overflow-hidden">
              <div className="h-full bg-ember transition-all duration-300" style={{ width: pct + "%" }} />
            </div>
            <p className="text-sm text-ink-3 mt-2 font-mono">
              {myName}
              {myTeam && myTeam !== "Unassigned" ? <> &middot; {myTeam}</> : null}
              {" "}&middot; about {Math.max(1, remaining.length)} minute{remaining.length === 1 ? "" : "s"} left
            </p>
          </div>
        )}
      </Widget>

      )}

      {!live && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-ink-3">Sample team. You are answering as yourself; switch to see how others answered:</span>
          {[DEMO_ME, ...PERSONAS].map((p) => (
            <button key={p.id} onClick={() => { setDemoPersona(p.id); setOpenId(null); }}
              className={"px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-2 " +
                (p.id === demoPersona ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
              <IconDecidesAlone size={14} />
              {p.name}
            </button>
          ))}
        </div>
      )}

      {current && !noRound && !sealed && (
        <SuitCard card={current}>
          {current.type === "text" || current.type === "blind_definition" ? (
            <FreeText
              key={current.id}
              initial={(responses[current.id] || {})[whoId] || ""}
              onSave={(v) => answer(current.id, v)}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {optionsFor(current).map((opt) => {
                const selected = (responses[current.id] || {})[whoId] === opt;
                return (
                  <button key={opt} onClick={() => answer(current.id, opt)}
                    className={"px-3.5 py-2 rounded-full text-sm border " +
                      (selected ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </SuitCard>
      )}

      {answeredIds.size > 0 && !noRound && (
        <Widget eyebrow="Your questions" title="Answered" sub={answeredIds.size + " done"} tone="done"
          icon={<IconAligned size={19} />}>
          <div className="divide-y divide-line/70 border-y border-line/70">
            {CARDS.filter((c) => answeredIds.has(c.id)).map((c) => (
              <button key={c.id} onClick={() => setOpenId(c.id)}
                className="w-full text-left py-2.5 flex flex-wrap gap-x-3 gap-y-1 items-baseline hover:bg-raised/40">
                <span className="text-sm text-ink flex-1 min-w-0">{c.prompt}</span>
                <Chip tone="peri">{(responses[c.id] || {})[whoId]?.slice(0, 40)}</Chip>
              </button>
            ))}
          </div>
          <p className="text-sm text-ink-3 mt-3">Tap any line to change your answer.</p>
        </Widget>
      )}
    </div>
  );
}

// Free text saves on blur or Enter rather than per keystroke, so a
// half-typed thought never counts as an answer.
function FreeText({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <textarea value={value} rows={2} autoFocus
        placeholder="A few words is enough"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && value.trim()) {
            e.preventDefault();
            onSave(value.trim());
          }
        }}
        className="w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <button onClick={() => value.trim() && onSave(value.trim())} disabled={!value.trim()}
          className="pill-primary px-5 py-2 text-sm">
          Save and next
        </button>
        <span className="text-sm text-ink-3">Enter to save</span>
      </div>
    </div>
  );
}
