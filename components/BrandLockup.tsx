// Brand lockup. The signature wordmark and the product name were two loose
// pieces of text, which reads as a caption rather than a logo. A lockup
// needs a fixed relationship: the mark, a rule, and the product name in a
// treatment that is clearly typographic rather than body copy.

import { Wordmark } from "./Wordmark";

export function BrandLockup({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex flex-col gap-1.5">
      <Wordmark className={(compact ? "h-5" : "h-6") + " w-auto text-ink"} />
      <span aria-hidden="true" className="block h-px w-full bg-gradient-to-r from-brand via-peri/60 to-transparent" />
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink-2 whitespace-nowrap">
        Governance Deck
      </span>
    </div>
  );
}
