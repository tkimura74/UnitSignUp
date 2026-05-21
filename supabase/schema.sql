create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  address text,
  service_schedule text not null default 'Each 3rd Thursday of the Month',
  next_service_date date,
  next_service_note text,
  technician_token text not null default gen_random_uuid()::text unique,
  resident_fee numeric(10, 2) not null default 40.00,
  payment_methods text not null default 'cash_check' check (payment_methods in ('cash', 'check', 'cash_check')),
  payable_to text not null default 'ORKIN LLC',
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  service_date date,
  resident_name text not null,
  unit_number text not null,
  phone_number text not null,
  payment_acknowledged boolean not null default false,
  technician_completed boolean not null default false,
  technician_notes text,
  created_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.submissions enable row level security;

grant usage on schema public to anon;
grant select on public.properties to anon;
revoke insert on public.submissions from anon;
grant usage on schema public to service_role;
grant all privileges on public.properties to service_role;
grant all privileges on public.submissions to service_role;

alter table public.properties add column if not exists next_service_date date;
alter table public.properties add column if not exists next_service_note text;
alter table public.properties add column if not exists updated_at timestamptz not null default now();
alter table public.properties add column if not exists technician_token text;
alter table public.properties add column if not exists payment_methods text not null default 'cash_check';
alter table public.properties drop constraint if exists properties_payment_methods_check;
alter table public.properties add constraint properties_payment_methods_check check (payment_methods in ('cash', 'check', 'cash_check'));
update public.properties
set technician_token = gen_random_uuid()::text
where technician_token is null;
alter table public.properties alter column technician_token set default gen_random_uuid()::text;
alter table public.properties alter column technician_token set not null;
create unique index if not exists properties_technician_token_key on public.properties (technician_token);
alter table public.submissions add column if not exists technician_completed boolean not null default false;
alter table public.submissions add column if not exists technician_notes text;
alter table public.submissions add column if not exists service_date date;
update public.submissions s
set service_date = p.next_service_date
from public.properties p
where s.property_id = p.id
  and s.service_date is null;
delete from public.submissions
where coalesce(service_date, created_at::date) < current_date - interval '1 year';

drop policy if exists "Public can view active properties" on public.properties;
create policy "Public can view active properties"
on public.properties
for select
to anon
using (is_active = true);

drop policy if exists "Public can create resident submissions" on public.submissions;

insert into public.properties (
  slug,
  name,
  address,
  service_schedule,
  next_service_date,
  next_service_note,
  resident_fee,
  payment_methods,
  payable_to,
  notes
)
values (
  'demo-property',
  'Demo Property',
  'Property address goes here',
  'Each 3rd Thursday of the Month',
  null,
  'Admin-only note: confirm the upcoming service date with property management before sending the signup link.',
  40.00,
  'cash_check',
  'ORKIN LLC',
  'Please be available by phone in case the technician or property team needs to coordinate access.'
)
on conflict (slug) do nothing;
