import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, UserRoundPlus } from "lucide-react";
import { WorkerForm } from "@/components/worker-form";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function NewWorkerPage() {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) redirect("/protected/setup");
  if (!["owner", "admin", "project_manager", "supervisor"].includes(organization.role)) redirect("/protected/workers");
  return <div className="mx-auto max-w-4xl space-y-5"><Link href="/protected/workers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Workers</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7 flex items-start gap-3 border-b border-slate-100 pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><UserRoundPlus size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{organization.name}</p><h1 className="mt-1 text-2xl font-semibold text-[#152d4b]">Add a worker</h1><p className="mt-1 text-sm text-slate-500">Create a directory profile for someone on your workforce.</p></div></div><WorkerForm /></section></div>;
}
