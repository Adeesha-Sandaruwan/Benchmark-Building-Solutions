create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
  );
$$;

create or replace function public.has_organization_role(target_organization_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.status = 'active'
      and membership.role = any(allowed_roles)
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.has_organization_role(uuid, text[]) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;
grant execute on function public.has_organization_role(uuid, text[]) to authenticated;

create policy "Organization members can read fellow member profiles"
  on public.profiles for select to authenticated
  using (
    exists (
      select 1
      from public.organization_memberships membership
      where membership.user_id = profiles.id
        and public.is_organization_member(membership.organization_id)
    )
  );

create policy "Organization members can read their organizations"
  on public.organizations for select to authenticated
  using (public.is_organization_member(id));

create policy "Organization admins can update their organizations"
  on public.organizations for update to authenticated
  using (public.has_organization_role(id, array['owner', 'admin']))
  with check (public.has_organization_role(id, array['owner', 'admin']));

create policy "Members can read their organization memberships"
  on public.organization_memberships for select to authenticated
  using (public.is_organization_member(organization_id));

create policy "Organization admins can manage memberships"
  on public.organization_memberships for all to authenticated
  using (public.has_organization_role(organization_id, array['owner', 'admin']))
  with check (public.has_organization_role(organization_id, array['owner', 'admin']));

create or replace function public.create_organization(organization_name text, organization_slug text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_organization_id uuid;
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if char_length(trim(organization_name)) not between 2 and 160 then
    raise exception 'Organization name must be between 2 and 160 characters';
  end if;
  if organization_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Organization slug must contain lowercase letters, numbers, and single hyphens';
  end if;
  if exists (
    select 1 from public.organization_memberships
    where user_id = current_user_id and status = 'active'
  ) then
    raise exception 'You already belong to an active organization';
  end if;

  insert into public.organizations (name, slug, created_by)
  values (trim(organization_name), organization_slug, current_user_id)
  returning id into new_organization_id;

  insert into public.organization_memberships (organization_id, user_id, role, status)
  values (new_organization_id, current_user_id, 'owner', 'active');

  return new_organization_id;
end;
$$;

revoke all on function public.create_organization(text, text) from public;
grant execute on function public.create_organization(text, text) to authenticated;
