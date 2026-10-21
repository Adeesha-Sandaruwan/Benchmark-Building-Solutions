"use client";

import { useActionState } from "react";
import { createOrganizationAction } from "@/app/protected/setup/actions";

export function OrganizationSetupForm() {
  const [state, action, isPending] = useActionState(createOrganizationAction, { error: null });
  return <form action={action} className="mt-6 space-y-5">
    <div><label htmlFor="organization-name" className="mb-2 block text-sm font-medium text-slate-700">Company or organization name</label><input id="organization-name" name="name" required minLength={2} maxLength={160} autoComplete="organization" placeholder="e.g. Benchmark Building Solutions" className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></div>
    {state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">{state.error}</p>}
    <button type="submit" disabled={isPending} className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white transition hover:bg-[#203e64] disabled:opacity-70">{isPending ? "Creating workspace…" : "Create workspace"}</button>
    <p className="text-xs leading-5 text-slate-500">You’ll become the workspace owner. You can invite teammates after the member management workflow is added.</p>
  </form>;
}
