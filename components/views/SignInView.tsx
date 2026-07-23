"use client";

// Magic-link sign in. No passwords to manage, which matters when the people
// testing this are coworkers and friends rather than a provisioned org.

import { useState } from "react";
import { getBrowserClient, isConfigured } from "../../lib/supabase/client";
import { Widget } from "../ui";
import { IconStart, IconAligned } from "../Icons";

const inputClass =
  "w-full rounded-lg bg-ground border border-line-strong px-3 py-2.5 text-base text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-brand";

export default function SignInView() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const send = async () => {
    const sb = getBrowserClient();
    if (!sb) return;
    setState("sending");
    const { error } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
    });
    if (error) {
      setState("error");
      setMessage(error.message);
    } else {
      setState("sent");
    }
  };

  if (!isConfigured) {
    return (
      <Widget eyebrow="Demo" title="Running in demo mode" icon={<IconStart size={19} />}>
        <p className="text-base text-ink-2 max-w-2xl">
          Sign in is not available because this copy has no database connected. Everything still works with sample data, and nothing you enter is saved. To run a real round with your team, add your Supabase URL and anon key to the environment and redeploy.
        </p>
      </Widget>
    );
  }

  return (
    <div className="max-w-lg">
      <Widget eyebrow="Access" title="Sign in" sub="No password needed" icon={<IconStart size={19} />}>
        {state === "sent" ? (
          <div>
            <p className="text-base text-ink mb-2 inline-flex items-center gap-2">
              <IconAligned size={18} />
              Check your email
            </p>
            <p className="text-sm text-ink-2">
              We sent a sign-in link to {email}. Open it on this device and you will land back here signed in. The link works once and expires in an hour.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-ink-2 mb-4">
              Enter your work email and we will send you a link. There is no password to set or remember. Once you are in, you will create your team&apos;s shared space, or join one with a code from a teammate.
            </p>
            <input className={inputClass} type="email" value={email} placeholder="you@company.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && email.includes("@")) void send(); }} />
            <button onClick={send} disabled={!email.includes("@") || state === "sending"}
              className="pill-primary px-5 py-2.5 text-sm mt-3">
              {state === "sending" ? "Sending" : "Email me a link"}
            </button>
            {state === "error" && <p className="text-sm text-ember-text mt-3">{message}</p>}
          </div>
        )}
      </Widget>
    </div>
  );
}
