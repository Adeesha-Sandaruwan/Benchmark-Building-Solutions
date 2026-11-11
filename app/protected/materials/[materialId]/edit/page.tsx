import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Boxes } from "lucide-react";
import { MaterialForm } from "@/components/material-form";
import { getMaterialCatalog } from "@/lib/data/materials";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function EditMaterialPage({ params }: { params: Promise<{ materialId: string }> }) {
  const { materialId } = await params;
  const organization = (await getOrganizationOptions())[0];
  if (!["owner", "admin", "project_manager", "supervisor"].includes(organization?.role ?? "")) redirect("/protected/materials");
  const { materials } = await getMaterialCatalog();
  const material = materials.find((record) => record.id === materialId);
  if (!material) notFound();
  return <div className="mx-auto max-w-3xl space-y-5"><Link href="/protected/materials" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Materials</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Boxes size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{material.material_code}</p><h1 className="mt-1 text-2xl font-semibold text-[#152d4b]">Edit catalog material</h1></div></div><MaterialForm material={material} /></section></div>;
}
