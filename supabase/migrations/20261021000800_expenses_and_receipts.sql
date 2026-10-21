create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid not null,
  category text not null check (char_length(trim(category)) between 2 and 80),
  merchant text not null default '',
  description text not null check (char_length(trim(description)) between 2 and 2000),
  amount numeric(14,2) not null check (amount > 0),
  currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  expense_date date not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'approved', 'rejected')),
  receipt_path text,
  submitted_by uuid not null references public.profiles (id) on delete restrict,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  review_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (project_id, organization_id)
    references public.projects (id, organization_id) on delete cascade,
  check ((status = 'submitted' and reviewed_by is null and reviewed_at is null)
    or (status in ('approved', 'rejected') and reviewed_by is not null and reviewed_at is not null))
);

create index if not exists expenses_project_status_date_idx
  on public.expenses (project_id, status, expense_date desc);
create index if not exists expenses_org_date_idx
  on public.expenses (organization_id, expense_date desc);

alter table public.expenses enable row level security;
grant select, insert, update on public.expenses to authenticated;

create policy "Project members can read expenses"
  on public.expenses for select to authenticated
  using (public.can_access_project(project_id));

create policy "Project members can submit expenses"
  on public.expenses for insert to authenticated
  with check (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'supervisor', 'finance', 'worker'])
    and submitted_by = (select auth.uid())
    and status = 'submitted'
  );

create policy "Expense approvers can review submissions"
  on public.expenses for update to authenticated
  using (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'finance'])
  )
  with check (
    public.can_access_project(project_id)
    and public.has_organization_role(organization_id, array['owner', 'admin', 'project_manager', 'finance'])
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-receipts',
  'expense-receipts',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Project members can upload expense receipts"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'expense-receipts'
    and case
      when (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      then public.can_access_project(((storage.foldername(name))[1])::uuid)
      else false
    end
  );

create policy "Project members can view expense receipts"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'expense-receipts'
    and case
      when (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      then public.can_access_project(((storage.foldername(name))[1])::uuid)
      else false
    end
  );
