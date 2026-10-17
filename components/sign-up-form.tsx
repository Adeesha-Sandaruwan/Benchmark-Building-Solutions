"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

export function SignUpForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const router = useRouter();

  async function handleSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isLoading) return;
    setError(null);
    if (password.length < 12) {
      setError("Use at least 12 characters for your password.");
      return;
    }
    if (password !== repeatPassword) {
      setError("The passwords don’t match. Please check them and try again.");
      return;
    }

    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/protected`,
        },
      });
      if (signUpError) throw signUpError;
      router.push("/auth/sign-up-success");
    } catch {
      setError("We couldn’t create your account. Check the details and try again, or contact your workspace administrator.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Create your account</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#152d4b]">Join Benchmark</h2><p className="mt-2 text-sm leading-6 text-slate-500">Use your work details to set up your project workspace access.</p></div>
      <form onSubmit={handleSignUp} className="space-y-4">
        <div><label htmlFor="full-name" className="mb-2 block text-sm font-medium text-slate-700">Full name</label><input id="full-name" name="name" type="text" autoComplete="name" minLength={2} maxLength={100} required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></div>
        <div><label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label><input id="email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /></div>
        <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-11 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /><button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div><p className="mt-1.5 text-xs text-slate-500">At least 12 characters.</p></div>
        <div><label htmlFor="repeat-password" className="mb-2 block text-sm font-medium text-slate-700">Confirm password</label><div className="relative"><input id="repeat-password" name="repeat-password" type={showRepeatPassword ? "text" : "password"} autoComplete="new-password" minLength={12} required value={repeatPassword} onChange={(event) => setRepeatPassword(event.target.value)} className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-11 text-sm outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10" /><button type="button" onClick={() => setShowRepeatPassword((visible) => !visible)} aria-label={showRepeatPassword ? "Hide confirmation password" : "Show confirmation password"} className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showRepeatPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">{error}</p>}
        <button type="submit" disabled={isLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#152d4b] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203e64] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-70">{isLoading && <LoaderCircle size={17} className="animate-spin" />}{isLoading ? "Creating your account…" : "Create account"}</button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-500">Already have an account? <Link href="/auth/login" className="font-semibold text-amber-800 underline-offset-4 hover:underline">Sign in</Link></p>
    </div>
  );
}
