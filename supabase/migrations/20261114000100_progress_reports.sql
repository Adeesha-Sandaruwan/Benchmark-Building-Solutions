
-- Benchmark Building Solutions
-- Progress Reports Module
-- Apply after the existing construction migrations.
-- DO NOT apply to shared production without approval.


-- 1. Progress Reports table

CREATE TABLE public.progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  organization_id UUID NOT NULL
    REFERENCES public.organizations(id)
    ON DELETE RESTRICT,

  project_id UUID NOT NULL,

  report_type TEXT NOT NULL
    CHECK (report_type IN ('daily', 'weekly')),

  report_date DATE NOT NULL,

  progress_percentage INTEGER NOT NULL
    CHECK (progress_percentage BETWEEN 0 AND 100),

  completed_work TEXT NOT NULL
    CHECK (
      char_length(trim(completed_work)) BETWEEN 2 AND 5000
    ),

  planned_work TEXT NOT NULL DEFAULT ''
    CHECK (char_length(planned_work) <= 5000),

  issues TEXT NOT NULL DEFAULT ''
    CHECK (char_length(issues) <= 5000),

  created_by UUID NOT NULL
    REFERENCES public.profiles(id)
    ON DELETE RESTRICT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ,

  -- Ensure that the project belongs
  -- to the selected organization.
  CONSTRAINT progress_reports_project_fk
    FOREIGN KEY (project_id, organization_id)
    REFERENCES public.projects(id, organization_id)
    ON DELETE RESTRICT
);

-- 2. Validate project relationship and protect audit fields

create function public.validate_progress_report()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Prevent changing the identity and ownership.
  if tg_op = 'UPDATE' then
    if new.id is distinct from old.id
      or new.organization_id is distinct from old.organization_id
      or new.project_id is distinct from old.project_id
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at
    then
      raise exception 'Report identity cannot be changed';
    end if;
  end if;

  -- The report must reference a project
  -- belonging to the same organization.
  if not exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and p.organization_id = new.organization_id
      and p.archived_at is null
  ) then
    raise exception 'Invalid or archived project';
  end if;

  -- Prevent changing the stored creation time.
  if tg_op = 'INSERT' then
    new.created_at = now();
  end if;

  new.updated_at = now();

  return new;
end;
$$;

create trigger validate_progress_report_trigger
before insert or update
on public.progress_reports
for each row
execute function public.validate_progress_report();

-- 3. Indexes

create index progress_reports_project_date_idx
on public.progress_reports(project_id, report_date desc)
where archived_at is null;

create index progress_reports_org_type_idx
on public.progress_reports(
  organization_id,
  report_type,
  report_date desc
)
where archived_at is null;

create index progress_reports_author_idx
on public.progress_reports(created_by);

-- 4. Row Level Security

alter table public.progress_reports
enable row level security;

grant select, insert, update
on public.progress_reports to authenticated;

-- 5. Read access

create policy "Read accessible project reports"
on public.progress_reports
for select
to authenticated
using (
  public.can_access_project(project_id)
);

-- 6. Create access

create policy "Authorized members create reports"
on public.progress_reports
for insert
to authenticated
with check (
  public.can_access_project(project_id)
  and public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'project_manager', 'supervisor']
  )
  and created_by = (select auth.uid())
  and archived_at is null
);

-- 7. Update access

create policy "Authorized members update reports"
on public.progress_reports
for update
to authenticated
using (
  public.can_access_project(project_id)
  and public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'project_manager', 'supervisor']
  )
)
with check (
  public.can_access_project(project_id)
  and public.has_organization_role(
    organization_id,
    array['owner', 'admin', 'project_manager', 'supervisor']
  )
);

-- Physical deletion is intentionally not granted.
-- Reports are archived using archived_at.
