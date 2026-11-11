"use client";

import { useState, useTransition } from "react";
import { Archive, LoaderCircle } from "lucide-react";
import { archiveWorkerAction } from "@/app/protected/workers/actions";

export function ArchiveWorkerButton({ workerId }: { workerId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  return <div><button type="button" disabled={pending} onClick={() => { if (!window.confirm("Archive this worker? Their historic project assignments will be retained.")) return; startTransition(async () => setError((await archiveWorkerAction(workerId)).error)); }} className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60">{pending ? <LoaderCircle size={15} className="animate-spin" /> : <Archive size={15} />}{pending ? "Archiving…" : "Archive worker"}</button>{error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>;
}
