// Shared UI atoms. Amplenote cockpit grammar rendered in the
// shawncapizzi.com design system: card-surface with the site's own
// sheen and glow, periwinkle eyebrows, rounded-full chips, and an
// optional LaserFrame comet on hero and CTA cards.

import { ReactNode } from "react";
import { DeckCard, SUIT_STYLE } from "../lib/deck";
import { LaserFrame } from "./LaserFrame";

export function Widget({ eyebrow, title, sub, children, className = "", laser = false, glow = false, laserDelay = 0 }: {
  eyebrow: string; title: string; sub?: string; children: ReactNode;
  className?: string; laser?: boolean; glow?: boolean; laserDelay?: number;
}) {
  return (
    <section className={"relative overflow-hidden card-surface border border-line rounded-2xl p-5 md:p-6 " + className}>
      {glow && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,92,255,0.22) 0%, rgba(107,92,255,0.06) 45%, transparent 75%)" }} />
      )}
      <div className="relative">
        <header className="mb-4">
          <p className="eyebrow">{eyebrow}</p>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mt-1">
            <h2 className="text-ink text-base md:text-lg font-semibold tracking-tight">{title}</h2>
            {sub && <span className="text-xs text-ink-2">{sub}</span>}
          </div>
        </header>
        {children}
      </div>
      {laser && <LaserFrame radius={15} delay={laserDelay} />}
    </section>
  );
}

export type ChipTone = "neutral" | "peri" | "cobalt" | "brand" | "magenta" | "ember";

const CHIP_TONES: Record<ChipTone, string> = {
  neutral: "bg-raised text-ink-2 border border-line-strong",
  peri: "bg-peri/10 text-peri border border-peri/30",
  cobalt: "bg-cobalt/10 text-peri border border-cobalt/40",
  brand: "bg-brand/15 text-peri border border-brand/40",
  magenta: "bg-magenta/10 text-magenta border border-magenta/30",
  ember: "bg-ember/10 text-ember border border-ember/30",
};

export function Chip({ tone = "neutral", children }: { tone?: ChipTone; children: ReactNode }) {
  return (
    <span className={"text-xs font-mono px-2.5 py-0.5 rounded-full inline-flex items-center " + CHIP_TONES[tone]}>
      {children}
    </span>
  );
}

export function StatusChip({ status, resolved }: { status: string; resolved: boolean }) {
  if (resolved) return <Chip tone="brand">Reconciled</Chip>;
  if (status === "agreed") return <Chip tone="peri">Aligned</Chip>;
  if (status === "divergent") return <Chip tone="ember">Split</Chip>;
  if (status === "review") return <Chip tone="cobalt">Facilitator review</Chip>;
  return <Chip>Pending</Chip>;
}

export function GapChip({ gap }: { gap: { leads: string; team: string } | null }) {
  if (!gap) return null;
  return <Chip tone="magenta">Perception gap: leads say {gap.leads}, team says {gap.team}</Chip>;
}

export function SuitCard({ card, children }: { card: DeckCard; children?: ReactNode }) {
  const s = SUIT_STYLE[card.suit];
  return (
    <div className="flex card-surface rounded-2xl border border-line overflow-hidden">
      <div className={"w-1 shrink-0 " + s.rail} />
      <div className="p-4 md:p-5 w-full min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="font-mono text-xs text-ink-3">{card.id}</span>
          <span className={"text-xs px-2.5 py-0.5 rounded-full " + s.chip}>{card.suit}</span>
          {card.feeds && <span className="text-xs font-mono text-ink-3">&rarr; {card.feeds}</span>}
        </div>
        <p className="text-sm text-ink mb-3">{card.prompt}</p>
        {children}
      </div>
    </div>
  );
}
