import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, ClipboardCheck, HardHat, ShieldCheck } from "lucide-react";

const features = [
  { icon: ClipboardCheck, title: "Plan the work", detail: "Keep project tasks, owners, and milestones in one clear view." },
  { icon: Boxes, title: "Know what is on site", detail: "Track material requests, deliveries, and project costs." },
  { icon: BarChart3, title: "See progress sooner", detail: "Bring daily updates and decisions together across your projects." },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7fa] text-slate-950">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="Benchmark Building Solutions home">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#152d4b] text-amber-400"><HardHat size={23} strokeWidth={2.2} /></span>
          <span className="leading-tight"><span className="block text-sm font-bold tracking-wide">BENCHMARK</span><span className="block text-[10px] font-semibold tracking-[0.2em] text-slate-500">BUILDING SOLUTIONS</span></span>
        </Link>
        <Link href="/auth/login" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50">Sign in <ArrowRight size={16} /></Link>
      </header>

      <section className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-16 pt-10 sm:px-8 md:pt-16 lg:grid-cols-[1.05fr_.95fr] lg:px-12 lg:pb-24">
        <div className="max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900"><ShieldCheck size={15} /> A clearer view of every jobsite</div>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-[#152d4b] sm:text-5xl lg:text-6xl">Build with clarity.<br /><span className="text-amber-600">Deliver with confidence.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">A practical home for your construction projects, teams, materials, expenses, tasks, and site updates.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/auth/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203e64]">Open your workspace <ArrowRight size={17} /></Link>
            <p className="flex min-h-12 items-center text-sm text-slate-500">Secure access for your project team</p>
          </div>
          <div className="mt-12 grid gap-5 border-t border-slate-200 pt-7 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, detail }) => <div key={title} className="flex gap-3"><span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 shadow-sm ring-1 ring-slate-200"><Icon size={18} /></span><div><h2 className="text-sm font-semibold text-slate-900">{title}</h2><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p></div></div>)}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -right-12 -top-12 size-48 rounded-full bg-amber-200/50 blur-3xl" />
          <div className="absolute -bottom-12 -left-10 size-48 rounded-full bg-blue-200/50 blur-3xl" />
          <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_24px_80px_-32px_rgba(15,35,65,.32)] sm:p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4"><div><p className="text-xs font-medium uppercase tracking-wider text-slate-400">Project overview</p><p className="mt-1 font-semibold text-[#152d4b]">North Ridge Residence</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">On track</span></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><Metric label="Progress" value="68%" /><Metric label="Open tasks" value="12" /><Metric label="Team on site" value="18" /></div>
            <div className="mt-5 rounded-xl bg-[#f5f7fa] p-4"><div className="flex items-center justify-between text-sm"><span className="font-medium text-slate-700">Build progress</span><span className="font-semibold text-[#152d4b]">68%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[68%] rounded-full bg-amber-500" /></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Started 12 Mar</span><span>Due 30 Nov</span></div></div>
            <div className="mt-4 space-y-3"><Activity title="Concrete delivery received" meta="Materials · 8:42 AM" tone="amber" /><Activity title="Foundation inspection completed" meta="Progress report · Yesterday" tone="green" /><Activity title="Electrical rough-in assigned" meta="Task · Yesterday" tone="blue" /></div>
          </div>
          <div className="absolute -bottom-5 right-4 hidden items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex"><span className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><ShieldCheck size={18} /></span><span><span className="block text-xs font-semibold text-slate-800">Your team, in sync</span><span className="block text-[11px] text-slate-500">Updates organized in one place</span></span></div>
        </div>
      </section>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><span>© {new Date().getFullYear()} Benchmark Building Solutions</span><span>Project management for the people who build.</span></div></footer>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-100 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-xl font-semibold tracking-tight text-[#152d4b]">{value}</p></div>;
}

function Activity({ title, meta, tone }: { title: string; meta: string; tone: "amber" | "green" | "blue" }) {
  const colors = { amber: "bg-amber-400", green: "bg-emerald-500", blue: "bg-blue-500" };
  return <div className="flex items-start gap-3"><span className={`mt-1.5 size-2 rounded-full ${colors[tone]}`} /><div><p className="text-sm font-medium text-slate-700">{title}</p><p className="mt-0.5 text-xs text-slate-400">{meta}</p></div></div>;
}
