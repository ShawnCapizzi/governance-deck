// SpineCard, the physical deck face from the Clarity Cards Spine direction,
// rendered in the app. White card, suit-colored left rail carrying the rank
// in mono, the suit name rotated up the rail, and the suit glyph at the
// foot. The body holds an uppercase eyebrow, a large prompt, and a muted
// clarifier. Proportions are calc() off a single --card-w variable so the
// deck holds its shape at every breakpoint, same as the site component.

export interface SpineCardData {
  rank: string;
  suit: string;
  color: string;
  glyph: string;
  eyebrow: string;
  prompt: string;
  clarifier: string;
}

const INK = "#16161A";
const MUTE = "#6A6A73";

export function SpineCard({ card, tilt = 0, dealIndex, dealing = false }: {
  card: SpineCardData; tilt?: number; dealIndex?: number; dealing?: boolean;
}) {
  return (
    <div
      className={"spine-card relative shrink-0 bg-white flex overflow-hidden" + (dealing ? " is-dealing" : "")}
      style={{
        ["--deal-i" as string]: dealIndex ?? 0,
        width: "var(--card-w)",
        height: "calc(var(--card-w) * 1.5)",
        borderRadius: "calc(var(--card-w) * 0.045)",
        transform: "rotate(" + tilt + "deg)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.30), 0 16px 40px -12px rgba(0,0,0,0.60)",
      }}
    >
      <div
        className="flex flex-col items-center justify-between shrink-0"
        style={{
          width: "calc(var(--card-w) * 0.17)",
          background: card.color,
          padding: "calc(var(--card-w) * 0.06) 0",
        }}
      >
        <span className="font-mono font-bold text-white leading-none"
          style={{ fontSize: "calc(var(--card-w) * 0.085)" }}>
          {card.rank}
        </span>
        <span className="font-mono text-white/85 uppercase whitespace-nowrap"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            letterSpacing: "0.22em",
            fontSize: "max(8px, calc(var(--card-w) * 0.038))",
          }}>
          {card.suit}
        </span>
        <span className="text-white leading-none" style={{ fontSize: "calc(var(--card-w) * 0.085)" }}>
          {card.glyph}
        </span>
      </div>

      <div className="flex flex-col" style={{ flex: 1, minWidth: 0, padding: "calc(var(--card-w) * 0.085)" }}>
        <p className="font-mono uppercase"
          style={{
            color: card.color,
            letterSpacing: "0.10em",
            fontSize: "max(8px, calc(var(--card-w) * 0.028))",
            marginBottom: "calc(var(--card-w) * 0.04)",
          }}>
          {card.eyebrow}
        </p>
        <p className="font-semibold tracking-tight"
          style={{ color: INK, lineHeight: 1.08, fontSize: "calc(var(--card-w) * 0.125)" }}>
          {card.prompt}
        </p>
        <p style={{
          color: MUTE,
          marginTop: "calc(var(--card-w) * 0.055)",
          fontSize: "max(12px, calc(var(--card-w) * 0.058))",
          lineHeight: 1.42,
        }}>
          {card.clarifier}
        </p>
      </div>
    </div>
  );
}
