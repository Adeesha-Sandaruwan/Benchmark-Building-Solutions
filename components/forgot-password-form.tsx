"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, LoaderCircle, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleForgotPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (resetError) throw resetError;
      setSuccess(true);
    } catch {
      setError("We couldn’t send the reset email. Please check the address and try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) return <div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><MailCheck size={27} /></span><p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Check your inbox</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Reset link sent</h2><p className="mt-3 text-sm leading-6 text-slate-500">If an account exists for <span className="font-medium text-slate-700">{email}</span>, you’ll receive instructions to reset your password.</p><Link href="/auth/login" className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64]"><ArrowLeft size={16} /> Back to sign in</Link></div>;

  return <div><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Account recovery</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Reset your password</h2><p className="mt-2 text-sm leading-6 text-slate-500">Enter your account email and we’ll send you a secure reset link.</p></div><form onSubmit={handleForgotPassword} className="space-y-5"><div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></div>{error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{error}</p>}<button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-70">{isLoading && <LoaderCircle size={17} className="animate-spin" />}{isLoading ? "Sending reset link…" : "Send reset link"}</button></form><p className="mt-6 text-center text-sm"><Link href="/auth/login" className="inline-flex items-center gap-1.5 font-semibold text-amber-800 hover:underline"><ArrowLeft size={15} /> Back to sign in</Link></p></div>;
}
