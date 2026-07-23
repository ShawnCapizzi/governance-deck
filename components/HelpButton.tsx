"use client";

// Persistent help affordance. A question mark that is always in the same
// corner is the cheapest way to make a tool feel safe to poke at, which
// matters when the people testing this did not ask to be here and will not
// read a manual.
//
// White on brand purple computes at 4.18 and fails AA, so the trigger is a
// raised surface with a periwinkle glyph (7.06) instead of a purple fill.

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconListen, IconRoles, IconGather, IconConverge, IconArtifacts, IconHealth } from "./Icons";

const TOPICS = [
  {
    Icon: IconRoles,
    title: "Start with your team",
    copy: "Add the people who will answer, then set their level. Contributors answer; curators settle open questions.",
    href: "/team",
    cta: "Go to Team",
  },
  {
    Icon: IconListen,
    title: "Name the roles that decide",
    copy: "Governance decides by role, not by person, so the answer survives turnover. Load a kit if you want a head start.",
    href: "/roles",
    cta: "Go to Roles",
  },
  {
    Icon: IconGather,
    title: "Answer your questions",
    copy: "One question at a time, on your own schedule. A few words is a real answer, and nobody sees yours until everyone finishes.",
    href: "/gather",
    cta: "Answer now",
  },
  {
    Icon: IconConverge,
    title: "Close the gaps",
    copy: "Where answers differed, a named decider picks what stands and writes down why. The reason travels with the decision.",
    href: "/converge",
    cta: "See alignment",
  },
  {
    Icon: IconHealth,
    title: "Track where you stand",
    copy: "See who has finished, who is still open, and how each area moves from no agreed rule to a team that corrects itself.",
    href: "/",
    cta: "See progress",
  },
  {
    Icon: IconArtifacts,
    title: "Take the decisions with you",
    copy: "Every settled question becomes a dated document you can download, drop into a deck, or hand to someone new.",
    href: "/artifacts",
    cta: "See decisions",
  },
];

export function HelpButton() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Help and getting started"
        className="fixed bottom-5 right-5 z-40 w-11 h-11 rounded-full grid place-items-center border border-line-strong bg-raised text-peri hover:text-ink hover:border-ink-3 shadow-lg backdrop-blur-sm">
        <span className="text-lg font-semibold leading-none">?</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6">
          <button aria-label="Close help" onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div role="dialog" aria-modal="true" aria-label="Help and getting started"
            className="relative w-full md:max-w-3xl max-h-[85vh] overflow-y-auto rounded-t-2xl md:rounded-2xl border border-line bg-surface">
            <div className="sticky top-0 flex items-center justify-between gap-4 px-5 md:px-6 py-4 border-b border-line bg-surface">
              <h2 className="text-lg font-semibold tracking-tight text-ink">Help and getting started</h2>
              <button onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-full grid place-items-center border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3"
                aria-label="Close">
                &times;
              </button>
            </div>

            <div className="p-5 md:p-6">
              <p className="text-base text-ink-2 max-w-2xl leading-relaxed">
                This app finds the places your team answers the same question differently, settles each one on the record, and turns the answers into documents anyone can follow. It runs on your own schedule, and no step needs a meeting.
              </p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {TOPICS.map((t) => (
                  <div key={t.title} className="rounded-xl border border-line bg-ground/60 p-4">
                    <div className="flex items-center gap-2.5">
                      <span className="grid place-items-center w-8 h-8 rounded-lg border bg-raised border-line-strong text-ink-2 shrink-0">
                        <t.Icon size={17} />
                      </span>
                      <p className="text-base text-ink font-medium tracking-tight">{t.title}</p>
                    </div>
                    <p className="mt-2 text-base text-ink-2 leading-relaxed">{t.copy}</p>
                    <Link href={t.href} onClick={() => setOpen(false)}
                      className="mt-3 inline-block text-base text-peri hover:text-ink">
                      {t.cta} &rarr;
                    </Link>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-line flex flex-wrap items-center gap-4">
                <Link href="/start" onClick={() => setOpen(false)} className="pill-primary px-5 py-2.5 text-base">
                  Watch the 60 second demo
                </Link>
                <a href="https://www.shawncapizzi.com" className="text-base text-ink-2 hover:text-ink">
                  Workshops and the printed deck
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
