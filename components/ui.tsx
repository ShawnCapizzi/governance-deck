// Shared UI atoms. Amplenote cockpit grammar rendered in the
// shawncapizzi.com design system: card-surface with the site's own
// sheen and glow, periwinkle eyebrows, rounded-full chips, and an
// optional LaserFrame comet on hero and CTA cards.

import { ReactNode } from "react";
import { DeckCard, SUIT_STYLE } from "../lib/deck";
import { LaserFrame } from "./LaserFrame";
import { IconListen, IconVisible, IconProved, IconSpine, IconAligned, IconSplit, IconReview, IconGap } from "./Icons";

// Pillar segmentation. The eyebrow already names the pillar, so the
// surface tint and eyebrow color derive from it automatically. No view
// has to remember which class to use, and the coding stays consistent.
const PILLAR: Record<string, {
  surface: string; eyebrow: string; tile: string; rule: string;
  Icon: (p: { size?: number }) => React.ReactElement;
}> = {
  "listen first": {
    surface: "surface-listen", eyebrow: "eyebrow-listen",
    tile: "bg-peri/12 border-peri/35 text-peri", rule: "bg-peri/70", Icon: IconListen,
  },
  "make it visible": {
    surface: "surface-visible", eyebrow: "eyebrow-visible",
    tile: "bg-cobalt/18 border-cobalt/45 text-[#9DA9FF]", rule: "bg-cobalt", Icon: IconVisible,
  },
  "prove it worked": {
    surface: "surface-proved", eyebrow: "eyebrow-proved",
    tile: "bg-magenta/12 border-magenta/35 text-magenta", rule: "bg-magenta/70", Icon: IconProved,
  },
  continuity: {
    surface: "surface-continuity", eyebrow: "eyebrow-continuity",
    tile: "bg-[#1B6D68]/25 border-[#5FC9C0]/40 text-[#5FC9C0]", rule: "bg-[#5FC9C0]/70", Icon: IconSpine,
  },
};

function pillarOf(eyebrow: string) {
  return PILLAR[eyebrow.trim().toLowerCase()] ?? null;
}

export function Widget({ eyebrow, title, sub, children, className = "", laser = false, glow = false, laserDelay = 0, icon }: {
  eyebrow: string; title: string; sub?: string; children: ReactNode;
  className?: string; laser?: boolean; glow?: boolean; laserDelay?: number;
  icon?: ReactNode;
}) {
  const p = pillarOf(eyebrow);
  const Icon = p?.Icon;
  return (
    <section className={"relative overflow-hidden border border-line rounded-2xl " + (p ? p.surface : "surface-neutral") + " " + className}>
      {/* Color blocking: a solid pillar rule across the head of every card.
          This is the structural cue that survives a squint test in a room. */}
      <div aria-hidden="true" className={"absolute inset-x-0 top-0 h-[3px] " + (p ? p.rule : "bg-line-strong")} />
      {glow && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(107,92,255,0.22) 0%, rgba(107,92,255,0.06) 45%, transparent 75%)" }} />
      )}
      <div className="relative p-5 md:p-6">
        <header className="mb-4 flex items-start gap-3">
          <span className={"mt-0.5 shrink-0 grid place-items-center w-9 h-9 rounded-xl border " + (p ? p.tile : "bg-raised border-line-strong text-ink-2")}>
            {icon ?? (Icon ? <Icon size={19} /> : null)}
          </span>
          <div className="min-w-0 flex-1">
            <p className={"eyebrow " + (p ? p.eyebrow : "")}>{eyebrow}</p>
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
  ember: "bg-ember/10 text-ember border border-ember/30",
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
  if (status === "divergent") return <Chip tone="ember" icon={<IconSplit size={13} />}>Split</Chip>;
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
    <div className={"flex rounded-2xl border border-line overflow-hidden " + s.shade}>
      {/* Deck-face rail: the card id reads as a rank, the suit name runs
          up the rail, and the glyph anchors the foot, same anatomy as the
          physical Spine cards. */}
      <div className={"w-11 md:w-12 shrink-0 flex flex-col items-center justify-between py-3 " + s.rail}>
        <span className="font-mono text-[11px] md:text-xs font-bold text-white leading-none tracking-tight">
          {card.id}
        </span>
        <span className="font-mono text-white/80 uppercase tracking-[0.2em] text-[9px]"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
          {card.suit}
        </span>
        <span className="text-white/90 text-sm leading-none" aria-hidden="true">{s.glyph}</span>
      </div>
      <div className="p-4 md:p-5 w-full min-w-0">
        {card.feeds && (
          <p className="text-xs font-mono text-ink-3 mb-2">&rarr; {card.feeds}</p>
        )}
        <p className="text-base text-ink mb-3 leading-relaxed">{card.prompt}</p>
        {children}
      </div>
    </div>
  );
}
