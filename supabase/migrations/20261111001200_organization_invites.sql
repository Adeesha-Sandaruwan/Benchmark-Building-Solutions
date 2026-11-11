create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token text not null unique,
  email text,
  role text not null check (role in ('admin', 'project_manager', 'supervisor', 'finance', 'worker', 'viewer')),
  created_by uuid not null references public.profiles (id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check ((accepted_by is null and accepted_at is null) or (accepted_by is not null and accepted_at is not null))
);

create index if not exists organization_invites_org_expiry_idx
  on public.organization_invites (organization_id, expires_at desc);
alter table public.organization_invites enable row level security;
revoke all on public.organization_invites from anon, authenticated;

create or replace function public.create_organization_invite(target_organization_id uuid, invited_role text, invited_email text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  invite_token text := gen_random_uuid()::text || gen_random_uuid()::text;
  normalized_email text := nullif(lower(trim(invited_email)), '');
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  if not public.has_organization_role(target_organization_id, array['owner', 'admin']) then
    raise exception 'Only workspace owners and admins can create invitations';
  end if;
  if invited_role not in ('admin', 'project_manager', 'supervisor', 'finance', 'worker', 'viewer') then
    raise exception 'Choose a valid organization role';
  end if;
  if invited_role = 'admin' and not public.has_organization_role(target_organization_id, array['owner']) then
    raise exception 'Only the workspace owner can invite another admin';
  end if;
  if normalized_email is not null and (char_length(normalized_email) > 254 or normalized_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$') then
    raise exception 'Enter a valid email address';
  end if;
  insert into public.organization_invites (organization_id, token, email, role, created_by)
  values (target_organization_id, invite_token, normalized_email, invited_role, current_user_id);
  return invite_token;
end;
$$;

create or replace function public.accept_organization_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  invite_row public.organization_invites%rowtype;
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  select * into invite_row from public.organization_invites where token = invite_token for update;
  if not found or invite_row.accepted_at is not null or invite_row.expires_at <= now() then
    raise exception 'This invitation is invalid or has expired';
  end if;
  if invite_row.email is not null and invite_row.email <> current_email then
    raise exception 'Sign in with the invited email address to accept this invitation';
  end if;
  if exists (
    select 1 from public.organization_memberships
    where organization_id = invite_row.organization_id and user_id = current_user_id and status = 'active'
  ) then raise exception 'You already belong to this workspace'; end if;

  insert into public.organization_memberships (organization_id, user_id, role, status, invited_by)
  values (invite_row.organization_id, current_user_id, invite_row.role, 'active', invite_row.created_by);
  update public.organization_invites
    set accepted_by = current_user_id, accepted_at = now()
    where id = invite_row.id;
  return invite_row.organization_id;
end;
$$;

revoke all on function public.create_organization_invite(uuid, text, text) from public;
revoke all on function public.accept_organization_invite(text) from public;
grant execute on function public.create_organization_invite(uuid, text, text) to authenticated;
grant execute on function public.accept_organization_invite(text) to authenticated;
