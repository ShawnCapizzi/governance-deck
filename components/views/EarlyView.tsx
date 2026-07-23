"use client";

// Campaign landing page. Different rules from the app: cold traffic, one
// conversion action, and no navigation, because on a campaign page every
// link is an exit. The email capture repeats at top and bottom, which is
// the only pattern that reliably converts a page people scroll once.
//
// Honesty rule applies here too. With no database configured the form
// cannot store anything, so it becomes a real mailto link rather than a
// button that pretends to have captured something.

import { useState } from "react";
import Link from "next/link";
import { Wordmark } from "../Wordmark";
import { HowItWorks } from "../HowItWorks";
import { ProductVisual } from "../ProductVisual";
import { getBrowserClient, isConfigured } from "../../lib/supabase/client";
import { IconAligned, IconSplit, IconArtifacts, IconListen } from "../Icons";

const CONTACT = "hello@shawncapizzi.com";

const VALUE = [
  {
    Icon: IconListen,
    title: "Fewer meetings",
    copy: "Everyone answers on their own time. No calendar hunt, no room, and nobody anchors on whoever spoke first.",
  },
  {
    Icon: IconSplit,
    title: "Less rework",
    copy: "Gaps show up in week one, not in launch week when changing course costs real money.",
  },
  {
    Icon: IconArtifacts,
    title: "A faster yes",
    copy: "Settled decisions stop being reopened. Work moves, and it stays moved.",
  },
];

function CaptureForm({ id, dense = false }: { id: string; dense?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const submit = async () => {
    const sb = getBrowserClient();
    if (!sb) return;
    setState("sending");
    const { error } = await sb.from("early_access").insert({
      email: email.trim().toLowerCase(),
      source: "early",
    });
    if (error) {
      // A duplicate is a success from the person's point of view.
      if (error.code === "23505") { setState("done"); return; }
      setState("error");
      setMessage("That did not go through. Email " + CONTACT + " and I will add you.");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <p className="text-base text-ink inline-flex items-center gap-2">
        <IconAligned size={18} />
        You are on the list. I will be in touch before the next round of invites.
      </p>
    );
  }

  // Without a database there is nothing to write to, so the honest control
  // is an email link, not a form.
  if (!isConfigured) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <a href={"mailto:" + CONTACT + "?subject=Governance%20Deck%20early%20access"}
          className="pill-primary px-6 py-3 text-base">
          Request early access
        </a>
        <Link href="/start" className="px-5 py-3 rounded-full text-base border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
          See it work first
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className={"flex flex-wrap gap-3 " + (dense ? "" : "max-w-xl")}>
        <label htmlFor={id} className="sr-only">Work email</label>
        <input id={id} type="email" value={email} placeholder="you@company.com"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && email.includes("@")) void submit(); }}
          className="flex-1 min-w-[15rem] rounded-full bg-surface border border-line-strong px-5 py-3 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand" />
        <button onClick={submit} disabled={!email.includes("@") || state === "sending"}
          className="pill-primary px-6 py-3 text-base">
          {state === "sending" ? "Adding you" : "Request early access"}
        </button>
      </div>
      {state === "error" && <p className="text-base text-ember-text mt-3">{message}</p>}
      {state !== "error" && (
        <p className="text-base text-ink-3 mt-3">
          No spam, and no sales sequence. One email when your invite is ready.
        </p>
      )}
    </div>
  );
}

export default function EarlyView() {
  return (
    <div className="min-h-screen">
      {/* Campaign header: identity and one escape hatch, nothing else. */}
      <header className="border-b border-line">
        <div className="mx-auto max-w-5xl px-5 md:px-8 py-4 flex items-center justify-between gap-4">
          <Wordmark className="h-6 w-auto text-ink" />
          <Link href="/start" className="text-base text-ink-2 hover:text-ink">See the demo</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 md:px-8">
        {/* Hero. Glow peak computed at 0.26 alpha so body copy holds 9.46:1
            at its brightest point. */}
        <section className="relative py-14 md:py-20">
          <div aria-hidden="true" className="mesh-hero pointer-events-none absolute inset-0 -z-10" />
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="eyebrow text-peri">Early access</p>
              <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight text-ink leading-[1.1]">
                Align your team once, not in every meeting
              </h1>
              <p className="mt-5 text-lg md:text-xl text-ink-2 leading-relaxed">
                Teams assume they agree on who decides what, and mostly they do. The expensive part is the handful of places they only think they agree. This finds those, settles each one on the record, and turns the answers into documents your business can run on.
              </p>
              <p className="mt-5 text-base text-ink-3">
                About ten minutes per person. No meeting, no calendar hunt.
              </p>
              <div className="mt-6">
                <CaptureForm id="hero-email" />
              </div>
            </div>
            <div className="lg:pl-4">
              <ProductVisual />
            </div>
          </div>
        </section>

        {/* Proof. Real credentials only: no invented logos or fake counts. */}
        <section className="py-6 border-y border-line">
          <p className="text-base text-ink-3 max-w-3xl">
            Built by Shawn Capizzi, an experience architect with fifteen years across seventy-plus brands in pharma, financial services, and agency work, including Pfizer, Biogen, AbbVie, and Bloomberg. Teaches at NYU, Pratt, and SVA.
          </p>
        </section>

        <section className="py-14 md:py-16">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-ink leading-tight max-w-md">
                Clarity your team can point to, not assume
              </h2>
              <div className="mt-6">
                <Link href="/start" className="pill-primary px-6 py-3 text-base">See it work</Link>
              </div>
            </div>
            <div className="divide-y divide-line">
              {VALUE.map((v) => (
                <div key={v.title} className="py-5 first:pt-0">
                  <div className="flex items-center gap-2.5">
                    <span className="grid place-items-center w-8 h-8 rounded-lg border bg-raised border-line-strong text-ink-2 shrink-0">
                      <v.Icon size={17} />
                    </span>
                    <p className="text-lg text-ink font-medium tracking-tight">{v.title}</p>
                  </div>
                  <p className="mt-2 text-base text-ink-2 leading-relaxed">{v.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-14 md:pb-16">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink">How it works</h2>
          <p className="mt-3 text-base text-ink-2 max-w-2xl leading-relaxed">
            Four steps, all of them asynchronous. Nobody has to be in a room, or even awake at the same time.
          </p>
          <div className="mt-6">
            <HowItWorks />
          </div>
        </section>

      </main>

      <section className="border-y border-line bg-ground">
        <div className="mx-auto max-w-3xl px-5 md:px-8 py-16 md:py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink leading-tight">
            Find out what your team actually agrees on
          </h2>
          <p className="mt-4 text-lg text-ink-2 leading-relaxed">
            Early access goes out in small groups so every team gets a real setup conversation. Add your email and I will send an invite with a code for your team.
          </p>
          <div className="mt-7 flex justify-center">
            <div className="w-full max-w-xl text-left">
              <CaptureForm id="footer-email" dense />
            </div>
          </div>
        </div>
      </section>


      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-5 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-base text-ink-3">Capizzi Governance Deck</p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="/start" className="text-base text-ink-2 hover:text-ink">See the demo</Link>
            <a href="https://www.shawncapizzi.com" className="text-base text-ink-2 hover:text-ink">shawncapizzi.com</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
