-- Roles, profile bootstrap, and org join codes.
--
-- 0001 defined decks, cards, sessions, and artifacts. 0002 added programs,
-- rounds, assignments, and handoffs. This migration adds the pieces the
-- running app needs to persist: the org's governance roles list, automatic
-- profile creation on signup, and a join code so a curator can invite
-- teammates without wiring email infrastructure first.

create type decision_mode as enum (
  'decides_alone', 'consults_then_decides', 'consensus_with_pair', 'escalates_to_lead'
);

create table governance_roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations (id) on delete cascade,
  title text not null,
  held_by text,
  held_by_user_id uuid references profiles (id) on delete set null,
  department text not null default 'Delivery',
  decision_mode decision_mode not null default 'consults_then_decides',
  paired_with uuid references governance_roles (id) on delete set null,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  check (paired_with is null or paired_with <> id)
);

create index governance_roles_org_idx on governance_roles (org_id);

-- Join codes let a curator share one short string. Real email invites can
-- layer on later without changing this table.
alter table organizations add column join_code text unique;
alter table organizations add column created_by uuid references profiles (id);

create or replace function generate_join_code()
returns text language sql volatile as $$
  select upper(substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8));
$$;

-- Every auth user gets a profile row automatically. Without this, the first
-- membership insert fails its foreign key and signup appears to hang.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Create an org and make the caller its owner, in one transaction. Doing
-- this as a function avoids a race where the org exists but has no owner,
-- which would lock everyone out under RLS.
create or replace function create_organization(org_name text)
returns organizations language plpgsql security definer set search_path = public as $$
declare
  new_org organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into organizations (name, join_code, created_by)
  values (org_name, generate_join_code(), auth.uid())
  returning * into new_org;

  insert into memberships (org_id, user_id, role, level, status)
  values (new_org.id, auth.uid(), 'owner', 'owner', 'active');

  -- Seed a starting roles list so the org is never an empty form.
  insert into governance_roles (org_id, title, department, decision_mode, sort) values
    (new_org.id, 'Creative Director', 'Creative', 'decides_alone', 1),
    (new_org.id, 'Strategy Lead', 'Strategy', 'consults_then_decides', 2),
    (new_org.id, 'Design Lead', 'Design Ops', 'consults_then_decides', 3),
    (new_org.id, 'Brand Owner', 'Brand', 'consensus_with_pair', 4),
    (new_org.id, 'Project Lead', 'Delivery', 'escalates_to_lead', 5);

  return new_org;
end;
$$;

-- Join an existing org by code. Defaults to contributor: a person can only
-- raise their own level if an owner or curator does it for them.
create or replace function join_organization(code text)
returns organizations language plpgsql security definer set search_path = public as $$
declare
  target organizations;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into target from organizations o where o.join_code = upper(trim(code));
  if target.id is null then
    raise exception 'no organization matches that code';
  end if;

  insert into memberships (org_id, user_id, role, level, status)
  values (target.id, auth.uid(), 'member', 'contributor', 'active')
  on conflict (org_id, user_id) do nothing;

  return target;
end;
$$;

grant execute on function create_organization(text) to authenticated;
grant execute on function join_organization(text) to authenticated;

-- RLS for the roles list.
alter table governance_roles enable row level security;

create policy governance_roles_select on governance_roles for select
  using (is_org_member(org_id));
create policy governance_roles_write on governance_roles for all
  using (has_level(org_id, array['owner','curator']::member_level[]))
  with check (has_level(org_id, array['owner','curator']::member_level[]));

-- Members may read the org they belong to; join_organization handles lookup
-- by code through security definer, so no blanket read of all orgs is needed.
