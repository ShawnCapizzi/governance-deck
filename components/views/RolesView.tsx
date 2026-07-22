"use client";

// Roles and decision rights. Every decider card in the deck reads its
// options from this list, so editing a role here changes what the whole
// team can choose during gather. Departments answer who owns the call,
// decision modes answer how it gets made when nobody is in a room, and
// pairing answers who has to agree before it counts.

import { useState } from "react";
import { DECISION_MODES, DEPARTMENTS, DecisionMode, Role } from "../../lib/deck";
import { useSession } from "../../lib/store";
import { Widget, Chip } from "../ui";

const MODE_NOTE: Record<DecisionMode, string> = {
  "Decides alone": "Resolves split cards without waiting. Fastest, and the rationale carries the weight.",
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
  const { roles, addRole, updateRole, removeRole } = useSession();
  const [draft, setDraft] = useState({
    title: "",
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
      department: draft.department,
      decisionMode: draft.decisionMode,
      pairedWith: draft.pairedWith || null,
    });
    setDraft({ title: "", department: DEPARTMENTS[0], decisionMode: DECISION_MODES[0], pairedWith: "" });
  };

  return (
    <div className="grid gap-4">
      <Widget eyebrow="Listen first" title="Roles and decision rights" sub={roles.length + " roles"}>
        <p className="text-sm text-ink-2 max-w-2xl">
          The deck asks who decides, and it asks for a role rather than a person so the answer survives turnover. Every decider card pulls its options from this list. Set the department that owns each call, how that role decides when the team is working async, and which role it has to agree with before anything is final.
        </p>
      </Widget>

      {roles.map((role: Role) => {
        const editing = editingId === role.id;
        return (
          <Widget key={role.id} eyebrow={role.department} title={role.title}
            sub={editing ? "Editing" : undefined}>
            {editing ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Role title">
                  <input className={inputClass} value={role.title}
                    onChange={(e) => updateRole(role.id, { title: e.target.value })} />
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
                    className="text-sm text-ember hover:text-ink">
                    Remove role
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Chip tone="peri">{role.decisionMode}</Chip>
                  {role.pairedWith
                    ? <Chip tone="cobalt">Paired with {nameOf(role.pairedWith)}</Chip>
                    : <Chip>No pairing</Chip>}
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

      <Widget eyebrow="Make it visible" title="Add a role">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Role title">
            <input className={inputClass} value={draft.title} placeholder="Medical Review Lead"
              onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
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
            <button onClick={submit} disabled={!draft.title.trim()} className="pill-primary px-5 py-2.5 text-sm">
              Add role
            </button>
          </div>
        </div>
      </Widget>
    </div>
  );
}
