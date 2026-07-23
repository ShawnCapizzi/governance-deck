// Team, permissions, and handoff model.
//
// Structure: Organization > Program > Round.
//   Program  a brand or project a curator owns, e.g. "Oncology Brand Team"
//   Round    one pass of the questions inside a program, repeatable on a
//            cadence. Round 2 next quarter is how progress gets measured.
//
// Handoffs are governed events, not settings changes. When someone goes
// out or leaves, the transfer records who took over, why, and until when.
// Continuity when people leave mid-effort is the whole point of the tool,
// so the tool models it rather than assuming it.

export const LEVELS = ["Owner", "Curator", "Contributor", "Observer"] as const;
export type Level = (typeof LEVELS)[number];

export const LEVEL_DESC: Record<Level, string> = {
  Owner: "Full control of the organization, including people, levels, and billing.",
  Curator: "Runs programs and rounds. Invites people, assigns questions, and settles disagreements.",
  Contributor: "Answers the questions assigned to them and can see what the team agreed.",
  Observer: "Read-only. Sees health and published documents, answers nothing.",
};

export interface Permissions {
  manageOrg: boolean;
  managePeople: boolean;
  manageProgram: boolean;
  createRound: boolean;
  assign: boolean;
  answer: boolean;
  reconcile: boolean;
  publish: boolean;
  view: boolean;
}

export function permissionsFor(level: Level): Permissions {
  switch (level) {
    case "Owner":
      return { manageOrg: true, managePeople: true, manageProgram: true, createRound: true,
        assign: true, answer: true, reconcile: true, publish: true, view: true };
    case "Curator":
      return { manageOrg: false, managePeople: true, manageProgram: true, createRound: true,
        assign: true, answer: true, reconcile: true, publish: true, view: true };
    case "Contributor":
      return { manageOrg: false, managePeople: false, manageProgram: false, createRound: false,
        assign: false, answer: true, reconcile: false, publish: false, view: true };
    case "Observer":
    default:
      return { manageOrg: false, managePeople: false, manageProgram: false, createRound: false,
        assign: false, answer: false, reconcile: false, publish: false, view: true };
  }
}

export type PersonStatus = "active" | "away" | "departed";

export interface Person {
  id: string;
  name: string;
  email: string;
  level: Level;
  team: string;
  status: PersonStatus;
  roleId: string | null; // seat held in the roles list
}

export type HandoffReason = "Out of office" | "Left the organization" | "Workload change";

export interface Handoff {
  id: string;
  fromId: string;
  toId: string;
  reason: HandoffReason;
  note: string;
  until: string | null; // null means permanent
  createdAt: string;
  active: boolean;
}

export interface Program {
  id: string;
  name: string;
  client: string;
  curatorId: string;
  roundCount: number;
  lastRound: string;
}

export const PEOPLE: Person[] = [
  { id: "u1", name: "Shawn Capizzi", email: "shawn@example.com", level: "Owner", team: "Studio", status: "active", roleId: null },
  { id: "u2", name: "Dana Whitfield", email: "dana@example.com", level: "Curator", team: "Creative", status: "active", roleId: "r1" },
  { id: "u3", name: "Marcus Reyes", email: "marcus@example.com", level: "Curator", team: "Strategy", status: "active", roleId: "r2" },
  { id: "u4", name: "Priya Anand", email: "priya@example.com", level: "Contributor", team: "Design Ops", status: "active", roleId: "r3" },
  { id: "u5", name: "Jo Nakamura", email: "jo@example.com", level: "Contributor", team: "Brand", status: "away", roleId: "r4" },
  { id: "u6", name: "Sam Ortiz", email: "sam@example.com", level: "Contributor", team: "Delivery", status: "active", roleId: "r5" },
  { id: "u7", name: "Elena Fischer", email: "elena@example.com", level: "Observer", team: "Executive", status: "active", roleId: null },
];

export const PROGRAMS: Program[] = [
  { id: "pg1", name: "Oncology Brand Team", client: "Pharma client", curatorId: "u3", roundCount: 2, lastRound: "Round 2, this quarter" },
  { id: "pg2", name: "Design System Stewardship", client: "Internal", curatorId: "u2", roundCount: 3, lastRound: "Round 3, last month" },
  { id: "pg3", name: "AI Usage Guardrails", client: "Org wide", curatorId: "u1", roundCount: 1, lastRound: "Round 1, in progress" },
];

export const HANDOFFS: Handoff[] = [
  { id: "h1", fromId: "u5", toId: "u4", reason: "Out of office", note: "Parental leave, Priya covers brand questions.",
    until: "2026-09-01", createdAt: "2026-07-14", active: true },
];

// Resolve who is actually responsible for a person's questions right now,
// following the handoff chain. Cycle-guarded: a chain that loops resolves
// to the last valid holder rather than hanging.
export function effectiveHolder(personId: string, handoffs: Handoff[], depth = 0): string {
  if (depth > 8) return personId;
  const active = handoffs.find((h) => h.active && h.fromId === personId);
  if (!active) return personId;
  if (active.toId === personId) return personId;
  return effectiveHolder(active.toId, handoffs, depth + 1);
}

// Everyone a person is currently covering for.
export function coveringFor(personId: string, handoffs: Handoff[], people: Person[]): Person[] {
  return handoffs
    .filter((h) => h.active && h.toId === personId)
    .map((h) => people.find((p) => p.id === h.fromId))
    .filter((p): p is Person => Boolean(p));
}

// A round cannot close while any question sits with someone who is away or
// departed and has no cover. This is the check that stops work going dark.
export function uncoveredPeople(people: Person[], handoffs: Handoff[]): Person[] {
  return people.filter((p) => {
    if (p.status === "active") return false;
    return effectiveHolder(p.id, handoffs) === p.id;
  });
}
