"use client";

// In-memory session store for v1. Lives in the root layout so state
// survives client-side navigation between Gather, Converge, Health,
// and Artifacts. Production wiring to Supabase is specified in CLAUDE.md.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient, isConfigured } from "./supabase/client";
import * as db from "./db";
import type { OrgContext } from "./db";
import { SEED, ResponseMap, Resolution, Role, DEFAULT_ROLES, RoleKit } from "./deck";
import { PEOPLE, PROGRAMS, HANDOFFS, Person, Handoff, Program, Level, HandoffReason } from "./team";

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
  people: Person[];
  programs: Program[];
  handoffs: Handoff[];
  currentUserId: string;
  setCurrentUserId: (id: string) => void;
  addPerson: (p: Omit<Person, "id">) => void;
  setLevel: (id: string, level: Level) => void;
  setStatus: (id: string, status: Person["status"]) => void;
  createHandoff: (h: Omit<Handoff, "id" | "createdAt" | "active">) => void;
  endHandoff: (id: string) => void;
  // Live mode: Supabase configured and the user belongs to an org.
  mode: "demo" | "live";
  user: User | null;
  org: OrgContext | null;
  loading: boolean;
  refresh: () => Promise<void>;
  updateMe: (patch: { displayName?: string; team?: string }) => Promise<void>;
  addProgram: (name: string, client: string) => Promise<void>;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [responses, setResponses] = useState<ResponseMap>(SEED);
  const [resolved, setResolved] = useState<Record<string, Resolution>>({});
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [people, setPeople] = useState<Person[]>(PEOPLE);
  const [programs, setPrograms] = useState<Program[]>(PROGRAMS);
  const [handoffs, setHandoffs] = useState<Handoff[]>(HANDOFFS);
  const [currentUserId, setCurrentUserId] = useState("u1");
  const [user, setUser] = useState<User | null>(null);
  const [org, setOrg] = useState<OrgContext | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  const mode: "demo" | "live" = org ? "live" : "demo";

  // Hydrate from Supabase when configured. Demo data stays in place until
  // real data arrives, so the UI never flashes empty.
  const refresh = async () => {
    const sb = getBrowserClient();
    if (!sb) { setLoading(false); return; }
    const { data: auth } = await sb.auth.getUser();
    setUser(auth.user ?? null);
    if (!auth.user) { setOrg(null); setLoading(false); return; }
    const ctx = await db.loadOrgContext(sb, auth.user.id);
    setOrg(ctx);
    if (ctx) {
      const [r, p, h, pg] = await Promise.all([
        db.loadRoles(sb, ctx.orgId),
        db.loadPeople(sb, ctx.orgId),
        db.loadHandoffs(sb, ctx.orgId),
        db.loadPrograms(sb, ctx.orgId),
      ]);
      if (r.length) setRoles(r);
      if (p.length) setPeople(p);
      setHandoffs(h);
      setPrograms(pg);
      setCurrentUserId(auth.user.id);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!isConfigured) return;
    void refresh();
    const sb = getBrowserClient();
    if (!sb) return;
    const { data: sub } = sb.auth.onAuthStateChange(() => { void refresh(); });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const setResponse = (cardId: string, personaId: string, value: string) => {
    setResponses((prev) => ({ ...prev, [cardId]: { ...(prev[cardId] || {}), [personaId]: value } }));
  };
  const reconcile = (cardId: string, resolution: Resolution) => {
    setResolved((prev) => ({ ...prev, [cardId]: resolution }));
  };
  const addRole = (role: Omit<Role, "id">) => {
    const temp = { ...role, id: "r" + (Date.now() % 100000) };
    setRoles((prev) => [...prev, temp]);
    const sb = getBrowserClient();
    if (sb && org) void db.insertRole(sb, org.orgId, role, roles.length).then(() => refresh());
  };
  const updateRole = (id: string, patch: Partial<Omit<Role, "id">>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    const sb = getBrowserClient();
    if (sb && org) void db.updateRoleRow(sb, id, patch);
  };
  const applyKit = (kit: RoleKit) => {
    setRoles(kit.roles.map((r, i) => ({ ...r, id: kit.id + "-" + i })));
    const sb = getBrowserClient();
    if (sb && org) void db.replaceRoles(sb, org.orgId, kit.roles).then(() => refresh());
  };
  const updateMe = async (patch: { displayName?: string; team?: string }) => {
    const sb = getBrowserClient();
    if (!sb || !org || !user) return;
    if (patch.displayName) await db.updateProfile(sb, user.id, patch.displayName);
    if (patch.team) await db.updateMembership(sb, org.orgId, user.id, { team: patch.team });
    await refresh();
  };
  const addProgram = async (name: string, client: string) => {
    const sb = getBrowserClient();
    if (!sb || !org || !user) return;
    await db.createProgram(sb, org.orgId, name, client, user.id);
    await refresh();
  };
  const addPerson = (p: Omit<Person, "id">) => {
    setPeople((prev) => [...prev, { ...p, id: "u" + (Date.now() % 100000) }]);
  };
  const setLevel = (id: string, level: Level) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, level } : p)));
    const sb = getBrowserClient();
    if (sb && org) void db.updateMembership(sb, org.orgId, id, { level });
  };
  const setStatus = (id: string, status: Person["status"]) => {
    setPeople((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    const sb = getBrowserClient();
    if (sb && org) void db.updateMembership(sb, org.orgId, id, { status });
  };
  const createHandoff = (h: Omit<Handoff, "id" | "createdAt" | "active">) => {
    setHandoffs((prev) => [
      // One active handoff per person: a new one supersedes the old.
      ...prev.map((x) => (x.active && x.fromId === h.fromId ? { ...x, active: false } : x)),
      { ...h, id: "h" + (Date.now() % 100000), createdAt: new Date().toISOString().slice(0, 10), active: true },
    ]);
    const sb = getBrowserClient();
    if (sb && org) void db.insertHandoff(sb, org.orgId, h).then(() => refresh());
  };
  const endHandoff = (id: string) => {
    setHandoffs((prev) => prev.map((h) => (h.id === id ? { ...h, active: false } : h)));
    const sb = getBrowserClient();
    if (sb && org) void db.endHandoffRow(sb, id);
  };
  const removeRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id).map((r) => (r.pairedWith === id ? { ...r, pairedWith: null } : r)));
  };
  return (
    <Ctx.Provider value={{ responses, setResponse, resolved, reconcile, roles, addRole, updateRole, removeRole, applyKit,
      people, programs, handoffs, currentUserId, setCurrentUserId,
      addPerson, setLevel, setStatus, createHandoff, endHandoff,
      mode, user, org, loading, refresh, updateMe, addProgram }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSession(): SessionState {
  const s = useContext(Ctx);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
