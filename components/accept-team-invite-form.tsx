"use client";

import { useActionState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { acceptTeamInviteAction } from "@/app/protected/team/actions";

export function AcceptTeamInviteForm({ initialCode = "" }: { initialCode?: string }) {
  const [state, action, pending] = useActionState(acceptTeamInviteAction, { error: null });
  return <form action={action} className="space-y-4"><label className="block text-sm font-medium text-slate-700">Invitation code<input name="invite_code" required minLength={72} maxLength={72} defaultValue={initialCode} placeholder="Paste the code shared by your workspace admin" className="mt-1.5 h-12 w-full rounded-lg border border-slate-300 px-3 font-mono text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></label>{state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{state.error}</p>}<button disabled={pending} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-60">{pending && <LoaderCircle size={16} className="animate-spin" />}{pending ? "Joining workspace…" : "Join workspace"}</button><p className="text-xs text-slate-500">You must be signed in to accept an invitation. <Link href="/auth/login" className="font-semibold text-amber-800 underline">Sign in here</Link>.</p></form>;
}
