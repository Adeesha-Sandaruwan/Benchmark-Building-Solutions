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

export async function createMaterialRequestAction(_state: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const projectId = text(formData, "project_id");
  const materialId = text(formData, "material_id");
  const quantity = Number(text(formData, "quantity_requested"));
  const unitCostText = text(formData, "unit_cost");
  const unitCost = unitCostText ? Number(unitCostText) : null;
  const supplier = text(formData, "supplier");
  const neededBy = text(formData, "needed_by") || null;
  const notes = text(formData, "notes");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidPattern.test(projectId) || !uuidPattern.test(materialId)) return { error: "Choose a valid project and catalog material." };
  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 99999999999) return { error: "Enter a quantity greater than zero." };
  if (unitCost !== null && (!Number.isFinite(unitCost) || unitCost < 0 || unitCost > 999999999999)) return { error: "Enter a valid non-negative unit cost." };
  if (supplier.length > 180 || notes.length > 2000) return { error: "Supplier or notes are too long." };
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !["owner", "admin", "project_manager", "supervisor", "worker"].includes(organization.role)) return { error: "You don’t have permission to request materials." };
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Your session has expired. Sign in again." };
  const { error } = await supabase.from("project_materials").insert({ organization_id: organization.id, project_id: projectId, material_id: materialId, quantity_requested: quantity, unit_cost: unitCost, supplier: supplier || null, needed_by: neededBy, notes, requested_by: claims.claims.sub });
  if (error) return { error: "The material request could not be saved. Confirm your project access and try again." };
  revalidatePath("/protected/materials");
  revalidatePath(`/protected/projects/${projectId}`);
  redirect("/protected/materials/requests");
}
