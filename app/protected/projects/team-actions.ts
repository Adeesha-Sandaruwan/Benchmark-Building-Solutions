"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

const managerRoles = ["owner", "admin", "project_manager", "supervisor"];
function validUuid(value: string) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value); }

export async function assignWorkerAction(_state: { error: string | null; success: string | null }, formData: FormData): Promise<{ error: string | null; success: string | null }> {
  const projectId = String(formData.get("project_id") ?? "");
  const workerId = String(formData.get("worker_id") ?? "");
  const role = String(formData.get("role_on_project") ?? "").trim().slice(0, 120);
  if (!validUuid(projectId) || !validUuid(workerId)) return { error: "Select a valid project and worker.", success: null };
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !managerRoles.includes(organization.role)) return { error: "You don’t have permission to assign workers.", success: null };
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Your session has expired. Sign in again.", success: null };
  const { error } = await supabase.from("project_worker_assignments").insert({ organization_id: organization.id, project_id: projectId, worker_id: workerId, role_on_project: role, assigned_by: claims.claims.sub });
  if (error?.code === "23505") return { error: "This worker is already assigned to the project.", success: null };
  if (error) return { error: "The assignment could not be saved. Check project access and try again.", success: null };
  revalidatePath(`/protected/projects/${projectId}`);
  revalidatePath("/protected/workers");
  return { error: null, success: "Worker assigned to this project." };
}

export async function endWorkerAssignmentAction(_state: { error: string | null; success: string | null }, formData: FormData): Promise<{ error: string | null; success: string | null }> {
  const projectId = String(formData.get("project_id") ?? "");
  const assignmentId = String(formData.get("assignment_id") ?? "");
  if (!validUuid(projectId) || !validUuid(assignmentId)) return { error: "Assignment not found.", success: null };
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !managerRoles.includes(organization.role)) return { error: "You don’t have permission to change project assignments.", success: null };
  const supabase = await createClient();
  const { data, error } = await supabase.from("project_worker_assignments").update({ removed_at: new Date().toISOString() }).eq("id", assignmentId).eq("project_id", projectId).eq("organization_id", organization.id).is("removed_at", null).select("id").maybeSingle();
  if (error || !data) return { error: "The assignment could not be ended. Refresh and try again.", success: null };
  revalidatePath(`/protected/projects/${projectId}`);
  return { error: null, success: "Worker removed from the active project team. Assignment history is retained." };
}
