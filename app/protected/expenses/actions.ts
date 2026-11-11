"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

const submitRoles = ["owner", "admin", "project_manager", "supervisor", "finance", "worker"];
const reviewRoles = ["owner", "admin", "project_manager", "finance"];
const receiptTypes = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const maxReceiptSize = 8 * 1024 * 1024;
function value(data: FormData, key: string) { return String(data.get(key) ?? "").trim(); }

export async function createExpenseAction(_state: { error: string | null }, formData: FormData): Promise<{ error: string | null }> {
  const projectId = value(formData, "project_id");
  const category = value(formData, "category");
  const merchant = value(formData, "merchant");
  const description = value(formData, "description");
  const amount = Number(value(formData, "amount"));
  const currency = value(formData, "currency").toUpperCase();
  const expenseDate = value(formData, "expense_date");
  const receipt = formData.get("receipt");
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(projectId)) return { error: "Choose a valid project." };
  if (!category || category.length > 80 || description.length < 2 || description.length > 2000 || merchant.length > 180) return { error: "Check the expense category, description, and merchant fields." };
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999999.99) return { error: "Enter an amount greater than zero." };
  if (!/^[A-Z]{3}$/.test(currency)) return { error: "Choose a valid currency." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(expenseDate) || Number.isNaN(Date.parse(`${expenseDate}T00:00:00`))) return { error: "Choose a valid expense date." };
  const file = receipt instanceof File && receipt.size > 0 ? receipt : null;
  if (file && (!receiptTypes.has(file.type) || file.size > maxReceiptSize)) return { error: "Receipt must be a JPG, PNG, WebP, or PDF smaller than 8 MB." };

  const organization = (await getOrganizationOptions())[0];
  if (!organization || !submitRoles.includes(organization.role)) return { error: "You don’t have permission to submit expenses." };
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Your session has expired. Sign in again." };
  const { data: project, error: projectError } = await supabase.from("projects").select("id, organization_id").eq("id", projectId).eq("organization_id", organization.id).is("archived_at", null).maybeSingle();
  if (projectError || !project) return { error: "You don’t have access to the selected project." };

  const expenseId = crypto.randomUUID();
  let receiptPath: string | null = null;
  if (file) {
    const extension = file.type === "application/pdf" ? "pdf" : file.type.split("/")[1].replace("jpeg", "jpg");
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-90) || `receipt.${extension}`;
    receiptPath = `${projectId}/${expenseId}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from("expense-receipts").upload(receiptPath, file, { contentType: file.type, upsert: false });
    if (uploadError) return { error: "Receipt upload failed. Check the file type and size, then try again." };
  }

  const { error } = await supabase.from("expenses").insert({ id: expenseId, organization_id: organization.id, project_id: projectId, category, merchant: merchant || "", description, amount, currency, expense_date: expenseDate, receipt_path: receiptPath, submitted_by: claims.claims.sub });
  if (error) {
    if (receiptPath) await supabase.storage.from("expense-receipts").remove([receiptPath]);
    return { error: "Expense submission failed. Confirm the project and account permissions and try again." };
  }
  revalidatePath("/protected/expenses");
  revalidatePath("/protected");
  redirect("/protected/expenses");
}

export async function reviewExpenseAction(_state: { error: string | null; success: string | null }, formData: FormData): Promise<{ error: string | null; success: string | null }> {
  const expenseId = value(formData, "expense_id");
  const decision = value(formData, "decision");
  const note = value(formData, "review_note");
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(expenseId) || !["approved", "rejected"].includes(decision) || note.length > 1000) return { error: "Invalid expense review action.", success: null };
  const organization = (await getOrganizationOptions())[0];
  if (!organization || !reviewRoles.includes(organization.role)) return { error: "You don’t have permission to review expenses." , success: null };
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_expense", { expense_id: expenseId, decision, decision_note: note });
  if (error) return { error: "This expense could not be reviewed. It may already have been decided or may be your own submission.", success: null };
  revalidatePath("/protected/expenses");
  revalidatePath("/protected");
  return { error: null, success: decision === "approved" ? "Expense approved." : "Expense rejected." };
}
