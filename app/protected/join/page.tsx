import { Building2 } from "lucide-react";
import { AcceptTeamInviteForm } from "@/components/accept-team-invite-form";

export default async function JoinWorkspacePage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  return <div className="mx-auto max-w-xl"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><span className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800"><Building2 size={23} /></span><p className="mt-6 text-xs font-semibold uppercase tracking-[0.15em] text-amber-700">Team invitation</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Join a workspace</h1><p className="mt-3 text-sm leading-6 text-slate-500">Paste the invitation code shared by your workspace owner or admin. If you don’t have an account yet, create one first, verify your email, then return here.</p><div className="mt-6"><AcceptTeamInviteForm initialCode={code ?? ""} /></div></section></div>;
}
