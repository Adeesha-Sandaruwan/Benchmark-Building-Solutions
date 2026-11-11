"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { workerStatuses, type WorkerStatus } from "@/lib/domain";

const managerRoles = ["owner", "admin", "project_manager", "supervisor"];
function field(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }

async function getManagerContext() {
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !managerRoles.includes(organization.role)) return { error: "You don’t have permission to manage the workforce." as const };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return { error: "Your session has expired. Sign in again to continue." as const };
  return { organization, userId: data.claims.sub, supabase };
}

function validateWorker(formData: FormData) {
  const workerCode = field(formData, "worker_code").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
  const fullName = field(formData, "full_name");
  const email = field(formData, "email").toLowerCase();
  const phone = field(formData, "phone");
  const trade = field(formData, "trade");
  const employmentStatus = field(formData, "employment_status") || "active";
  const startDate = field(formData, "start_date") || null;
  const notes = field(formData, "notes");
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(workerCode)) return { error: "Enter a worker code using letters, numbers, and hyphens." as const };
  if (fullName.length < 2 || fullName.length > 160) return { error: "Name must be between 2 and 160 characters." as const };
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) return { error: "Enter a valid email address." as const };
  if (phone.length > 40 || trade.length > 120 || notes.length > 3000) return { error: "One or more fields exceed their maximum length." as const };
  if (!workerStatuses.includes(employmentStatus as WorkerStatus)) return { error: "Choose a valid employment status." as const };
  return { value: { worker_code: workerCode, full_name: fullName, email: email || null, phone: phone || null, trade, employment_status: employmentStatus, start_date: startDate, notes } };
}

export async function createWorkerAction(_previousState: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const validation = validateWorker(formData);
  if (validation.error) return { error: validation.error };
  const context = await getManagerContext();
  if (context.error) return { error: context.error };
  const { error } = await context.supabase.from("workers").insert({ ...validation.value, organization_id: context.organization.id, created_by: context.userId });
  if (error?.code === "23505") return { error: "That worker code is already in use." };
  if (error) return { error: "We couldn’t save this worker. Check the details and try again." };
  revalidatePath("/protected/workers");
  redirect("/protected/workers");
}

export async function updateWorkerAction(_previousState: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const workerId = field(formData, "worker_id");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workerId)) return { error: "Worker not found." };
  const validation = validateWorker(formData);
  if (validation.error) return { error: validation.error };
  const context = await getManagerContext();
  if (context.error) return { error: context.error };
  const { data, error } = await context.supabase.from("workers").update({ ...validation.value, updated_at: new Date().toISOString() }).eq("id", workerId).eq("organization_id", context.organization.id).select("id").maybeSingle();
  if (error?.code === "23505") return { error: "That worker code is already in use." };
  if (error || !data) return { error: "We couldn’t update this worker. Check your access and try again." };
  revalidatePath("/protected/workers");
  redirect(`/protected/workers/${workerId}`);
}

export async function archiveWorkerAction(workerId: string): Promise<{ error: string | null }> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(workerId)) return { error: "Worker not found." };
  const context = await getManagerContext();
  if (context.error) return { error: context.error };
  const { data, error } = await context.supabase.from("workers").update({ archived_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", workerId).eq("organization_id", context.organization.id).is("archived_at", null).select("id").maybeSingle();
  if (error || !data) return { error: "The worker could not be archived. Refresh and try again." };
  revalidatePath("/protected/workers");
  redirect("/protected/workers");
}
