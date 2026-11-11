"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Clipboard, LoaderCircle, UserPlus } from "lucide-react";
import { createTeamInviteAction } from "@/app/protected/team/actions";

const roles = [
  ["project_manager", "Project manager"], ["supervisor", "Site supervisor"], ["finance", "Finance"], ["worker", "Worker"], ["viewer", "Read-only"],
];

export function TeamInviteForm({ organizationId, canInviteAdmin }: { organizationId: string; canInviteAdmin: boolean }) {
  const [state, action, pending] = useActionState(createTeamInviteAction, { error: null, token: null });
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const availableRoles = canInviteAdmin ? [["admin", "Workspace admin"], ...roles] : roles;
  const inviteUrl = state.token && origin ? `${origin}/protected/join?code=${state.token}` : "";
  async function copyInvite() { if (!inviteUrl) return; await navigator.clipboard.writeText(inviteUrl); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }
  return <div><form action={action} className="grid gap-3 sm:grid-cols-[1fr_200px_auto]"><input type="hidden" name="organization_id" value={organizationId} /><label><span className="sr-only">Invite email, optional</span><input name="email" type="email" placeholder="Invitee email (optional)" className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></label><label><span className="sr-only">Workspace role</span><select name="role" defaultValue="worker" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">{availableRoles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button disabled={pending} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-60">{pending ? <LoaderCircle size={16} className="animate-spin" /> : <UserPlus size={16} />}Create invite code</button></form>{state.error && <p role="alert" className="mt-3 text-sm text-red-700">{state.error}</p>}{state.token && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-sm font-semibold text-emerald-900">Invite link ready · expires in 7 days</p><p className="mt-1 text-xs leading-5 text-emerald-800">Share this link with the teammate. They must sign in with the invited email (if one was specified) and accept the invitation. The app does not send email.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><code className="min-w-0 flex-1 break-all rounded-lg border border-emerald-200 bg-white px-3 py-2 font-mono text-xs text-slate-800">{inviteUrl || state.token}</code><button type="button" onClick={copyInvite} disabled={!inviteUrl} className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-semibold text-emerald-900 disabled:opacity-60">{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy link"}</button></div></div>}</div>;
}
