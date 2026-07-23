// A one-minute visual of the async loop, shown where people commit: the
// onboarding screen. Four steps, connected left to right on desktop and
// top to bottom on mobile. Step one carries timestamps because async is
// the point: nobody has to be in a room, or even awake at the same time.

import { ReactNode } from "react";
import { IconListen, IconSplit, IconAligned, IconArtifacts } from "./Icons";

const STEPS: {
  Icon: (p: { size?: number }) => ReactNode;
  tile: string;
  title: string;
  copy: string;
  chips?: string[];
}[] = [
  {
    Icon: IconListen,
    tile: "bg-peri/12 border-peri/35 text-peri",
    title: "Everyone answers alone",
    copy: "Each person answers on their own schedule. No meeting, and nobody anchors on the loudest voice.",
    chips: ["Mon 9:14a", "Tue 11:52p", "Thu 7:03a"],
  },
  {
    Icon: IconSplit,
    tile: "bg-ember/10 border-ember/30 text-ember",
    title: "Disagreements surface",
    copy: "Matching answers settle themselves. Where the team split, it gets flagged, often where everyone assumed agreement.",
  },
  {
    Icon: IconAligned,
    tile: "bg-brand/15 border-brand/40 text-peri",
    title: "Settled on the record",
    copy: "A named decider picks what stands and writes down why. The reason travels with the decision.",
  },
  {
    Icon: IconArtifacts,
    tile: "bg-[#1B6D68]/25 border-[#5FC9C0]/40 text-[#5FC9C0]",
    title: "Documents you keep",
    copy: "Decisions become dated documents anyone new can read and follow. Nothing lives in one person's head.",
  },
];

export function HowItWorks() {
  return (
    <ol className="flex flex-col md:flex-row md:items-stretch gap-2 md:gap-0">
      {STEPS.map((s, i) => (
        <li key={s.title} className="contents">
          <div className="flex-1 rounded-xl border border-line bg-ground/60 p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <span className={"grid place-items-center w-8 h-8 rounded-lg border shrink-0 " + s.tile}>
                <s.Icon size={17} />
              </span>
              <span className="font-mono text-xs text-ink-3">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="text-base text-ink font-medium tracking-tight">{s.title}</p>
            <p className="text-[15px] leading-relaxed text-ink-2 mt-1">{s.copy}</p>
            {s.chips && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {s.chips.map((c) => (
                  <span key={c} className="text-xs font-mono px-2 py-0.5 rounded-full bg-raised text-ink-2 border border-line-strong">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className="self-center text-ink-3 px-1.5 hidden md:block">&rarr;</span>
          )}
          {i < STEPS.length - 1 && (
            <span aria-hidden="true" className="self-center text-ink-3 md:hidden">&darr;</span>
          )}
        </li>
      ))}
    </ol>
  );
}
