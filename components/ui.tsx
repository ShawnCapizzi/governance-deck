// Shared UI atoms. Amplenote cockpit grammar rendered in the
// shawncapizzi.com design system: card-surface with the site's own
// sheen and glow, periwinkle eyebrows, rounded-full chips, and an
// optional LaserFrame comet on hero and CTA cards.

import { ReactNode } from "react";
import { DeckCard, SUIT_STYLE } from "../lib/deck";
import { LaserFrame } from "./LaserFrame";
import { IconAligned, IconSplit, IconReview, IconGap } from "./Icons";

// Pillar segmentation. The eyebrow already names the pillar, so the
// surface tint and eyebrow color derive from it automatically. No view
// has to remember which class to use, and the coding stays consistent.
// ONE COLOR SYSTEM.
//
// Hue means subject, and only subject. The five topic hues live on question
// cards (Beliefs, Guardrails, Recovery, Change, Reality check) and nowhere
// else, so a person can actually learn them.
//
// Panels do not carry topic hue. They carry state, and only three exist:
//   neutral  nothing is required of you here
//   action   something is waiting on you
//   done     this is finished
//
// Before this, panels tinted by Capizzi pillar using hues 1 to 2 degrees
// away from the card topic hues, so purple meant two different things
// depending on what it was painted on. That is unlearnable, so panel topic
// tint is gone. Structure comes from the icon tile and the hairline rule.

export type WidgetTone = "neutral" | "action" | "done";

const TONE: Record<WidgetTone, { surface: string; rule: string; tile: string; label: string }> = {
  neutral: {
    surface: "surface-neutral", rule: "bg-line-strong",
    tile: "bg-raised border-line-strong text-ink-2", label: "text-ink-3",
  },
  action: {
    surface: "surface-action", rule: "bg-ember",
    tile: "bg-ember/12 border-ember/40 text-ember-text", label: "text-ember-text",
  },
  done: {
    surface: "surface-done", rule: "bg-[#5FC9C0]",
    tile: "bg-[#1B6D68]/25 border-[#5FC9C0]/40 text-[#5FC9C0]", label: "text-[#5FC9C0]",
  },
};

export function Widget({ eyebrow, title, sub, children, className = "", laser = false, glow = false, laserDelay = 0, icon, tone = "neutral" }: {
  eyebrow: string; title: string; sub?: string; children: ReactNode;
  className?: string; laser?: boolean; glow?: boolean; laserDelay?: number;
  icon?: ReactNode; tone?: WidgetTone;
}) {
  const t = TONE[tone];
  return (
    <section className={"lit raise-1 relative overflow-hidden border border-line rounded-2xl " + t.surface + " " + className}>
      <div aria-hidden="true" className={"absolute inset-x-0 top-0 h-[3px] " + t.rule} />
      {glow && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,92,255,0.22) 0%, rgba(107,92,255,0.06) 45%, transparent 75%)" }} />
      )}
      <div className="relative p-5 md:p-6">
        <header className="mb-4 flex items-start gap-3">
          {icon && (
            <span className={"mt-0.5 shrink-0 grid place-items-center w-9 h-9 rounded-xl border " + t.tile}>
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className={"eyebrow " + t.label}>{eyebrow}</p>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mt-0.5">
              <h2 className="text-ink text-base md:text-lg font-semibold tracking-tight">{title}</h2>
              {sub && <span className="text-sm text-ink-2">{sub}</span>}
            </div>
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
  ember: "bg-ember/10 text-ember-text border border-ember/30",
};

export function Chip({ tone = "neutral", children, icon }: { tone?: ChipTone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={"text-xs font-mono px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 " + CHIP_TONES[tone]}>
      {icon}
      {children}
    </span>
  );
}

export function StatusChip({ status, resolved }: { status: string; resolved: boolean }) {
  if (resolved) return <Chip tone="brand" icon={<IconAligned size={13} />}>Reconciled</Chip>;
  if (status === "agreed") return <Chip tone="peri" icon={<IconAligned size={13} />}>Aligned</Chip>;
  if (status === "divergent") return <Chip tone="ember" icon={<IconSplit size={13} />}>Not aligned yet</Chip>;
  if (status === "review") return <Chip tone="cobalt" icon={<IconReview size={13} />}>Facilitator review</Chip>;
  return <Chip>Pending</Chip>;
}

export function GapChip({ gap }: { gap: { leads: string; team: string } | null }) {
  if (!gap) return null;
  return <Chip tone="magenta" icon={<IconGap size={13} />}>Perception gap: leads say {gap.leads}, team says {gap.team}</Chip>;
}

export function SuitCard({ card, children }: { card: DeckCard; children?: ReactNode }) {
  const s = SUIT_STYLE[card.suit];
  return (
    <div className={"lit raise-1 flex rounded-2xl border border-line overflow-hidden " + s.shade}>
      {/* The rail says what the card governs in plain words. Deck suit
          names and internal card ids are not shown: a person answering a
          question should not have to learn a taxonomy first. */}
      <div className={"w-10 md:w-11 shrink-0 flex flex-col items-center justify-between py-3.5 " + s.rail}>
        <span className="text-white/95 text-sm leading-none" aria-hidden="true">{s.glyph}</span>
        <span className="font-mono text-white font-bold uppercase tracking-[0.14em] text-[11px] whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {s.label}
        </span>
      </div>
      <div className="p-4 md:p-5 w-full min-w-0">
        {card.feeds && (
          <p className="text-xs font-mono text-ink-3 mb-2">Feeds {card.feeds}</p>
        )}
        <p className="text-lg md:text-xl text-ink font-medium tracking-tight mb-3 leading-snug">{card.prompt}</p>
        {children}
      </div>
    </div>
  );
}
