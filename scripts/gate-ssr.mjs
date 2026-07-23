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
  alias: {
    "next/link": path.resolve("scripts/link-stub.tsx"),
    "next/navigation": path.resolve("scripts/navigation-stub.tsx"),
  },
  loader: { ".css": "empty" },
  jsx: "automatic",
  logLevel: "silent",
});

const { renderAll } = await import(path.resolve(".gates/ssr-bundle.mjs"));
const html = renderAll();
// Markers must be single text nodes. React SSR inserts <!-- --> between
// adjacent text nodes, so "Covering for {name}" renders as
// "Covering for <!-- -->Jo Nakamura" and a concatenated marker will miss.
const checks = {
  early: ["Early access", "Align your team once", "Request early access", "Fewer meetings", "Gaps come into view", "Not aligned yet", "decision-rights.md", "shawncapizzi.com"],
  start: ["Run smarter, together", "Fewer meetings", "Start answering", "Try the loop", "Explore the workshop and card deck", "Start a round", "spine-card", "Deal again"],
  signin: ["Running in demo mode", "no database connected"],
  onboarding: ["How this works", "Everyone answers alone", "Documents you keep", "shared space"],
  team: ["Your team", "Set up", "Programs", "Covering for", "Jo Nakamura", "Handoff record", "Curator", "surface-neutral"],
  roles: ["Roles and decision rights", "Name a role", "Held by (person)", "Start from a kit", "AI usage guardrails", "Held by Dana Whitfield"],
  health: ["Where you stand", "aria-label=\"Capizzi\"", "Governance Health", "Waiting on", "Gaps to close", "Settle these now", "Manuscript discipline", "sc-frame"],
  gather: ["Your questions", "questions left", "Your questions", "shade-signals", "surface-action", "minute"],
  converge: ["Needs your decision", "Alignment", "Recovery", "aligned", "surface-action"],
  artifacts: ["truth-signals.md", "What your team decided", "THE CAPIZZI PROCESS", "Download .md", "artifact-paper"],
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
