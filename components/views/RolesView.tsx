"use client";

// Roles and decision rights. Every decider card in the deck reads its
// options from this list, so editing a role here changes what the whole
// team can choose during gather. Departments answer who owns the call,
// decision modes answer how it gets made when nobody is in a room, and
// pairing answers who has to agree before it counts.

import { useState } from "react";
import { DECISION_MODES, DEPARTMENTS, DecisionMode, Role, ROLE_KITS } from "../../lib/deck";
import { useSession } from "../../lib/store";
import { Widget, Chip } from "../ui";
import { PageHeader } from "../PageHeader";
import {
  IconProduct, IconTransformation, IconSystem, IconRegulated,
  IconDecidesAlone, IconConsults, IconConsensus, IconEscalates, IconAdd,
} from "../Icons";

const KIT_ICON = {
  product: IconProduct,
  transformation: IconTransformation,
  system: IconSystem,
  regulated: IconRegulated,
} as const;

const MODE_ICON: Record<DecisionMode, (p: { size?: number }) => React.ReactElement> = {
  "Decides alone": IconDecidesAlone,
  "Consults, then decides": IconConsults,
  "Consensus with paired role": IconConsensus,
  "Escalates to a lead": IconEscalates,
};

const MODE_NOTE: Record<DecisionMode, string> = {
  "Decides alone": "Settles open questions without waiting. Fastest, and the reason carries the weight.",
  "Consults, then decides": "Gathers input async, then calls it. Input is required, agreement is not.",
  "Consensus with paired role": "Both roles must agree before a card is reconciled. Slower, and harder to overturn later.",
  "Escalates to a lead": "Does not resolve alone. Routes the card up with the divergence attached.",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm text-ink-2 mb-1">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand";

export default function RolesView() {
  const { roles, addRole, updateRole, removeRole, applyKit } = useSession();
  const [draft, setDraft] = useState({
    title: "",
    heldBy: "",
    department: DEPARTMENTS[0],
    decisionMode: DECISION_MODES[0] as DecisionMode,
    pairedWith: "" as string,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const nameOf = (id: string | null) => roles.find((r) => r.id === id)?.title ?? null;

  const submit = () => {
    if (!draft.title.trim()) return;
    addRole({
      title: draft.title.trim(),
      heldBy: draft.heldBy.trim(),
      department: draft.department,
      decisionMode: draft.decisionMode,
      pairedWith: draft.pairedWith || null,
    });
    setDraft({ title: "", heldBy: "", department: DEPARTMENTS[0], decisionMode: DECISION_MODES[0], pairedWith: "" });
  };

  return (
    <div className="grid gap-4">
      <PageHeader
        eyebrow="Set up"
        title="Roles and decision rights"
        lead="Questions ask who decides, and they ask for a role rather than a person so the answer survives turnover. Set the department that owns each call, how the role decides when the team is working async, and which role it has to agree with before anything is final."
      />

      <Widget eyebrow="Roles" title="Name a role" sub="The task you will do most">
        <p className="text-base text-ink-2 max-w-2xl mb-4">
          Governance decides by role so the answer survives turnover, but a live session still needs to know who is in the seat today. Name the role, then name the person holding it. The role is what the deck asks about; the person is who gets chased when a card is waiting.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Role">
            <input className={inputClass} value={draft.title} placeholder="Medical Review Lead"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </Field>
          <Field label="Held by (person)">
            <input className={inputClass} value={draft.heldBy} placeholder="Alex Moreau"
              onChange={(e) => setDraft({ ...draft, heldBy: e.target.value })} />
          </Field>
          <Field label="Department">
            <select className={inputClass} value={draft.department}
              onChange={(e) => setDraft({ ...draft, department: e.target.value })}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="How this role decides async">
            <select className={inputClass} value={draft.decisionMode}
              onChange={(e) => setDraft({ ...draft, decisionMode: e.target.value as DecisionMode })}>
              {DECISION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>
          <Field label="Paired with">
            <select className={inputClass} value={draft.pairedWith}
              onChange={(e) => setDraft({ ...draft, pairedWith: e.target.value })}>
              <option value="">No pairing</option>
              {roles.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2">
            <button onClick={submit} disabled={!draft.title.trim()} className="pill-primary px-5 py-2.5 text-sm gap-1.5">
              <IconAdd size={15} />
              Add role
            </button>
          </div>
        </div>
      </Widget>

      <Widget eyebrow="Templates" title="Start from a kit" sub="Loads in one click, edit anything after">
        <p className="text-base text-ink-2 max-w-2xl mb-4">
          Nobody should start governance from a blank form. Each kit is a working set of roles with departments, decision modes, and pairing already reasoned through for a common shape of team. Load the closest one, then edit until it matches how you actually work.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {ROLE_KITS.map((kit) => (
            <div key={kit.id} className="rounded-xl border border-line bg-ground/60 p-4 flex flex-col">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg border bg-cobalt/18 border-cobalt/45 text-[#9DA9FF] shrink-0">
                  {(() => { const I = KIT_ICON[kit.icon]; return <I size={17} />; })()}
                </span>
                <p className="text-base text-ink font-medium tracking-tight">{kit.name}</p>
              </div>
              <p className="text-sm text-ink-2">{kit.bestFor}</p>
              <p className="text-sm text-ink-3 mt-2 flex-1">{kit.outcome}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {kit.roles.map((r) => <Chip key={r.title}>{r.title}</Chip>)}
              </div>
              <button onClick={() => applyKit(kit)} className="pill-primary mt-4 px-4 py-2 text-sm self-start">
                Use this kit
              </button>
            </div>
          ))}
        </div>
      </Widget>

      <Widget eyebrow="Your roles" title="Your roles" sub={roles.length + " active"}>
        <p className="text-base text-ink-2 max-w-2xl">
          These are the options your team will see on every decider card during gather. Edit a role and the change reaches the whole session.
        </p>
      </Widget>

      {roles.map((role: Role) => {
        const editing = editingId === role.id;
        return (
          <Widget key={role.id} eyebrow={role.department} title={role.title}
            sub={editing ? "Editing" : role.heldBy ? "Held by " + role.heldBy : "Seat unfilled"}>
            {editing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role title">
                  <input className={inputClass} value={role.title}
                    onChange={(e) => updateRole(role.id, { title: e.target.value })} />
                </Field>
                <Field label="Held by (person)">
                  <input className={inputClass} value={role.heldBy} placeholder="Unassigned"
                    onChange={(e) => updateRole(role.id, { heldBy: e.target.value })} />
                </Field>
                <Field label="Department">
                  <select className={inputClass} value={role.department}
                    onChange={(e) => updateRole(role.id, { department: e.target.value })}>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="How this role decides async">
                  <select className={inputClass} value={role.decisionMode}
                    onChange={(e) => updateRole(role.id, { decisionMode: e.target.value as DecisionMode })}>
                    {DECISION_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </Field>
                <Field label="Paired with">
                  <select className={inputClass} value={role.pairedWith ?? ""}
                    onChange={(e) => updateRole(role.id, { pairedWith: e.target.value || null })}>
                    <option value="">No pairing</option>
                    {roles.filter((r) => r.id !== role.id).map((r) => (
                      <option key={r.id} value={r.id}>{r.title}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-1">
                  <button onClick={() => setEditingId(null)} className="pill-primary px-5 py-2.5 text-sm">
                    Done
                  </button>
                  <button onClick={() => { removeRole(role.id); setEditingId(null); }}
                    className="text-sm text-ember-text hover:text-ink">
                    Remove role
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Chip tone="peri" icon={(() => { const I = MODE_ICON[role.decisionMode]; return <I size={13} />; })()}>{role.decisionMode}</Chip>
                  {role.pairedWith
                    ? <Chip tone="cobalt">Paired with {nameOf(role.pairedWith)}</Chip>
                    : <Chip>No pairing</Chip>}
                  {!role.heldBy && <Chip tone="ember">Seat unfilled</Chip>}
                </div>
                <p className="text-sm text-ink-2 max-w-xl">{MODE_NOTE[role.decisionMode]}</p>
                <button onClick={() => setEditingId(role.id)}
                  className="mt-3 text-sm text-peri hover:text-ink">
                  Edit role &rarr;
                </button>
              </div>
            )}
          </Widget>
        );
      })}

    </div>
  );
}
