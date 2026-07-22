-- Capizzi Governance Deck, initial schema with RLS.
-- Sources: governance-deck-architecture.md, governance-diagnostics-roadmap.md,
-- governance-growth-strategy.md. Requires Supabase (auth schema present).

create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------
create type org_role as enum ('owner', 'facilitator', 'member');
create type deck_scope as enum ('canonical', 'template', 'org');
create type deck_status as enum ('draft', 'published', 'archived');
create type pillar as enum ('listen_first', 'make_it_visible', 'prove_it_worked', 'continuity');
create type card_kind as enum ('normative', 'diagnostic');
create type response_type as enum ('text', 'single_select', 'multi_select', 'ranked', 'frequency', 'binary_with_evidence', 'blind_definition', 'practice_pick');
create type card_cadence as enum ('one_time', 'monthly', 'quarterly', 'per_engagement');
create type session_status as enum ('setup', 'gathering', 'converging', 'reconciled', 'published');
create type convergence_status as enum ('agreed', 'divergent', 'reconciled');
create type participant_tier as enum ('leads', 'team');
create type issue_status as enum ('active', 'met', 'archived');
create type insight_type as enum ('alignment_score', 'perception_gap', 'practice_drift', 'trend_delta');
create type milestone_status as enum ('open', 'met');

-- Tables ----------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  role org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create table domains (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table decks (
  id uuid primary key default gen_random_uuid(),
  scope deck_scope not null,
  org_id uuid references organizations (id) on delete cascade,
  name text not null,
  version int not null default 1,
  status deck_status not null default 'draft',
  cloned_from uuid references decks (id),
  created_at timestamptz not null default now(),
  check ((scope = 'org') = (org_id is not null))
);

create table suits (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references decks (id) on delete cascade,
  name text not null,
  pillar pillar not null,
  artifact_key text not null,
  sort int not null default 0
);

create table governance_issues (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  domain_id uuid references domains (id) on delete set null,
  linked_suit_id uuid references suits (id) on delete set null,
  title text not null,
  problem_statement text not null,
  target_state text,
  success_criteria text,
  target_stage int not null default 3 check (target_stage between 1 and 5),
  owner_id uuid references profiles (id),
  status issue_status not null default 'active',
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create table cards (
  id uuid primary key default gen_random_uuid(),
  suit_id uuid not null references suits (id) on delete cascade,
  kind card_kind not null default 'normative',
  response_type response_type not null,
  prompt text not null,
  options jsonb,
  artifact_mapping text,
  issue_id uuid references governance_issues (id) on delete set null,
  cadence card_cadence,
  code text,
  sort int not null default 0,
  check (kind = 'diagnostic' or issue_id is null)
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  deck_id uuid not null references decks (id),
  deck_version_snapshot int not null,
  facilitator_id uuid references profiles (id),
  status session_status not null default 'setup',
  created_at timestamptz not null default now()
);

create table session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  tier participant_tier not null default 'team',
  team text,
  unique (session_id, user_id)
);

create table responses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  card_id uuid not null references cards (id) on delete cascade,
  participant_id uuid not null references session_participants (id) on delete cascade,
  value jsonb not null,
  created_at timestamptz not null default now(),
  unique (session_id, card_id, participant_id)
);

create table convergences (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  card_id uuid not null references cards (id) on delete cascade,
  status convergence_status not null,
  resolved_value jsonb,
  resolved_by uuid references profiles (id),
  rationale text,
  escalated boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, card_id)
);

create table artifacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions (id) on delete cascade,
  artifact_key text not null,
  version int not null default 1,
  content_md text not null,
  provenance jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  unique (session_id, artifact_key, version)
);

create table insights (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  issue_id uuid references governance_issues (id) on delete cascade,
  session_id uuid references sessions (id) on delete cascade,
  insight_type insight_type not null,
  score numeric,
  summary text not null,
  evidence jsonb not null default '{}'::jsonb,
  recommended_action text,
  created_at timestamptz not null default now()
);

create table issue_scores (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references governance_issues (id) on delete cascade,
  session_id uuid references sessions (id) on delete set null,
  stage int not null check (stage between 1 and 5),
  scored_by uuid references profiles (id),
  rationale text,
  created_at timestamptz not null default now()
);

create table milestones (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references governance_issues (id) on delete cascade,
  description text not null,
  success_criteria text,
  status milestone_status not null default 'open',
  evidence jsonb not null default '{}'::jsonb,
  met_at timestamptz
);

-- Helpers ----------------------------------------------------------------
create or replace function is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships m where m.org_id = org and m.user_id = auth.uid());
$$;

create or replace function has_org_role(org uuid, roles org_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships m where m.org_id = org and m.user_id = auth.uid() and m.role = any (roles));
$$;

-- RLS ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table domains enable row level security;
alter table decks enable row level security;
alter table suits enable row level security;
alter table cards enable row level security;
alter table sessions enable row level security;
alter table session_participants enable row level security;
alter table responses enable row level security;
alter table convergences enable row level security;
alter table artifacts enable row level security;
alter table governance_issues enable row level security;
alter table insights enable row level security;
alter table issue_scores enable row level security;
alter table milestones enable row level security;

create policy profiles_self on profiles for all
  using (id = auth.uid()) with check (id = auth.uid());

create policy orgs_select on organizations for select using (is_org_member(id));
create policy orgs_insert on organizations for insert with check (auth.uid() is not null);
create policy orgs_update on organizations for update using (has_org_role(id, array['owner']::org_role[]));

create policy memberships_select on memberships for select using (is_org_member(org_id));
create policy memberships_bootstrap on memberships for insert with check (
  user_id = auth.uid() and role = 'owner'
  and not exists (select 1 from memberships m2 where m2.org_id = memberships.org_id)
);
create policy memberships_manage on memberships for all
  using (has_org_role(org_id, array['owner']::org_role[]))
  with check (has_org_role(org_id, array['owner']::org_role[]));

create policy domains_select on domains for select using (is_org_member(org_id));
create policy domains_write on domains for all
  using (has_org_role(org_id, array['owner','facilitator']::org_role[]))
  with check (has_org_role(org_id, array['owner','facilitator']::org_role[]));

-- Canonical and template decks are readable by everyone signed in; writes
-- go through the service role only (no write policy on purpose).
create policy decks_select on decks for select
  using (scope in ('canonical', 'template') or is_org_member(org_id));
create policy decks_org_write on decks for all
  using (scope = 'org' and has_org_role(org_id, array['owner','facilitator']::org_role[]))
  with check (scope = 'org' and has_org_role(org_id, array['owner','facilitator']::org_role[]));

create policy suits_select on suits for select using (
  exists (select 1 from decks d where d.id = suits.deck_id
          and (d.scope in ('canonical','template') or is_org_member(d.org_id)))
);
create policy suits_org_write on suits for all using (
  exists (select 1 from decks d where d.id = suits.deck_id and d.scope = 'org'
          and has_org_role(d.org_id, array['owner','facilitator']::org_role[]))
) with check (
  exists (select 1 from decks d where d.id = suits.deck_id and d.scope = 'org'
          and has_org_role(d.org_id, array['owner','facilitator']::org_role[]))
);

create policy cards_select on cards for select using (
  exists (select 1 from suits s join decks d on d.id = s.deck_id where s.id = cards.suit_id
          and (d.scope in ('canonical','template') or is_org_member(d.org_id)))
);
create policy cards_org_write on cards for all using (
  exists (select 1 from suits s join decks d on d.id = s.deck_id where s.id = cards.suit_id
          and d.scope = 'org' and has_org_role(d.org_id, array['owner','facilitator']::org_role[]))
) with check (
  exists (select 1 from suits s join decks d on d.id = s.deck_id where s.id = cards.suit_id
          and d.scope = 'org' and has_org_role(d.org_id, array['owner','facilitator']::org_role[]))
);

create policy sessions_select on sessions for select using (is_org_member(org_id));
create policy sessions_write on sessions for all
  using (has_org_role(org_id, array['owner','facilitator']::org_role[]))
  with check (has_org_role(org_id, array['owner','facilitator']::org_role[]));

create policy participants_select on session_participants for select using (
  exists (select 1 from sessions s where s.id = session_id and is_org_member(s.org_id))
);
create policy participants_write on session_participants for all using (
  exists (select 1 from sessions s where s.id = session_id
          and has_org_role(s.org_id, array['owner','facilitator']::org_role[]))
) with check (
  exists (select 1 from sessions s where s.id = session_id
          and has_org_role(s.org_id, array['owner','facilitator']::org_role[]))
);

-- Responses stay private to their author until the session leaves gather.
-- This is the anti-anchoring rule from the architecture spec, in SQL.
create policy responses_select on responses for select using (
  participant_id in (select sp.id from session_participants sp where sp.user_id = auth.uid())
  or exists (select 1 from sessions s where s.id = responses.session_id
             and s.status in ('converging','reconciled','published') and is_org_member(s.org_id))
);
create policy responses_insert on responses for insert with check (
  participant_id in (select sp.id from session_participants sp where sp.user_id = auth.uid())
  and exists (select 1 from sessions s where s.id = responses.session_id and s.status = 'gathering')
);
create policy responses_update on responses for update using (
  participant_id in (select sp.id from session_participants sp where sp.user_id = auth.uid())
  and exists (select 1 from sessions s where s.id = responses.session_id and s.status = 'gathering')
);

create policy convergences_select on convergences for select using (
  exists (select 1 from sessions s where s.id = session_id and is_org_member(s.org_id))
);
create policy convergences_write on convergences for all using (
  exists (select 1 from sessions s where s.id = session_id
          and has_org_role(s.org_id, array['owner','facilitator']::org_role[]))
) with check (
  exists (select 1 from sessions s where s.id = session_id
          and has_org_role(s.org_id, array['owner','facilitator']::org_role[]))
);

create policy artifacts_select on artifacts for select using (
  exists (select 1 from sessions s where s.id = session_id and is_org_member(s.org_id))
);
create policy artifacts_insert on artifacts for insert with check (
  exists (select 1 from sessions s where s.id = session_id
          and has_org_role(s.org_id, array['owner','facilitator']::org_role[]))
);
-- No update or delete policy on artifacts: versions are immutable by design.

create policy issues_select on governance_issues for select using (is_org_member(org_id));
create policy issues_write on governance_issues for all
  using (has_org_role(org_id, array['owner','facilitator']::org_role[]))
  with check (has_org_role(org_id, array['owner','facilitator']::org_role[]));

create policy insights_select on insights for select using (is_org_member(org_id));
create policy insights_write on insights for insert
  with check (has_org_role(org_id, array['owner','facilitator']::org_role[]));

create policy issue_scores_select on issue_scores for select using (
  exists (select 1 from governance_issues gi where gi.id = issue_id and is_org_member(gi.org_id))
);
create policy issue_scores_insert on issue_scores for insert with check (
  exists (select 1 from governance_issues gi where gi.id = issue_id
          and has_org_role(gi.org_id, array['owner','facilitator']::org_role[]))
);
-- Append-only by design: no update or delete policy. The trend line is the row history.

create policy milestones_select on milestones for select using (
  exists (select 1 from governance_issues gi where gi.id = issue_id and is_org_member(gi.org_id))
);
create policy milestones_write on milestones for all using (
  exists (select 1 from governance_issues gi where gi.id = issue_id
          and has_org_role(gi.org_id, array['owner','facilitator']::org_role[]))
) with check (
  exists (select 1 from governance_issues gi where gi.id = issue_id
          and has_org_role(gi.org_id, array['owner','facilitator']::org_role[]))
);
