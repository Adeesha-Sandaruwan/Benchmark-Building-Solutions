"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, PackageCheck, PackagePlus, Truck } from "lucide-react";
import { recordMaterialReceiptAction, recordMaterialUsageAction, transitionMaterialRequestAction } from "@/app/protected/materials/actions";

const empty = { error: null, success: null };

export function MaterialRequestControls({ requestId, projectId, status, remainingToReceive, remainingToUse, canManage, canRecordUsage }: { requestId: string; projectId: string; status: string; remainingToReceive: number; remainingToUse: number; canManage: boolean; canRecordUsage: boolean }) {
  const [statusState, statusAction, statusPending] = useActionState(transitionMaterialRequestAction, empty);
  const [receiptState, receiptAction, receiptPending] = useActionState(recordMaterialReceiptAction, empty);
  const [usageState, usageAction, usagePending] = useActionState(recordMaterialUsageAction, empty);
  const feedback = statusState.error || receiptState.error || usageState.error || statusState.success || receiptState.success || usageState.success;
  const error = statusState.error || receiptState.error || usageState.error;
  return <div className="space-y-2">{canManage && (status === "requested" || status === "approved") && <div className="flex flex-wrap gap-2">{status === "requested" && <StatusForm action={statusAction} projectId={projectId} requestId={requestId} status="approved" label="Approve" icon="check" pending={statusPending} />}{status === "approved" && <StatusForm action={statusAction} projectId={projectId} requestId={requestId} status="ordered" label="Mark ordered" icon="truck" pending={statusPending} />}<StatusForm action={statusAction} projectId={projectId} requestId={requestId} status="cancelled" label="Cancel" icon="cancel" pending={statusPending} /></div>}
    {canManage && ["ordered", "partially_received"].includes(status) && remainingToReceive > 0 && <form action={receiptAction} className="flex flex-wrap items-center gap-2"><input type="hidden" name="request_id" value={requestId} /><input type="hidden" name="project_id" value={projectId} /><label><span className="sr-only">Quantity received</span><input name="quantity" type="number" min="0.001" max={remainingToReceive} step="0.001" required placeholder="Qty received" className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-xs" /></label><button disabled={receiptPending} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{receiptPending ? <LoaderCircle size={14} className="animate-spin" /> : <PackageCheck size={14} />}Receive</button></form>}
    {canRecordUsage && remainingToUse > 0 && ["partially_received", "received"].includes(status) && <form action={usageAction} className="flex flex-wrap items-center gap-2"><input type="hidden" name="request_id" value={requestId} /><input type="hidden" name="project_id" value={projectId} /><label><span className="sr-only">Quantity used</span><input name="quantity" type="number" min="0.001" max={remainingToUse} step="0.001" required placeholder="Qty used" className="h-9 w-28 rounded-lg border border-slate-300 px-2 text-xs" /></label><button disabled={usagePending} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">{usagePending ? <LoaderCircle size={14} className="animate-spin" /> : <PackagePlus size={14} />}Record use</button></form>}
    {feedback && <p role={error ? "alert" : "status"} className={`text-xs ${error ? "text-red-700" : "text-emerald-700"}`}>{feedback}</p>}</div>;
}

function StatusForm({ action, projectId, requestId, status, label, icon, pending }: { action: (payload: FormData) => void; projectId: string; requestId: string; status: string; label: string; icon: "check" | "truck" | "cancel"; pending: boolean }) {
  const Icon = icon === "check" ? Check : icon === "truck" ? Truck : PackagePlus;
  return <form action={action}><input type="hidden" name="request_id" value={requestId} /><input type="hidden" name="project_id" value={projectId} /><input type="hidden" name="next_status" value={status} /><button disabled={pending} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><Icon size={14} />{label}</button></form>;
}
