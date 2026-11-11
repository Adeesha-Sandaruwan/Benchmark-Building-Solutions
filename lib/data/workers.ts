import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { workerStatuses, type WorkerStatus } from "@/lib/domain";

export async function getWorkers(filters: { q?: string; status?: string } = {}) {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) return { organization: null, workers: [], error: null };
  const supabase = await createClient();
  let query = supabase.from("workers").select("*").eq("organization_id", organization.id).is("archived_at", null).order("full_name");
  const search = filters.q?.trim().replace(/[^a-zA-Z0-9\s@.+-]/g, "").slice(0, 80);
  if (search) query = query.or(`full_name.ilike.%${search}%,worker_code.ilike.%${search}%,trade.ilike.%${search}%,email.ilike.%${search}%`);
  if (filters.status && workerStatuses.includes(filters.status as WorkerStatus)) query = query.eq("employment_status", filters.status);
  const { data, error } = await query;
  return { organization, workers: data ?? [], error: error ? "Workers could not be loaded. Refresh and try again." : null };
}

export async function getWorkerById(workerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("workers").select("*").eq("id", workerId).is("archived_at", null).maybeSingle();
  return error ? null : data;
}
