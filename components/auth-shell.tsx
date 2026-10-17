import Link from "next/link";
import { HardHat, ShieldCheck } from "lucide-react";

export function AuthShell({ children, eyebrow = "BENCHMARK WORKSPACE", title = "Good work starts with a clear plan.", description = "Keep your projects, people, and site updates moving together." }: { children: React.ReactNode; eyebrow?: string; title?: string; description?: string }) {
  return (
    <main className="min-h-svh bg-[#f5f7fa] text-slate-950 lg:grid lg:grid-cols-[minmax(340px,.9fr)_1.1fr]">
      <aside className="relative hidden overflow-hidden bg-[#152d4b] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -right-40 top-24 size-[28rem] rounded-full border border-white/10" /><div className="absolute -right-24 top-40 size-80 rounded-full border border-white/10" /><div className="absolute -bottom-28 -left-20 size-72 rounded-full bg-amber-500/10 blur-3xl" />
        <Link href="/" className="relative flex w-fit items-center gap-3"><span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-amber-400"><HardHat size={23} /></span><span className="leading-tight"><span className="block text-sm font-bold tracking-wide">BENCHMARK</span><span className="block text-[10px] font-semibold tracking-[0.2em] text-slate-300">BUILDING SOLUTIONS</span></span></Link>
        <div className="relative max-w-lg py-12"><span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200"><ShieldCheck size={14} className="text-amber-400" /> {eyebrow}</span><h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">{title}</h1><p className="mt-5 max-w-md text-base leading-7 text-slate-300">{description}</p><div className="mt-10 flex gap-2"><span className="h-1 w-10 rounded-full bg-amber-400" /><span className="h-1 w-5 rounded-full bg-white/25" /><span className="h-1 w-5 rounded-full bg-white/25" /></div></div>
        <p className="relative text-xs text-slate-400">© 2026 Benchmark Building Solutions</p>
      </aside>
      <section className="flex min-h-svh flex-col px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
        <div className="flex items-center justify-between lg:justify-end"><Link href="/" className="flex items-center gap-2 lg:hidden"><span className="flex size-9 items-center justify-center rounded-lg bg-[#152d4b] text-amber-400"><HardHat size={19} /></span><span className="text-xs font-bold tracking-wide text-[#152d4b]">BENCHMARK</span></Link><Link href="/" className="rounded-md px-2 py-2 text-sm text-slate-500 transition hover:text-slate-900">Back to home</Link></div>
        <div className="flex flex-1 items-center justify-center py-10"><div className="w-full max-w-[420px]">{children}</div></div>
        <p className="text-center text-xs text-slate-400">Secure access for your project team</p>
      </section>
    </main>
  );
}
