"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  BriefcaseBusiness,
  LayoutDashboard,
  UserCog,
  UsersRound,
  WalletCards,
} from "lucide-react";

const modules = [
  { href: "/protected", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/protected/projects", label: "Projects", icon: BriefcaseBusiness },
  { href: "/protected/workers", label: "Workers", icon: UsersRound },
  { href: "/protected/materials", label: "Materials", icon: Boxes },
  { href: "/protected/expenses", label: "Expenses", icon: WalletCards },
  { href: "/protected/team", label: "Team access", icon: UserCog },
];

export function WorkspaceNav() {
  const pathname = usePathname();
  return (
    <>
      <aside className="workspace-sidebar hidden lg:sticky lg:top-[72px] lg:flex lg:h-[calc(100svh-72px)] lg:flex-col">
        <div className="px-4 pb-3 pt-7">
          <p className="px-3 text-[10px] font-bold uppercase tracking-[.2em] text-slate-400">Workspace</p>
          <nav aria-label="Workspace modules" className="mt-3 space-y-1">
            {modules.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
              return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`workspace-nav-link group flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition ${active ? "workspace-nav-link-active" : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"}`}><span className={`flex size-8 items-center justify-center rounded-lg transition ${active ? "bg-[#274d43] text-[#f1c86e] shadow-sm" : "bg-transparent text-slate-400 group-hover:bg-white group-hover:text-[#315e4e]"}`}><Icon size={17} strokeWidth={1.9} /></span>{label}{active && <span className="ml-auto size-1.5 rounded-full bg-[#e9ad47]" />}</Link>;
            })}
          </nav>
        </div>
        <div className="mt-auto p-4">
          <div className="workspace-sidebar-photo relative flex min-h-[168px] flex-col justify-end overflow-hidden rounded-2xl p-4 text-white">
            <span className="relative z-10 text-[9px] font-bold uppercase tracking-[.19em] text-[#f0c777]">On site, in sync</span>
            <p className="relative z-10 mt-2 max-w-[170px] text-sm font-semibold leading-5">Keep every moving part of the build in view.</p>
          </div>
          <p className="px-1 pt-4 text-[10px] leading-4 text-slate-400">Benchmark Building Solutions<br />Construction workspace</p>
        </div>
      </aside>

      <nav aria-label="Mobile workspace modules" className="workspace-mobile-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-6 border-t border-slate-200/80 bg-white/95 px-1 pb-[max(.35rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
        {modules.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[9px] font-semibold transition ${active ? "text-[#274d43]" : "text-slate-400 hover:text-slate-700"}`}><span className={`flex size-8 items-center justify-center rounded-xl transition ${active ? "bg-[#edf3ee] text-[#315e4e]" : ""}`}><Icon size={18} strokeWidth={active ? 2.2 : 1.8} /></span><span className="max-w-full truncate">{label === "Team access" ? "Team" : label}</span></Link>;
        })}
      </nav>
    </>
  );
}
