// Data layer. Maps between the app's in-memory shapes and Supabase rows.
//
// Mode is decided by configuration, not by a flag: with no env vars the app
// runs the seeded demo (public, instant, good for a cold link), and with
// Supabase configured plus a signed-in member it runs live and persists.

import type { SupabaseClient } from "@supabase/supabase-js";
import { Role, DecisionMode } from "./deck";
import { Person, Level, Handoff, HandoffReason, Program, PersonStatus } from "./team";

// --- enum mapping ----------------------------------------------------------

const MODE_TO_DB: Record<DecisionMode, string> = {
  "Decides alone": "decides_alone",
  "Consults, then decides": "consults_then_decides",
  "Consensus with paired role": "consensus_with_pair",
  "Escalates to a lead": "escalates_to_lead",
};
const MODE_FROM_DB: Record<string, DecisionMode> = {
  decides_alone: "Decides alone",
  consults_then_decides: "Consults, then decides",
  consensus_with_pair: "Consensus with paired role",
  escalates_to_lead: "Escalates to a lead",
};
const LEVEL_TO_DB: Record<Level, string> = {
  Owner: "owner", Curator: "curator", Contributor: "contributor", Observer: "observer",
};
const LEVEL_FROM_DB: Record<string, Level> = {
  owner: "Owner", curator: "Curator", contributor: "Contributor", observer: "Observer",
};
const REASON_TO_DB: Record<HandoffReason, string> = {
  "Out of office": "out_of_office",
  "Left the organization": "left_org",
  "Workload change": "workload_change",
};
const REASON_FROM_DB: Record<string, HandoffReason> = {
  out_of_office: "Out of office",
  left_org: "Left the organization",
  workload_change: "Workload change",
};

export interface OrgContext {
  orgId: string;
  orgName: string;
  joinCode: string | null;
  level: Level;
}

// --- org -------------------------------------------------------------------

export async function loadOrgContext(sb: SupabaseClient, userId: string): Promise<OrgContext | null> {
  const { data, error } = await sb
    .from("memberships")
    .select("level, org_id, organizations(id, name, join_code)")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  const org = (Array.isArray(data.organizations) ? data.organizations[0] : data.organizations) as
    | { id: string; name: string; join_code: string | null }
    | undefined;
  if (!org) return null;
  return {
    orgId: org.id,
    orgName: org.name,
    joinCode: org.join_code,
    level: LEVEL_FROM_DB[data.level as string] ?? "Contributor",
  };
}

export async function createOrganization(sb: SupabaseClient, name: string) {
  return sb.rpc("create_organization", { org_name: name });
}

export async function joinOrganization(sb: SupabaseClient, code: string) {
  return sb.rpc("join_organization", { code });
}

// --- roles -----------------------------------------------------------------

export async function loadRoles(sb: SupabaseClient, orgId: string): Promise<Role[]> {
  const { data, error } = await sb
    .from("governance_roles")
    .select("id, title, held_by, department, decision_mode, paired_with, sort")
    .eq("org_id", orgId)
    .order("sort", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id as string,
    title: r.title as string,
    heldBy: (r.held_by as string) ?? "",
    department: r.department as string,
    decisionMode: MODE_FROM_DB[r.decision_mode as string] ?? "Consults, then decides",
    pairedWith: (r.paired_with as string) ?? null,
  }));
}

export async function insertRole(sb: SupabaseClient, orgId: string, role: Omit<Role, "id">, sort: number) {
  return sb.from("governance_roles").insert({
    org_id: orgId,
    title: role.title,
    held_by: role.heldBy || null,
    department: role.department,
    decision_mode: MODE_TO_DB[role.decisionMode],
    paired_with: role.pairedWith,
    sort,
  }).select("id").single();
}

export async function updateRoleRow(sb: SupabaseClient, id: string, patch: Partial<Omit<Role, "id">>) {
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.heldBy !== undefined) row.held_by = patch.heldBy || null;
  if (patch.department !== undefined) row.department = patch.department;
  if (patch.decisionMode !== undefined) row.decision_mode = MODE_TO_DB[patch.decisionMode];
  if (patch.pairedWith !== undefined) row.paired_with = patch.pairedWith;
  if (Object.keys(row).length === 0) return { error: null };
  return sb.from("governance_roles").update(row).eq("id", id);
}

export async function deleteRoleRow(sb: SupabaseClient, id: string) {
  return sb.from("governance_roles").delete().eq("id", id);
}

export async function replaceRoles(sb: SupabaseClient, orgId: string, roles: Omit<Role, "id">[]) {
  await sb.from("governance_roles").delete().eq("org_id", orgId);
  if (roles.length === 0) return { error: null };
  return sb.from("governance_roles").insert(
    roles.map((r, i) => ({
      org_id: orgId,
      title: r.title,
      held_by: r.heldBy || null,
      department: r.department,
      decision_mode: MODE_TO_DB[r.decisionMode],
      paired_with: null,
      sort: i,
    }))
  );
}

// --- people ----------------------------------------------------------------

export async function loadPeople(sb: SupabaseClient, orgId: string): Promise<Person[]> {
  const { data, error } = await sb
    .from("memberships")
    .select("user_id, level, status, team, role_id, profiles(id, display_name)")
    .eq("org_id", orgId);
  if (error || !data) return [];
  return data.map((m) => {
    const prof = (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles) as
      | { id: string; display_name: string | null }
      | undefined;
    return {
      id: m.user_id as string,
      name: prof?.display_name ?? "Teammate",
      email: "",
      level: LEVEL_FROM_DB[m.level as string] ?? "Contributor",
      team: (m.team as string) ?? "Unassigned",
      status: (m.status as PersonStatus) ?? "active",
      roleId: (m.role_id as string) ?? null,
    };
  });
}

export async function updateMembership(
  sb: SupabaseClient, orgId: string, userId: string,
  patch: { level?: Level; status?: PersonStatus; team?: string; roleId?: string | null }
) {
  const row: Record<string, unknown> = {};
  if (patch.level) row.level = LEVEL_TO_DB[patch.level];
  if (patch.status) row.status = patch.status;
  if (patch.team !== undefined) row.team = patch.team;
  if (patch.roleId !== undefined) row.role_id = patch.roleId;
  return sb.from("memberships").update(row).eq("org_id", orgId).eq("user_id", userId);
}

// --- handoffs --------------------------------------------------------------

export async function loadHandoffs(sb: SupabaseClient, orgId: string): Promise<Handoff[]> {
  const { data, error } = await sb
    .from("handoffs")
    .select("id, from_id, to_id, reason, note, until, active, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((h) => ({
    id: h.id as string,
    fromId: h.from_id as string,
    toId: h.to_id as string,
    reason: REASON_FROM_DB[h.reason as string] ?? "Workload change",
    note: (h.note as string) ?? "",
    until: (h.until as string) ?? null,
    createdAt: String(h.created_at).slice(0, 10),
    active: Boolean(h.active),
  }));
}

export async function insertHandoff(
  sb: SupabaseClient, orgId: string, h: Omit<Handoff, "id" | "createdAt" | "active">
) {
  // One active handoff per person is enforced by a unique index; clear any
  // existing one first so the insert cannot trip it.
  await sb.from("handoffs").update({ active: false })
    .eq("org_id", orgId).eq("from_id", h.fromId).eq("active", true);
  return sb.from("handoffs").insert({
    org_id: orgId,
    from_id: h.fromId,
    to_id: h.toId,
    reason: REASON_TO_DB[h.reason],
    note: h.note || null,
    until: h.until,
    active: true,
  });
}

export async function endHandoffRow(sb: SupabaseClient, id: string) {
  return sb.from("handoffs").update({ active: false }).eq("id", id);
}

// --- programs --------------------------------------------------------------

export async function loadPrograms(sb: SupabaseClient, orgId: string): Promise<Program[]> {
  const { data, error } = await sb
    .from("programs")
    .select("id, name, client, curator_id, rounds(id, sequence, label)")
    .eq("org_id", orgId);
  if (error || !data) return [];
  return data.map((p) => {
    const rounds = (p.rounds ?? []) as { id: string; sequence: number; label: string | null }[];
    const latest = rounds.slice().sort((a, b) => b.sequence - a.sequence)[0];
    return {
      id: p.id as string,
      name: p.name as string,
      client: (p.client as string) ?? "",
      curatorId: (p.curator_id as string) ?? "",
      roundCount: rounds.length,
      lastRound: latest ? latest.label ?? "Round " + latest.sequence : "No rounds yet",
    };
  });
}

export async function createProgram(sb: SupabaseClient, orgId: string, name: string, client: string, curatorId: string) {
  return sb.from("programs").insert({ org_id: orgId, name, client, curator_id: curatorId }).select("id").single();
}

// --- profile ---------------------------------------------------------------

export async function updateProfile(sb: SupabaseClient, userId: string, displayName: string) {
  return sb.from("profiles").update({ display_name: displayName }).eq("id", userId);
}
