"use client";

// LaserFrame, ported from shawncapizzi.com. Implements the contract in
// laserframe.css: three comet strokes (glow, mid, head) ride the same
// rounded path normalized to pathLength 100, revealed and orbiting once
// the card scrolls into view. Reduced motion handled in the CSS.

import { useEffect, useRef, useState, CSSProperties } from "react";
import "./laserframe.css";

export function LaserFrame({ radius = 15, delay = 0 }: { radius?: number; delay?: number }) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={"sc-frame" + (inView ? " is-inview" : "")}
      style={{ "--sc-delay": delay + "s" } as CSSProperties}
      aria-hidden="true"
    >
      <rect className="comet comet-glow" x="0" y="0" width="100%" height="100%" rx={radius} pathLength={100} />
      <rect className="comet comet-mid" x="0" y="0" width="100%" height="100%" rx={radius} pathLength={100} />
      <rect className="comet comet-head" x="0" y="0" width="100%" height="100%" rx={radius} pathLength={100} />
    </svg>
  );
}
