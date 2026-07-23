# Supabase setup

Ten minutes, start to a signed-in team. Until you do this, the app runs in
demo mode: everything works on sample data, nothing is saved. That is
deliberate, so a cold link to /start always works for someone you are
pitching.

## 1. Create the project

1. Go to supabase.com, create a project, and pick a region near your team.
2. Wait for it to finish provisioning, roughly two minutes.
3. Open Project Settings, then API. Copy two values:
   - Project URL
   - anon public key

Never copy the service_role key into this app. It bypasses every access
rule and must not reach a browser.

## 2. Run the migrations, in order

Open the SQL Editor and run each file top to bottom, one at a time:

1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_team_programs_rounds.sql`
3. `supabase/migrations/0003_roles_profiles_bootstrap.sql`

Then optionally run `supabase/seed.sql` to load the canonical question deck.

Order matters: 0002 and 0003 both build on tables and helper functions
defined in 0001.

## 3. Point auth back at your app

In Authentication, then URL Configuration:

- Site URL: your Vercel URL, for example `https://governance-deck.vercel.app`
- Redirect URLs: add `https://YOUR-URL/auth/callback` and, for local work,
  `http://localhost:3000/auth/callback`

Email sign-in is on by default. Supabase's built-in mail is rate limited
and fine for testing with a handful of people. For a real rollout, connect
your own SMTP under Authentication, then Emails.

## 4. Add the keys

Local, in a file named `.env.local` at the project root:

    NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY

On Vercel: Project Settings, Environment Variables, add the same two for
Production, Preview, and Development, then redeploy. Environment variables
are read at build time, so a redeploy is required.

## 5. First run

1. Visit `/signin`, enter your email, and open the link it sends.
2. You land on `/onboarding`. Create your organization. You become Owner,
   and a starting set of roles is created so you never face a blank form.
3. Copy the eight-character join code and send it to a teammate.
4. They sign in, choose Join with a code, and land as a Contributor.
5. Raise anyone to Curator on the Team page when they need to run rounds.

## What is protected

Access rules live in the database, not just the interface, so they hold
even if someone calls the API directly.

- People only see organizations they belong to.
- Answers stay private to their author until a round moves past gathering.
  This is the anti-anchoring rule, enforced in SQL.
- Observers cannot answer. That is a restrictive policy, not a hidden button.
- Only Owners and Curators can settle disagreements, publish documents, or
  change levels.
- Published documents cannot be edited or deleted, only superseded by a new
  version.
- Handoff history cannot be deleted. Ending a cover marks it inactive and
  keeps the record.

## Troubleshooting

**The sign-in link opens and bounces back to sign in.** Your redirect URL
does not exactly match. It must include `/auth/callback` and the same
protocol and host you are browsing.

**"no organization matches that code".** Join codes are eight characters
and case-insensitive here, but check for a pasted trailing space.

**Signup seems to hang.** Confirm 0003 ran: it installs the trigger that
creates a profile row for each new user. Without it, the first membership
insert fails on its foreign key.

**Still seeing sample data after signing in.** You are signed in but not in
an organization yet. Finish `/onboarding`.
