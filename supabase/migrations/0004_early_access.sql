-- Early access capture for the campaign page.
--
-- Security posture: anonymous visitors may INSERT their own email and
-- nothing else. There is no select policy for anon or authenticated, so
-- the list cannot be read back through the public API even though the anon
-- key ships in the browser. Read it in the Supabase dashboard, or from a
-- server context using the service role key.

create table early_access (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  created_at timestamptz not null default now()
);

create unique index early_access_email_idx on early_access (lower(email));

alter table early_access enable row level security;

-- Insert only. Deliberately no select, update, or delete policy.
create policy early_access_insert on early_access for insert
  to anon, authenticated
  with check (
    email is not null
    and length(email) between 5 and 254
    and position('@' in email) > 1
  );

grant insert on table early_access to anon, authenticated;
