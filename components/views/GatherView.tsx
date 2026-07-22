"use client";

import { useState } from "react";
import { CARDS, FREQ, PERSONAS } from "../../lib/deck";
import { useSession } from "../../lib/store";
import { SuitCard, Widget } from "../ui";
import { IconDecidesAlone } from "../Icons";

export default function GatherView() {
  const { responses, setResponse, roles } = useSession();
  const [activePersona, setActivePersona] = useState("p3");
  const persona = PERSONAS.find((p) => p.id === activePersona)!;
  const answered = CARDS.filter((c) => (responses[c.id] || {})[activePersona]).length;

  return (
    <div className="space-y-4">
      <Widget eyebrow="Listen first" title="Async gather" sub={answered + " of " + CARDS.length + " answered"}>
        <p className="text-sm text-ink-2 mb-4">
          Each participant answers on their own time. In production, answers stay private until convergence to prevent anchoring. Switch personas to simulate the distributed team.
        </p>
        <div className="flex flex-wrap gap-2">
          {PERSONAS.map((p) => (
            <button key={p.id} onClick={() => setActivePersona(p.id)}
              className={"px-3 py-1.5 rounded-full text-sm border inline-flex items-center gap-2 " +
                (p.id === activePersona ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
              <IconDecidesAlone size={14} />
              {p.name} <span className="text-xs opacity-70">&middot; {p.tier}</span>
            </button>
          ))}
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm text-ink-2 mb-1.5">
            <span>{persona.name}, {persona.role}</span>
            <span className="font-mono">{Math.round((answered / CARDS.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-ground border border-line overflow-hidden">
            <div className="h-full bg-peri" style={{ width: Math.round((answered / CARDS.length) * 100) + "%" }} />
          </div>
        </div>
      </Widget>
      {CARDS.map((card) => {
        const value = (responses[card.id] || {})[activePersona] || "";
        return (
          <SuitCard key={card.id} card={card}>
            {card.type === "text" || card.type === "blind_definition" ? (
              <textarea value={value} rows={2}
                onChange={(e) => setResponse(card.id, activePersona, e.target.value)}
                placeholder={card.type === "blind_definition"
                  ? "Write your definition. Other answers are hidden until convergence."
                  : "Your answer"}
                className="w-full rounded-lg bg-ground border border-line-strong px-3 py-2 text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(card.type === "frequency" ? FREQ : card.type === "binary" ? ["Yes", "No"] : roles.map((r) => r.title)).map((opt) => (
                  <button key={opt} onClick={() => setResponse(card.id, activePersona, opt)}
                    className={"px-3 py-1.5 rounded-full text-sm border " +
                      (value === opt ? "bg-ink border-ink text-ink-inverse" : "border-line-strong text-ink-2 hover:text-ink hover:border-ink-3")}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </SuitCard>
        );
      })}
    </div>
  );
}
