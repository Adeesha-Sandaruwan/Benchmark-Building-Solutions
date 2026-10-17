import Link from "next/link";
import { CircleAlert } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";

export default async function AuthErrorPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthShell eyebrow="LINK NEEDS ATTENTION" title="Let’s get your access sorted." description="For your protection, account links are time-limited and can only be used once."><div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-800"><CircleAlert size={27} /></span><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#152d4b]">Link unavailable</h2><p className="mt-3 text-sm leading-6 text-slate-500">{error || "This authentication link could not be verified. It may have expired or already been used."}</p><div className="mt-6 grid gap-3"><Link href="/auth/login" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64]">Go to sign in</Link><Link href="/auth/forgot-password" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Request a password reset</Link></div></div></AuthShell>;
}
