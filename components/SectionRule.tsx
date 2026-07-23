// A labelled divider between groups of panels. Pages were reading as one
// undifferentiated stack of rectangles; this segments them into named
// passages so the eye knows where one idea ends and the next begins.
// The accent follows the nav stage ramp, so a section on a page and its
// group in the sidebar carry the same colour.

export function SectionRule({ label, stage = "set" }: {
  label: string;
  stage?: "set" | "run" | "results";
}) {
  const dot =
    stage === "run" ? "bg-peri" : stage === "results" ? "bg-[#5FC9C0]" : "bg-brand";
  return (
    <div className="flex items-center gap-3 pt-4 pb-1">
      <span aria-hidden="true" className={"h-1.5 w-1.5 rounded-full shrink-0 " + dot} />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3 whitespace-nowrap">{label}</p>
      <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
  );
}
