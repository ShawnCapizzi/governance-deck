// Convergence engine. Classifies gathered responses, detects perception
// gaps between the leads and team tiers, and scores blind-definition
// alignment. Verified by scripts/gate-ssr.mjs and unit-exercised in
// the launch verification pass.

import { DeckCard, PERSONAS, FREQ, ResponseMap, Resolution, Tier } from "./deck";

export interface Entry { personaId: string; name: string; tier: Tier; value: string; }
export interface Gap { leads: string; team: string; }
export interface CardResult {
  status: "pending" | "agreed" | "divergent" | "review";
  entries: Entry[];
  gap: Gap | null;
  alignment?: number;
}

function modal(values: string[]): string {
  const counts: Record<string, number> = {};
  values.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function tierGap(entries: Entry[]): Gap | null {
  const leads = entries.filter((e) => e.tier === "leads").map((e) => e.value);
  const team = entries.filter((e) => e.tier === "team").map((e) => e.value);
  if (!leads.length || !team.length) return null;
  const lm = modal(leads);
  const tm = modal(team);
  return lm !== tm ? { leads: lm, team: tm } : null;
}

export function alignmentScore(texts: string[]): number {
  const sets = texts.map((t) => new Set(t.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 3)));
  let total = 0;
  let pairs = 0;
  for (let i = 0; i < sets.length; i++) {
    for (let j = i + 1; j < sets.length; j++) {
      const inter = [...sets[i]].filter((x) => sets[j].has(x)).length;
      const uni = new Set([...sets[i], ...sets[j]]).size;
      total += uni ? inter / uni : 0;
      pairs += 1;
    }
  }
  return pairs ? Math.round((total / pairs) * 100) : 0;
}

export function classifyCard(card: DeckCard, respMap?: Record<string, string>): CardResult {
  const entries: Entry[] = PERSONAS.map((p) => ({
    personaId: p.id, name: p.name, tier: p.tier, value: (respMap || {})[p.id] || "",
  })).filter((e) => e.value !== "");
  if (entries.length < PERSONAS.length) return { status: "pending", entries, gap: null };
  if (card.type === "single_select" || card.type === "binary") {
    const uniq = [...new Set(entries.map((e) => e.value))];
    return { status: uniq.length === 1 ? "agreed" : "divergent", entries, gap: tierGap(entries) };
  }
  if (card.type === "frequency") {
    const idxs = entries.map((e) => FREQ.indexOf(e.value));
    const spread = Math.max(...idxs) - Math.min(...idxs);
    return { status: spread <= 1 ? "agreed" : "divergent", entries, gap: tierGap(entries) };
  }
  if (card.type === "blind_definition") {
    return { status: "review", entries, gap: null, alignment: alignmentScore(entries.map((e) => e.value)) };
  }
  return { status: "review", entries, gap: null };
}

// The facilitator queue: open work sorted so perception gaps surface first.
export function openWork(cards: DeckCard[], responses: ResponseMap, resolved: Record<string, Resolution>) {
  return cards
    .map((card) => ({ card, result: classifyCard(card, responses[card.id]) }))
    .filter(({ card, result }) => !resolved[card.id] && (result.status === "divergent" || result.status === "review"))
    .sort((a, b) => (b.result.gap ? 1 : 0) - (a.result.gap ? 1 : 0));
}
