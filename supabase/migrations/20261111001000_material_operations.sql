create or replace function public.transition_material_request(request_id uuid, next_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.project_materials%rowtype;
begin
  select * into request_row from public.project_materials where id = request_id for update;
  if not found then raise exception 'Material request not found'; end if;
  if not public.can_access_project(request_row.project_id)
    or not public.has_organization_role(request_row.organization_id, array['owner', 'admin', 'project_manager', 'supervisor']) then
    raise exception 'Not authorized to update this material request';
  end if;
  if not (
    (request_row.status = 'requested' and next_status in ('approved', 'cancelled'))
    or (request_row.status = 'approved' and next_status in ('ordered', 'cancelled'))
    or (request_row.status = 'ordered' and next_status = 'cancelled')
  ) then raise exception 'Invalid material request status transition'; end if;
  update public.project_materials set status = next_status, updated_at = now() where id = request_id;
end;
$$;

create or replace function public.record_material_receipt(request_id uuid, received_quantity numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.project_materials%rowtype;
  new_total numeric(14,3);
begin
  if received_quantity is null or received_quantity <= 0 then raise exception 'Received quantity must be greater than zero'; end if;
  select * into request_row from public.project_materials where id = request_id for update;
  if not found then raise exception 'Material request not found'; end if;
  if not public.can_access_project(request_row.project_id)
    or not public.has_organization_role(request_row.organization_id, array['owner', 'admin', 'project_manager', 'supervisor']) then
    raise exception 'Not authorized to receive this material';
  end if;
  if request_row.status not in ('ordered', 'partially_received') then raise exception 'Only ordered material can be received'; end if;
  new_total := request_row.quantity_received + received_quantity;
  if new_total > 99999999999 then raise exception 'Received quantity is too large'; end if;
  update public.project_materials
    set quantity_received = new_total,
        status = case when new_total >= quantity_requested then 'received' else 'partially_received' end,
        updated_at = now()
    where id = request_id;
end;
$$;

create or replace function public.record_material_usage(request_id uuid, used_quantity numeric)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_row public.project_materials%rowtype;
begin
  if used_quantity is null or used_quantity <= 0 then raise exception 'Used quantity must be greater than zero'; end if;
  select * into request_row from public.project_materials where id = request_id for update;
  if not found then raise exception 'Material request not found'; end if;
  if not public.can_access_project(request_row.project_id)
    or not public.has_organization_role(request_row.organization_id, array['owner', 'admin', 'project_manager', 'supervisor', 'worker']) then
    raise exception 'Not authorized to record material usage';
  end if;
  if request_row.quantity_used + used_quantity > request_row.quantity_received then raise exception 'Used quantity cannot exceed received quantity'; end if;
  update public.project_materials set quantity_used = quantity_used + used_quantity, updated_at = now() where id = request_id;
end;
$$;

revoke all on function public.transition_material_request(uuid, text) from public;
revoke all on function public.record_material_receipt(uuid, numeric) from public;
revoke all on function public.record_material_usage(uuid, numeric) from public;
grant execute on function public.transition_material_request(uuid, text) to authenticated;
grant execute on function public.record_material_receipt(uuid, numeric) to authenticated;
grant execute on function public.record_material_usage(uuid, numeric) to authenticated;
