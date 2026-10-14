-- =====================================================================
-- Arkawelle CRM: user accounts (sign up / sign in via Supabase Auth)
-- Run this in Supabase -> SQL Editor -> New query -> Run
-- Safe to re-run.
-- =====================================================================

-- 1) Profiles: one row per auth user with CRM name, role and service area.
--    Passwords are NOT stored here; Supabase Auth hashes them in auth.users.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null unique,
  full_name  text not null,
  phone      text,
  role       text not null default 'Technician'
             check (role in ('Admin', 'Sales Manager', 'Technician')),
  -- Must match TECHS in src/lib/constants.js (used to filter a technician's leads)
  tech       text check (tech in ('Tech A - Gurugram', 'Tech B - Delhi', 'Tech C - Noida', 'Tech D - Faridabad')),
  created_at timestamptz not null default now(),
  constraint technician_needs_tech check (role <> 'Technician' or tech is not null)
);

alter table public.profiles enable row level security;

-- Helper used by policies. security definer avoids RLS recursion on profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'Admin');
$$;

-- Users can read their own profile; Admins can read everyone's.
-- There are deliberately no insert/update policies: profiles are created by the
-- trigger below, and roles are changed by an Admin in the Supabase dashboard,
-- so nobody can promote themselves from the browser.
drop policy if exists "profiles: read own or admin" on public.profiles;
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

-- 2) Auto-create the profile when someone signs up.
--    Reads the details the signup screen sends in options.data.
--    The very first account becomes Admin; after that, signups can only pick
--    Sales Manager or Technician (an Admin can promote people later).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta       jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  final_role text;
  final_tech text;
begin
  if not exists (select 1 from public.profiles) then
    final_role := 'Admin';
  elsif meta->>'role' in ('Sales Manager', 'Technician') then
    final_role := meta->>'role';
  else
    final_role := 'Technician';
  end if;

  if final_role = 'Technician' then
    final_tech := nullif(meta->>'tech', '');
  end if;

  insert into public.profiles (id, email, full_name, phone, role, tech)
  values (
    new.id,
    lower(new.email),
    coalesce(nullif(trim(meta->>'full_name'), ''), split_part(new.email, '@', 1)),
    nullif(trim(meta->>'phone'), ''),
    final_role,
    final_tech
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) Change someone's role later (run manually as needed):
-- update public.profiles set role = 'Admin', tech = null where email = 'someone@arkawelle.in';
-- update public.profiles set role = 'Technician', tech = 'Tech B - Delhi' where email = 'someone@arkawelle.in';

-- 4) RECOMMENDED once everyone has an account: lock the leads table to signed-in users.
--    Until you run this, anyone holding the anon key can still read/write leads.
-- alter table public.leads enable row level security;
-- drop policy if exists "leads: signed-in read"   on public.leads;
-- drop policy if exists "leads: signed-in insert" on public.leads;
-- drop policy if exists "leads: signed-in update" on public.leads;
-- drop policy if exists "leads: admin delete"     on public.leads;
-- create policy "leads: signed-in read"   on public.leads for select to authenticated using (true);
-- create policy "leads: signed-in insert" on public.leads for insert to authenticated with check (true);
-- create policy "leads: signed-in update" on public.leads for update to authenticated using (true) with check (true);
-- create policy "leads: admin delete"     on public.leads for delete to authenticated using (public.is_admin());
