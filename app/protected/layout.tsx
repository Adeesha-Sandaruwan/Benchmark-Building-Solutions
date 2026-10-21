import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import Link from "next/link";
import { HardHat } from "lucide-react";
import { connection } from "next/server";
import { WorkspaceNav } from "@/components/workspace-nav";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims) redirect("/auth/login");
  return (
    <main className="min-h-svh bg-[#f5f7fa] text-slate-900">
      <header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"><Link href="/protected" className="flex items-center gap-2.5"><span className="flex size-9 items-center justify-center rounded-lg bg-[#152d4b] text-amber-400"><HardHat size={19} /></span><span className="text-sm font-bold tracking-wide text-[#152d4b]">BENCHMARK</span></Link><div className="flex items-center gap-4"><span className="hidden text-sm text-slate-500 sm:inline">{claims.email}</span><LogoutButton /></div></div></header>
      <WorkspaceNav />
      <div className="mx-auto min-h-[calc(100svh-4rem)] max-w-7xl px-4 py-7 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
