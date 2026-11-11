"use client";

import { useActionState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";
import { reviewExpenseAction } from "@/app/protected/expenses/actions";

export function ExpenseReviewControls({ expenseId, canReview }: { expenseId: string; canReview: boolean }) {
  const [state, action, pending] = useActionState(reviewExpenseAction, { error: null, success: null });
  if (!canReview) return null;
  return <form action={action} className="space-y-2"><input type="hidden" name="expense_id" value={expenseId} /><label><span className="sr-only">Review note</span><input name="review_note" maxLength={1000} placeholder="Review note (optional)" className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-amber-500" /></label><div className="flex gap-2"><button name="decision" value="approved" disabled={pending} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{pending ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />}Approve</button><button name="decision" value="rejected" disabled={pending} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"><X size={14} />Reject</button></div>{state.error && <p role="alert" className="text-xs text-red-700">{state.error}</p>}{state.success && <p role="status" className="text-xs text-emerald-700">{state.success}</p>}</form>;
}
