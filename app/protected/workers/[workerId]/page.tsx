import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, HardHat, Mail, Phone, Pencil, UserRound } from "lucide-react";
import { getWorkerById } from "@/lib/data/workers";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { ArchiveWorkerButton } from "@/components/archive-worker-button";

export default async function WorkerDetailsPage({ params }: { params: Promise<{ workerId: string }> }) {
  const { workerId } = await params;
  const [worker, organizations] = await Promise.all([getWorkerById(workerId), getOrganizationOptions()]);
  if (!worker) notFound();
  const canManage = ["owner", "admin", "project_manager", "supervisor"].includes(organizations[0]?.role ?? "");
  return <div className="mx-auto max-w-4xl space-y-5"><Link href="/protected/workers" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Workers</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div className="flex items-center gap-4"><span className="flex size-14 items-center justify-center rounded-2xl bg-[#152d4b] text-amber-300"><HardHat size={25} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{worker.worker_code}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#152d4b]">{worker.full_name}</h1><p className="mt-1 text-sm text-slate-500">{worker.trade || "Trade not specified"}</p></div></div>{canManage && <div className="flex flex-wrap gap-2"><Link href={`/protected/workers/${workerId}/edit`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"><Pencil size={15} /> Edit profile</Link><ArchiveWorkerButton workerId={workerId} /></div>}</div><div className="mt-8 grid gap-3 border-t border-slate-100 pt-6 sm:grid-cols-2"><Info icon={Mail} label="Email" value={worker.email || "Not provided"} /><Info icon={Phone} label="Phone" value={worker.phone || "Not provided"} /><Info icon={UserRound} label="Employment status" value={{ active: "Active", on_leave: "On leave", inactive: "Inactive" }[worker.employment_status as "active" | "on_leave" | "inactive"]} /><Info icon={CalendarDays} label="Start date" value={worker.start_date ? new Date(`${worker.start_date}T00:00:00`).toLocaleDateString() : "Not set"} /></div>{worker.notes && <div className="mt-6 rounded-xl bg-slate-50 p-4"><h2 className="text-sm font-semibold text-slate-800">Work notes</h2><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{worker.notes}</p></div>}</section></div>;
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="flex items-center gap-2 text-xs font-medium text-slate-500"><Icon size={14} />{label}</p><p className="mt-2 break-words text-sm font-semibold text-slate-800">{value}</p></div>;
}
