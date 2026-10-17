"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function UpdatePasswordForm() {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleUpdatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setError(null);
    if (password.length < 12) { setError("Use at least 12 characters for your new password."); return; }
    if (password !== repeatPassword) { setError("The passwords don’t match. Please check them and try again."); return; }
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      window.setTimeout(() => { router.replace("/protected"); router.refresh(); }, 1600);
    } catch {
      setError("We couldn’t update your password. The reset link may have expired; request a new one and try again.");
    } finally { setIsLoading(false); }
  }

  if (success) return <div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><ShieldCheck size={27} /></span><h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#152d4b]">Password updated</h2><p className="mt-3 text-sm text-slate-500">Your new password is ready. Taking you to your workspace…</p><Link href="/protected" className="mt-5 inline-flex text-sm font-semibold text-amber-800 hover:underline">Continue to workspace</Link></div>;

  return <div><div className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Secure your account</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Choose a new password</h2><p className="mt-2 text-sm leading-6 text-slate-500">Create a strong password with at least 12 characters.</p></div><form onSubmit={handleUpdatePassword} className="space-y-4"><div><label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">New password</label><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-12 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div><div><label htmlFor="repeat-password" className="mb-2 block text-sm font-medium text-slate-700">Confirm new password</label><input id="repeat-password" name="repeat-password" type="password" autoComplete="new-password" minLength={12} required value={repeatPassword} onChange={(event) => setRepeatPassword(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></div>{error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{error}</p>}<button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-70">{isLoading && <LoaderCircle size={17} className="animate-spin" />}{isLoading ? "Updating password…" : "Update password"}</button></form></div>;
}
