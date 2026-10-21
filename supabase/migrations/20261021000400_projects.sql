create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  code text not null,
  name text not null check (char_length(trim(name)) between 2 and 180),
  client_name text,
  description text not null default '',
  location text not null default '',
  status text not null default 'planning'
    check (status in ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  manager_id uuid references public.profiles (id) on delete set null,
  budget numeric(14,2) check (budget is null or budget >= 0),
  currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  start_date date,
  target_end_date date,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, code),
  check (start_date is null or target_end_date is null or target_end_date >= start_date)
);

create index if not exists projects_org_status_idx
  on public.projects (organization_id, status, archived_at, created_at desc);

create index if not exists projects_manager_idx
  on public.projects (manager_id) where manager_id is not null;

alter table public.projects enable row level security;
