import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";
import { ProjectForm } from "@/components/project-form";
import { getProjectById } from "@/lib/data/projects";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function EditProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const organizations = await getOrganizationOptions();
  if (!organizations[0] || !["owner", "admin", "project_manager"].includes(organizations[0].role)) redirect(`/protected/projects/${projectId}`);
  const project = await getProjectById(projectId);
  if (!project) notFound();
  return <div className="mx-auto max-w-4xl space-y-5"><Link href={`/protected/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Project details</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7 flex items-start gap-3 border-b border-slate-100 pb-5"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><BriefcaseBusiness size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{project.code}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#152d4b]">Edit project</h1><p className="mt-1 text-sm text-slate-500">Update project details and current status.</p></div></div><ProjectForm project={project} /></section></div>;
}
