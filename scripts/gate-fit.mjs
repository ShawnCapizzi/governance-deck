// Gate 4: card text fit.
//
// Every prompt the deck can render must fit inside the card face at its
// computed size. This gate exists because a single fixed prompt size
// overflowed the longest question by 151px, and neither a compile check nor
// an SSR render catches text running off the end of a fixed-height box:
// the markup is valid, the render succeeds, and the words are simply gone.

import path from "node:path";
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["lib/deck.ts"],
  outfile: ".gates/fit/deck.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  logLevel: "silent",
});

const { CARDS } = await import(path.resolve(".gates/fit/deck.mjs"));

// Must match promptRatio in components/SpineCard.tsx.
const ratio = (len) =>
  len <= 20 ? 0.125 : len <= 45 ? 0.098 : len <= 70 ? 0.084 : len <= 95 ? 0.074 : 0.064;

const RAIL = 0.17, PAD = 0.085, ASPECT = 1.5, LINE_HEIGHT = 1.12, CHAR_W = 0.52;
const WIDTHS = [194, 212, 236];

let failures = 0, worst = null;

for (const W of WIDTHS) {
  const bodyW = W * (1 - RAIL) - 2 * (W * PAD);
  const bodyH = W * ASPECT - 2 * (W * PAD);
  const promptH = bodyH - 18 - 10 - 38 - 10;

  for (const c of CARDS) {
    const f = W * ratio(c.prompt.length);
    const cpl = Math.max(1, Math.floor(bodyW / (f * CHAR_W)));
    const lines = Math.ceil(c.prompt.length / cpl);
    const h = lines * f * LINE_HEIGHT;
    const slack = promptH - h;
    if (!worst || slack < worst.slack) {
      worst = { W, id: c.id, len: c.prompt.length, lines, h: Math.round(h), box: Math.round(promptH), slack: Math.round(slack) };
    }
    if (h > promptH) {
      failures++;
      console.log(`FAIL ${c.id} at ${W}px: ${c.prompt.length} chars, ${lines} lines, ${Math.round(h)}px in a ${Math.round(promptH)}px box`);
    }
  }
}

console.log(`tightest fit: ${worst.id} at ${worst.W}px, ${worst.len} chars, ${worst.lines} lines, ${worst.h}/${worst.box}px, ${worst.slack}px slack`);
if (failures) { console.log(`GATE 4 FAIL: ${failures} prompts overflow the card face`); process.exit(1); }
console.log(`GATE 4 PASS: all ${CARDS.length} prompts fit at every breakpoint`);
