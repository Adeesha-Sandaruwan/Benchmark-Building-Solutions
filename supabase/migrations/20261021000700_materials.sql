alter table public.projects
  add constraint projects_id_organization_unique unique (id, organization_id);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  material_code text not null,
  name text not null check (char_length(trim(name)) between 2 and 180),
  category text not null default '',
  unit text not null default 'unit',
  default_supplier text,
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  unique (organization_id, material_code),
  unique (id, organization_id)
);

create table if not exists public.project_materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null,
  material_id uuid not null,
  quantity_requested numeric(14,3) not null check (quantity_requested > 0),
  quantity_received numeric(14,3) not null default 0 check (quantity_received >= 0),
  quantity_used numeric(14,3) not null default 0 check (quantity_used >= 0),
  unit_cost numeric(14,2) check (unit_cost is null or unit_cost >= 0),
  supplier text,
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'ordered', 'partially_received', 'received', 'cancelled')),
  needed_by date,
  notes text not null default '',
  requested_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  foreign key (material_id, organization_id)
    references public.materials (id, organization_id) on delete restrict,
  check (quantity_used <= quantity_received)
);

create index if not exists materials_org_name_idx
  on public.materials (organization_id, name) where archived_at is null;
create index if not exists project_materials_project_status_idx
  on public.project_materials (project_id, status, needed_by);

alter table public.materials enable row level security;
alter table public.project_materials enable row level security;
grant select, insert, update on public.materials, public.project_materials to authenticated;

create policy "Organization members can read the materials catalog"
  on public.materials for select to authenticated
  using (public.is_organization_member(organization_id));

create policy "Project leaders can add catalog materials"
  on public.materials for insert to authenticated
  with check (
    public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
    and created_by = (select auth.uid())
  );

create policy "Project leaders can update catalog materials"
  on public.materials for update to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor']));

create policy "Project members can read material requests"
  on public.project_materials for select to authenticated
  using (public.can_access_project(project_id));

create policy "Site and project leads can request materials"
  on public.project_materials for insert to authenticated
  with check (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor', 'worker'])
    and requested_by = (select auth.uid())
  );

create policy "Project leaders can update material requests"
  on public.project_materials for update to authenticated
  using (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
  )
  with check (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
  );
