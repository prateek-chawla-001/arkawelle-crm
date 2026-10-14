-- =====================================================================
-- Arkawelle CRM: run this in Supabase -> SQL Editor -> New query -> Run
-- =====================================================================

-- 1) Enable Realtime on the leads table (live updates across devices/tabs)
alter table public.leads replica identity full;
alter publication supabase_realtime add table public.leads;
-- (If you get "relation is already member of publication", it is already enabled. Ignore it.)

-- 2) Optional: clear existing test rows before seeding
-- delete from public.leads;

-- 3) Demo data: 20 realistic leads spread over the last ~8 weeks
insert into public.leads
  (customer_name, phone, email, city, address, roof_type, estimated_kw, status, assigned_tech, created_at)
values
 ('Rakesh Sharma',      '+91 98100 11001', 'rakesh.sharma@example.com',  'Gurugram',  'B-214, Sector 56',            'Concrete',  5,   'Completed',             'Tech A - Gurugram', now() - interval '54 days'),
 ('Sunita Verma',       '+91 98100 11002', 'sunita.verma@example.com',   'Faridabad', 'H-12, Sector 21C',            'Concrete',  3,   'Completed',             'Tech D - Faridabad', now() - interval '49 days'),
 ('Gupta Textiles Pvt Ltd','+91 98100 11003','accounts@guptatextiles.example','Panipat', 'Plot 44, Industrial Area',    'Tin Sheet', 50,  'Installation Approved', 'Tech B - Delhi',     now() - interval '45 days'),
 ('Anil Kapoor',        '+91 98100 11004', 'anil.kapoor@example.com',    'Noida',     'C-77, Sector 41',             'Concrete',  6,   'Completed',             'Tech C - Noida',    now() - interval '41 days'),
 ('Meera Iyer',         '+91 98100 11005', 'meera.iyer@example.com',     'Gurugram',  '1203, DLF Phase 3',           'Slanted',   4,   'Installation Approved', 'Tech A - Gurugram', now() - interval '38 days'),
 ('Vikram Singh',       '+91 98100 11006', 'vikram.singh@example.com',   'Delhi',     'A-9, Pitampura',              'Concrete',  8,   'Site Survey Scheduled', 'Tech B - Delhi',    now() - interval '33 days'),
 ('Sharma Cold Storage','+91 98100 11007', 'ops@sharmacold.example',     'Sonipat',   'Kundli Industrial Estate',    'Tin Sheet', 75,  'Site Survey Scheduled', 'Tech A - Gurugram', now() - interval '30 days'),
 ('Pooja Malhotra',     '+91 98100 11008', 'pooja.m@example.com',        'Ghaziabad', 'Indirapuram, Shakti Khand',   'Concrete',  3,   'Site Survey Scheduled', 'Tech C - Noida',    now() - interval '27 days'),
 ('Harish Chauhan',     '+91 98100 11009', 'harish.c@example.com',       'Faridabad', 'Sector 15, House 88',         'Slanted',   5,   'Installation Approved', 'Tech D - Faridabad', now() - interval '24 days'),
 ('Deepak Arora',       '+91 98100 11010', 'deepak.arora@example.com',   'Gurugram',  'Sohna Road, Vatika City',     'Concrete',  10,  'Site Survey Scheduled', 'Tech A - Gurugram', now() - interval '21 days'),
 ('Kavita Nair',        '+91 98100 11011', 'kavita.nair@example.com',    'Noida',     'Sector 62, Tower B',          'Concrete',  4,   'New Lead',              null,                now() - interval '18 days'),
 ('Bansal Dairy Farm',  '+91 98100 11012', 'bansal.dairy@example.com',   'Rewari',    'Bawal Road',                  'Tin Sheet', 20,  'New Lead',              'Tech B - Delhi',    now() - interval '15 days'),
 ('Ritu Agarwal',       '+91 98100 11013', 'ritu.agarwal@example.com',   'Delhi',     'Rohini Sector 13',            'Concrete',  5,   'New Lead',              'Tech A - Gurugram', now() - interval '12 days'),
 ('Sanjay Mehta',       '+91 98100 11014', 'sanjay.mehta@example.com',   'Gurugram',  'Palam Vihar, Block C',        'Slanted',   6,   'New Lead',              'Tech A - Gurugram', now() - interval '9 days'),
 ('Lakshmi Reddy',      '+91 98100 11015', 'lakshmi.r@example.com',      'Faridabad', 'NIT 5, Near Metro',           'Concrete',  3,   'New Lead',              null,                now() - interval '7 days'),
 ('Modern Public School','+91 98100 11016','admin@modernschool.example', 'Panipat',   'GT Road',                     'Concrete',  30,  'Site Survey Scheduled', 'Tech B - Delhi',    now() - interval '5 days'),
 ('Imran Khan',         '+91 98100 11017', 'imran.khan@example.com',     'Ghaziabad', 'Vaishali, Sector 4',          'Tin Sheet', 7,   'New Lead',              null,                now() - interval '3 days'),
 ('Ashok Yadav',        '+91 98100 11018', 'ashok.yadav@example.com',    'Gurugram',  'Sector 49, Sushant Lok',      'Concrete',  5,   'New Lead',              'Tech A - Gurugram', now() - interval '2 days'),
 ('Neelam Joshi',       '+91 98100 11019', 'neelam.joshi@example.com',   'Noida',     'Sector 137, Supertech Capetown','Concrete', 4,   'New Lead',              null,                now() - interval '1 days'),
 ('Tyagi Steel Works',  '+91 98100 11020', 'info@tyagisteel.example',    'Sonipat',   'Rai Industrial Area',         'Tin Sheet', 40,  'New Lead',              'Tech C - Noida',    now() - interval '6 hours');
