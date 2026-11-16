
"use client";

import { useActionState } from "react";
import {
  createProgressReportAction,
  type ReportActionState,
} from "../actions";

type ProjectOption = {
  id: string;
  name: string;
  organizationName: string;
};

const initialState: ReportActionState = {
  error: null,
};

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100";

export function ProgressReportForm({
  projects,
}: {
  projects: ProjectOption[];
}) {
  const [state, action, pending] = useActionState(
    createProgressReportAction,
    initialState,
  );

  return (
    <form
      action={action}
      className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="project_id"
          className="mb-2 block text-sm font-semibold"
        >
          Construction Project *
        </label>
        <select
          id="project_id"
          name="project_id"
          required
          defaultValue=""
          className={fieldClass}
        >
          <option value="" disabled>
            Select a project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.organizationName} — {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="report_type"
            className="mb-2 block text-sm font-semibold"
          >
            Report Type *
          </label>
          <select
            id="report_type"
            name="report_type"
            defaultValue="daily"
            required
            className={fieldClass}
          >
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="report_date"
            className="mb-2 block text-sm font-semibold"
          >
            Report Date *
          </label>
          <input
            id="report_date"
            name="report_date"
            type="date"
            required
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="progress_percentage"
          className="mb-2 block text-sm font-semibold"
        >
          Project Progress (%) *
        </label>
        <input
          id="progress_percentage"
          name="progress_percentage"
          type="number"
          min={0}
          max={100}
          step={1}
          required
          placeholder="e.g. 45"
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-slate-500">
          Enter the overall project progress from 0 to 100.
          This is a manually reported percentage.
        </p>
      </div>

      <div>
        <label
          htmlFor="completed_work"
          className="mb-2 block text-sm font-semibold"
        >
          Completed Work *
        </label>
        <textarea
          id="completed_work"
          name="completed_work"
          rows={4}
          minLength={2}
          maxLength={5000}
          required
          placeholder="Describe the construction activities completed..."
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="planned_work"
          className="mb-2 block text-sm font-semibold"
        >
          Planned Work / Next Activities
        </label>
        <textarea
          id="planned_work"
          name="planned_work"
          rows={3}
          maxLength={5000}
          placeholder="Describe upcoming tasks and activities..."
          className={fieldClass}
        />
      </div>

      <div>
        <label
          htmlFor="issues"
          className="mb-2 block text-sm font-semibold"
        >
          Issues / Delays
        </label>
        <textarea
          id="issues"
          name="issues"
          rows={3}
          maxLength={5000}
          placeholder="Record site issues, delays, or blockers..."
          className={fieldClass}
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="reset"
          disabled={pending}
          className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#152d4b] px-6 py-3 text-sm font-semibold text-white hover:bg-[#203e64] disabled:opacity-50"
        >
          {pending ? "Submitting..." : "Create Report"}
        </button>
      </div>
    </form>
  );
}
