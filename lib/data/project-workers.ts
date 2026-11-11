import { createClient } from "@/lib/supabase/server";

export async function getProjectWorkerAssignments(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("project_worker_assignments")
    .select("id, role_on_project, assigned_at, notes, workers!inner(id, worker_code, full_name, trade, employment_status, email, phone)")
    .eq("project_id", projectId)
    .is("removed_at", null)
    .order("assigned_at", { ascending: false });
  if (error) return { assignments: [], error: "Project team could not be loaded." };
  return { assignments: data ?? [], error: null };
}
