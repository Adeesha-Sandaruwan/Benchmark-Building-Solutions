"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Boxes,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  HardHat,
  Mail,
  Menu,
  ShieldCheck,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1763665814710-b0067b823603?auto=format&fit=crop&w=1800&q=85",
    alt: "Construction crew working on a concrete building beneath a tower crane",
    eyebrow: "Built around the worksite",
    title: "Keep every project moving forward.",
  },
  {
    src: "https://images.unsplash.com/photo-1587582423116-ec07293f0395?auto=format&fit=crop&w=1800&q=85",
    alt: "Construction professional reviewing work at an active building site",
    eyebrow: "One connected team",
    title: "Give your team a clearer view.",
  },
  {
    src: "https://images.unsplash.com/photo-1770820983716-fbc7a31510aa?auto=format&fit=crop&w=1800&q=85",
    alt: "Modern city construction project rising above the surrounding skyline",
    eyebrow: "From plan to handover",
    title: "Turn site updates into progress.",
  },
];

const modules = [
  { icon: BriefcaseBusiness, title: "Projects", label: "01", copy: "Keep project details, budgets, timelines, and status together from kickoff to closeout." },
  { icon: UsersRound, title: "Workers", label: "02", copy: "Maintain worker profiles and make project team assignments easy to review." },
  { icon: Boxes, title: "Materials", label: "03", copy: "Follow material requests through review, ordering, delivery, and on-site usage." },
  { icon: WalletCards, title: "Expenses", label: "04", copy: "Record project costs, attach receipts, and keep reviews accountable." },
  { icon: ClipboardList, title: "Tasks", label: "05", copy: "Give the team a shared place for responsibilities and day-to-day work." },
  { icon: ClipboardList, title: "Progress reports", label: "06", copy: "Bring site updates into a consistent record of work as it advances." },
];

const steps = [
  { number: "01", title: "Set up the workspace", copy: "Create your organization and bring the right people into a shared space." },
  { number: "02", title: "Organize the project", copy: "Capture core project details, assign a team, and keep resources in view." },
  { number: "03", title: "Keep work in motion", copy: "Review requests, costs, responsibilities, and updates as the site changes." },
];

export function Homepage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reducedMotion || !("IntersectionObserver" in window)) {
      sections.forEach((section) => section.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -36px 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  const moveSlide = (direction: number) => {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <main id="top" className="homepage min-h-screen overflow-hidden bg-[#f8f8f5] text-[#19272b]">
      <header className="site-header sticky top-0 z-50 border-b border-white/10 bg-[#111e21]/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="#top" className="flex items-center gap-3" aria-label="Benchmark Building Solutions home" onClick={closeMenu}>
            <BrandMark />
            <span className="leading-none"><span className="block text-[15px] font-extrabold tracking-[0.13em]">BENCHMARK</span><span className="mt-1.5 block text-[9px] font-semibold tracking-[0.25em] text-white/60">BUILDING SOLUTIONS</span></span>
          </Link>
          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            <a className="site-nav-link" href="#solutions">Solutions</a><a className="site-nav-link" href="#how-it-works">How it works</a><a className="site-nav-link" href="#about">About</a><a className="site-nav-link" href="#contact">Contact</a>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <Link href="/auth/login" className="rounded-full px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:text-white">Sign in</Link>
            <Link href="/auth/sign-up" className="inline-flex items-center gap-2 rounded-full bg-[#e9ad47] px-5 py-3 text-sm font-bold text-[#172427] transition hover:bg-[#f3c46f]">Get started <ArrowRight size={15} /></Link>
          </div>
          <button type="button" className="inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white lg:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
        {menuOpen && <nav className="border-t border-white/10 bg-[#111e21] px-5 py-5 lg:hidden" aria-label="Mobile navigation"><div className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:px-3">{[["Solutions", "#solutions"], ["How it works", "#how-it-works"], ["About", "#about"], ["Contact", "#contact"]].map(([label, href]) => <a key={href} href={href} onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-semibold text-white/80 hover:bg-white/5">{label}</a>)}<Link href="/auth/login" onClick={closeMenu} className="mt-2 rounded-full bg-[#e9ad47] px-5 py-3 text-center text-sm font-bold text-[#172427]">Open your workspace</Link></div></nav>}
      </header>

      <section className="hero-section relative isolate min-h-[690px] overflow-hidden bg-[#111e21] text-white lg:min-h-[770px]">
        <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_40%,rgba(42,83,77,.45),transparent_46%)]" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[690px] max-w-[1440px] items-center gap-12 px-5 pb-20 pt-14 sm:px-8 lg:min-h-[770px] lg:grid-cols-[.92fr_1.08fr] lg:gap-10 lg:px-12 lg:pb-24 lg:pt-20">
          <div className="relative z-10 max-w-[640px]" data-reveal>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f0c777]"><span className="size-1.5 rounded-full bg-[#e9ad47] shadow-[0_0_14px_#e9ad47]" /> A better way to build together</div>
            <h1 className="max-w-[760px] text-[clamp(3.2rem,7vw,6.5rem)] font-semibold leading-[.98] tracking-[-.065em]">Build with <span className="font-serif italic font-normal text-[#e9ad47]">clarity.</span><br />Deliver with <span className="font-serif italic font-normal text-[#e9ad47]">confidence.</span></h1>
            <p className="mt-7 max-w-[500px] text-base leading-7 text-white/65 sm:text-lg sm:leading-8">One connected workspace for the people, plans, materials, costs, and progress behind every construction project.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/sign-up" className="group inline-flex min-h-[54px] items-center justify-center gap-3 rounded-full bg-[#e9ad47] px-7 text-sm font-bold text-[#172427] transition duration-300 hover:-translate-y-0.5 hover:bg-[#f3c46f]">Start building better <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></Link>
              <a href="#solutions" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white/85 transition hover:border-white/50 hover:bg-white/5">Explore the platform</a>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium text-white/55"><span className="inline-flex items-center gap-2"><ShieldCheck size={15} className="text-[#e9ad47]" /> Organized workspace access</span><span className="inline-flex items-center gap-2"><Check size={15} className="text-[#e9ad47]" /> Desktop and mobile ready</span></div>
          </div>

          <div className="hero-showcase relative mx-auto w-full max-w-[700px] lg:ml-auto" data-reveal>
            <div className="hero-orbit hero-orbit-one" aria-hidden="true" /><div className="hero-orbit hero-orbit-two" aria-hidden="true" />
            <div className="hero-photo-card relative aspect-[1.18/1] overflow-hidden rounded-[28px] border border-white/20 bg-[#26383a] shadow-[0_35px_100px_-30px_rgba(0,0,0,.75)] sm:aspect-[1.28/1]" onPointerMove={(event) => { if (event.pointerType !== "mouse") return; const rect = event.currentTarget.getBoundingClientRect(); const x = (event.clientX - rect.left) / rect.width - 0.5; const y = (event.clientY - rect.top) / rect.height - 0.5; event.currentTarget.style.setProperty("--tilt-x", `${-y * 3}deg`); event.currentTarget.style.setProperty("--tilt-y", `${x * 4}deg`); }} onPointerLeave={(event) => { event.currentTarget.style.setProperty("--tilt-x", "0deg"); event.currentTarget.style.setProperty("--tilt-y", "0deg"); }}>
              {slides.map((slide, index) => <div key={slide.src} className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"}`} aria-hidden={index !== activeSlide}><Image src={slide.src} alt={slide.alt} fill priority={index === 0} unoptimized sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /></div>)}
              <div className="absolute inset-0 bg-gradient-to-t from-[#101a1c]/90 via-[#101a1c]/10 to-[#101a1c]/15" />
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#111e21]/45 px-3 py-2 text-[10px] font-semibold uppercase tracking-[.14em] text-white/85 backdrop-blur-md sm:left-7 sm:top-7"><span className="size-1.5 rounded-full bg-emerald-400" /> Project workspace</div>
              <div className="absolute inset-x-5 bottom-6 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-8"><div className="max-w-[390px]"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f0c777]">{slides[activeSlide].eyebrow}</p><h2 className="mt-2 text-2xl font-semibold leading-tight tracking-[-.03em] sm:text-3xl">{slides[activeSlide].title}</h2></div><div className="hidden gap-2 sm:flex"><button type="button" onClick={() => moveSlide(-1)} className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur transition hover:bg-white/15" aria-label="Previous construction image"><ChevronLeft size={19} /></button><button type="button" onClick={() => moveSlide(1)} className="flex size-11 items-center justify-center rounded-full border border-white/30 bg-black/15 text-white backdrop-blur transition hover:bg-white/15" aria-label="Next construction image"><ChevronRight size={19} /></button></div></div>
              <div className="absolute bottom-5 right-5 flex gap-1.5 sm:hidden">{slides.map((slide, index) => <button key={slide.src} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show construction image ${index + 1}`} aria-current={index === activeSlide} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-7 bg-[#f0c777]" : "w-1.5 bg-white/55"}`} />)}</div>
            </div>
            <div className="floating-insight absolute -left-3 top-[18%] hidden max-w-[205px] rounded-2xl border border-white/15 bg-[#192a2d]/90 p-4 shadow-xl backdrop-blur-xl sm:block lg:-left-10"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Work at a glance</span><span className="size-2 rounded-full bg-emerald-400" /></div><p className="mt-3 text-2xl font-semibold">68<span className="text-base text-[#f0c777]">%</span></p><p className="mt-1 text-xs text-white/55">Project progress</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-[#e9ad47]" /></div></div>
            <div className="absolute -bottom-6 right-5 hidden items-center gap-3 rounded-2xl border border-white/15 bg-white px-4 py-3 text-[#19272b] shadow-xl sm:flex lg:right-8"><span className="flex size-10 items-center justify-center rounded-full bg-[#edf3ed] text-[#315e4e]"><UsersRound size={19} /></span><span><span className="block text-xs font-bold">One team, one view</span><span className="mt-1 block text-[10px] text-slate-500">Project work, connected</span></span></div>
          </div>
        </div>
        <a href="#solutions" className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[10px] font-semibold uppercase tracking-[.2em] text-white/45 transition hover:text-white/80 lg:flex">Scroll to explore <ArrowDown size={13} className="animate-bounce" /></a>
      </section>

      <section id="solutions" className="scroll-mt-24 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-end" data-reveal><div><p className="section-eyebrow">The platform</p><h2 className="section-title mt-4">Everything that moves<br className="hidden sm:block" /> a project, <em>in sync.</em></h2></div><p className="max-w-xl pb-1 text-base leading-7 text-[#637072]">Construction work is connected. Your tools should be, too. Benchmark brings essential project information into one shared, easy-to-follow workspace.</p></div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(({ icon: Icon, title, label, copy }, index) => <article key={title} data-reveal className="module-card group relative overflow-hidden rounded-[22px] border border-[#e5e8e2] bg-white p-6 transition duration-500 hover:-translate-y-1 hover:border-[#c6d2ca] hover:shadow-[0_24px_70px_-38px_rgba(18,45,39,.4)] sm:p-7" style={{ transitionDelay: `${index * 65}ms` }}><div className="flex items-start justify-between"><span className="flex size-12 items-center justify-center rounded-2xl bg-[#eef3ee] text-[#315e4e] transition duration-500 group-hover:rotate-[-6deg] group-hover:bg-[#e9ad47] group-hover:text-[#19272b]"><Icon size={21} strokeWidth={1.8} /></span><span className="font-mono text-xs text-[#9aa5a0]">{label}</span></div><h3 className="mt-8 text-xl font-semibold tracking-tight text-[#19272b]">{title}</h3><p className="mt-2 min-h-[52px] text-sm leading-6 text-[#687573]">{copy}</p><Link href="/auth/login" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#315e4e] transition group-hover:gap-3">Explore {title.toLowerCase()} <ArrowRight size={14} /></Link><div className="absolute -bottom-10 -right-6 size-28 rounded-full border border-[#edf0eb] transition duration-700 group-hover:scale-150 group-hover:border-[#e9ad47]/40" aria-hidden="true" /></article>)}</div>
          <p className="mt-5 text-xs leading-5 text-[#8a9490]" data-reveal>Tasks and progress reporting are part of the shared platform experience and are being developed with the project team.</p>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 bg-[#e9eee8] px-5 py-24 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div data-reveal><p className="section-eyebrow">A calmer way to coordinate</p><h2 className="section-title mt-4">From first setup<br />to <em>the finish line.</em></h2><p className="mt-6 max-w-lg text-base leading-7 text-[#637072]">Give your team a practical starting point, then keep project details and field activity connected as work progresses.</p><Link href="/auth/sign-up" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#19272b] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#315e4e]">Create your workspace <ArrowRight size={16} /></Link></div>
          <div className="relative" data-reveal><div className="absolute bottom-8 left-[27px] top-8 w-px bg-[#c7d2c8] sm:left-[31px]" aria-hidden="true" /><div className="space-y-4">{steps.map((step) => <article key={step.number} className="workflow-card group relative flex gap-5 rounded-[22px] border border-white/70 bg-white/70 p-5 transition duration-500 hover:translate-x-1 hover:bg-white sm:gap-7 sm:p-7"><span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-2xl border border-[#cbd9ce] bg-[#f8f8f5] font-mono text-xs font-bold text-[#315e4e] transition group-hover:border-[#e9ad47] group-hover:bg-[#e9ad47] group-hover:text-[#19272b] sm:size-14">{step.number}</span><div className="pt-1"><h3 className="text-lg font-semibold text-[#19272b]">{step.title}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-[#687573]">{step.copy}</p></div></article>)}</div></div>
        </div>
      </section>

      <section id="about" className="scroll-mt-20 px-5 py-24 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          <div className="about-photo relative min-h-[390px] overflow-hidden rounded-[28px] bg-[#25383a] sm:min-h-[500px]" data-reveal><Image src="https://images.unsplash.com/photo-1685464197644-41d9b07e1e73?auto=format&fit=crop&w=1400&q=85" alt="Construction workers collaborating on a building project" fill unoptimized sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#111e21]/70 via-transparent to-transparent" /><div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/15 bg-[#111e21]/55 p-5 text-white backdrop-blur-xl sm:bottom-8 sm:left-8 sm:right-8"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#f0c777]">Made for the people behind the build</p><p className="mt-2 text-lg font-semibold">Clear information. Better coordination.</p></div></div>
          <div data-reveal><p className="section-eyebrow">About Benchmark</p><h2 className="section-title mt-4">Good building starts<br />with <em>good visibility.</em></h2><p className="mt-6 text-base leading-7 text-[#637072]">Benchmark Building Solutions is a construction project management workspace designed to bring the moving parts of a project closer together. It gives teams a shared place to organize project information, people, materials, costs, and site activity.</p><p className="mt-4 text-base leading-7 text-[#637072]">The aim is straightforward: make important information easier to find, make handoffs easier to follow, and help every contributor see how their work fits into the larger build.</p><div className="mt-8 grid gap-4 border-t border-[#e3e7e1] pt-7 sm:grid-cols-2"><div className="flex gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e9eee8] text-[#315e4e]"><Check size={16} /></span><span><strong className="block text-sm text-[#19272b]">One connected workspace</strong><small className="mt-1 block text-xs leading-5 text-[#78827e]">Core project records, organized together.</small></span></div><div className="flex gap-3"><span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e9eee8] text-[#315e4e]"><Check size={16} /></span><span><strong className="block text-sm text-[#19272b]">Built for every screen</strong><small className="mt-1 block text-xs leading-5 text-[#78827e]">Use the workspace at your desk or on site.</small></span></div></div></div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20 px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32">
        <div className="contact-panel relative mx-auto max-w-[1440px] overflow-hidden rounded-[30px] bg-[#172427] px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20" data-reveal><div className="contact-glow absolute -right-10 -top-40 size-[380px] rounded-full bg-[#315e4e]/50 blur-[90px]" aria-hidden="true" /><div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end"><div className="max-w-2xl"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#f0c777]">Let’s build in sync</p><h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-5xl">Bring your next project<br className="hidden sm:block" /> into clearer focus.</h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">Get in touch with your workspace administrator for access, or sign in to continue to your team’s construction workspace.</p></div><div className="flex flex-col gap-3 sm:flex-row lg:flex-col"><Link href="/auth/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e9ad47] px-6 text-sm font-bold text-[#172427] transition hover:bg-[#f3c46f]">Open workspace <ArrowRight size={16} /></Link><p className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white/75"><Mail size={15} /> Support through your workspace admin</p></div></div></div>
      </section>

      <footer className="border-t border-[#e3e7e1] bg-[#f8f8f5] px-5 py-8 sm:px-8 lg:px-12"><div className="mx-auto flex max-w-[1440px] flex-col gap-7 sm:flex-row sm:items-center sm:justify-between"><Link href="#top" className="flex items-center gap-3"><BrandMark light /><span className="leading-none"><span className="block text-xs font-extrabold tracking-[.13em] text-[#19272b]">BENCHMARK</span><span className="mt-1 block text-[8px] font-semibold tracking-[.22em] text-[#7c8782]">BUILDING SOLUTIONS</span></span></Link><nav className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#66716c]" aria-label="Footer navigation"><a href="#solutions" className="transition hover:text-[#315e4e]">Solutions</a><a href="#how-it-works" className="transition hover:text-[#315e4e]">How it works</a><a href="#about" className="transition hover:text-[#315e4e]">About us</a><a href="#contact" className="transition hover:text-[#315e4e]">Contact us</a><Link href="/auth/login" className="transition hover:text-[#315e4e]">Sign in</Link></nav><p className="text-[10px] text-[#87918c]">© {new Date().getFullYear()} Benchmark Building Solutions</p></div></footer>
    </main>
  );
}

function BrandMark({ light = false }: { light?: boolean }) {
  return <span className={`flex size-10 shrink-0 items-center justify-center rounded-[13px] ${light ? "bg-[#19272b]" : "bg-[#e9ad47]"}`}><span className="flex size-[29px] items-center justify-center rounded-[9px] bg-[#19272b] text-[#f0c777]"><HardHat size={19} strokeWidth={2.1} /></span></span>;
}
