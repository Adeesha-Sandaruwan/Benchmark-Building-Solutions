"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createMaterialAction, updateMaterialAction } from "@/app/protected/materials/actions";
import type { MaterialRecord } from "@/lib/domain";

const label = "block text-sm font-medium text-slate-700";
const input = "mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10";

export function MaterialForm({ material }: { material?: MaterialRecord }) {
  const [state, action, pending] = useActionState(material ? updateMaterialAction : createMaterialAction, { error: null });
  return <form action={action} className="space-y-6">{material && <input type="hidden" name="material_id" value={material.id} />}<div className="grid gap-5 sm:grid-cols-2"><label className={label}>Material name<input name="name" required minLength={2} maxLength={180} defaultValue={material?.name} placeholder="Ready-mix concrete" className={input} /></label><label className={label}>Material code<input name="material_code" required maxLength={30} pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" defaultValue={material?.material_code} placeholder="CONC-40MPA" className={input} /></label><label className={label}>Category<input name="category" maxLength={100} defaultValue={material?.category} placeholder="Concrete, timber, electrical…" className={input} /></label><label className={label}>Unit<input name="unit" required maxLength={32} defaultValue={material?.unit ?? "unit"} placeholder="m³, bag, length" className={input} /></label><label className={`${label} sm:col-span-2`}>Default supplier<input name="default_supplier" maxLength={180} defaultValue={material?.default_supplier ?? ""} placeholder="Supplier name (optional)" className={input} /></label></div>{state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{state.error}</p>}<div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><Link href="/protected/materials" className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</Link><button disabled={pending} className="h-11 rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-60">{pending ? "Saving…" : material ? "Save changes" : "Add material"}</button></div></form>;
}
