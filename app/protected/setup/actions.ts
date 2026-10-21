"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { slugifyOrganizationName } from "@/lib/data/organizations";

export async function createOrganizationAction(_previousState: { error: string | null }, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const slug = slugifyOrganizationName(name);
  if (name.length < 2 || name.length > 160 || !slug) {
    return { error: "Enter an organization name between 2 and 160 characters." };
  }

  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return { error: "Your session has expired. Sign in again to continue." };

  const { error } = await supabase.rpc("create_organization", {
    organization_name: name,
    organization_slug: slug,
  });
  if (error) {
    if (error.code === "23505") return { error: "An organization with a similar name already exists. Choose a more specific name." };
    return { error: "We couldn’t create the organization. Please try again." };
  }

  revalidatePath("/protected", "layout");
  redirect("/protected");
}
