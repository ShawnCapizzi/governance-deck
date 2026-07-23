// Page header. Every page previously opened straight into a stack of
// identical cards, so there was no "where am I" and no visual rhythm: the
// eye met six panels of equal weight. A header sits outside the cards on
// the page background, carries the section accent, and gives the stack
// something to hang from.
//
// The accent bar uses brand purple, which in this app means chrome and
// identity only. Topic hue belongs to question cards; state colour belongs
// to panels. Keeping the three scopes separate is what makes any of them
// readable.

import { ReactNode } from "react";

export function PageHeader({ eyebrow, title, lead, actions }: {
  eyebrow: string;
  title: string;
  lead?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-5">
      <div className="flex items-start gap-4">
        <span aria-hidden="true"
          className="mt-1.5 w-1 self-stretch rounded-full bg-gradient-to-b from-brand via-peri to-transparent shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-peri">{eyebrow}</p>
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink">{title}</h1>
            {actions}
          </div>
          {lead && (
            <p className="mt-2.5 text-base text-ink-2 max-w-2xl leading-relaxed">{lead}</p>
          )}
        </div>
      </div>
    </header>
  );
}
