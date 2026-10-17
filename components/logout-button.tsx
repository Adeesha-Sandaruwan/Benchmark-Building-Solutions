"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    if (isLoading) return;
    setIsLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
    router.refresh();
  }

  return <button type="button" onClick={logout} disabled={isLoading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60">{isLoading ? <LoaderCircle size={15} className="animate-spin" /> : <LogOut size={15} />}{isLoading ? "Signing out…" : "Sign out"}</button>;
}
