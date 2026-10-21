create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('owner', 'admin', 'project_manager', 'supervisor', 'finance', 'worker', 'viewer')),
  status text not null default 'active'
    check (status in ('invited', 'active', 'suspended')),
  invited_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists organization_memberships_user_status_idx
  on public.organization_memberships (user_id, status, organization_id);

create index if not exists organization_memberships_org_role_idx
  on public.organization_memberships (organization_id, role, status);

alter table public.organization_memberships enable row level security;
grant select, insert, update on public.organization_memberships to authenticated;
