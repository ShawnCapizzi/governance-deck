// Product visual for the campaign hero. Campaign pages that convert show
// the thing; a wall of type asks people to imagine it. This is a simplified,
// non-interactive mock of the alignment view built from the same tokens as
// the real app, so it cannot drift out of brand.
//
// It is decorative, so it is hidden from assistive technology and the page
// copy carries the same information in prose.

import { IconAligned, IconSplit } from "./Icons";

const ROWS = [
  { name: "Dana", answer: "Creative Director", match: true },
  { name: "Marcus", answer: "Creative Director", match: true },
  { name: "Priya", answer: "Creative Director", match: true },
  { name: "Jo", answer: "Brand Owner", match: false },
  { name: "Sam", answer: "Brand Owner", match: false },
];

export function ProductVisual() {
  return (
    <div aria-hidden="true" className="lit raise-2 select-none rounded-2xl border border-line bg-surface overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-3 border-b border-line bg-raised">
        <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
        <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
        <span className="w-2.5 h-2.5 rounded-full bg-line-strong" />
        <span className="ml-2 font-mono text-xs text-ink-3">Alignment</span>
      </div>

      <div className="p-4 md:p-5">
        <div className="flex rounded-xl border border-line overflow-hidden shade-signals">
          <div className="w-9 shrink-0 flex flex-col items-center justify-between py-3 bg-[#6355BB]">
            <span className="text-white text-sm leading-none">&#9670;</span>
            <span className="font-mono text-white font-bold uppercase tracking-[0.14em] text-[11px] whitespace-nowrap"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
              Beliefs
            </span>
          </div>
          <div className="p-4 min-w-0 flex-1">
            <p className="text-base md:text-lg text-ink font-medium tracking-tight leading-snug">
              Who decides what good looks like for a deliverable?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 bg-ember/10 text-ember-text border border-ember/30">
                <IconSplit size={13} />
                Not aligned yet
              </span>
            </div>
            <div className="mt-3 divide-y divide-line/70 border-y border-line/70">
              {ROWS.map((r) => (
                <div key={r.name} className="flex flex-wrap gap-x-4 gap-y-0.5 py-2">
                  <span className="font-mono text-xs text-ink-2 w-16 shrink-0 pt-1 uppercase tracking-wide">
                    {r.name}
                  </span>
                  <span className="text-sm text-ink flex-1 min-w-0">{r.answer}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-line p-4 surface-done">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center w-7 h-7 rounded-lg border bg-[#1B6D68]/25 border-[#5FC9C0]/40 text-[#5FC9C0] shrink-0">
              <IconAligned size={15} />
            </span>
            <p className="text-base text-ink font-medium tracking-tight">Settled</p>
          </div>
          <p className="mt-2 text-sm text-ink-2 leading-relaxed">
            Creative Director decides. Brand Owner is consulted first on anything client facing.
          </p>
          <p className="mt-1.5 font-mono text-xs text-ink-3">decision-rights.md &middot; v1.0.0</p>
        </div>
      </div>
    </div>
  );
}
