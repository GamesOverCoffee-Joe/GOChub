-- GOQ Museum: staff badges, duty log and leaderboard.
-- Paste this whole file into Supabase's SQL Editor and press Run. It's safe to run again later.
--
-- How it's locked down:
--   * The tables live in a private schema called "goq". The website can't see that schema at all.
--   * The website can only call three functions: clock_in, log_duty and get_leaderboard.
--   * Badge keys and session tokens are stored scrambled (hashed), never as plain text.
--   * The leaderboard only ever shows display names and points.
--
-- Your admin helpers (run these yourself in the SQL Editor, the website can't):
--   select * from goq.add_badge('0002', 'Wower');      -- makes a badge and shows its key ONCE
--   select * from goq.new_key('0002');                  -- gives a badge a fresh key (old key and logins stop working)
--   select goq.set_active('0002', false);               -- turn a badge off (true turns it back on)
--   select goq.rename_badge('0002', 'New Name');         -- change the name on the leaderboard
--   select * from goq.badge_list;                        -- every badge with points this month and all time

create extension if not exists pgcrypto with schema extensions;
create schema if not exists goq;
revoke all on schema goq from public;

-- ---------- Tables ----------
create table if not exists goq.badges (
  badge        text primary key check (badge ~ '^[0-9]{1,8}$'),
  key_hash     text not null,
  name         text not null check (length(name) between 1 and 40),
  active       boolean not null default true,
  failed_tries int not null default 0,
  locked_until timestamptz,
  created_at   timestamptz not null default now()
);

create table if not exists goq.sessions (
  token_hash text primary key,
  badge      text not null references goq.badges(badge) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 days'
);

create table if not exists goq.duties (
  id     bigint generated always as identity primary key,
  badge  text not null references goq.badges(badge) on delete cascade,
  duty   text not null,
  target text not null default '',
  points int not null,
  day    date not null default (now() at time zone 'utc')::date,
  at     timestamptz not null default now()
);
-- Fair limit: each frame, case or plant counts once per day per badge. (Loved recommendations can repeat.)
create unique index if not exists duties_once_a_day on goq.duties (badge, duty, target, day) where duty <> 'helped';
create index if not exists duties_by_day on goq.duties (day, badge);

-- Belt and braces: row-level security on, no policies, so nothing gets in except the functions below.
alter table goq.badges enable row level security;
alter table goq.sessions enable row level security;
alter table goq.duties enable row level security;
revoke all on all tables in schema goq from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then execute 'revoke all on all tables in schema goq from anon'; end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then execute 'revoke all on all tables in schema goq from authenticated'; end if;
end $$;

-- ---------- What each duty is worth, and how many count per day ----------
-- [UPDATE, October 2026] Added 'closings' (closing up the museum): 3 points, once a day per badge.
-- [UPDATE, October 2026] 'helped' now means a visitor came back and loved the game you recommended (it used to be helping
--                        a lost visitor). Same name, points and daily cap, so nothing else changes for it.
create or replace function goq.duty_rule(p_duty text, out points int, out daily_cap int)
language sql immutable set search_path = '' as $$
  select r.points, r.daily_cap from (values
    ('dusted', 1, 40), ('straightened', 1, 20), ('wiped', 1, 45),
    ('watered', 1, 10), ('mugs', 1, 1), ('helped', 3, 10),
    ('closings', 3, 1)
  ) as r(duty, points, daily_cap) where r.duty = p_duty;
$$;

create or replace function goq.norm_key(k text) returns text
language sql immutable set search_path = '' as $$ select regexp_replace(upper(coalesce(k, '')), '[^A-Z0-9]', '', 'g'); $$;

create or replace function goq.token_hash(t text) returns text
language sql immutable set search_path = '' as $$ select encode(extensions.digest(coalesce(t, ''), 'sha256'), 'hex'); $$;

-- ---------- The three doors the website may use ----------

-- Clock in with a badge number and key. Returns the name and a login token the game remembers on that device.
create or replace function public.clock_in(p_badge text, p_key text) returns json
language plpgsql security definer set search_path = '' as $$
declare b goq.badges; tok text; nb text := regexp_replace(coalesce(p_badge, ''), '\D', '', 'g');
begin
  select * into b from goq.badges where badge = nb for update;
  if not found then return json_build_object('ok', false, 'reason', 'wrong'); end if;
  if b.locked_until is not null and b.locked_until > now() then
    return json_build_object('ok', false, 'reason', 'locked');
  end if;
  if b.key_hash <> extensions.crypt(goq.norm_key(p_key), b.key_hash) then
    update goq.badges set failed_tries = failed_tries + 1,
      locked_until = case when failed_tries + 1 >= 8 then now() + interval '15 minutes' else locked_until end
      where badge = nb;
    return json_build_object('ok', false, 'reason', 'wrong');
  end if;
  update goq.badges set failed_tries = 0, locked_until = null where badge = nb;
  if not b.active then return json_build_object('ok', false, 'reason', 'inactive'); end if;
  tok := encode(extensions.gen_random_bytes(24), 'hex');
  insert into goq.sessions (token_hash, badge) values (goq.token_hash(tok), nb);
  delete from goq.sessions where expires_at < now();
  return json_build_object('ok', true, 'badge', nb, 'name', b.name, 'token', tok);
end $$;

-- Record one chore for whoever owns the token. Fair limits decide whether it counts.
create or replace function public.log_duty(p_token text, p_duty text, p_target text default '') returns json
language plpgsql security definer set search_path = '' as $$
declare s goq.sessions; b goq.badges; r record; today date := (now() at time zone 'utc')::date;
        tgt text := left(coalesce(p_target, ''), 60); n int; added int;
begin
  select * into s from goq.sessions where token_hash = goq.token_hash(p_token) and expires_at > now();
  if not found then return json_build_object('ok', false, 'reason', 'session'); end if;
  select * into b from goq.badges where badge = s.badge;
  if not b.active then return json_build_object('ok', false, 'reason', 'inactive'); end if;
  select * into r from goq.duty_rule(p_duty);
  if r.points is null then return json_build_object('ok', false, 'reason', 'duty'); end if;
  if p_duty = 'mugs' then tgt := ''; end if;
  select count(*) into n from goq.duties where badge = b.badge and duty = p_duty and day = today;
  if n >= r.daily_cap then return json_build_object('ok', true, 'counted', false, 'reason', 'cap'); end if;
  insert into goq.duties (badge, duty, target, points, day) values (b.badge, p_duty, tgt, r.points, today)
    on conflict do nothing;
  get diagnostics added = row_count;
  if added = 0 then return json_build_object('ok', true, 'counted', false, 'reason', 'again'); end if;
  return json_build_object('ok', true, 'counted', true, 'points', r.points);
end $$;

-- Names and points only: this month's top ten, and Employee of the Month.
-- Employee of the Month is last month's winner. Until there is one, it's this month's leader "so far".
create or replace function public.get_leaderboard() returns json
language sql stable security definer set search_path = '' as $$
  with m as (select date_trunc('month', now() at time zone 'utc')::date as this_m),
  this_month as (
    select b.name, sum(d.points)::int as points, min(d.at) as first_at
    from goq.duties d join goq.badges b using (badge), m
    where b.active and d.day >= m.this_m group by b.badge, b.name
  ),
  last_month as (
    select b.name, sum(d.points)::int as points, min(d.at) as first_at
    from goq.duties d join goq.badges b using (badge), m
    where b.active and d.day >= (m.this_m - interval '1 month')::date and d.day < m.this_m group by b.badge, b.name
  ),
  top as (select name, points from this_month order by points desc, first_at limit 10),
  champ as (select name, points from last_month order by points desc, first_at limit 1),
  lead as (select name, points from this_month order by points desc, first_at limit 1)
  select json_build_object(
    'month', to_char((select this_m from m), 'FMMonth YYYY'),
    'top', coalesce((select json_agg(json_build_object('name', name, 'points', points)) from top), '[]'::json),
    'eotm', coalesce(
      (select json_build_object('name', name, 'points', points, 'month', to_char((select this_m from m) - interval '1 month', 'FMMonth'), 'sofar', false) from champ),
      (select json_build_object('name', name, 'points', points, 'month', to_char((select this_m from m), 'FMMonth'), 'sofar', true) from lead))
  );
$$;

-- Only these three can be called by the website.
revoke all on function public.clock_in(text, text) from public;
revoke all on function public.log_duty(text, text, text) from public;
revoke all on function public.get_leaderboard() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'grant execute on function public.clock_in(text, text) to anon, authenticated';
    execute 'grant execute on function public.log_duty(text, text, text) to anon, authenticated';
    execute 'grant execute on function public.get_leaderboard() to anon, authenticated';
  end if;
end $$;

-- ---------- Admin helpers (SQL Editor only) ----------

-- A random six-character key without look-alikes (no O/0, no I/1).
create or replace function goq.random_key() returns text
language plpgsql volatile set search_path = '' as $$
declare a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; bytes bytea := extensions.gen_random_bytes(6); k text := ''; i int;
begin
  for i in 0..5 loop k := k || substr(a, 1 + (get_byte(bytes, i) % 32), 1); end loop;
  return k;
end $$;

create or replace function goq.add_badge(p_badge text, p_name text, out badge text, out name text, out key text)
language plpgsql volatile set search_path = '' as $$
declare k text := goq.random_key();
begin
  insert into goq.badges (badge, key_hash, name) values (p_badge, extensions.crypt(k, extensions.gen_salt('bf', 8)), trim(p_name));
  badge := p_badge; name := trim(p_name); key := substr(k, 1, 3) || '-' || substr(k, 4, 3);
end $$;

create or replace function goq.new_key(p_badge text, out badge text, out key text)
language plpgsql volatile set search_path = '' as $$
declare k text := goq.random_key();
begin
  update goq.badges set key_hash = extensions.crypt(k, extensions.gen_salt('bf', 8)), failed_tries = 0, locked_until = null where goq.badges.badge = p_badge;
  if not found then raise exception 'No badge %', p_badge; end if;
  delete from goq.sessions where goq.sessions.badge = p_badge;
  badge := p_badge; key := substr(k, 1, 3) || '-' || substr(k, 4, 3);
end $$;

create or replace function goq.set_active(p_badge text, p_active boolean) returns text
language plpgsql volatile set search_path = '' as $$
begin
  update goq.badges set active = p_active where badge = p_badge;
  if not found then raise exception 'No badge %', p_badge; end if;
  if not p_active then delete from goq.sessions where badge = p_badge; end if;
  return p_badge || case when p_active then ' is on' else ' is off' end;
end $$;

create or replace function goq.rename_badge(p_badge text, p_name text) returns text
language plpgsql volatile set search_path = '' as $$
begin
  update goq.badges set name = trim(p_name) where badge = p_badge;
  if not found then raise exception 'No badge %', p_badge; end if;
  return p_badge || ' is now ' || trim(p_name);
end $$;

create or replace view goq.badge_list as
  select b.badge, b.name, b.active,
    coalesce(sum(d.points) filter (where d.day >= date_trunc('month', now() at time zone 'utc')::date), 0)::int as points_this_month,
    coalesce(sum(d.points), 0)::int as points_all_time,
    (select count(*) from goq.sessions s where s.badge = b.badge and s.expires_at > now())::int as devices_logged_in
  from goq.badges b left join goq.duties d using (badge)
  group by b.badge order by b.badge;

do $$ begin
  revoke all on all functions in schema goq from public;
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all functions in schema goq from anon, authenticated';
    execute 'revoke all on goq.badge_list from anon, authenticated';
  end if;
end $$;
