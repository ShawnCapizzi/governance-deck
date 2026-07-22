"use client";

// In-memory session store for v1. Lives in the root layout so state
// survives client-side navigation between Gather, Converge, Health,
// and Artifacts. Production wiring to Supabase is specified in CLAUDE.md.

import { createContext, useContext, useState, ReactNode } from "react";
import { SEED, ResponseMap, Resolution } from "./deck";

interface SessionState {
  responses: ResponseMap;
  setResponse: (cardId: string, personaId: string, value: string) => void;
  resolved: Record<string, Resolution>;
  reconcile: (cardId: string, resolution: Resolution) => void;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<ResponseMap>(SEED);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const setResponse = (cardId: string, personaId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [cardId]: { ...(prev[cardId] || {}), [personaId]: value } }));
  };
  const reconcile = (cardId: string, resolution: Resolution) => {
    setResolved((prev) => ({ ...prev, [cardId]: resolution }));
  };
  return <Ctx.Provider value={{ responses, setResponse, resolved, reconcile }}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
