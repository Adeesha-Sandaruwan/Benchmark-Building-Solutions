"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProjectAction, updateProjectAction } from "@/app/protected/projects/actions";
import { projectStatuses, projectStatusLabels, type ProjectSummary } from "@/lib/domain";

const inputClass = "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";
const labelClass = "block text-sm font-medium text-slate-700";

export function ProjectForm({ project }: { project?: ProjectSummary }) {
  const [state, action, isPending] = useActionState(project ? updateProjectAction : createProjectAction, { error: null });
  return <form action={action} className="space-y-6">
    {project && <input type="hidden" name="project_id" value={project.id} />}
    <section className="grid gap-5 sm:grid-cols-2">
      <label className={labelClass}>Project name<input name="name" required minLength={2} maxLength={180} defaultValue={project?.name} placeholder="North Ridge Residence" className={inputClass} /></label>
      <label className={labelClass}>Project code<input name="code" required maxLength={24} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" defaultValue={project?.code} placeholder="NRR-2026" className={inputClass} /><span className="mt-1 block text-xs font-normal text-slate-500">Letters, numbers, and hyphens; unique within your company.</span></label>
      <label className={labelClass}>Client<input name="client_name" maxLength={160} defaultValue={project?.client_name ?? ""} placeholder="Client or organization" className={inputClass} /></label>
      <label className={labelClass}>Location<input name="location" maxLength={240} defaultValue={project?.location} placeholder="Project address or area" className={inputClass} /></label>
      <label className={labelClass}>Status<select name="status" defaultValue={project?.status ?? "planning"} className={inputClass}>{projectStatuses.map((status) => <option key={status} value={status}>{projectStatusLabels[status]}</option>)}</select></label>
      <label className={labelClass}>Budget<input name="budget" type="number" min="0" max="999999999999" step="0.01" defaultValue={project?.budget ?? ""} placeholder="0.00" className={inputClass} /></label>
      <label className={labelClass}>Currency<select name="currency" defaultValue={project?.currency ?? "LKR"} className={inputClass}><option value="LKR">LKR · Sri Lankan Rupee</option><option value="USD">USD · US Dollar</option><option value="INR">INR · Indian Rupee</option><option value="GBP">GBP · British Pound</option><option value="EUR">EUR · Euro</option></select></label>
      <label className={labelClass}>Start date<input name="start_date" type="date" defaultValue={project?.start_date ?? ""} className={inputClass} /></label>
      <label className={labelClass}>Target completion date<input name="target_end_date" type="date" defaultValue={project?.target_end_date ?? ""} className={inputClass} /></label>
      <label className={`${labelClass} sm:col-span-2`}>Project description<textarea name="description" maxLength={4000} rows={4} defaultValue={project?.description} placeholder="Scope, goals, and important context for the team" className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></label>
    </section>
    {state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{state.error}</p>}
    <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Link href={project ? `/protected/projects/${project.id}` : "/protected/projects"} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link><button type="submit" disabled={isPending} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-70">{isPending ? "Saving project…" : project ? "Save changes" : "Create project"}</button></div>
  </form>;
}
