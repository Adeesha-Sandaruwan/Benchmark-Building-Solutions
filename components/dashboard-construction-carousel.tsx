"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Plus } from "lucide-react";

const slides = [
  {
    src: "https://images.unsplash.com/photo-1763665814710-b0067b823603?auto=format&fit=crop&w=1900&q=85",
    alt: "Construction crew working on a concrete building beneath a tower crane",
    label: "Your operational snapshot",
    caption: "The right view for every stage of the build.",
  },
  {
    src: "https://images.unsplash.com/photo-1587582423116-ec07293f0395?auto=format&fit=crop&w=1900&q=85",
    alt: "Construction professional reviewing work at an active building site",
    label: "People and project work",
    caption: "Keep your team and project details connected.",
  },
  {
    src: "https://images.unsplash.com/photo-1770820983716-fbc7a31510aa?auto=format&fit=crop&w=1900&q=85",
    alt: "A modern construction project rising above the surrounding city skyline",
    label: "Progress in motion",
    caption: "Bring the moving parts of the jobsite into view.",
  },
];

export function DashboardConstructionCarousel({ organizationName, firstName }: { organizationName: string; firstName: string }) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 7200);
    return () => window.clearInterval(timer);
  }, []);

  function changeSlide(direction: number) {
    setActiveSlide((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="dashboard-hero relative isolate overflow-hidden rounded-[28px] text-white" aria-labelledby="dashboard-title">
      {slides.map((slide, index) => <div key={slide.src} className={`absolute inset-0 -z-20 transition-opacity duration-1000 ${activeSlide === index ? "opacity-100" : "opacity-0"}`} aria-hidden="true"><Image src={slide.src} alt="" fill priority={index === 0} unoptimized sizes="(max-width: 1024px) 100vw, 85vw" className="dashboard-hero-image object-cover" /></div>)}
      <div className="dashboard-hero-shade absolute inset-0 -z-10" />
      <div className="dashboard-hero-grid absolute inset-0 -z-10" aria-hidden="true" />
      <div className="relative grid gap-9 p-6 sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end lg:p-12">
        <div className="max-w-2xl"><p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.17em] text-white/80 backdrop-blur"><span className="size-1.5 rounded-full bg-emerald-400" /> {organizationName}</p><h1 id="dashboard-title" className="mt-5 text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">Good to see you, <span className="font-serif italic font-normal text-[#f0c777]">{firstName}.</span></h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base sm:leading-7">Get a live view of your projects, people, procurement, and costs together in one workspace.</p></div>
        <Link href="/protected/projects/new" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#e9ad47] px-5 text-sm font-bold text-[#19272b] shadow-lg transition duration-300 hover:-translate-y-0.5 hover:bg-[#f2c46f]"><Plus size={17} /> Create a project <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link>
      </div>
      <div className="dashboard-hero-foot relative flex flex-wrap items-center justify-between gap-4 border-t border-white/15 px-6 py-4 text-[10px] font-medium text-white/75 sm:px-9 lg:px-12">
        <div className="min-w-0"><span className="font-bold uppercase tracking-[.16em] text-[#f0c777]">{slides[activeSlide].label}</span><p className="mt-1 text-xs text-white/75">{slides[activeSlide].caption}</p></div>
        <div className="flex shrink-0 items-center gap-2" aria-label="Construction image controls">
          <button type="button" onClick={() => changeSlide(-1)} className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition hover:bg-white/15" aria-label="Previous construction image"><ChevronLeft size={17} /></button>
          <div className="flex items-center gap-1.5 px-1">{slides.map((slide, index) => <button key={slide.src} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show image ${index + 1}: ${slide.label}`} aria-current={index === activeSlide} className={`h-1.5 rounded-full transition-all duration-300 ${activeSlide === index ? "w-7 bg-[#f0c777]" : "w-1.5 bg-white/55 hover:bg-white"}`} />)}</div>
          <button type="button" onClick={() => changeSlide(1)} className="flex size-9 items-center justify-center rounded-full border border-white/25 bg-white/5 text-white transition hover:bg-white/15" aria-label="Next construction image"><ChevronRight size={17} /></button>
        </div>
      </div>
    </section>
  );
}
