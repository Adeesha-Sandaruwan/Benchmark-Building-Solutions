import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { expenseStatuses, type ExpenseStatus } from "@/lib/domain";

export async function getExpenses(filters: { status?: string; q?: string } = {}) {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) return { organization: null, expenses: [], error: null };
  const supabase = await createClient();
  let query = supabase.from("expenses").select("*, projects!inner(id, code, name, currency)").eq("organization_id", organization.id).order("expense_date", { ascending: false }).limit(250);
  if (filters.status && expenseStatuses.includes(filters.status as ExpenseStatus)) query = query.eq("status", filters.status);
  const search = filters.q?.trim().replace(/[^a-zA-Z0-9\s@.+-]/g, "").slice(0, 80);
  if (search) query = query.or(`category.ilike.%${search}%,merchant.ilike.%${search}%,description.ilike.%${search}%`);
  const { data, error } = await query;
  if (error || !data) return { organization, expenses: [], error: "Expenses could not be loaded. Refresh and try again." };
  const expenses = await Promise.all(data.map(async (expense) => {
    if (!expense.receipt_path) return { ...expense, receipt_url: null };
    const { data: signed } = await supabase.storage.from("expense-receipts").createSignedUrl(expense.receipt_path, 600);
    return { ...expense, receipt_url: signed?.signedUrl ?? null };
  }));
  return { organization, expenses, error: null };
}
