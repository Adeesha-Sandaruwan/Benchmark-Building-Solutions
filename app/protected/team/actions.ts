"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

const inviteRoles = ["admin", "project_manager", "supervisor", "finance", "worker", "viewer"];

export async function createTeamInviteAction(_state: { error: string | null; token: string | null }, formData: FormData): Promise<{ error: string | null; token: string | null }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const organizationId = String(formData.get("organization_id") ?? "");
  if (!inviteRoles.includes(role) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(organizationId)) return { error: "Choose a valid role and workspace.", token: null };
  if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) return { error: "Enter a valid email address or leave it blank." , token: null };
  const organization = (await getOrganizationOptions()).find((option) => option.id === organizationId);
  if (!organization || !["owner", "admin"].includes(organization.role)) return { error: "Only workspace owners and admins can invite members.", token: null };
  if (role === "admin" && organization.role !== "owner") return { error: "Only the owner can invite another admin.", token: null };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_organization_invite", { target_organization_id: organizationId, invited_role: role, invited_email: email || null });
  if (error || !data) return { error: "The invitation could not be created. Confirm the latest database migration is applied.", token: null };
  revalidatePath("/protected/team");
  return { error: null, token: data };
}

export async function acceptTeamInviteAction(_state: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const token = String(formData.get("invite_code") ?? "").replace(/\s/g, "");
  if (!/^[0-9a-f-]{72}$/i.test(token)) return { error: "Enter the full invitation code." };
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Sign in to accept your workspace invitation." };
  const { error } = await supabase.rpc("accept_organization_invite", { invite_token: token });
  if (error) return { error: error.message.includes("invited email") ? "Sign in using the email address this invitation was sent to." : "This invitation is invalid, expired, or already used." };
  revalidatePath("/protected", "layout");
  redirect("/protected");
}
