"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createWorkerAction, updateWorkerAction } from "@/app/protected/workers/actions";
import type { WorkerRecord } from "@/lib/domain";

const label = "block text-sm font-medium text-slate-700";
const control = "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";

export function WorkerForm({ worker }: { worker?: WorkerRecord }) {
  const [state, action, isPending] = useActionState(worker ? updateWorkerAction : createWorkerAction, { error: null });
  return <form action={action} className="space-y-6">{worker && <input type="hidden" name="worker_id" value={worker.id} />}<div className="grid gap-5 sm:grid-cols-2">
    <label className={label}>Full name<input name="full_name" required minLength={2} maxLength={160} defaultValue={worker?.full_name} placeholder="Worker name" className={control} /></label>
    <label className={label}>Worker code<input name="worker_code" required maxLength={24} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" defaultValue={worker?.worker_code} placeholder="WRK-001" className={control} /><span className="mt-1 block text-xs font-normal text-slate-500">Unique to your company.</span></label>
    <label className={label}>Trade or role<input name="trade" maxLength={120} defaultValue={worker?.trade} placeholder="Carpenter, electrician, site engineer…" className={control} /></label>
    <label className={label}>Employment status<select name="employment_status" defaultValue={worker?.employment_status ?? "active"} className={control}><option value="active">Active</option><option value="on_leave">On leave</option><option value="inactive">Inactive</option></select></label>
    <label className={label}>Email<input name="email" type="email" maxLength={254} autoComplete="email" defaultValue={worker?.email ?? ""} placeholder="worker@company.com" className={control} /></label>
    <label className={label}>Phone<input name="phone" type="tel" maxLength={40} autoComplete="tel" defaultValue={worker?.phone ?? ""} placeholder="Contact number" className={control} /></label>
    <label className={label}>Start date<input name="start_date" type="date" defaultValue={worker?.start_date ?? ""} className={control} /></label>
    <label className={`${label} sm:col-span-2`}>Work notes<textarea name="notes" maxLength={3000} rows={4} defaultValue={worker?.notes} placeholder="Relevant work information only. Avoid sensitive personal details." className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></label>
  </div>{state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{state.error}</p>}<div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Link href={worker ? `/protected/workers/${worker.id}` : "/protected/workers"} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link><button disabled={isPending} className="inline-flex h-11 items-center justify-center rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-70">{isPending ? "Saving…" : worker ? "Save changes" : "Add worker"}</button></div></form>;
}
