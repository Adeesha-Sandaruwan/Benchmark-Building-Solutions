create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  worker_code text not null,
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  email text,
  phone text,
  trade text not null default '',
  employment_status text not null default 'active'
    check (employment_status in ('active', 'on_leave', 'inactive')),
  start_date date,
  notes text not null default '',
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, worker_code)
);

create index if not exists workers_org_status_name_idx
  on public.workers (organization_id, employment_status, full_name)
  where archived_at is null;
create index if not exists workers_project_user_lookup_idx
  on public.workers (user_id) where user_id is not null;

alter table public.workers enable row level security;

create policy "Organization members can read workers"
  on public.workers for select to authenticated
  using (public.is_organization_member(organization_id));

create policy "Workforce managers can add workers"
  on public.workers for insert to authenticated
  with check (
    public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
    and created_by = (select auth.uid())
  );

create policy "Workforce managers can update workers"
  on public.workers for update to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor']));
