"use client";

import { useActionState } from "react";
import { Database, LoaderCircle, Sparkles } from "lucide-react";
import {
  seedPresentationDataAction,
  type PresentationDataState,
} from "@/app/protected/presentation-data-actions";

const initialState: PresentationDataState = { message: null, error: null };

export function PresentationDataLoader() {
  const [state, action, pending] = useActionState(
    seedPresentationDataAction,
    initialState,
  );

  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-[#d8e4dc] bg-gradient-to-r from-[#f1f6f1] via-white to-[#fff8e9] p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#274d43] text-[#f1c86e]">
          <Sparkles size={18} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-[#19272b]">
            Prepare your presentation workspace
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
            Add a connected set of construction project records across every module. Existing workspace records stay unchanged, and loading again will not duplicate this set.
          </p>
          {state.message && <p role="status" className="mt-2 text-xs font-semibold text-emerald-800">{state.message}</p>}
          {state.error && <p role="alert" className="mt-2 text-xs font-semibold text-red-700">{state.error}</p>}
        </div>
      </div>
      <form action={action} className="shrink-0">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#274d43] px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1d3b34] disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        >
          {pending ? <LoaderCircle size={16} className="animate-spin" /> : <Database size={16} />}
          {pending ? "Preparing records…" : "Load presentation records"}
        </button>
      </form>
    </section>
  );
}
