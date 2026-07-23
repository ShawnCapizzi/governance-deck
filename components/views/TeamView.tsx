"use client";

// Team, levels, and handoffs. The handoff panel is the part that matters:
// when someone goes away or leaves, their questions have to land somewhere
// or a round stalls silently. Every handoff is recorded with who, why, and
// until when, so continuity is auditable rather than remembered.

import { useState } from "react";
import {
  LEVELS, LEVEL_DESC, Level, Person, HandoffReason,
  permissionsFor, coveringFor, effectiveHolder, uncoveredPeople,
} from "../../lib/team";
import { useSession } from "../../lib/store";
import { Widget, Chip } from "../ui";
import { PageHeader } from "../PageHeader";
import { SectionRule } from "../SectionRule";
import {
  IconRoles, IconAdd, IconTransformation, IconEscalates,
  IconAligned, IconSplit, IconProduct,
} from "../Icons";

import { CARDS } from "../../lib/deck";

const TOTAL_QUESTIONS = CARDS.length;
const REASONS: HandoffReason[] = ["Out of office", "Left the organization", "Workload change"];
const TEAMS = ["Studio", "Creative", "Strategy", "Design Ops", "Content Ops", "Brand", "Delivery", "Legal and Compliance", "Executive"];

const inputClass =
  "w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-ink-2 mb-1">{label}</span>
      {children}
    </label>
  );
}

const LEVEL_TONE: Record<Level, "peri" | "cobalt" | "brand" | "neutral"> = {
  Owner: "brand",
  Curator: "peri",
  Contributor: "cobalt",
  Observer: "neutral",
};

export default function TeamView() {
  const {
    people, programs, handoffs, roles,
    addPerson, setLevel, setStatus, createHandoff, endHandoff,
    mode, org, user, updateMe, addProgram,
    rounds, round, setRoundId, openRound, advanceRound, progress,
  } = useSession();

  const [invite, setInvite] = useState({ name: "", email: "", level: "Contributor" as Level, team: TEAMS[1] });
  const [handoffFor, setHandoffFor] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [me, setMe] = useState({ displayName: "", team: TEAMS[1] });
  const [program, setProgram] = useState({ name: "", client: "" });
  const live = mode === "live";
  const canRun = org?.level === "Owner" || org?.level === "Curator";
  const answerers = people.filter((p) => p.level !== "Observer");
  const doneCount = answerers.filter((p) => (progress[p.id] ?? 0) >= TOTAL_QUESTIONS).length;
  const [draft, setDraft] = useState({ toId: "", reason: REASONS[0], note: "", until: "" });

  const nameOf = (id: string) => people.find((p) => p.id === id)?.name ?? "A teammate";
  const roleTitle = (roleId: string | null) => roles.find((r) => r.id === roleId)?.title ?? null;
  const uncovered = uncoveredPeople(people, handoffs);
  const activeHandoffs = handoffs.filter((h) => h.active);

  const submitInvite = () => {
    if (!invite.name.trim() || !invite.email.trim()) return;
    addPerson({ ...invite, name: invite.name.trim(), email: invite.email.trim(), status: "active", roleId: null });
    setInvite({ name: "", email: "", level: "Contributor", team: TEAMS[1] });
  };

  const submitHandoff = (fromId: string) => {
    if (!draft.toId) return;
    createHandoff({ fromId, toId: draft.toId, reason: draft.reason, note: draft.note.trim(), until: draft.until || null });
    if (draft.reason === "Left the organization") setStatus(fromId, "departed");
    else if (draft.reason === "Out of office") setStatus(fromId, "away");
    setHandoffFor(null);
    setDraft({ toId: "", reason: REASONS[0], note: "", until: "" });
  };

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="Set up"
        title="Your team"
        lead="Everyone who takes part sits here. Levels decide what a person can do: run things, answer questions, or just watch. When somebody goes away or leaves, hand their questions to someone else so a round never stalls waiting on an empty chair."
      />

      {uncovered.length > 0 && (
        <Widget eyebrow="Needs attention" title="Needs cover" sub={uncovered.length + " unassigned"}
          tone="action" icon={<IconSplit size={19} />}>
          <p className="text-sm text-ink-2 mb-3">
            These people are away or gone and nobody has picked up their questions. Anything assigned to them is stuck until someone does.
          </p>
          <div className="flex flex-wrap gap-2">
            {uncovered.map((p) => (
              <Chip key={p.id} tone="ember" icon={<IconSplit size={13} />}>{p.name}</Chip>
            ))}
          </div>
        </Widget>
      )}

      <SectionRule label="Programs" stage="set" />

      <Widget eyebrow="Brands and projects" title="Programs" sub={programs.length === 0 ? "None yet" : programs.length + (programs.length === 1 ? " program" : " programs")}
        icon={<IconProduct size={19} />}>
        <p className="text-base text-ink-2 mb-4 max-w-2xl">
          A program is one brand, client, or initiative. Rounds run inside it on a cadence, so you can compare where a team stood last quarter against where it stands now. A curator owns each one.
        </p>
        {live && (
          <div className="grid gap-3 sm:grid-cols-2 mb-4 border-b border-line pb-5">
            <Field label="Program name">
              <input className={inputClass} value={program.name} placeholder="Oncology Brand Team"
                onChange={(e) => setProgram({ ...program, name: e.target.value })} />
            </Field>
            <Field label="Client or scope">
              <input className={inputClass} value={program.client} placeholder="Internal, or a client name"
                onChange={(e) => setProgram({ ...program, client: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <button
                onClick={() => {
                  void addProgram(program.name.trim(), program.client.trim());
                  setProgram({ name: "", client: "" });
                }}
                disabled={!program.name.trim()}
                className="pill-primary px-5 py-2.5 text-sm gap-1.5">
                <IconAdd size={15} />
                Create program
              </button>
            </div>
          </div>
        )}
        {programs.length === 0 && !live && (
          <p className="text-sm text-ink-3 mb-3">No programs yet.</p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          {programs.map((pg) => (
            <div key={pg.id} className="rounded-xl border border-line bg-ground/60 p-4">
              <p className="text-base text-ink font-medium tracking-tight">{pg.name}</p>
              <p className="text-sm text-ink-2 mt-0.5">{pg.client}</p>
              {live && canRun && (
                <button onClick={() => void openRound(pg.id, "")}
                  className="mt-3 px-4 py-2 rounded-full text-base border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
                  Open a round here
                </button>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip tone="peri">Curator: {nameOf(pg.curatorId)}</Chip>
                <Chip>{pg.roundCount} rounds</Chip>
                <Chip tone="cobalt">{pg.lastRound}</Chip>
              </div>
            </div>
          ))}
        </div>
      </Widget>

      {live && <SectionRule label="Current round" stage="run" />}
      {live && (
        <Widget eyebrow="Current round" title={round ? round.label : "No round open"}
          sub={round ? round.programName : undefined}
          tone={round ? (round.status === "gathering" ? "action" : "done") : "neutral"}
          icon={<IconTransformation size={19} />}>
          {round ? (
            <div>
              <p className="text-base text-ink-2 max-w-2xl mb-4">
                {round.status === "gathering"
                  ? "People are answering now. Every answer stays private until you close gathering, then all of them become visible at once."
                  : round.status === "aligning"
                    ? "Answers are open to the team. Curators settle the questions where answers differed, each with a reason on record."
                    : "This round is closed. Open a new one to measure the same questions again and see what moved."}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                <Chip tone={round.status === "gathering" ? "ember" : "peri"}>
                  {doneCount} of {answerers.length} finished
                </Chip>
                {answerers.filter((p) => (progress[p.id] ?? 0) < TOTAL_QUESTIONS).map((p) => (
                  <Chip key={p.id}>{p.name}: {TOTAL_QUESTIONS - (progress[p.id] ?? 0)} left</Chip>
                ))}
              </div>
              {canRun && (
                <div className="flex flex-wrap items-center gap-3">
                  {round.status === "gathering" && (
                    <button onClick={() => void advanceRound("aligning")} className="pill-primary px-5 py-2.5 text-base">
                      Close gathering and reveal answers
                    </button>
                  )}
                  {round.status === "aligning" && (
                    <button onClick={() => void advanceRound("closed")} className="pill-primary px-5 py-2.5 text-base">
                      Close this round
                    </button>
                  )}
                  {rounds.length > 1 && (
                    <select value={round.id} onChange={(e) => setRoundId(e.target.value)}
                      className="rounded-lg bg-ground border border-line-strong px-3 py-2 text-base text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                      {rounds.map((r) => (
                        <option key={r.id} value={r.id}>{r.programName}: {r.label}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
              {round.status === "gathering" && !canRun && (
                <p className="text-base text-ink-3">A curator closes gathering once everyone has finished.</p>
              )}
            </div>
          ) : (
            <div>
              <p className="text-base text-ink-2 max-w-2xl mb-4">
                A round is one pass through the questions. Run it again next quarter against the same questions and the difference is your progress. {canRun ? "Pick a program below and open the first one." : "A curator opens the first one."}
              </p>
              {canRun && programs.length === 0 && (
                <p className="text-base text-ink-3">Create a program first, then open a round inside it.</p>
              )}
            </div>
          )}
        </Widget>
      )}

      {live && user && (
        <Widget eyebrow="You" title="How you appear to your team" sub="Everyone sees this">
          <p className="text-base text-ink-2 mb-4 max-w-2xl">
            Your name came from your email address, so it probably needs fixing. This is what teammates see next to your answers.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Your name">
              <input className={inputClass} value={me.displayName}
                placeholder={people.find((p) => p.id === user.id)?.name ?? "Your name"}
                onChange={(e) => setMe({ ...me, displayName: e.target.value })} />
            </Field>
            <Field label="Your team">
              <select className={inputClass} value={me.team}
                onChange={(e) => setMe({ ...me, team: e.target.value })}>
                {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <button
                onClick={() => void updateMe({ displayName: me.displayName.trim() || undefined, team: me.team })}
                disabled={!me.displayName.trim()}
                className="pill-primary px-5 py-2.5 text-sm">
                Save
              </button>
            </div>
          </div>
        </Widget>
      )}

      {live ? (
        <Widget eyebrow="Invites" title="Invite your team" sub="Share this code">
          <p className="text-base text-ink-2 mb-4 max-w-2xl">
            Send this code to anyone you want in. They sign in with their email, choose Join with a code, and land here as a Contributor. You can raise anyone to Curator below once they need to run rounds.
          </p>
          {org?.joinCode ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl tracking-[0.25em] text-ink bg-ground border border-line-strong rounded-lg px-4 py-2.5">
                {org.joinCode}
              </span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(org.joinCode as string);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="px-4 py-2 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
          ) : (
            <p className="text-sm text-ink-3">No join code on this organization yet.</p>
          )}
        </Widget>
      ) : (
        <Widget eyebrow="Invites" title="Invite someone" sub="Sample data only">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name">
              <input className={inputClass} value={invite.name} placeholder="Alex Moreau"
                onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            </Field>
            <Field label="Email">
              <input className={inputClass} value={invite.email} placeholder="alex@company.com"
                onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            </Field>
            <Field label="Team">
              <select className={inputClass} value={invite.team}
                onChange={(e) => setInvite({ ...invite, team: e.target.value })}>
                {TEAMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Level">
              <select className={inputClass} value={invite.level}
                onChange={(e) => setInvite({ ...invite, level: e.target.value as Level })}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <div className="sm:col-span-2">
              <p className="text-sm text-ink-3 mb-3">{LEVEL_DESC[invite.level]}</p>
              <button onClick={submitInvite} disabled={!invite.name.trim() || !invite.email.trim()}
                className="pill-primary px-5 py-2.5 text-sm gap-1.5">
                <IconAdd size={15} />
                Add to the sample team
              </button>
            </div>
          </div>
        </Widget>
      )}

      <SectionRule label="People and levels" stage="set" />

      {people.map((p: Person) => {
        const perms = permissionsFor(p.level);
        const covers = coveringFor(p.id, handoffs, people);
        const holder = effectiveHolder(p.id, handoffs);
        const handedTo = holder !== p.id ? nameOf(holder) : null;
        const mine = handoffs.find((h) => h.active && h.fromId === p.id);
        const open = handoffFor === p.id;
        return (
          <Widget key={p.id} eyebrow={p.team} title={p.name}
            sub={p.status === "active" ? undefined : p.status === "away" ? "Away" : "Departed"}
            icon={<IconRoles size={19} />}>
            <div className="flex flex-wrap gap-2 mb-3">
              <Chip tone={LEVEL_TONE[p.level]}>{p.level}</Chip>
              {roleTitle(p.roleId) && <Chip tone="cobalt">{roleTitle(p.roleId)}</Chip>}
              {perms.reconcile && <Chip tone="peri" icon={<IconAligned size={13} />}>Can settle open questions</Chip>}
              {!perms.answer && <Chip>Read only</Chip>}
              {handedTo && <Chip tone="ember" icon={<IconEscalates size={13} />}>Questions handed to {handedTo}</Chip>}
              {covers.map((cv) => (
                <Chip key={cv.id} tone="magenta" icon={<IconTransformation size={13} />}>Covering for {cv.name}</Chip>
              ))}
            </div>
            <p className="text-base text-ink-2 max-w-2xl">{LEVEL_DESC[p.level]}</p>

            {mine && (
              <div className="mt-3 rounded-lg border border-line bg-ground/60 p-3">
                <p className="text-sm text-ink">
                  {mine.reason}. {nameOf(mine.toId)} is covering{mine.until ? " until " + mine.until : " indefinitely"}.
                </p>
                {mine.note && <p className="text-sm text-ink-2 mt-1">{mine.note}</p>}
                <p className="text-xs text-ink-3 mt-1.5 font-mono">Recorded {mine.createdAt}</p>
                <button onClick={() => { endHandoff(mine.id); setStatus(p.id, "active"); }}
                  className="mt-2 text-sm text-peri hover:text-ink">
                  End cover and return questions
                </button>
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <label className="text-sm text-ink-2 inline-flex items-center gap-2">
                Level
                <select value={p.level} onChange={(e) => setLevel(p.id, e.target.value as Level)}
                  className="rounded-lg bg-ground border border-line-strong px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand">
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </label>
              {!mine && (
                <button onClick={() => setHandoffFor(open ? null : p.id)}
                  className="text-sm text-peri hover:text-ink">
                  {open ? "Cancel" : "Hand off their questions \u2192"}
                </button>
              )}
            </div>

            {open && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 border-t border-line pt-3">
                <Field label="Hand off to">
                  <select className={inputClass} value={draft.toId}
                    onChange={(e) => setDraft({ ...draft, toId: e.target.value })}>
                    <option value="">Choose a person</option>
                    {people.filter((x) => x.id !== p.id && x.status === "active" && permissionsFor(x.level).answer)
                      .map((x) => <option key={x.id} value={x.id}>{x.name}, {x.team}</option>)}
                  </select>
                </Field>
                <Field label="Reason">
                  <select className={inputClass} value={draft.reason}
                    onChange={(e) => setDraft({ ...draft, reason: e.target.value as HandoffReason })}>
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Until (leave empty if permanent)">
                  <input type="date" className={inputClass} value={draft.until}
                    onChange={(e) => setDraft({ ...draft, until: e.target.value })} />
                </Field>
                <Field label="Note">
                  <input className={inputClass} value={draft.note} placeholder="What the cover needs to know"
                    onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
                </Field>
                <div className="sm:col-span-2">
                  <button onClick={() => submitHandoff(p.id)} disabled={!draft.toId}
                    className="pill-primary px-5 py-2.5 text-sm gap-1.5">
                    <IconEscalates size={15} />
                    Record handoff
                  </button>
                </div>
              </div>
            )}
          </Widget>
        );
      })}

      {activeHandoffs.length > 0 && (
        <Widget eyebrow="Your profile" title="Handoff record" sub={activeHandoffs.length + " active"}>
          <p className="text-sm text-ink-2 mb-3">
            Every handoff is kept with a date and a reason. When someone new joins mid-effort, this is how they find out who has been carrying what.
          </p>
          <div className="divide-y divide-line/70 border-y border-line/70">
            {activeHandoffs.map((h) => (
              <div key={h.id} className="py-2.5">
                <p className="text-sm text-ink">
                  {nameOf(h.fromId)} &rarr; {nameOf(h.toId)}
                  <span className="text-ink-2"> &middot; {h.reason}</span>
                </p>
                <p className="text-xs text-ink-3 font-mono mt-0.5">
                  Recorded {h.createdAt}{h.until ? ", until " + h.until : ", permanent"}
                </p>
              </div>
            ))}
          </div>
        </Widget>
      )}
    </div>
  );
}
