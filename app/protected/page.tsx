import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Boxes,
  BriefcaseBusiness,
  ClipboardList,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { DashboardConstructionCarousel } from "@/components/dashboard-construction-carousel";
import { PresentationDataLoader } from "@/components/presentation-data-loader";

export default async function ProtectedPage() {
  const organizations = await getOrganizationOptions();
  if (organizations.length === 0) redirect("/protected/setup");
  const organization = organizations[0];
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const name = typeof claims?.user_metadata?.full_name === "string" ? claims.user_metadata.full_name.trim().split(/\s+/)[0] : null;
  const firstName = name || (typeof claims?.email === "string" ? claims.email.split("@")[0] : "there");
  const [projectsResult, workersResult, materialsResult, expensesResult, tasksResult, reportsResult] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "active").is("archived_at", null),
    supabase.from("workers").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("employment_status", "active").is("archived_at", null),
    supabase.from("project_materials").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).in("status", ["requested", "approved", "ordered", "partially_received"]),
    supabase.from("expenses").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).eq("status", "submitted"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).is("archived_at", null),
    supabase.from("progress_reports").select("id", { count: "exact", head: true }).eq("organization_id", organization.id).is("archived_at", null),
  ]);
  const metrics = [
    { icon: BriefcaseBusiness, label: "Active projects", value: projectsResult.count ?? 0, detail: "Open project portfolio", href: "/protected/projects", tone: "green" },
    { icon: UsersRound, label: "Active workers", value: workersResult.count ?? 0, detail: "People in your directory", href: "/protected/workers", tone: "blue" },
    { icon: Boxes, label: "Material requests", value: materialsResult.count ?? 0, detail: "Moving through procurement", href: "/protected/materials/requests", tone: "amber" },
    { icon: WalletCards, label: "Expenses to review", value: expensesResult.count ?? 0, detail: "Awaiting a decision", href: "/protected/expenses", tone: "violet" },
  ];
  const shortcuts = [
    { icon: BriefcaseBusiness, title: "Project portfolio", copy: "Create, review, and organize project details.", href: "/protected/projects", tag: "Projects" },
    { icon: UsersRound, title: "Workforce", copy: "Maintain worker records and team assignments.", href: "/protected/workers", tag: "People" },
    { icon: Boxes, title: "Materials", copy: "Manage catalog items and project requests.", href: "/protected/materials", tag: "Procurement" },
    { icon: WalletCards, title: "Expenses", copy: "Submit costs, review receipts, and approvals.", href: "/protected/expenses", tag: "Finance" },
  ];

  return <div className="space-y-8 sm:space-y-10">
    <DashboardConstructionCarousel organizationName={organization.name} firstName={firstName} />

    {["owner", "admin"].includes(organization.role) && <PresentationDataLoader />}

    <section aria-label="Workspace metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(({ icon: Icon, label, value, detail, href, tone }, index) => <Link key={label} href={href} className={`metric-card metric-${tone} group rounded-[20px] border border-slate-200/80 bg-white p-5 shadow-[0_8px_28px_-24px_rgba(18,39,40,.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_-27px_rgba(18,39,40,.45)]`} style={{ animationDelay: `${index * 90}ms` }}><div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold text-slate-500">{label}</span><span className="metric-icon flex size-10 items-center justify-center rounded-[14px] transition duration-300 group-hover:rotate-[-7deg] group-hover:scale-105"><Icon size={18} strokeWidth={1.9} /></span></div><div className="mt-4 flex items-end justify-between"><span className="text-4xl font-semibold tracking-[-.06em] text-[#19272b]">{value.toLocaleString()}</span><ArrowUpRight size={17} className="mb-1 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#315e4e]" /></div><p className="mt-1 text-[10px] text-slate-400">{detail}</p></Link>)}</section>

    <section aria-labelledby="quick-access-title"><div className="mb-5 flex items-end justify-between gap-4"><div><p className="section-eyebrow">Your operations</p><h2 id="quick-access-title" className="mt-2 text-2xl font-semibold tracking-tight text-[#19272b] sm:text-3xl">Pick up where work happens</h2></div><Link href="/protected/projects" className="hidden items-center gap-2 text-xs font-bold text-[#315e4e] transition hover:gap-3 sm:inline-flex">View all projects <ArrowRight size={14} /></Link></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{shortcuts.map(({ icon: Icon, title, copy, href, tag }, index) => <Link href={href} key={title} className="shortcut-card group relative overflow-hidden rounded-[22px] border border-slate-200/80 bg-white p-5 transition duration-500 hover:-translate-y-1 hover:border-[#c5d4ca] hover:shadow-[0_22px_55px_-34px_rgba(18,45,39,.55)] sm:p-6" style={{ animationDelay: `${index * 100}ms` }}><div className="flex items-center justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#315e4e] transition duration-300 group-hover:rotate-[-6deg] group-hover:bg-[#e9ad47] group-hover:text-[#19272b]"><Icon size={21} /></span><span className="rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.13em] text-slate-400">{tag}</span></div><h3 className="mt-7 text-lg font-semibold tracking-tight text-[#19272b]">{title}</h3><p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{copy}</p><span className="mt-5 inline-flex items-center gap-2 text-[11px] font-bold text-[#315e4e]">Open module <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></span><span className="shortcut-watermark" aria-hidden="true"><Icon size={94} strokeWidth={0.8} /></span></Link>)}</div></section>

    <section className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <article className="rounded-[22px] border border-slate-200/80 bg-white p-6 shadow-[0_8px_28px_-24px_rgba(18,39,40,.45)] sm:p-7"><div className="flex items-start gap-4"><span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#edf3ee] text-[#315e4e]"><BriefcaseBusiness size={20} /></span><div><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#678077]">A connected workspace</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-[#19272b]">More clarity across every handoff.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Keep your project records, workforce, procurement requests, and expenses organized in dedicated areas that share the same workspace.</p><div className="mt-5 flex flex-wrap gap-2">{["Projects", "People", "Materials", "Costs"].map((item) => <span key={item} className="rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-500">{item}</span>)}</div></div></div></article>
      <article className="rounded-[22px] border border-[#dfe7df] bg-[#edf3ee] p-6 sm:p-7"><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-white text-[#315e4e]"><ClipboardList size={19} /></span><p className="text-[10px] font-bold uppercase tracking-[.17em] text-[#678077]">Field delivery</p></div><h2 className="mt-4 text-lg font-semibold text-[#19272b]">Tasks &amp; progress reports</h2><p className="mt-2 text-sm leading-6 text-slate-600">Follow assigned work, priorities, due dates, and daily or weekly site updates across your projects.</p><div className="mt-5 grid grid-cols-2 gap-3"><Link href="/protected/tasks" className="rounded-xl border border-white bg-white/80 p-3 transition hover:-translate-y-0.5 hover:shadow-sm"><span className="block text-2xl font-semibold text-[#19272b]">{tasksResult.count ?? 0}</span><span className="mt-1 block text-[10px] font-semibold text-slate-500">Open task board</span></Link><Link href="/protected/progress-reports" className="rounded-xl border border-white bg-white/80 p-3 transition hover:-translate-y-0.5 hover:shadow-sm"><span className="block text-2xl font-semibold text-[#19272b]">{reportsResult.count ?? 0}</span><span className="mt-1 block text-[10px] font-semibold text-slate-500">Review site reports</span></Link></div></article>
    </section>
  </div>;
}
