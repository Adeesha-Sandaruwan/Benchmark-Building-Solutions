import { Activity, ArrowUpRight, BriefcaseBusiness, Boxes, CalendarDays, Plus, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProtectedPage() {
  const organizations = await getOrganizationOptions();
  if (organizations.length === 0) redirect("/protected/setup");
  const organization = organizations[0];
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name = typeof claims?.user_metadata?.full_name === "string" ? claims.user_metadata.full_name.trim().split(/\s+/)[0] : null;
  const firstName = name || (typeof claims?.email === "string" ? claims.email.split("@")[0] : "there");
  const [projectsResult, workersResult, materialsResult, expensesResult] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "active").is("archived_at", null),
    supabase.from("workers").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("employment_status", "active").is("archived_at", null),
    supabase.from("project_materials").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).in("status", ["requested", "approved", "ordered", "partially_received"]),
    supabase.from("expenses").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "submitted"),
  ]);
  const metrics = [
    { icon: BriefcaseBusiness, label: "Active projects", value: projectsResult.count ?? 0, note: "Not archived" },
    { icon: Users, label: "Active workers", value: workersResult.count ?? 0, note: "In your directory" },
    { icon: Boxes, label: "Open material requests", value: materialsResult.count ?? 0, note: "Awaiting delivery" },
    { icon: Wallet, label: "Expenses to review", value: expensesResult.count ?? 0, note: "Awaiting approval" },
  ];
  return <div className="space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-amber-700">{organization.name} · Workspace overview</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#152d4b]">Good morning, {firstName}</h1><p className="mt-2 text-sm text-slate-500">Here’s what’s happening across your construction projects.</p></div><Link href="/protected/projects/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64]"><Plus size={16} /> New project</Link></div>
    <section aria-label="Workspace metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ icon: Icon, label, value, note }) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><Icon size={18} /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-[#152d4b]">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>)}</section>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-[#152d4b]">Project portfolio</h2><p className="mt-1 text-xs text-slate-500">Go directly to your project register.</p></div><BriefcaseBusiness size={18} className="text-slate-400" /></div><div className="grid gap-3 p-5 sm:grid-cols-2">{[["Projects", "/protected/projects", BriefcaseBusiness], ["Workers", "/protected/workers", Users], ["Materials", "/protected/materials", Boxes], ["Expenses", "/protected/expenses", Wallet]].map(([label, href, Icon]) => { const ItemIcon = Icon as typeof BriefcaseBusiness; return <Link key={String(href)} href={String(href)} className="group flex min-h-20 items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-amber-300 hover:bg-amber-50/50"><span className="flex size-10 items-center justify-center rounded-lg bg-slate-50 text-[#152d4b] group-hover:bg-white"><ItemIcon size={19} /></span><span className="text-sm font-semibold text-slate-800">{String(label)}</span><ArrowUpRight size={16} className="ml-auto text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>; })}</div></section>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-[#152d4b]">Workspace focus</h2><p className="mt-1 text-xs text-slate-500">Your next operational steps.</p></div><Activity size={18} className="text-slate-400" /></div><div className="space-y-4 p-5"><p className="text-sm leading-6 text-slate-600">Keep project records, team assignments, procurement, and costs organized from their dedicated modules.</p><Link href="/protected/projects/new" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64]"><Plus size={16} /> Create a project</Link><p className="flex items-start gap-2 text-xs leading-5 text-slate-400"><CalendarDays size={15} className="mt-0.5 shrink-0" /> Project task and progress reporting is maintained by the project team’s separate workstream.</p></div></section>
    </div>
    <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-800"><Activity size={18} /></span><div><h2 className="text-sm font-semibold text-[#152d4b]">Construction workspace</h2><p className="mt-1 text-sm leading-6 text-slate-600">Projects, workforce, procurement, and expenses are connected here. Tasks and progress reporting are being developed in the team’s separate workstream.</p></div></div><ArrowUpRight size={18} className="mt-3 hidden shrink-0 text-amber-800 sm:mt-0 sm:block" /></section>
  </div>;
}
