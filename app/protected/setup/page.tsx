import Link from "next/link";
import { Building2 } from "lucide-react";
import { OrganizationSetupForm } from "@/components/organization-setup-form";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { redirect } from "next/navigation";

export default async function OrganizationSetupPage() {
  const organizations = await getOrganizationOptions();
  if (organizations.length > 0) redirect("/protected");
  return <div className="mx-auto max-w-2xl"><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><span className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Building2 size={23} /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Set up your workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Start with your organization</h1><p className="mt-3 text-sm leading-6 text-slate-500">Create your company workspace to organize projects, workers, materials, and expenses. Your signed-in account will be its owner.</p><OrganizationSetupForm /><p className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500">Have an invite code? <Link href="/protected/join" className="font-semibold text-amber-800 hover:underline">Join an existing workspace</Link></p></section></div>;
}
