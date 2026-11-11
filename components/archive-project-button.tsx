"use client";

import { useState, useTransition } from "react";
import { Archive, LoaderCircle } from "lucide-react";
import { archiveProjectAction } from "@/app/protected/projects/actions";

export function ArchiveProjectButton({ projectId }: { projectId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  function archive() {
    if (!window.confirm("Archive this project? It will be hidden from the active project list. Its financial and operational records will remain available for audit.")) return;
    setError(null);
    startTransition(async () => {
      const result = await archiveProjectAction(projectId);
      setError(result.error);
    });
  }
  return <div className="flex flex-col items-end gap-2"><button type="button" onClick={archive} disabled={isPending} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60">{isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Archive size={16} />}{isPending ? "Archiving…" : "Archive project"}</button>{error && <p role="alert" className="max-w-xs text-right text-xs text-red-700">{error}</p>}</div>;
}
