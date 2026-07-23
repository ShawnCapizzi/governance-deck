"use client";

// ArtifactDoc renders a generated governance artifact as a finished
// document rather than a screen element: warm paper, dark ink, a ruled
// masthead, and a provenance footer. The visual break from the dark app
// is deliberate. An artifact is the thing you hand to someone, so it
// should look like paper, not like UI.
//
// Exports, all dependency-free:
//   .md   Blob download, the canonical versioned file
//   .png  drawn to canvas at 2x, sized for a slide, for PowerPoint or Keynote
//   copy  clipboard, for pasting into a doc or ticket
//   print browser print dialog, which also yields Save as PDF

import { useRef, useState } from "react";
import { IconArtifacts, IconAdd, IconAligned } from "./Icons";

const PAPER = "#FBFAF7";
const PAPER_INK = "#16161A";
const PAPER_MUTE = "#6A6A73";

export interface ArtifactDocProps {
  filename: string;
  title: string;
  version: string;
  session: string;
  provenance: string;
  accent: string;
  lines: string[];
  status: "draft" | "final";
}

function download(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Draw the document to a canvas at 2x. Content is plain text lines, so
// canvas drawing is exact and needs no html-to-image dependency.
function exportPng(doc: ArtifactDocProps) {
  const scale = 2;
  const W = 1000;
  const padX = 72;
  const lineH = 30;
  const headH = 190;
  const footH = 84;
  const H = Math.max(620, headH + doc.lines.length * lineH + footH);

  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = doc.accent;
  ctx.fillRect(0, 0, W, 8);

  ctx.fillStyle = doc.accent;
  ctx.font = "600 13px ui-monospace, Menlo, monospace";
  ctx.fillText("THE CAPIZZI PROCESS", padX, 62);

  ctx.fillStyle = PAPER_INK;
  ctx.font = "700 34px ui-sans-serif, -apple-system, Segoe UI, sans-serif";
  ctx.fillText(doc.title, padX, 106);

  ctx.fillStyle = PAPER_MUTE;
  ctx.font = "14px ui-monospace, Menlo, monospace";
  ctx.fillText(doc.filename + "   v" + doc.version + "   " + doc.status.toUpperCase(), padX, 134);
  ctx.fillText(doc.session, padX, 156);

  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padX, 172);
  ctx.lineTo(W - padX, 172);
  ctx.stroke();

  let y = headH + 12;
  doc.lines.forEach((raw) => {
    const line = raw ?? "";
    const isBullet = line.trimStart().startsWith("-");
    const isIndent = line.startsWith("  ");
    ctx.fillStyle = isIndent ? PAPER_MUTE : PAPER_INK;
    ctx.font = (isBullet && !isIndent ? "500 " : "") + "16px ui-monospace, Menlo, monospace";
    ctx.fillText(line, padX + (isIndent ? 18 : 0), y);
    y += lineH;
  });

  ctx.strokeStyle = "rgba(0,0,0,0.14)";
  ctx.beginPath();
  ctx.moveTo(padX, H - 56);
  ctx.lineTo(W - padX, H - 56);
  ctx.stroke();
  ctx.fillStyle = PAPER_MUTE;
  ctx.font = "13px ui-monospace, Menlo, monospace";
  ctx.fillText(doc.provenance, padX, H - 32);

  canvas.toBlob((blob) => {
    if (blob) download(doc.filename.replace(/\.md$/, "") + ".png", blob);
  }, "image/png");
}

export function ArtifactDoc(props: ArtifactDocProps) {
  const { filename, title, version, session, provenance, accent, lines, status } = props;
  const [copied, setCopied] = useState(false);
  const paperRef = useRef<HTMLDivElement>(null);

  const markdown = ["# " + title, "", "File: " + filename, "Version: " + version,
    "Session: " + session, "Provenance: " + provenance, "", ...lines].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="artifact-doc rounded-2xl overflow-hidden border border-line">
      <div ref={paperRef} className="artifact-paper relative px-6 py-7 md:px-10 md:py-9"
        style={{ background: PAPER, color: PAPER_INK }}>
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-2" style={{ background: accent }} />

        <p className="font-mono text-[11px] tracking-[0.2em] font-semibold" style={{ color: accent }}>
          THE CAPIZZI PROCESS
        </p>
        <h3 className="text-xl md:text-2xl font-bold tracking-tight mt-1.5" style={{ color: PAPER_INK }}>
          {title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs" style={{ color: PAPER_MUTE }}>
          <span>{filename}</span>
          <span>v{version}</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full"
            style={{
              color: status === "final" ? "#1B6D68" : "#8A5A18",
              background: status === "final" ? "rgba(27,109,104,0.10)" : "rgba(138,90,24,0.10)",
            }}>
            {status === "final" ? <IconAligned size={12} /> : null}
            {status === "final" ? "FINAL" : "DRAFT"}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs" style={{ color: PAPER_MUTE }}>{session}</p>

        <div className="my-5 h-px" style={{ background: "rgba(0,0,0,0.14)" }} />

        <div className="font-mono text-sm leading-7">
          {lines.map((line, i) => {
            const indent = line.startsWith("  ");
            return (
              <p key={i} className={indent ? "pl-5" : ""}
                style={{ color: indent ? PAPER_MUTE : PAPER_INK, minHeight: "1.75rem" }}>
                {line}
              </p>
            );
          })}
        </div>

        <div className="mt-6 pt-4 font-mono text-xs" style={{ borderTop: "1px solid rgba(0,0,0,0.14)", color: PAPER_MUTE }}>
          {provenance}
        </div>
      </div>

      <div className="artifact-actions flex flex-wrap items-center gap-2 px-4 py-3 bg-raised border-t border-line">
        <button onClick={() => download(filename, new Blob([markdown], { type: "text/markdown" }))}
          className="pill-primary px-4 py-2 text-sm gap-1.5">
          <IconArtifacts size={15} />
          Download .md
        </button>
        <button onClick={() => exportPng(props)}
          className="px-4 py-2 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3 inline-flex items-center gap-1.5">
          <IconAdd size={15} />
          Image for slides
        </button>
        <button onClick={copy}
          className="px-4 py-2 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
          {copied ? "Copied" : "Copy text"}
        </button>
        <button onClick={() => window.print()}
          className="px-4 py-2 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
          Print or PDF
        </button>
      </div>
    </div>
  );
}
