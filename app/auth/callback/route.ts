// Exchanges the magic-link code for a session, then sends the person to
// onboarding. Onboarding forwards straight through if they already belong
// to an org, so returning users never see it.

import { NextResponse, type NextRequest } from "next/server";
import { getServerClient } from "../../../lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/onboarding";

  if (code) {
    const sb = await getServerClient();
    if (sb) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(origin + next);
    }
  }
  return NextResponse.redirect(origin + "/signin?error=link");
}
