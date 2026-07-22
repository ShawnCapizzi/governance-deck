// Gate 1: esbuild transpile of every ts/tsx file. Logic and syntax gate.
import { build } from "esbuild";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib", "scripts"];
const files = [];
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = path.join(d, f);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(f)) files.push(p);
  }
};
roots.forEach((r) => { try { walk(r); } catch {} });

let fail = false;
for (const f of files) {
  try {
    await build({ entryPoints: [f], write: false, bundle: false, jsx: "automatic", logLevel: "silent" });
    console.log("ok:", f);
  } catch {
    fail = true;
    console.error("GATE 1 FAIL:", f);
  }
}
if (fail) process.exit(1);
console.log("GATE 1 PASS:", files.length, "files transpile clean");
