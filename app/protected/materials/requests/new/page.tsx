import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";
import { MaterialRequestForm } from "@/components/material-request-form";
import { getActiveProjectsForOrganization, getMaterialCatalog } from "@/lib/data/materials";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function NewMaterialRequestPage() {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) redirect("/protected/setup");
  if (!["owner", "admin", "project_manager", "supervisor", "worker"].includes(organization.role)) redirect("/protected/materials/requests");
  const [projects, catalog] = await Promise.all([getActiveProjectsForOrganization(), getMaterialCatalog()]);
  return <div className="mx-auto max-w-4xl space-y-5"><Link href="/protected/materials/requests" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Material requests</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><ClipboardList size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{organization.name}</p><h1 className="mt-1 text-2xl font-semibold text-[#152d4b]">Request materials</h1><p className="mt-1 text-sm text-slate-500">Select the project and item, then estimate quantity and delivery needs.</p></div></div>{(!projects.length || !catalog.materials.length) && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">You need at least one active project and one catalog material before submitting a request. <Link href={!catalog.materials.length ? "/protected/materials/new" : "/protected/projects"} className="font-semibold underline">Add the missing record</Link>.</div>}<MaterialRequestForm projects={projects} materials={catalog.materials} /></section></div>;
}
