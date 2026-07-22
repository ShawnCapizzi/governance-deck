// Canonical seed data for the Governance Deck v1.
// Suits map to the Capizzi Process pillars plus Spine (continuity).
// Suit colors derive from the shawncapizzi.com Tier 3 brand ramp:
// Signals periwinkle, Bounds cobalt, Trace brand purple, Spine magenta,
// Diagnostic ember (the reserved accent, fitting for reality checks).

export type Tier = "leads" | "team";
export type Suit = "Signals" | "Bounds" | "Trace" | "Spine" | "Diagnostic";
export type CardType = "text" | "single_select" | "binary" | "frequency" | "blind_definition";

export interface Persona { id: string; name: string; role: string; tier: Tier; }
export interface DeckCard {
  id: string; suit: Suit; kind: "normative" | "diagnostic"; type: CardType;
  prompt: string; options?: string[]; feeds?: string; issueId?: string;
}
export interface Issue {
  id: string; title: string; problem: string; domain: string;
  target: number; stage: number; prevStage: number;
}
export interface Resolution { value: string; rationale: string; }
export type ResponseMap = Record<string, Record<string, string>>;

export const SESSION_DATE = "2026-07-07";
// How a role reaches a decision when the team is working async. This is
// the governance answer to "who decides, and how, when we are not in a room."
export const DECISION_MODES = [
  "Decides alone",
  "Consults, then decides",
  "Consensus with paired role",
  "Escalates to a lead",
] as const;
export type DecisionMode = (typeof DECISION_MODES)[number];

export interface Role {
  id: string;
  title: string;
  department: string;
  decisionMode: DecisionMode;
  pairedWith: string | null;
}

export const DEFAULT_ROLES: Role[] = [
  { id: "r1", title: "Creative Director", department: "Creative", decisionMode: "Decides alone", pairedWith: null },
  { id: "r2", title: "Strategy Lead", department: "Strategy", decisionMode: "Consults, then decides", pairedWith: "r5" },
  { id: "r3", title: "Design Lead", department: "Design Ops", decisionMode: "Consults, then decides", pairedWith: "r1" },
  { id: "r4", title: "Brand Owner", department: "Brand", decisionMode: "Consensus with paired role", pairedWith: "r1" },
  { id: "r5", title: "Project Lead", department: "Delivery", decisionMode: "Escalates to a lead", pairedWith: null },
];

export const DEPARTMENTS = ["Creative", "Strategy", "Design Ops", "Content Ops", "Brand", "Delivery", "Legal and Compliance", "Product"];

// Seed labels, kept so the shipped demo responses stay coherent. Live
// option lists come from the roles in the session store, not from here.
export const ROLES = DEFAULT_ROLES.map((r) => r.title);
export const FREQ = ["Never", "Rarely", "Sometimes", "Often", "Always"];
export const STAGES = ["Ad hoc", "Documented", "Practiced", "Enforced", "Self-correcting"];

export const SUIT_STYLE: Record<Suit, { rail: string; chip: string }> = {
  Signals: { rail: "bg-peri", chip: "bg-peri/10 text-peri border border-peri/30" },
  Bounds: { rail: "bg-cobalt", chip: "bg-cobalt/10 text-peri border border-cobalt/40" },
  Trace: { rail: "bg-brand", chip: "bg-brand/10 text-peri border border-brand/40" },
  Spine: { rail: "bg-magenta", chip: "bg-magenta/10 text-magenta border border-magenta/30" },
  Diagnostic: { rail: "bg-ember", chip: "bg-ember/10 text-ember border border-ember/30" },
};

export const PERSONAS: Persona[] = [
  { id: "p1", name: "Dana", role: "Creative Director", tier: "leads" },
  { id: "p2", name: "Marcus", role: "Strategy Lead", tier: "leads" },
  { id: "p3", name: "Priya", role: "Senior Designer", tier: "team" },
  { id: "p4", name: "Jo", role: "Copywriter", tier: "team" },
  { id: "p5", name: "Sam", role: "Content Strategist", tier: "team" },
];

export const ISSUES: Issue[] = [
  { id: "iss1", title: "Design system integrity", domain: "Design Ops", target: 4, stage: 2, prevStage: 2,
    problem: "Designers detach or break shared components under deadline pressure." },
  { id: "iss2", title: "Manuscript discipline", domain: "Content Ops", target: 4, stage: 1, prevStage: 1,
    problem: "No shared manuscript template. Versions get overwritten and provenance is lost." },
  { id: "iss3", title: "Shared vocabulary", domain: "Strategy", target: 3, stage: 2, prevStage: 1,
    problem: "The strategy team defines core terms differently, so alignment is an illusion." },
];

export const CARDS: DeckCard[] = [
  { id: "SIG-1", suit: "Signals", kind: "normative", type: "text", feeds: "truth-signals.md",
    prompt: "What do we hold true about our craft that we will not compromise, even under deadline pressure?" },
  { id: "SIG-4", suit: "Signals", kind: "normative", type: "single_select", options: ROLES, feeds: "decision-rights.md",
    prompt: "Who decides what good looks like for a deliverable? Choose the role, not the person." },
  { id: "SIG-5", suit: "Signals", kind: "normative", type: "single_select", options: ROLES, feeds: "decision-rights.md",
    prompt: "When best in the abstract conflicts with best for us now, who makes that call?" },
  { id: "BND-1", suit: "Bounds", kind: "normative", type: "text", feeds: "guardrails.md",
    prompt: "What can never be changed by a single individual, regardless of seniority or conviction?" },
  { id: "BND-4", suit: "Bounds", kind: "normative", type: "single_select", options: ROLES, feeds: "decision-rights.md",
    prompt: "Who signs off that a deliverable is done at the craft level?" },
  { id: "TRC-1", suit: "Trace", kind: "normative", type: "text", feeds: "rollback-rules.md",
    prompt: "What do we checkpoint, and how often? Document where you are, how you got there, and what is unique about this file." },
  { id: "TRC-2", suit: "Trace", kind: "normative", type: "single_select", options: ROLES, feeds: "decision-rights.md",
    prompt: "If a page or asset is overwritten or broken, who can execute the path back?" },
  { id: "SPN-1", suit: "Spine", kind: "normative", type: "text", feeds: "change-protocol.md",
    prompt: "How does a truth signal get updated without being overridden by one strong opinion?" },
  { id: "SPN-3", suit: "Spine", kind: "normative", type: "text", feeds: "change-protocol.md",
    prompt: "When a new member joins mid-effort, how do they fall in line with our structure instead of restarting it?" },
  { id: "D-FIG-1", suit: "Diagnostic", kind: "diagnostic", issueId: "iss1", type: "frequency",
    prompt: "How often do you detach or break a shared component to hit a deadline?" },
  { id: "D-FIG-2", suit: "Diagnostic", kind: "diagnostic", issueId: "iss1", type: "binary",
    prompt: "Were your last three production files audited for detached components?" },
  { id: "D-MAN-1", suit: "Diagnostic", kind: "diagnostic", issueId: "iss2", type: "binary",
    prompt: "Did your last three manuscripts start from the shared template?" },
  { id: "D-MAN-2", suit: "Diagnostic", kind: "diagnostic", issueId: "iss2", type: "frequency",
    prompt: "How often is a working file checkpointed with a note on where you are and how you got there?" },
  { id: "D-VOC-1", suit: "Diagnostic", kind: "diagnostic", issueId: "iss3", type: "blind_definition",
    prompt: "Define what done means for a campaign page. Answer without looking at anyone else." },
];

export const SEED: ResponseMap = {
  "SIG-1": {
    p1: "We never ship work we would not sign our names to.",
    p2: "Strategy before execution. No brief, no build.",
    p3: "Accessibility is not a nice to have.",
    p4: "Every claim gets a source.",
    p5: "Clarity beats cleverness.",
  },
  "SIG-4": { p1: "Creative Director", p2: "Creative Director", p3: "Creative Director", p4: "Brand Owner", p5: "Brand Owner" },
  "SIG-5": { p1: "Project Lead", p2: "Project Lead", p3: "Project Lead", p4: "Project Lead", p5: "Project Lead" },
  "BND-1": {
    p1: "The approved brand system and locked legal copy.",
    p2: "The master positioning statement.",
    p3: "Published design system components.",
    p4: "Approved regulatory language.",
    p5: "The shared taxonomy.",
  },
  "BND-4": { p1: "Creative Director", p2: "Creative Director", p3: "Design Lead", p4: "Creative Director", p5: "Creative Director" },
  "TRC-1": {
    p1: "End of each working session, with a note.",
    p2: "At every review milestone.",
    p3: "Honestly, only when I remember.",
    p4: "Before any big revision pass.",
    p5: "Weekly, in the project folder.",
  },
  "TRC-2": { p1: "Design Lead", p2: "Design Lead", p3: "Design Lead", p4: "Project Lead", p5: "Design Lead" },
  "SPN-1": {
    p1: "Propose it, show evidence, leads vote.",
    p2: "Bring it to the monthly ops review.",
    p3: "Not sure we have a process.",
    p4: "Flag it to the CD and hope.",
    p5: "Document the case, then group review.",
  },
  "SPN-3": {
    p1: "They read the spine docs first.",
    p2: "Pair them with a lead for week one.",
    p3: "They shadow a project end to end.",
    p4: "We do not really have onboarding.",
    p5: "Walk the artifact set, then a live QA.",
  },
  "D-FIG-1": { p1: "Rarely", p2: "Rarely", p3: "Often", p4: "Sometimes", p5: "Often" },
  "D-FIG-2": { p1: "No", p2: "No", p3: "No", p4: "No", p5: "No" },
  "D-MAN-1": { p1: "Yes", p2: "Yes", p3: "No", p4: "No", p5: "Yes" },
  "D-MAN-2": { p1: "Rarely", p2: "Sometimes", p3: "Never", p4: "Rarely", p5: "Never" },
  "D-VOC-1": {
    p1: "Approved by the client and live in market.",
    p2: "Meets the brief and the business objective.",
    p3: "Passed QA, accessible, and responsive.",
    p4: "Reviewed, proofed, and versioned.",
    p5: "Shipped, measured, and documented.",
  },
};


// ---------------------------------------------------------------------------
// ROLE KITS
// Pre-built starting points so a team never faces a blank form. Each kit is
// a working set of roles with departments, async decision modes, and pairing
// already reasoned through. Teams load one, then edit. This is the on-ramp:
// the fastest path from "we have no governance" to "we have a draft spine."
// ---------------------------------------------------------------------------

export interface RoleKit {
  id: string;
  name: string;
  bestFor: string;
  outcome: string;
  roles: Omit<Role, "id">[];
}

export const ROLE_KITS: RoleKit[] = [
  {
    id: "kit-product",
    name: "Product team",
    bestFor: "Product, design, and engineering shipping on a release cadence.",
    outcome: "Craft calls stay with the practice leads, scope and timing calls stay with product, and nothing ships without one named signer.",
    roles: [
      { title: "Product Lead", department: "Product", decisionMode: "Decides alone", pairedWith: null },
      { title: "Design Lead", department: "Design Ops", decisionMode: "Consults, then decides", pairedWith: null },
      { title: "Engineering Lead", department: "Product", decisionMode: "Consults, then decides", pairedWith: null },
      { title: "Content Lead", department: "Content Ops", decisionMode: "Consults, then decides", pairedWith: null },
    ],
  },
  {
    id: "kit-transformation",
    name: "Internal business transformation",
    bestFor: "Cross-functional change programs with executive sponsorship and real budget.",
    outcome: "Decision rights are explicit across functions, so the program stops stalling on who gets to call it.",
    roles: [
      { title: "Transformation Sponsor", department: "Delivery", decisionMode: "Decides alone", pairedWith: null },
      { title: "Workstream Lead", department: "Delivery", decisionMode: "Escalates to a lead", pairedWith: null },
      { title: "Operations Owner", department: "Delivery", decisionMode: "Consults, then decides", pairedWith: null },
      { title: "Change and Comms Lead", department: "Strategy", decisionMode: "Consults, then decides", pairedWith: null },
      { title: "Risk and Compliance Lead", department: "Legal and Compliance", decisionMode: "Consensus with paired role", pairedWith: null },
    ],
  },
  {
    id: "kit-design-system",
    name: "Design system governance",
    bestFor: "Teams stewarding a shared system they use daily but did not build.",
    outcome: "Component changes get a named owner and a review gate, so detaching under deadline stops being invisible.",
    roles: [
      { title: "System Owner", department: "Design Ops", decisionMode: "Decides alone", pairedWith: null },
      { title: "Contributing Designer", department: "Design", decisionMode: "Escalates to a lead", pairedWith: null },
      { title: "Accessibility Reviewer", department: "Design Ops", decisionMode: "Consensus with paired role", pairedWith: null },
      { title: "Brand Owner", department: "Brand", decisionMode: "Consensus with paired role", pairedWith: null },
    ],
  },
  {
    id: "kit-regulated",
    name: "Regulated content operations",
    bestFor: "Pharma, financial services, and any team shipping claims through a review gate.",
    outcome: "Nothing reaches a public surface without medical, legal, and regulatory sign-off recorded against a role.",
    roles: [
      { title: "Medical Review Lead", department: "Legal and Compliance", decisionMode: "Consensus with paired role", pairedWith: null },
      { title: "Regulatory Lead", department: "Legal and Compliance", decisionMode: "Decides alone", pairedWith: null },
      { title: "Brand Owner", department: "Brand", decisionMode: "Consults, then decides", pairedWith: null },
      { title: "Creative Director", department: "Creative", decisionMode: "Consults, then decides", pairedWith: null },
    ],
  },
];