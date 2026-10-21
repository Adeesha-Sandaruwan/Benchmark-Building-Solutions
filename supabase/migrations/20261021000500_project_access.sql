create table if not exists public.project_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'viewer'
    check (role in ('project_manager', 'supervisor', 'worker', 'finance', 'viewer')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  assigned_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create index if not exists project_memberships_user_project_idx
  on public.project_memberships (user_id, project_id) where status = 'active';
create index if not exists project_memberships_project_role_idx
  on public.project_memberships (project_id, role, status);

alter table public.project_memberships enable row level security;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.projects project
    where project.id = target_project_id
      and public.is_organization_member(project.organization_id)
      and (
        public.has_organization_role(project.organization_id, array['owner', 'admin'])
        or not exists (
          select 1 from public.project_memberships assignment
          where assignment.project_id = project.id and assignment.status = 'active'
        )
        or exists (
          select 1 from public.project_memberships assignment
          where assignment.project_id = project.id
            and assignment.user_id = (select auth.uid())
            and assignment.status = 'active'
        )
      )
  );
$$;

revoke all on function public.can_access_project(uuid) from public;
grant execute on function public.can_access_project(uuid) to authenticated;

create policy "Members can read projects they can access"
  on public.projects for select to authenticated
  using (public.can_access_project(id));

create policy "Authorized members can create projects"
  on public.projects for insert to authenticated
  with check (
    public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager'])
    and created_by = (select auth.uid())
  );

create policy "Project managers can update accessible projects"
  on public.projects for update to authenticated
  using (
    public.can_access_project(id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager'])
  )
  with check (
    public.can_access_project(id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager'])
  );

create policy "Members can read their project assignments"
  on public.project_memberships for select to authenticated
  using (public.can_access_project(project_id));

create policy "Project managers can manage project assignments"
  on public.project_memberships for all to authenticated
  using (
    public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager'])
    and public.can_access_project(project_id)
  )
  with check (
    public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager'])
    and public.can_access_project(project_id)
  );

create or replace function public.add_project_creator_membership()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.project_memberships (organization_id, project_id, user_id, role, assigned_by)
  values (new.organization_id, new.id, new.created_by, 'project_manager', new.created_by)
  on conflict (project_id, user_id) do nothing;
  return new;
end;
$$;

create trigger project_creator_membership
  after insert on public.projects
  for each row execute procedure public.add_project_creator_membership();
