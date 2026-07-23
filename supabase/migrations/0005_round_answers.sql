-- Round answers and decisions.
--
-- This is what makes the app multi-user for real: answers survive a refresh
-- and become visible to teammates at the right moment.
--
-- Card keys are text (SIG-1, BND-4) rather than foreign keys into the cards
-- table, because the deck currently lives in code at lib/deck.ts and that is
-- its source of truth. When the deck moves into the database, add a cards
-- lookup and migrate these keys; until then a fake foreign key would be a
-- mapping layer maintaining a fiction.

create type round_status as enum ('gathering', 'aligning', 'closed');

alter table rounds add column status round_status not null default 'gathering';
alter table rounds add column opened_by uuid references profiles (id);

-- One answer per person per question per round. Re-answering updates in
-- place, so there is never a second opinion from the same seat.
create table round_answers (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds (id) on delete cascade,
  card_key text not null,
  user_id uuid not null references profiles (id) on delete cascade,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (round_id, card_key, user_id)
);

-- One settled decision per question per round, with the reason and the name
-- attached. Rationale is required: a decision without a reason is the thing
-- this product exists to prevent.
create table round_decisions (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds (id) on delete cascade,
  card_key text not null,
  resolved_value text not null,
  rationale text not null,
  decided_by uuid not null references profiles (id),
  decided_at timestamptz not null default now(),
  unique (round_id, card_key),
  check (length(trim(rationale)) > 0)
);

create index round_answers_round_idx on round_answers (round_id);
create index round_answers_user_idx on round_answers (round_id, user_id);
create index round_decisions_round_idx on round_decisions (round_id);

-- Helper: the org a round belongs to, via its program.
create or replace function round_org(r uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select pg.org_id from rounds rd join programs pg on pg.id = rd.program_id where rd.id = r;
$$;

create or replace function round_state(r uuid)
returns round_status language sql stable security definer set search_path = public as $$
  select status from rounds rd where rd.id = r;
$$;

-- ANTI-ANCHORING, enforced in the database.
--
-- While a round is gathering, you can read only your own answers. Not the
-- curator's, not the loudest person's, not your manager's. This is the rule
-- the whole method rests on: if you can see what the room said before you
-- answer, your answer is worth less. Once the round advances past gathering,
-- every member of the org can read every answer, because that is the point
-- of the exercise.
alter table round_answers enable row level security;
alter table round_decisions enable row level security;

create policy round_answers_select on round_answers for select using (
  user_id = auth.uid()
  or (round_state(round_id) <> 'gathering' and is_org_member(round_org(round_id)))
);

-- You may write only your own answers, only while the round is gathering,
-- and only if you are allowed to answer at all (observers are not).
create policy round_answers_insert on round_answers for insert with check (
  user_id = auth.uid()
  and round_state(round_id) = 'gathering'
  and is_org_member(round_org(round_id))
  and not has_level(round_org(round_id), array['observer']::member_level[])
);
create policy round_answers_update on round_answers for update using (
  user_id = auth.uid() and round_state(round_id) = 'gathering'
) with check (
  user_id = auth.uid() and round_state(round_id) = 'gathering'
);
-- No delete policy: an answer is withdrawn by changing it, not by erasing it.

-- Decisions are readable by the whole org, always: they are the output.
create policy round_decisions_select on round_decisions for select using (
  is_org_member(round_org(round_id))
);
-- Only owners and curators settle, and only once gathering has closed, so
-- nobody can settle a question before the team has finished answering it.
create policy round_decisions_write on round_decisions for all using (
  has_level(round_org(round_id), array['owner','curator']::member_level[])
) with check (
  has_level(round_org(round_id), array['owner','curator']::member_level[])
  and round_state(round_id) = 'aligning'
  and decided_by = auth.uid()
);

-- Rounds: members read, curators write.
create policy rounds_status_update on rounds for update using (
  exists (select 1 from programs pg where pg.id = rounds.program_id
          and has_level(pg.org_id, array['owner','curator']::member_level[]))
);

-- Progress without exposure. Curators need to know who has finished so they
-- can chase people, but they must not see the answers during gathering.
-- This returns counts only, never values.
create or replace function round_progress(r uuid)
returns table (user_id uuid, answered bigint)
language sql stable security definer set search_path = public as $$
  select m.user_id, count(ra.id)
    from memberships m
    left join round_answers ra on ra.round_id = r and ra.user_id = m.user_id
   where m.org_id = round_org(r)
     and m.level <> 'observer'
   group by m.user_id;
$$;

grant execute on function round_progress(uuid) to authenticated;
grant execute on function round_org(uuid) to authenticated;
grant execute on function round_state(uuid) to authenticated;

-- Create a round in a program and open it for answering.
create or replace function open_round(program uuid, round_label text)
returns rounds language plpgsql security definer set search_path = public as $$
declare
  target_org uuid;
  next_seq int;
  new_round rounds;
begin
  select pg.org_id into target_org from programs pg where pg.id = program;
  if target_org is null then
    raise exception 'no such program';
  end if;
  if not has_level(target_org, array['owner','curator']::member_level[]) then
    raise exception 'only an owner or curator can open a round';
  end if;

  select coalesce(max(sequence), 0) + 1 into next_seq from rounds where program_id = program;

  insert into rounds (program_id, sequence, label, status, opened_by, opens_at)
  values (program, next_seq, coalesce(nullif(trim(round_label), ''), 'Round ' || next_seq),
          'gathering', auth.uid(), now())
  returning * into new_round;

  return new_round;
end;
$$;

-- Advance a round. Gathering closes and every answer becomes visible at the
-- same instant for everyone, which is what keeps the reveal fair.
create or replace function advance_round(r uuid, next_state round_status)
returns rounds language plpgsql security definer set search_path = public as $$
declare
  target_org uuid := round_org(r);
  updated rounds;
begin
  if not has_level(target_org, array['owner','curator']::member_level[]) then
    raise exception 'only an owner or curator can advance a round';
  end if;
  update rounds set status = next_state,
         closes_at = case when next_state = 'closed' then now() else closes_at end
   where id = r
  returning * into updated;
  return updated;
end;
$$;

grant execute on function open_round(uuid, text) to authenticated;
grant execute on function advance_round(uuid, round_status) to authenticated;
