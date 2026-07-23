"use client";

// Sample question deal.
//
// The four loop cards explain the four steps of the process, and they are a
// sequence, so they deal in order and never shuffle. But that left the deck
// metaphor doing no work: nothing in the app ever showed what the questions
// actually are, and a card that never changes is not a deck.
//
// This is the shuffle. It deals three real questions drawn from the actual
// deck, and dealing again brings up three different ones. That teaches the
// single most important thing about the product, which is what it asks.

import { useState } from "react";
import { CARDS, SUIT_STYLE, SUIT_COLOR } from "../lib/deck";
import { SpineCard, SpineCardData } from "./SpineCard";
import { IconTransformation } from "./Icons";

const GLYPH: Record<string, string> = {
  Signals: "\u25C6", Bounds: "\u25A0", Trace: "\u25B2", Spine: "\u2726", Diagnostic: "\u25CF",
};
const COLOR: Record<string, string> = {
  Signals: SUIT_COLOR.signals, Bounds: SUIT_COLOR.bounds, Trace: SUIT_COLOR.trace,
  Spine: SUIT_COLOR.spine, Diagnostic: SUIT_COLOR.diagnostic,
};

// What each area of the deck is actually asking about, in plain words.
const WHY: Record<string, string> = {
  Signals: "What your team refuses to compromise on.",
  Bounds: "What nobody may change alone.",
  Trace: "How you undo something that went wrong.",
  Spine: "How a rule changes once it exists.",
  Diagnostic: "How often this actually happens.",
};

function pick(n: number, exclude: Set<string>): typeof CARDS {
  const pool = CARDS.filter((c) => !exclude.has(c.id));
  const source = pool.length >= n ? pool : CARDS.slice();
  const shuffled = source.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

export function QuestionDeal() {
  const [hand, setHand] = useState(() => CARDS.slice(0, 3));
  const [dealKey, setDealKey] = useState(0);

  const deal = () => {
    setHand(pick(3, new Set(hand.map((c) => c.id))));
    setDealKey((k) => k + 1);
  };

  const faces: SpineCardData[] = hand.map((c, i) => ({
    rank: String(i + 1).padStart(2, "0"),
    suit: SUIT_STYLE[c.suit].label,
    color: COLOR[c.suit] ?? SUIT_COLOR.signals,
    glyph: GLYPH[c.suit] ?? "\u25C6",
    eyebrow: SUIT_STYLE[c.suit].label,
    prompt: c.prompt,
    clarifier: WHY[c.suit] ?? "",
  }));

  return (
    <div>
      <div className="clarity-deck flex flex-wrap justify-center gap-4 md:gap-5 pt-2 pb-1">
        {faces.map((f, i) => (
          <SpineCard key={f.prompt + "-" + dealKey} card={f}
            tilt={[-2, 1, 2][i] ?? 0} dealIndex={i} dealing />
        ))}
      </div>
      <div className="flex justify-center pt-5">
        <button onClick={deal}
          className="px-5 py-2.5 rounded-full text-base border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3 inline-flex items-center gap-2">
          <IconTransformation size={16} />
          Deal three more
        </button>
      </div>
    </div>
  );
}
