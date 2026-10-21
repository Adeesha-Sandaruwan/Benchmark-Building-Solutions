import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { projectStatuses, type ProjectStatus } from "@/lib/domain";

export interface ProjectFilters {
  search?: string;
  status?: string;
}

export async function getProjects(filters: ProjectFilters = {}) {
  const organizations = await getOrganizationOptions();
  const organization = organizations[0];
  if (!organization) return { organization: null, projects: [] };

  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("*")
    .eq("organization_id", organization.id)
    .is("archived_at", null)
    .order("updated_at", { ascending: false });

  const search = filters.search?.trim().replace(/[%_]/g, "").slice(0, 80);
  if (search) query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,client_name.ilike.%${search}%`);
  if (filters.status && projectStatuses.includes(filters.status as ProjectStatus)) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;
  if (error) return { organization, projects: [], error: "Projects could not be loaded. Refresh the page and try again." };
  return { organization, projects: data ?? [], error: null };
}

export async function getProjectById(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .is("archived_at", null)
    .maybeSingle();
  if (error) return null;
  return data;
}
