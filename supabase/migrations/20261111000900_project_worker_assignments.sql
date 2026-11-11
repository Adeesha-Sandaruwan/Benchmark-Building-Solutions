alter table public.workers
  add constraint workers_id_organization_unique unique (id, organization_id);

create table if not exists public.project_worker_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null,
  worker_id uuid not null,
  role_on_project text not null default '',
  assigned_by uuid not null references public.profiles (id) on delete restrict,
  assigned_at timestamptz not null default now(),
  removed_at timestamptz,
  notes text not null default '',
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  foreign key (worker_id, organization_id)
    references public.workers (id, organization_id) on delete restrict
);

create unique index if not exists project_worker_one_active_assignment_idx
  on public.project_worker_assignments (project_id, worker_id) where removed_at is null;
create index if not exists project_workers_project_active_idx
  on public.project_worker_assignments (project_id, assigned_at desc) where removed_at is null;
create index if not exists project_workers_worker_active_idx
  on public.project_worker_assignments (worker_id, assigned_at desc) where removed_at is null;

alter table public.project_worker_assignments enable row level security;
grant select, insert, update on public.project_worker_assignments to authenticated;

create policy "Project members can read workforce assignments"
  on public.project_worker_assignments for select to authenticated
  using (public.can_access_project(project_id));

create policy "Project leaders can assign workers"
  on public.project_worker_assignments for insert to authenticated
  with check (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
    and assigned_by = (select auth.uid())
  );

create policy "Project leaders can end assignments"
  on public.project_worker_assignments for update to authenticated
  using (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
  )
  with check (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor'])
  );
