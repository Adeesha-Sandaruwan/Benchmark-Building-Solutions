"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

const purchasingRoles = ["owner", "admin", "project_manager", "supervisor"];
function text(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }

export async function createMaterialAction(_state: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const code = text(formData, "material_code").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
  const name = text(formData, "name");
  const category = text(formData, "category");
  const unit = text(formData, "unit").toLowerCase();
  const supplier = text(formData, "default_supplier");
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code)) return { error: "Enter a material code using letters, numbers, and hyphens." };
  if (name.length < 2 || name.length > 180) return { error: "Material name must be between 2 and 180 characters." };
  if (category.length > 100 || unit.length < 1 || unit.length > 32 || supplier.length > 180) return { error: "Check category, unit, and supplier values." };
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !purchasingRoles.includes(organization.role)) return { error: "You don’t have permission to manage the materials catalog." };
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Your session has expired. Sign in again." };
  const { error } = await supabase.from("materials").insert({ organization_id: organization.id, material_code: code, name, category, unit, default_supplier: supplier || null, created_by: claims.claims.sub });
  if (error?.code === "23505") return { error: "That material code is already in the catalog." };
  if (error) return { error: "The material could not be saved. Check your access and try again." };
  revalidatePath("/protected/materials");
  redirect("/protected/materials");
}

export async function updateMaterialAction(_state: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const id = text(formData, "material_id");
  const code = text(formData, "material_code").toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 30);
  const name = text(formData, "name");
  const category = text(formData, "category");
  const unit = text(formData, "unit").toLowerCase();
  const supplier = text(formData, "default_supplier");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return { error: "Material not found." };
  if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(code) || name.length < 2 || name.length > 180 || unit.length < 1 || unit.length > 32) return { error: "Check the material code, name, and unit." };
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !purchasingRoles.includes(organization.role)) return { error: "You don’t have permission to edit catalog materials." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("materials").update({ material_code: code, name, category, unit, default_supplier: supplier || null, updated_at: new Date().toISOString() }).eq("id", id).eq("organization_id", organization.id).is("archived_at", null).select("id").maybeSingle();
  if (error?.code === "23505") return { error: "That material code is already in the catalog." };
  if (error || !data) return { error: "The material could not be updated." };
  revalidatePath("/protected/materials");
  redirect("/protected/materials");
}
