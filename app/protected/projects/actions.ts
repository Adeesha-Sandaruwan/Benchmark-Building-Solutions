"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { projectStatuses } from "@/lib/domain";

export async function createProjectAction(_previousState: { error: string | null }, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim().toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 24);
  const status = String(formData.get("status") ?? "planning");
  const clientName = String(formData.get("client_name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const currency = String(formData.get("currency") ?? "USD").toUpperCase();
  const budgetText = String(formData.get("budget") ?? "").trim();
  const budget = budgetText ? Number(budgetText) : null;
  const startDate = String(formData.get("start_date") ?? "") || null;
  const targetEndDate = String(formData.get("target_end_date") ?? "") || null;

  if (name.length < 2 || name.length > 180) return { error: "Project name must be between 2 and 180 characters." };
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code)) return { error: "Enter a project code using letters, numbers, and hyphens." };
  if (!projectStatuses.includes(status as (typeof projectStatuses)[number])) return { error: "Choose a valid project status." };
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Enter a three-letter currency code, such as USD or LKR." };
  if (budget !== null && (!Number.isFinite(budget) || budget < 0 || budget > 999999999999)) return { error: "Enter a valid non-negative project budget." };
  if (startDate && targetEndDate && targetEndDate < startDate) return { error: "Target completion date must be on or after the start date." };

  const organizations = await getOrganizationOptions();
  const organization = organizations[0];
  if (!organization) return { error: "Create an organization workspace before adding projects." };
  if (!["owner", "admin", "project_manager"].includes(organization.role)) return { error: "You don’t have permission to create projects in this workspace." };

  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Your session has expired. Sign in again to continue." };
  const { error } = await supabase.from("projects").insert({
    organization_id: organization.id,
    code,
    name,
    client_name: clientName || null,
    location,
    description,
    status,
    currency,
    budget,
    start_date: startDate,
    target_end_date: targetEndDate,
    manager_id: claims.claims.sub,
    created_by: claims.claims.sub,
  });

  if (error?.code === "23505") return { error: "That project code is already used in this workspace." };
  if (error) return { error: "We couldn’t save the project. Check your access and try again." };
  revalidatePath("/protected", "layout");
  redirect("/protected/projects");
}
