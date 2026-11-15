import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { HardHat, Sparkles } from "lucide-react";
import { connection } from "next/server";
import { WorkspaceNav } from "@/components/workspace-nav";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims) redirect("/auth/login");
  const email = typeof claims.email === "string" ? claims.email : "Workspace member";
  const initials = email.split("@")[0].split(/[._-]/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "B";
  const organizations = await getOrganizationOptions();
  const organizationName = organizations[0]?.name ?? "Your workspace";

  return (
    <main className="workspace-app min-h-svh text-slate-900">
      <header className="workspace-topbar sticky top-0 z-40 h-[72px] border-b border-white/10 text-white">
        <div className="flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/protected" aria-label="Benchmark workspace overview" className="flex shrink-0 items-center gap-2.5">
              <span className="workspace-brand-mark flex size-10 items-center justify-center rounded-[14px] text-[#f1c86e]"><HardHat size={21} strokeWidth={2} /></span>
              <span className="leading-none"><span className="block text-[13px] font-extrabold tracking-[.15em]">BENCHMARK</span><span className="mt-1 block text-[8px] font-bold tracking-[.22em] text-white/50">BUILDING SOLUTIONS</span></span>
            </Link>
            <span className="hidden h-8 w-px bg-white/15 md:block" />
            <div className="hidden min-w-0 md:block"><p className="text-[9px] font-bold uppercase tracking-[.19em] text-white/40">Construction workspace</p><p className="mt-1 max-w-[290px] truncate text-xs font-semibold text-white/80">{organizationName}</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-[190px] truncate text-xs text-white/65 xl:block">{email}</span>
            <span className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-[11px] font-bold text-[#f1c86e]" aria-label={`Signed in as ${email}`}>{initials}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <div className="workspace-frame lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <WorkspaceNav />
        <div className="workspace-canvas min-w-0 px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pb-10 lg:pt-9">
          <div className="workspace-content mx-auto w-full max-w-[1400px]">{children}</div>
          <footer className="mx-auto mt-12 hidden max-w-[1400px] items-center justify-between border-t border-slate-200/80 pt-5 text-[10px] text-slate-400 sm:flex"><span className="inline-flex items-center gap-1.5"><Sparkles size={12} className="text-amber-600" /> Built for the people who build</span><span>Benchmark Building Solutions</span></footer>
        </div>
      </div>
    </main>
  );
}
