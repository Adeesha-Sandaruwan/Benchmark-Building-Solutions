import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { TeamInviteForm } from "@/components/team-invite-form";

const roleDescriptions = [
  ["Admin", "Workspace settings and member access."],
  ["Project manager", "Project setup, workforce, purchasing, and cost oversight."],
  ["Site supervisor", "Workforce, site material requests, delivery, and project costs."],
  ["Finance", "Expense review and financial records."],
  ["Worker", "Submit project material requests and expenses."],
  ["Read-only", "View project information without editing it."],
];

export default async function TeamPage() {
  const organization = (await getOrganizationOptions())[0];
  if (!organization) redirect("/protected/setup");
  if (!["owner", "admin"].includes(organization.role)) redirect("/protected");
  return <div className="mx-auto max-w-4xl space-y-6"><div><p className="text-sm font-medium text-amber-700">{organization.name}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-[#152d4b]">Team access</h1><p className="mt-2 text-sm text-slate-500">Create secure, time-limited invitation codes for teammates who already have or will create an account.</p></div><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="mb-5 flex items-start gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800"><Users size={19} /></span><div><h2 className="font-semibold text-[#152d4b]">Invite a teammate</h2><p className="mt-1 text-sm leading-5 text-slate-500">An invitation expires after seven days and can be accepted once. The code is shown only after creation.</p></div></div><TeamInviteForm organizationId={organization.id} canInviteAdmin={organization.role === "owner"} /></section><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="font-semibold text-[#152d4b]">Access roles</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{roleDescriptions.map(([title, description]) => <div key={title} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>)}</div><p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-700" />All project and organization access is enforced by Supabase row-level security as well as the application.</p></section><Link href="/protected/join" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 hover:underline">Have an invite code? Join a workspace <ArrowRight size={15} /></Link></div>;
}
