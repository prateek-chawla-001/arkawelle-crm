-- =====================================================================
-- Arkawelle CRM: VENDOR signup + approval.  Run once in Supabase -> SQL Editor.
-- Safe to run even if you ran the earlier supabase_auth_setup.sql (it is cleaned up here).
-- =====================================================================

-- 0) Remove the earlier profiles-based setup, if present
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop table if exists public.profiles cascade;

-- 1) Vendors table (one row per vendor company)
create table if not exists public.vendors (
  id            uuid primary key default gen_random_uuid(),
  auth_id       uuid unique references auth.users (id) on delete cascade,  -- null for seeded demo vendors
  company_name  text not null unique,
  contact_name  text,
  email         text,
  phone         text,
  city          text,
  gst_number    text,
  status        text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  created_at    timestamptz not null default now()
);

-- DEMO: open access, same as your leads table. Tighten before real use (see notes in chat).
alter table public.vendors enable row level security;
drop policy if exists "demo open vendors" on public.vendors;
create policy "demo open vendors" on public.vendors for all using (true) with check (true);

-- 2) When someone signs up, create their vendor row automatically (always 'Pending')
create or replace function public.handle_new_vendor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  cname text := coalesce(nullif(m ->> 'company_name', ''), split_part(new.email, '@', 1));
begin
  begin
    insert into public.vendors (auth_id, company_name, contact_name, email, phone, city, gst_number, status)
    values (new.id, cname, m ->> 'contact_name', new.email, m ->> 'phone', m ->> 'city', nullif(m ->> 'gst_number', ''), 'Pending');
  exception when unique_violation then
    -- company name already taken: add a short suffix so signup still works
    insert into public.vendors (auth_id, company_name, contact_name, email, phone, city, gst_number, status)
    values (new.id, cname || ' (' || substr(new.id::text, 1, 4) || ')', m ->> 'contact_name', new.email, m ->> 'phone', m ->> 'city', nullif(m ->> 'gst_number', ''), 'Pending');
  end;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_vendor();

-- 3) Demo vendors (4 approved, 2 waiting for approval so you can show the approval flow)
insert into public.vendors (company_name, contact_name, email, phone, city, gst_number, status) values
 ('SunBridge Energy',    'Ankit Malhotra', 'ankit@sunbridge.example',  '+91 98100 20001', 'Gurugram',  '06ABCDE1234F1Z5', 'Approved'),
 ('Solaris Power Works', 'Priya Nair',     'priya@solaris.example',    '+91 98100 20002', 'Delhi',     '07ABCDE2345G1Z4', 'Approved'),
 ('GreenRay Installers', 'Manoj Tiwari',   'manoj@greenray.example',   '+91 98100 20003', 'Noida',     '09ABCDE3456H1Z3', 'Approved'),
 ('Helio Rooftops',      'Sana Qureshi',   'sana@helio.example',       '+91 98100 20004', 'Faridabad', '06ABCDE4567J1Z2', 'Approved'),
 ('BrightSky Solar',     'Rahul Bhatia',   'rahul@brightsky.example',  '+91 98100 20005', 'Ghaziabad', '09ABCDE5678K1Z1', 'Pending'),
 ('Urja Next Installers','Divya Rathi',    'divya@urjanext.example',   '+91 98100 20006', 'Sonipat',   '06ABCDE6789L1Z0', 'Pending')
on conflict (company_name) do nothing;

-- 4) Re-point the old demo technician names on leads to vendor company names
update public.leads set assigned_tech = case assigned_tech
    when 'Tech A - Gurugram'  then 'SunBridge Energy'
    when 'Tech B - Delhi'     then 'Solaris Power Works'
    when 'Tech C - Noida'     then 'GreenRay Installers'
    when 'Tech D - Faridabad' then 'Helio Rooftops'
    else assigned_tech end
where assigned_tech like 'Tech %';
