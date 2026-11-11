import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, HardHat } from "lucide-react";
import { WorkerForm } from "@/components/worker-form";
import { getWorkerById } from "@/lib/data/workers";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function EditWorkerPage({ params }: { params: Promise<{ workerId: string }> }) {
  const { workerId } = await params;
  const organizations = await getOrganizationOptions();
  if (!["owner", "admin", "project_manager", "supervisor"].includes(organizations[0]?.role ?? "")) redirect(`/protected/workers/${workerId}`);
  const worker = await getWorkerById(workerId);
  if (!worker) notFound();
  return <div className="mx-auto max-w-4xl space-y-5"><Link href={`/protected/workers/${workerId}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Worker profile</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7 flex items-start gap-3 border-b border-slate-100 pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><HardHat size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{worker.worker_code}</p><h1 className="mt-1 text-2xl font-semibold text-[#152d4b]">Edit worker profile</h1><p className="mt-1 text-sm text-slate-500">Keep contact and employment details up to date.</p></div></div><WorkerForm worker={worker} /></section></div>;
}
