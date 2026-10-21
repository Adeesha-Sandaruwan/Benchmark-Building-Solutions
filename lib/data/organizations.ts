import { createClient } from "@/lib/supabase/server";

export interface OrganizationOption {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export async function getOrganizationOptions(): Promise<OrganizationOption[]> {
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claims?.claims?.sub) return [];

  const { data, error } = await supabase
    .from("organization_memberships")
    .select("role, organizations!inner(id, name, slug)")
    .eq("user_id", claims.claims.sub)
    .eq("status", "active");

  if (error || !data) return [];
  return data.flatMap((membership) => {
    const organization = membership.organizations as unknown as { id: string; name: string; slug: string };
    return organization ? [{ ...organization, role: membership.role }] : [];
  });
}

export function slugifyOrganizationName(name: string): string {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
