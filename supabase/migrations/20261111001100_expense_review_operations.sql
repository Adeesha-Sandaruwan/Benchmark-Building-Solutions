revoke update on public.expenses from authenticated;
drop policy if exists "Expense approvers can review submissions" on public.expenses;

create or replace function public.review_expense(expense_id uuid, decision text, decision_note text default '')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  expense_row public.expenses%rowtype;
  reviewer_id uuid := auth.uid();
begin
  if reviewer_id is null then raise exception 'Authentication required'; end if;
  if decision not in ('approved', 'rejected') then raise exception 'Choose an approval or rejection decision'; end if;
  if char_length(decision_note) > 1000 then raise exception 'Review note is too long'; end if;
  select * into expense_row from public.expenses where id = expense_id for update;
  if not found then raise exception 'Expense not found'; end if;
  if expense_row.submitted_by = reviewer_id then raise exception 'You cannot review an expense you submitted'; end if;
  if not public.can_access_project(expense_row.project_id)
    or not public.has_organization_role(expense_row.organization_id, array['owner', 'admin', 'project_manager', 'finance']) then
    raise exception 'Not authorized to review this expense';
  end if;
  if expense_row.status <> 'submitted' then raise exception 'Only submitted expenses can be reviewed'; end if;
  update public.expenses
    set status = decision,
        reviewed_by = reviewer_id,
        reviewed_at = now(),
        review_note = trim(decision_note),
        updated_at = now()
    where id = expense_id;
end;
$$;

revoke all on function public.review_expense(uuid, text, text) from public;
grant execute on function public.review_expense(uuid, text, text) to authenticated;

create policy "Uploaders can remove their own project receipts"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'expense-receipts'
    and owner_id = (select auth.uid())::text
    and case
      when (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
      then public.can_access_project(((storage.foldername(name))[1])::uuid)
      else false
    end
  );
