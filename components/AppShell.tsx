"use client";

// Cockpit shell in the shawncapizzi.com header language: backdrop blur,
// tracking-tight nav, periwinkle links that go white on hover, and the
// white-pill CTA. Desktop keeps the left rail (home ground for Figma
// and Perplexity users). Mobile gets the site-style full-screen drawer
// with stacked high-contrast rows.

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { useSession } from "../lib/store";
import { getBrowserClient, isConfigured } from "../lib/supabase/client";
import { BrandLockup } from "./BrandLockup";
import { HelpButton } from "./HelpButton";
import { IconHealth, IconStart, IconRoles, IconGather, IconConverge, IconArtifacts, IconProduct } from "./Icons";

const NAV = [
  { key: "start", label: "Start here", href: "/start", Icon: IconStart, group: "" },
  { key: "team", label: "Team", href: "/team", Icon: IconRoles, group: "Set up" },
  { key: "roles", label: "Roles", href: "/roles", Icon: IconProduct, group: "Set up" },
  { key: "gather", label: "Your questions", href: "/gather", Icon: IconGather, group: "Run it" },
  { key: "converge", label: "Alignment", href: "/converge", Icon: IconConverge, group: "Run it" },
  { key: "health", label: "Where you stand", href: "/", Icon: IconHealth, group: "Results" },
  { key: "artifacts", label: "Decisions", href: "/artifacts", Icon: IconArtifacts, group: "Results" },
] as const;

const GROUPS = ["", "Set up", "Run it", "Results"] as const;

export type NavKey = (typeof NAV)[number]["key"];

export default function AppShell({ active, children }: { active: NavKey; children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { mode, user, org } = useSession();

  const signOut = async () => {
    const sb = getBrowserClient();
    if (sb) { await sb.auth.signOut(); window.location.href = "/start"; }
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="relative z-10 min-h-screen text-ink">
      <div className="mx-auto flex max-w-6xl">
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-line bg-raised/90 backdrop-blur-sm min-h-screen sticky top-0">
          <div className="px-5 pt-6 pb-5 border-b border-line">
            <BrandLockup />
          </div>
          <nav className="flex-1 px-3 py-4 space-y-4">
            {GROUPS.map((g) => (
              <div key={g || "top"} className="space-y-1">
                {g && (
                  <p className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">{g}</p>
                )}
                {NAV.filter((n) => n.group === g).map((n) => {
                  const on = active === n.key;
                  return (
                    <Link key={n.key} href={n.href}
                      aria-current={on ? "page" : undefined}
                      className={"group flex items-center gap-3 rounded-lg pl-2.5 pr-3 py-2 text-base tracking-tight border-l-2 transition-colors " +
                        (on
                          ? "border-brand nav-active text-ink font-medium"
                          : "border-transparent text-ink-2 hover:text-ink hover:bg-surface")}>
                      <span className={"grid place-items-center w-7 h-7 rounded-md border shrink-0 transition-colors " +
                        (on ? "bg-brand/25 border-peri/40 text-peri" : "bg-transparent border-transparent text-ink-3 group-hover:text-ink-2")}>
                        <n.Icon size={16} />
                      </span>
                      {n.label}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="px-5 py-4 border-t border-line">
            {org ? (
              <>
                <p className="eyebrow">Organization</p>
                <p className="text-sm text-ink mt-1">{org.orgName}</p>
                <p className="text-sm text-ink-2">{org.level}</p>
                <button onClick={signOut} className="mt-2 text-sm text-peri hover:text-ink">Sign out</button>
              </>
            ) : user ? (
              <>
                <p className="eyebrow">Signed in</p>
                <p className="text-sm text-ink-2 mt-1">No organization yet</p>
                <a href="/onboarding" className="mt-2 inline-block text-sm text-peri hover:text-ink">Finish setup &rarr;</a>
              </>
            ) : (
              <>
                <p className="eyebrow">{mode === "demo" ? "Demo" : "Not signed in"}</p>
                <p className="text-sm text-ink-2 mt-1">
                  {isConfigured ? "Sign in to run a real round." : "Sample data, nothing is saved."}
                </p>
                {isConfigured && (
                  <a href="/signin" className="mt-2 inline-block text-sm text-peri hover:text-ink">Sign in &rarr;</a>
                )}
              </>
            )}
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <header className="md:hidden sticky top-0 z-40 bg-raised/85 backdrop-blur-md border-b border-line px-4 h-14 flex items-center justify-between">
            <BrandLockup compact />
            <button type="button" onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center w-10 h-10 -mr-2 text-ink"
              aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                ) : (
                  <g>
                    <line x1="3" y1="9" x2="21" y2="9" strokeLinecap="round" />
                    <line x1="3" y1="16" x2="21" y2="16" strokeLinecap="round" />
                  </g>
                )}
              </svg>
            </button>
          </header>
          {mobileOpen ? (
            <div className="fixed inset-0 z-30 bg-raised md:hidden pt-14 overflow-y-auto">
              <nav className="px-6 py-6 flex flex-col gap-6">
                {GROUPS.map((g) => (
                  <div key={g || "top"}>
                    {g && (
                      <p className="pb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-3">{g}</p>
                    )}
                    {NAV.filter((n) => n.group === g).map((n) => {
                      const on = active === n.key;
                      return (
                        <Link key={n.key} href={n.href} onClick={() => setMobileOpen(false)}
                          aria-current={on ? "page" : undefined}
                          className={"flex items-center gap-3 py-3.5 border-b border-line text-xl tracking-tight " +
                            (on ? "text-ink font-semibold" : "text-ink-2 font-medium")}>
                          <span className={"grid place-items-center w-9 h-9 rounded-lg border shrink-0 " +
                            (on ? "bg-brand/25 border-peri/40 text-peri" : "bg-raised border-line-strong text-ink-3")}>
                            <n.Icon size={19} />
                          </span>
                          {n.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
                <a href="https://www.shawncapizzi.com" onClick={() => setMobileOpen(false)}
                  className="pill-primary mt-8 px-8 py-4 text-base w-full">
                  Book a workshop
                </a>
              </nav>
            </div>
          ) : null}
          <main className="px-4 md:px-8 py-6 md:py-8">{children}</main>
          <HelpButton />
        </div>
      </div>
    </div>
  );
}
