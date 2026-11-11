import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ReceiptText } from "lucide-react";
import { ExpenseForm } from "@/components/expense-form";
import { getActiveProjectsForOrganization } from "@/lib/data/materials";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function NewExpensePage() {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) redirect("/protected/setup");
  if (!["owner", "admin", "project_manager", "supervisor", "finance", "worker"].includes(organization.role)) redirect("/protected/expenses");
  const projects = await getActiveProjectsForOrganization();
  return <div className="mx-auto max-w-4xl space-y-5"><Link href="/protected/expenses" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"><ArrowLeft size={16} /> Expenses</Link><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="mb-7 flex items-center gap-3 border-b border-slate-100 pb-5"><span className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><ReceiptText size={21} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">{organization.name}</p><h1 className="mt-1 text-2xl font-semibold text-[#152d4b]">Submit an expense</h1><p className="mt-1 text-sm text-slate-500">Record the cost and attach the receipt for review.</p></div></div>{!projects.length && <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Add an active project before submitting an expense. <Link href="/protected/projects" className="font-semibold underline">View projects</Link>.</div>}<ExpenseForm projects={projects} /></section></div>;
}
