import { Activity, ArrowUpRight, BriefcaseBusiness, CalendarDays, ClipboardList, HardHat, PackageCheck, Plus, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { redirect } from "next/navigation";
import Link from "next/link";

const metrics = [
  { icon: BriefcaseBusiness, label: "Active projects", value: "—", note: "Your assigned projects" },
  { icon: ClipboardList, label: "Open tasks", value: "—", note: "Across your projects" },
  { icon: PackageCheck, label: "Material requests", value: "—", note: "Awaiting an update" },
  { icon: Wallet, label: "Recorded expenses", value: "—", note: "Current project period" },
];

export default async function ProtectedPage() {
  const organizations = await getOrganizationOptions();
  if (organizations.length === 0) redirect("/protected/setup");
  const organization = organizations[0];
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name = typeof claims?.user_metadata?.full_name === "string" ? claims.user_metadata.full_name.trim().split(/\s+/)[0] : null;
  const firstName = name || (typeof claims?.email === "string" ? claims.email.split("@")[0] : "there");
  return <div className="space-y-8">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-medium text-amber-700">{organization.name} · Workspace overview</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#152d4b]">Good morning, {firstName}</h1><p className="mt-2 text-sm text-slate-500">Here’s what’s happening across your construction projects.</p></div><Link href="/protected/projects/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64]"><Plus size={16} /> New project</Link></div>
    <section aria-label="Workspace metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ icon: Icon, label, value, note }) => <article key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-medium text-slate-500">{label}</span><span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><Icon size={18} /></span></div><p className="mt-4 text-3xl font-semibold tracking-tight text-[#152d4b]">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>)}</section>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-[#152d4b]">Your projects</h2><p className="mt-1 text-xs text-slate-500">Projects you can access will appear here.</p></div><BriefcaseBusiness size={18} className="text-slate-400" /></div><div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"><span className="flex size-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400"><HardHat size={23} /></span><h3 className="mt-4 text-sm font-semibold text-slate-800">Your project list is ready</h3><p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">Projects will show here once your workspace has been connected to the project database.</p></div></section>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold text-[#152d4b]">Recent activity</h2><p className="mt-1 text-xs text-slate-500">Latest updates across your team.</p></div><Activity size={18} className="text-slate-400" /></div><div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center"><CalendarDays size={22} className="text-slate-300" /><h3 className="mt-3 text-sm font-semibold text-slate-800">Nothing to report yet</h3><p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">Updates from your projects will appear here as your team records progress.</p></div></section>
    </div>
    <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-8"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-800"><Activity size={18} /></span><div><h2 className="text-sm font-semibold text-[#152d4b]">Your workspace is set up</h2><p className="mt-1 text-sm leading-6 text-slate-600">Authentication is ready. Project, team, materials, expense, task, and progress data will connect in upcoming milestones.</p></div></div><ArrowUpRight size={18} className="mt-3 hidden shrink-0 text-amber-800 sm:mt-0 sm:block" /></section>
  </div>;
}
