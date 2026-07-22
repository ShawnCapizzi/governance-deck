// Icon set. Geometric line icons on a 24 grid, 1.5 stroke, currentColor
// throughout so every icon inherits pillar color. No icon library
// dependency: the set is small, deliberate, and drawn for this product.
// Shapes lean structural (rails, gates, stacks, splits) rather than
// decorative, because the subject is governance, not consumer software.

import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" {...rest}>
      {children}
    </svg>
  );
}

// --- Pillars ---------------------------------------------------------------

// Listen first: concentric signal arcs meeting a point.
export const IconListen = (p: IconProps) => (
  <Base {...p}>
    <circle cx="6" cy="12" r="1.6" />
    <path d="M11 7.5a6.5 6.5 0 0 1 0 9" />
    <path d="M15 4.5a11 11 0 0 1 0 15" />
    <path d="M19 2a15.5 15.5 0 0 1 0 20" />
  </Base>
);

// Make it visible: a frame with its contents brought into view.
export const IconVisible = (p: IconProps) => (
  <Base {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
    <path d="M2.5 9h19" />
    <path d="M7 13.5h6" />
    <path d="M7 16.5h10" />
  </Base>
);

// Prove it worked: a checked gate.
export const IconProved = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.5 4 6v6c0 4.6 3.3 8.3 8 9.5 4.7-1.2 8-4.9 8-9.5V6z" />
    <path d="m8.75 11.75 2.25 2.25 4.25-4.5" />
  </Base>
);

// Continuity: linked segments carrying through.
export const IconSpine = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 14.5a4 4 0 0 1 0-5.5l2-2a4 4 0 0 1 5.5 5.5l-1 1" />
    <path d="M14.5 9.5a4 4 0 0 1 0 5.5l-2 2A4 4 0 0 1 7 11.5l1-1" />
  </Base>
);

// --- Navigation ------------------------------------------------------------

export const IconHealth = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 20.5h18" />
    <rect x="4" y="13" width="3.6" height="7.5" rx="0.8" />
    <rect x="10.2" y="8.5" width="3.6" height="12" rx="0.8" />
    <rect x="16.4" y="4" width="3.6" height="16.5" rx="0.8" />
  </Base>
);

export const IconStart = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 5.5A2 2 0 0 1 6 3.5h5v17H6a2 2 0 0 0-2 2z" />
    <path d="M20 5.5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z" />
  </Base>
);

export const IconRoles = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8.5" cy="8" r="3" />
    <path d="M3 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <circle cx="17.5" cy="10" r="2.4" />
    <path d="M15 20c0-2.4 1.4-4 3.5-4S22 17.6 22 20" />
  </Base>
);

export const IconGather = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3.5" width="7" height="7" rx="1.4" />
    <rect x="14" y="3.5" width="7" height="7" rx="1.4" />
    <rect x="3" y="13.5" width="7" height="7" rx="1.4" />
    <rect x="14" y="13.5" width="7" height="7" rx="1.4" />
  </Base>
);

export const IconConverge = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 4c0 5 3.5 7 8 8" />
    <path d="M4 20c0-5 3.5-7 8-8" />
    <path d="M12 12h7" />
    <path d="m16.5 8.5 3.5 3.5-3.5 3.5" />
  </Base>
);

export const IconArtifacts = (p: IconProps) => (
  <Base {...p}>
    <path d="M13.5 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M13.5 2.5V8H19" />
    <path d="M8.75 13h6.5M8.75 16.5h4.5" />
  </Base>
);

// --- Role kits -------------------------------------------------------------

export const IconProduct = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.75 20.5 7v10L12 21.25 3.5 17V7z" />
    <path d="M3.5 7 12 11.5 20.5 7" />
    <path d="M12 11.5v9.75" />
  </Base>
);

export const IconTransformation = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 12a8 8 0 0 1-13.9 5.4" />
    <path d="M4 12a8 8 0 0 1 13.9-5.4" />
    <path d="M17.5 2.5v4.2h-4.2" />
    <path d="M6.5 21.5v-4.2h4.2" />
  </Base>
);

export const IconSystem = (p: IconProps) => (
  <Base {...p}>
    <rect x="3" y="3" width="8" height="8" rx="1.4" />
    <rect x="13" y="3" width="8" height="4.5" rx="1.4" />
    <rect x="13" y="9.5" width="8" height="11.5" rx="1.4" />
    <rect x="3" y="13" width="8" height="8" rx="1.4" />
  </Base>
);

export const IconRegulated = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.5 4.5 5.75v6c0 4.4 3.1 8 7.5 9.75 4.4-1.75 7.5-5.35 7.5-9.75v-6z" />
    <path d="M12 8v4.5" />
    <path d="M12 15.75h.01" />
  </Base>
);

// --- Decision modes --------------------------------------------------------

export const IconDecidesAlone = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="7.5" r="3.25" />
    <path d="M5.5 20.5c0-3.6 2.9-6.25 6.5-6.25s6.5 2.65 6.5 6.25" />
  </Base>
);

export const IconConsults = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 6.5A2 2 0 0 1 5.5 4.5h9a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-4.5 3z" />
    <path d="M18.5 9.5h.5a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-.75l-3 2.5v-2.5" />
  </Base>
);

export const IconConsensus = (p: IconProps) => (
  <Base {...p}>
    <circle cx="8.75" cy="12" r="5.25" />
    <circle cx="15.25" cy="12" r="5.25" />
  </Base>
);

export const IconEscalates = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20.5V4.5" />
    <path d="m6.5 10 5.5-5.5L17.5 10" />
    <path d="M4.5 21.5h15" />
  </Base>
);

// --- Status ----------------------------------------------------------------

export const IconAligned = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.25 12.25 2.5 2.5 5-5.5" />
  </Base>
);

export const IconSplit = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.5v5" />
    <path d="M12 8.5 6.5 14v6.5" />
    <path d="M12 8.5 17.5 14v6.5" />
  </Base>
);

export const IconReview = (p: IconProps) => (
  <Base {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12" />
    <circle cx="12" cy="12" r="2.75" />
  </Base>
);

export const IconGap = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 8h6.5" />
    <path d="M14 8h6.5" />
    <path d="M3.5 16h6.5" />
    <path d="M14 16h6.5" />
    <path d="M12 3v3M12 10.5v3M12 18v3" />
  </Base>
);

export const IconAdd = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
