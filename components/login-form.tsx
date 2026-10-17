"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, HardHat, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
      const requestedPath = new URLSearchParams(window.location.search).get("next");
      const safePath = requestedPath?.startsWith("/") && !requestedPath.startsWith("//") ? requestedPath : "/protected";
      router.replace(safePath);
      router.refresh();
    } catch {
      setError("We couldn’t sign you in with those details. Check your email and password, then try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-7"><span className="mb-4 flex size-12 items-center justify-center rounded-xl bg-amber-100 text-amber-800 lg:hidden"><HardHat size={24} /></span><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Welcome back</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Sign in to Benchmark</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use your work account to continue to your workspace.</p></div>
      <form onSubmit={handleLogin} className="space-y-5">
        <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label><div className="relative"><Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="you@company.com" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></div></div>
        <div><div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label><Link href="/auth/forgot-password" className="text-xs font-semibold text-amber-800 underline-offset-4 hover:underline">Forgot password?</Link></div><div className="relative"><LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-12 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{error}</p>}
        <button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203e64] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-70">{isLoading && <LoaderCircle size={17} className="animate-spin" />}{isLoading ? "Signing you in…" : "Sign in"}</button>
      </form>
      <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500">New to Benchmark? <Link href="/auth/sign-up" className="font-semibold text-amber-800 underline-offset-4 hover:underline">Create an account</Link></div>
    </div>
  );
}
