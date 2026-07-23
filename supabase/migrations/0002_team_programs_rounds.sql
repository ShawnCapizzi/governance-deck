-- Team, programs, rounds, and handoffs.
-- Structure: organizations > programs > rounds. Rounds replace the earlier
-- "sessions" naming: a round is one repeatable pass of the questions, run on
-- a cadence, so Round 2 can be compared against Round 1.

-- Levels ------------------------------------------------------------------
-- Owner       full control of the org, including people and levels
-- Curator     runs programs and rounds, invites, assigns, reconciles
-- Contributor answers assigned questions
-- Observer    read only
create type member_level as enum ('owner', 'curator', 'contributor', 'observer');
create type person_status as enum ('active', 'away', 'departed');
create type handoff_reason as enum ('out_of_office', 'left_org', 'workload_change');
create type assignment_status as enum ('open', 'answered', 'skipped');

alter table memberships add column level member_level not null default 'contributor';
alter table memberships add column status person_status not null default 'active';
alter table memberships add column team text;
alter table memberships add column role_id uuid;

create table programs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  client text,
  curator_id uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table rounds (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references programs (id) on delete cascade,
  session_id uuid references sessions (id) on delete set null,
  sequence int not null default 1,
  label text,
  opens_at timestamptz,
  closes_at timestamptz,
  created_at timestamptz not null default now(),
  unique (program_id, sequence)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds (id) on delete cascade,
  card_id uuid not null references cards (id) on delete cascade,
  assignee_id uuid not null references profiles (id) on delete cascade,
  status assignment_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (round_id, card_id, assignee_id)
);

-- A handoff is a governed event, not a settings change. It records who took
-- over, why, when, and until when, so continuity is auditable. Rows are
-- never deleted: ending a cover sets active false and keeps the history.
create table handoffs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  program_id uuid references programs (id) on delete cascade,
  from_id uuid not null references profiles (id) on delete cascade,
  to_id uuid not null references profiles (id) on delete cascade,
  reason handoff_reason not null,
  note text,
  until date,
  active boolean not null default true,
  created_by uuid references profiles (id),
  created_at timestamptz not null default now(),
  check (from_id <> to_id)
);

-- At most one active handoff per person per org.
create unique index handoffs_one_active_per_person
  on handoffs (org_id, from_id) where active;

create index assignments_assignee_idx on assignments (assignee_id) where status = 'open';
create index rounds_program_idx on rounds (program_id);
create index programs_org_idx on programs (org_id);

-- Helpers -----------------------------------------------------------------
create or replace function has_level(org uuid, levels member_level[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from memberships m
    where m.org_id = org and m.user_id = auth.uid() and m.level = any (levels)
  );
$$;

-- Resolve who currently holds a person's questions, following the handoff
-- chain. Depth-capped so a cycle terminates instead of recursing forever.
create or replace function effective_holder(org uuid, person uuid)
returns uuid language plpgsql stable security definer set search_path = public as $$
declare
  current_id uuid := person;
  next_id uuid;
  hops int := 0;
begin
  loop
    select h.to_id into next_id
      from handoffs h
     where h.active and h.org_id = org and h.from_id = current_id
     limit 1;
    exit when next_id is null or hops >= 8 or next_id = current_id;
    current_id := next_id;
    next_id := null;
    hops := hops + 1;
  end loop;
  return current_id;
end;
$$;

-- RLS ----------------------------------------------------------------------
alter table programs enable row level security;
alter table rounds enable row level security;
alter table assignments enable row level security;
alter table handoffs enable row level security;

create policy programs_select on programs for select using (is_org_member(org_id));
create policy programs_write on programs for all
  using (has_level(org_id, array['owner','curator']::member_level[]))
  with check (has_level(org_id, array['owner','curator']::member_level[]));

create policy rounds_select on rounds for select using (
  exists (select 1 from programs pg where pg.id = program_id and is_org_member(pg.org_id))
);
create policy rounds_write on rounds for all using (
  exists (select 1 from programs pg where pg.id = program_id
          and has_level(pg.org_id, array['owner','curator']::member_level[]))
) with check (
  exists (select 1 from programs pg where pg.id = program_id
          and has_level(pg.org_id, array['owner','curator']::member_level[]))
);

-- A person sees assignments that are theirs, or that have been handed to
-- them through the handoff chain. Curators see everything in the org.
create policy assignments_select on assignments for select using (
  assignee_id = auth.uid()
  or exists (
    select 1 from rounds r join programs pg on pg.id = r.program_id
    where r.id = round_id and (
      has_level(pg.org_id, array['owner','curator']::member_level[])
      or effective_holder(pg.org_id, assignments.assignee_id) = auth.uid()
    )
  )
);
create policy assignments_write on assignments for all using (
  exists (select 1 from rounds r join programs pg on pg.id = r.program_id
          where r.id = round_id and has_level(pg.org_id, array['owner','curator']::member_level[]))
) with check (
  exists (select 1 from rounds r join programs pg on pg.id = r.program_id
          where r.id = round_id and has_level(pg.org_id, array['owner','curator']::member_level[]))
);
-- The person holding the questions may mark their own assignment answered.
create policy assignments_answer on assignments for update using (
  assignee_id = auth.uid()
  or exists (select 1 from rounds r join programs pg on pg.id = r.program_id
             where r.id = round_id and effective_holder(pg.org_id, assignments.assignee_id) = auth.uid())
);

create policy handoffs_select on handoffs for select using (is_org_member(org_id));
create policy handoffs_insert on handoffs for insert with check (
  has_level(org_id, array['owner','curator']::member_level[]) or from_id = auth.uid()
);
create policy handoffs_update on handoffs for update using (
  has_level(org_id, array['owner','curator']::member_level[]) or from_id = auth.uid()
);
-- No delete policy: handoff history is the continuity record.

-- Observers never answer. Enforced at the response layer as well as the UI.
create policy responses_no_observer on responses as restrictive for insert with check (
  exists (select 1 from sessions s where s.id = responses.session_id
          and not has_level(s.org_id, array['observer']::member_level[]))
);
