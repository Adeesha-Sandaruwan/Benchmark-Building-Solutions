
-- =====================================================
-- BENCHMARK BUILDING SOLUTIONS
-- Tasks Management Module
-- Migration: 20261113000100_tasks.sql
--
-- Dependencies:
-- All 12 existing construction migrations.
--
-- IMPORTANT:
-- Do not execute against the shared database
-- without approval from the group leader.
-- =====================================================


-- =====================================================
-- 1. CREATE TASKS TABLE
-- =====================================================

create table public.tasks (

  id uuid primary key default gen_random_uuid(),

  organization_id uuid not null
    references public.organizations(id)
    on delete restrict,

  project_id uuid not null,

  title text not null
    check (char_length(trim(title)) between 2 and 150),

  description text not null default ''
    check (char_length(description) <= 5000),

  assigned_worker_id uuid,

  priority text not null default 'medium'
    check (
      priority in (
        'low',
        'medium',
        'high',
        'critical'
      )
    ),

  status text not null default 'todo'
    check (
      status in (
        'todo',
        'in_progress',
        'blocked',
        'completed'
      )
    ),

  start_date date,

  due_date date,

  completed_at timestamptz,

  created_by uuid not null
    references public.profiles(id)
    on delete restrict,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  archived_at timestamptz,

  -- Project must belong to the same organization.

  constraint tasks_project_fk
    foreign key (project_id, organization_id)
    references public.projects(id, organization_id)
    on delete restrict,

  -- Assigned worker must belong to the same organization.

  constraint tasks_worker_fk
    foreign key (assigned_worker_id, organization_id)
    references public.workers(id, organization_id)
    on delete restrict,

  -- Due date cannot be earlier than start date.

  constraint tasks_valid_dates
    check (
      start_date is null
      or due_date is null
      or due_date >= start_date
    )

);


-- =====================================================
-- 2. VALIDATE TASK RELATIONSHIPS
-- =====================================================

-- Ensure that:
-- 1. The project is not archived.
-- 2. The assigned worker is active.
-- 3. The worker is actively assigned to this project.
-- 4. Immutable task identity fields are protected.
-- 5. Completion timestamps are synchronized.


create function public.validate_task_relationships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin

  -- Prevent changing a task's original ownership.

  if tg_op = 'UPDATE' then

    if new.id is distinct from old.id
      or new.organization_id is distinct from old.organization_id
      or new.project_id is distinct from old.project_id
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception
        'Task identity and ownership cannot be changed';
    end if;

  end if;


  -- Validate the related construction project.

  if not exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and p.organization_id = new.organization_id
      and p.archived_at is null
  ) then

    raise exception
      'Invalid or archived construction project';

  end if;


  -- Validate a newly selected worker assignment.
  -- Existing assignments may remain recorded after
  -- a worker is removed from a project.

  if new.assigned_worker_id is not null
     and (
       tg_op = 'INSERT'
       or new.assigned_worker_id
          is distinct from old.assigned_worker_id
     )
  then

    if not exists (
      select 1
      from public.workers w
      join public.project_worker_assignments a
        on a.worker_id = w.id
       and a.organization_id = w.organization_id

      where w.id = new.assigned_worker_id
        and w.organization_id = new.organization_id
        and w.archived_at is null
        and w.employment_status = 'active'

        and a.project_id = new.project_id
        and a.removed_at is null
    ) then

      raise exception
        'Worker must be active and assigned to the project';

    end if;

  end if;


  -- Automatically manage completion timestamps.

  if new.status = 'completed' then

    if tg_op = 'INSERT' then
      new.completed_at = now();

    elsif old.status is distinct from 'completed' then
      new.completed_at = now();

    end if;

  else

    new.completed_at = null;

  end if;


  -- Update modification timestamp.

  new.updated_at = now();

  return new;

end;
$$;


create trigger validate_task_relationships_trigger
before insert or update
on public.tasks
for each row
execute function public.validate_task_relationships();


-- =====================================================
-- 3. DATABASE INDEXES
-- =====================================================

-- Fast lookup by project and status.

create index tasks_project_status_idx
on public.tasks(project_id, status)
where archived_at is null;


-- Organization task history.

create index tasks_organization_created_idx
on public.tasks(organization_id, created_at desc);


-- Worker task assignments.

create index tasks_assigned_worker_idx
on public.tasks(assigned_worker_id)
where assigned_worker_id is not null
  and archived_at is null;


-- Task deadline filtering.

create index tasks_due_date_idx
on public.tasks(due_date)
where archived_at is null
  and due_date is not null;


-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

alter table public.tasks
enable row level security;


-- Only authenticated users get table privileges.

grant select, insert, update
on public.tasks
to authenticated;


-- =====================================================
-- 5. SELECT POLICY
-- =====================================================

-- Users may view tasks only for accessible projects.

create policy "Project members can read tasks"
on public.tasks
for select
to authenticated

using (
  public.can_access_project(project_id)
);


-- =====================================================
-- 6. INSERT POLICY
-- =====================================================

-- Authorized organization roles can create tasks.

create policy "Project leaders can create tasks"
on public.tasks
for insert
to authenticated

with check (

  public.can_access_project(project_id)

  and public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'project_manager',
      'supervisor'
    ]
  )

  and created_by = (select auth.uid())

);


-- =====================================================
-- 7. UPDATE POLICY
-- =====================================================

-- Authorized leaders can update accessible tasks.

create policy "Project leaders can update tasks"
on public.tasks
for update
to authenticated

using (

  public.can_access_project(project_id)

  and public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'project_manager',
      'supervisor'
    ]
  )

)

with check (

  public.can_access_project(project_id)

  and public.has_organization_role(
    organization_id,
    array[
      'owner',
      'admin',
      'project_manager',
      'supervisor'
    ]
  )

);


-- =====================================================
-- 8. SECURITY / AUDIT NOTES
-- =====================================================

-- Physical DELETE is intentionally not granted.
-- Tasks should be archived using archived_at.
--
-- Worker IDs are different from authenticated user IDs.
-- A worker must be assigned through the existing
-- project_worker_assignments table before task assignment.
--
-- The trigger protects task ownership and timestamps.
-- PostgreSQL RLS enforces project access and roles.
--
-- END OF TASKS MIGRATION
-- =====================================================
