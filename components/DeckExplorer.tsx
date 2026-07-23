"use client";

// One deck, two views.
//
// This page previously had three separate card moments: four step cards,
// three sample question cards, and an interactive demo that also shows a
// real question. Three decks stacked down one page reads as repetition, and
// the reader has to work out why they are being shown cards again.
//
// So the how and the what share a single card area with a toggle. The
// physical space is the same, the deck metaphor pays off once instead of
// three times, and the two views answer the two questions a newcomer
// actually has: how does this work, and what will it ask me.
//
// The two views behave differently on purpose. Steps are a sequence, so
// they deal 01 to 04 in order and never shuffle. Questions are a deck, so
// they shuffle to three different ones every time.

import { useEffect, useState } from "react";
import { CARDS, SUIT_STYLE, SUIT_COLOR } from "../lib/deck";
import { SpineCard, SpineCardData } from "./SpineCard";
import { IconTransformation } from "./Icons";

const STEPS: SpineCardData[] = [
  { rank: "01", suit: "Answer", color: SUIT_COLOR.signals, glyph: "\u25C6",
    eyebrow: "On your own time", prompt: "Gather",
    clarifier: "Everyone answers privately, so nobody anchors on the loudest voice in the room." },
  { rank: "02", suit: "Resolve", color: SUIT_COLOR.bounds, glyph: "\u25A0",
    eyebrow: "Where answers differ", prompt: "Align",
    clarifier: "Matching answers settle themselves. Only the real gaps need anyone's attention." },
  { rank: "03", suit: "Track", color: SUIT_COLOR.trace, glyph: "\u25B2",
    eyebrow: "Every cycle", prompt: "Measure",
    clarifier: "Each area climbs five stages, from no agreed rule to a team that corrects itself." },
  { rank: "04", suit: "Share", color: SUIT_COLOR.spine, glyph: "\u2726",
    eyebrow: "Yours to keep", prompt: "Decide",
    clarifier: "Decisions become dated documents you can send, present, or hand to someone new." },
];

const GLYPH: Record<string, string> = {
  Signals: "\u25C6", Bounds: "\u25A0", Trace: "\u25B2", Spine: "\u2726", Diagnostic: "\u25CF",
};
const COLOR: Record<string, string> = {
  Signals: SUIT_COLOR.signals, Bounds: SUIT_COLOR.bounds, Trace: SUIT_COLOR.trace,
  Spine: SUIT_COLOR.spine, Diagnostic: SUIT_COLOR.diagnostic,
};
const WHY: Record<string, string> = {
  Signals: "What your team refuses to compromise on.",
  Bounds: "What nobody may change alone.",
  Trace: "How you undo something that went wrong.",
  Spine: "How a rule changes once it exists.",
  Diagnostic: "How often this actually happens.",
};

function shuffleAway(exclude: Set<string>) {
  const pool = CARDS.filter((c) => !exclude.has(c.id));
  const source = pool.length >= 4 ? pool : CARDS.slice();
  const s = source.slice();
  for (let i = s.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [s[i], s[j]] = [s[j], s[i]];
  }
  return s.slice(0, 4);
}

export function DeckExplorer() {
  const [view, setView] = useState<"steps" | "questions">("steps");
  const [hand, setHand] = useState(() => CARDS.slice(0, 4));
  const [dealKey, setDealKey] = useState(0);
  const [dealing, setDealing] = useState(false);

  useEffect(() => {
    setDealing(true);
    const t = setTimeout(() => setDealing(false), 1100);
    return () => clearTimeout(t);
  }, [dealKey, view]);

  const questionFaces: SpineCardData[] = hand.map((c, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    suit: SUIT_STYLE[c.suit].label,
    color: COLOR[c.suit] ?? SUIT_COLOR.signals,
    glyph: GLYPH[c.suit] ?? "\u25C6",
    eyebrow: SUIT_STYLE[c.suit].label,
    prompt: c.prompt,
    clarifier: WHY[c.suit] ?? "",
  }));

  const faces = view === "steps" ? STEPS : questionFaces;

  const again = () => {
    if (view === "questions") setHand(shuffleAway(new Set(hand.map((c) => c.id))));
    setDealKey((k) => k + 1);
  };

  const tab = (key: "steps" | "questions", label: string) => (
    <button key={key} onClick={() => { setView(key); setDealKey((k) => k + 1); }}
      aria-pressed={view === key}
      className={"px-4 py-2 rounded-full text-base transition-colors " +
        (view === key ? "bg-ink text-ink-inverse font-medium" : "text-ink-2 hover:text-ink")}>
      {label}
    </button>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-1 p-1 rounded-full border border-line-strong bg-ground/60">
          {tab("steps", "How it works")}
          {tab("questions", "What it asks")}
        </div>
        <p className="text-base text-ink-2">
          {view === "steps"
            ? "Four steps, all on your own schedule."
            : "Real questions from the deck."}
        </p>
      </div>

      <div className="clarity-deck flex flex-wrap justify-center gap-4 md:gap-5 pt-2 pb-1">
        {faces.map((f, i) => (
          <SpineCard key={f.prompt + "-" + dealKey} card={f}
            tilt={[-2.5, 1.5, -1.5, 2.5][i] ?? 0} dealIndex={i} dealing={dealing} />
        ))}
      </div>

      <div className="flex justify-center pt-5">
        <button onClick={again}
          className="px-5 py-2.5 rounded-full text-base border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3 inline-flex items-center gap-2">
          <IconTransformation size={16} />
          {view === "steps" ? "Deal again" : "Deal four more"}
        </button>
      </div>
    </div>
  );
}
