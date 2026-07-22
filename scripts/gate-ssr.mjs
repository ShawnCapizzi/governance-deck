// Gate 2: SSR render every view under Node and verify content markers.
// Compile-clean is not sufficient; the layout must actually render.
import { build } from "esbuild";
import path from "node:path";

await build({
  entryPoints: ["scripts/ssr-entry.tsx"],
  bundle: true,
  format: "esm",
  platform: "node",
  outfile: ".gates/ssr-bundle.mjs",
  external: ["react", "react/jsx-runtime", "react-dom", "react-dom/server"],
  alias: { "next/link": path.resolve("scripts/link-stub.tsx") },
  loader: { ".css": "empty" },
  jsx: "automatic",
  logLevel: "silent",
});

const { renderAll } = await import(path.resolve(".gates/ssr-bundle.mjs"));
const html = renderAll();
const checks = {
  start: ["How the deck works", "Try the loop", "Bring this to your org", "spine-card", "Deal again"],
  roles: ["Name a role", "Held by (person)", "Start from a kit", "AI usage guardrails", "Held by Dana Whitfield", "surface-visible"],
  health: ["aria-label=\"Capizzi\"", "Governance Health", "Facilitator queue", "Manuscript discipline", "sc-frame"],
  gather: ["Async gather", "SIG-1", "shade-signals", "surface-listen"],
  converge: ["Convergence", "SIG-4", "aligned", "surface-visible"],
  artifacts: ["truth-signals.md", "decision-rights.md", "surface-proved"],
};
let fail = false;
for (const [view, markers] of Object.entries(checks)) {
  const missing = markers.filter((m) => !html[view].includes(m));
  if (missing.length) {
    fail = true;
    console.error("GATE 2 FAIL:", view, "missing:", missing.join(", "));
  } else {
    console.log("ok:", view, "renders", html[view].length, "chars, markers present");
  }
}
if (fail) process.exit(1);
console.log("GATE 2 PASS: all views SSR render with markers");
