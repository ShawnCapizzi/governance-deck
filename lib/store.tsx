"use client";

// In-memory session store for v1. Lives in the root layout so state
// survives client-side navigation between Gather, Converge, Health,
// and Artifacts. Production wiring to Supabase is specified in CLAUDE.md.

import { createContext, useContext, useState, ReactNode } from "react";
import { SEED, ResponseMap, Resolution, Role, DEFAULT_ROLES, RoleKit } from "./deck";

interface SessionState {
  responses: ResponseMap;
  setResponse: (cardId: string, personaId: string, value: string) => void;
  resolved: Record<string, Resolution>;
  reconcile: (cardId: string, resolution: Resolution) => void;
  roles: Role[];
  addRole: (role: Omit<Role, "id">) => void;
  updateRole: (id: string, patch: Partial<Omit<Role, "id">>) => void;
  removeRole: (id: string) => void;
  applyKit: (kit: RoleKit) => void;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<ResponseMap>(SEED);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const setResponse = (cardId: string, personaId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [cardId]: { ...(prev[cardId] || {}), [personaId]: value } }));
  };
  const reconcile = (cardId: string, resolution: Resolution) => {
    setResolved((prev) => ({ ...prev, [cardId]: resolution }));
  };
  const addRole = (role: Omit<Role, "id">) => {
    setRoles((prev) => [...prev, { ...role, id: "r" + (Date.now() % 100000) }]);
  };
  const updateRole = (id: string, patch: Partial<Omit<Role, "id">>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };
  const applyKit = (kit: RoleKit) => {
    setRoles(kit.roles.map((r, i) => ({ ...r, id: kit.id + "-" + i })));
  };
  const removeRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id).map((r) => (r.pairedWith === id ? { ...r, pairedWith: null } : r)));
  };
  return (
    <Ctx.Provider value={{ responses, setResponse, resolved, reconcile, roles, addRole, updateRole, removeRole, applyKit }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession(): SessionState {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
