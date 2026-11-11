import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { materialRequestStatuses, type MaterialRequestStatus } from "@/lib/domain";

export async function getMaterialCatalog(filters: { q?: string } = {}) {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) return { organization: null, materials: [], error: null };
  const supabase = await createClient();
  let query = supabase.from("materials").select("*").eq("organization_id", organization.id).is("archived_at", null).order("name");
  const search = filters.q?.trim().replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 80);
  if (search) query = query.or(`name.ilike.%${search}%,material_code.ilike.%${search}%,category.ilike.%${search}%`);
  const { data, error } = await query;
  return { organization, materials: data ?? [], error: error ? "Materials could not be loaded. Refresh and try again." : null };
}

export async function getMaterialRequests(filters: { status?: string; projectId?: string } = {}) {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) return { organization: null, requests: [], error: null };
  const supabase = await createClient();
  let query = supabase.from("project_materials").select("*, materials!inner(material_code, name, unit), projects!inner(code, name)").eq("organization_id", organization.id).order("created_at", { ascending: false }).limit(250);
  if (filters.status && materialRequestStatuses.includes(filters.status as MaterialRequestStatus)) query = query.eq("status", filters.status);
  if (filters.projectId) query = query.eq("project_id", filters.projectId);
  const { data, error } = await query;
  return { organization, requests: data ?? [], error: error ? "Material requests could not be loaded. Refresh and try again." : null };
}

export async function getActiveProjectsForOrganization() {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("id, code, name, currency").eq("organization_id", organization.id).eq("status", "active").is("archived_at", null).order("name");
  return data ?? [];
}
