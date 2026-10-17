import Link from "next/link";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export default async function SignUpSuccessPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return <AuthShell eyebrow="ONE LAST STEP" title="Verify your email to get started." description="We’ll keep your workspace access secure and ready for your team."><div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800"><MailCheck size={27} /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Account created</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Check your inbox</h2><p className="mt-3 text-sm leading-6 text-slate-500">We sent a verification link to{email ? <> <span className="font-medium text-slate-700">{email}</span></> : " your email address"}. Follow it to confirm your account and access your workspace.</p><div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-left text-xs leading-5 text-slate-500">Can’t find the email? Check your spam folder. The confirmation link may expire, so open it soon.</div><Link href="/auth/login" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64]">Return to sign in</Link></div></AuthShell>;
}
