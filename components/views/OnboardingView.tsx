"use client";

// First run: create an organization or join one with a code. A person who
// already belongs to an org sees their join code here instead, which is
// what they send to teammates.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient, isConfigured } from "../../lib/supabase/client";
import * as db from "../../lib/db";
import { useSession } from "../../lib/store";
import { Widget, Chip } from "../ui";
import { HowItWorks } from "../HowItWorks";
import { IconProduct, IconRoles, IconAdd, IconAligned } from "../Icons";

const inputClass =
  "w-full rounded-lg bg-ground border border-line-strong px-3 py-2.5 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand";

export default function OnboardingView() {
  const { user, org, loading, refresh } = useSession();
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const create = async () => {
    const sb = getBrowserClient();
    if (!sb || !orgName.trim()) return;
    setBusy(true); setError("");
    const { error: e } = await db.createOrganization(sb, orgName.trim());
    if (e) { setError(e.message); setBusy(false); return; }
    await refresh();
    setBusy(false);
    router.push("/team");
  };

  const join = async () => {
    const sb = getBrowserClient();
    if (!sb || !code.trim()) return;
    setBusy(true); setError("");
    const { error: e } = await db.joinOrganization(sb, code.trim());
    if (e) { setError(e.message); setBusy(false); return; }
    await refresh();
    setBusy(false);
    router.push("/gather");
  };

  const intro = (
    <Widget eyebrow="Before you start" title="How this works" sub="One minute">
      <p className="text-base text-ink-2 max-w-2xl mb-2">
        An organization here is simply your team&apos;s shared space. Your people, the roles you agree on, the questions you answer, and the documents that come out of it all live inside one organization. One of you creates it, everyone else joins it with a code.
      </p>
      <p className="text-base text-ink-2 max-w-2xl mb-5">
        Then the loop below runs on your schedule, not a meeting&apos;s. Most teams assume they agree on who decides what. This is how you find out, and write down, what is actually true.
      </p>
      <HowItWorks />
    </Widget>
  );

  const wrap = (body: React.ReactNode) => (
    <div className="grid gap-4">
      {intro}
      {body}
    </div>
  );

  if (!isConfigured) {
    return wrap(
      <Widget eyebrow="Setup" title="Demo mode" icon={<IconProduct size={19} />}>
        <p className="text-base text-ink-2 max-w-2xl">
          There is no database connected, so there is nothing to set up. The app runs on sample data and everything works, but nothing is saved between visits.
        </p>
      </Widget>
    );
  }

  if (loading) {
    return wrap(<Widget eyebrow="One moment" title="Checking your account"><p className="text-sm text-ink-2">One moment.</p></Widget>);
  }

  if (!user) {
    return wrap(
      <Widget eyebrow="Not signed in" title="Sign in first" icon={<IconRoles size={19} />}>
        <p className="text-sm text-ink-2 mb-4">You need to be signed in to create or join an organization.</p>
        <a href="/signin" className="pill-primary px-5 py-2.5 text-sm">Go to sign in</a>
      </Widget>
    );
  }

  if (org) {
    return wrap(
      <div className="grid gap-4">
        <Widget eyebrow="Your organization" title={org.orgName} sub={"You are " + org.level}
          icon={<IconAligned size={19} />}>
          <p className="text-base text-ink-2 mb-4 max-w-2xl">
            You are set up. Share the code below with teammates so they can join. Anyone who joins starts as a Contributor, and you can raise their level on the Team page.
          </p>
          {org.joinCode && (
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-2xl tracking-[0.25em] text-ink bg-ground border border-line-strong rounded-lg px-4 py-2.5">
                {org.joinCode}
              </span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(org.joinCode as string);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="px-4 py-2 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
                {copied ? "Copied" : "Copy code"}
              </button>
            </div>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href="/team" className="pill-primary px-5 py-2.5 text-sm">Go to your team</a>
            <a href="/roles" className="px-5 py-2.5 rounded-full text-sm border border-line-strong text-ink-2 hover:text-ink hover:border-ink-3">
              Set up roles first
            </a>
          </div>
        </Widget>
      </div>
    );
  }

  return wrap(
    <div className="grid gap-4 md:grid-cols-2">
      <Widget eyebrow="Start fresh" title="Create an organization" sub="You become the owner"
        icon={<IconProduct size={19} />}>
        <p className="text-sm text-ink-2 mb-4">
          Start fresh. You get a join code to share, a starting set of roles, and full control of levels.
        </p>
        <input className={inputClass} value={orgName} placeholder="Capizzi Studio"
          onChange={(e) => setOrgName(e.target.value)} />
        <button onClick={create} disabled={busy || !orgName.trim()} className="pill-primary px-5 py-2.5 text-sm mt-3 gap-1.5">
          <IconAdd size={15} />
          {busy ? "Creating" : "Create organization"}
        </button>
      </Widget>

      <Widget eyebrow="Have a code" title="Join with a code" sub="From a teammate" icon={<IconRoles size={19} />}>
        <p className="text-sm text-ink-2 mb-4">
          If someone already set up your organization, paste their eight-character code. You will join as a Contributor.
        </p>
        <input className={inputClass + " font-mono tracking-[0.2em] uppercase"} value={code}
          placeholder="A1B2C3D4" maxLength={8}
          onChange={(e) => setCode(e.target.value.toUpperCase())} />
        <button onClick={join} disabled={busy || code.trim().length < 6} className="pill-primary px-5 py-2.5 text-sm mt-3">
          {busy ? "Joining" : "Join organization"}
        </button>
      </Widget>

      {error && (
        <div className="md:col-span-2">
          <Chip tone="ember">{error}</Chip>
        </div>
      )}
    </div>
  );
}
