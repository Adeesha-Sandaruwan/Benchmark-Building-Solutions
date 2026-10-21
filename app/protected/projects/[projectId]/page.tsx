import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CircleDollarSign, MapPin, UserRound } from "lucide-react";
import { getProjectById } from "@/lib/data/projects";
import { projectStatusLabels } from "@/lib/domain";

const statusStyles: Record<string, string> = {
  planning: "bg-slate-100 text-slate-700",
  active: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-800",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

function displayDate(value: string | null) {
  return value ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "Not set";
}

export default async function ProjectDetailsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();
  return <div className="mx-auto max-w-5xl space-y-5"><Link href="/protected/projects" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Projects</Link>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{project.code}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#152d4b]">{project.name}</h1><p className="mt-2 text-sm text-slate-500">{project.client_name || "Client not specified"}</p></div><span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[project.status]}`}>{projectStatusLabels[project.status as keyof typeof projectStatusLabels]}</span></div>
      {project.description && <p className="mt-6 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">{project.description}</p>}
      <div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-4"><Info icon={MapPin} label="Location" value={project.location || "Not set"} /><Info icon={CalendarDays} label="Start date" value={displayDate(project.start_date)} /><Info icon={CalendarDays} label="Target completion" value={displayDate(project.target_end_date)} /><Info icon={CircleDollarSign} label="Budget" value={project.budget == null ? "Not set" : `${project.currency} ${Number(project.budget).toLocaleString()}`} /></div>
    </section>
    <section className="grid gap-4 md:grid-cols-2"><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-[#152d4b]"><UserRound size={18} /><h2 className="font-semibold">Project team</h2></div><p className="mt-3 text-sm leading-6 text-slate-500">Team member assignments will be managed through the Workers module as it is built.</p></article><article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 text-[#152d4b]"><CircleDollarSign size={18} /><h2 className="font-semibold">Materials and expenses</h2></div><p className="mt-3 text-sm leading-6 text-slate-500">Project materials and expenses will appear here as those modules are added.</p></article></section>
  </div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-3.5"><p className="flex items-center gap-2 text-xs font-medium text-slate-500"><Icon size={14} />{label}</p><p className="mt-2 break-words text-sm font-semibold text-slate-800">{value}</p></div>;
}
