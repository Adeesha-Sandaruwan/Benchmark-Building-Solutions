
"use client";

import { useActionState } from "react";
import {
  updateProgressReportAction,
  archiveProgressReportAction,
  type ReportActionState,
} from "../../actions";
import {
  reportTypes,
  reportTypeLabels,
  type ReportType,
} from "@/lib/progress-reports/types";

type EditableReport = {
  id: string;
  report_type: ReportType;
  report_date: string;
  progress_percentage: number;
  completed_work: string;
  planned_work: string;
  issues: string;
};

const initialState: ReportActionState = { error: null };

const fieldClass =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100";

export function ReportEditForm({
  report,
}: {
  report: EditableReport;
}) {
  const [editState, editAction, editing] = useActionState(
    updateProgressReportAction,
    initialState
  );

  const [archiveState, archiveAction, archiving] = useActionState(
    archiveProgressReportAction,
    initialState
  );

  return (
    <div className="space-y-6">
      <form
        action={editAction}
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="report_id" value={report.id} />

        {editState.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {editState.error}
          </p>
        )}

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
              required
              defaultValue={report.report_type}
              className={fieldClass}
            >
              {reportTypes.map((type) => (
                <option key={type} value={type}>
                  {reportTypeLabels[type]}
                </option>
              ))}
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
              defaultValue={report.report_date}
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
            defaultValue={report.progress_percentage}
            className={fieldClass}
          />
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
            defaultValue={report.completed_work}
            className={fieldClass}
          />
        </div>

        <div>
          <label
            htmlFor="planned_work"
            className="mb-2 block text-sm font-semibold"
          >
            Planned Work
          </label>

          <textarea
            id="planned_work"
            name="planned_work"
            rows={3}
            maxLength={5000}
            defaultValue={report.planned_work}
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
            defaultValue={report.issues}
            className={fieldClass}
          />
        </div>

        <button
          type="submit"
          disabled={editing || archiving}
          className="rounded-lg bg-[#152d4b] px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {editing ? "Saving..." : "Save Changes"}
        </button>
      </form>

      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Archive Progress Report
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Archiving removes this report from active lists
          without permanently deleting the database record.
        </p>

        <form action={archiveAction} className="mt-4 space-y-3">
          <input
            type="hidden"
            name="report_id"
            value={report.id}
          />

          {archiveState.error && (
            <p role="alert" className="text-sm text-red-700">
              {archiveState.error}
            </p>
          )}

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              name="confirm_archive"
              className="mt-1"
            />
            <span>
              I understand this report will be archived.
            </span>
          </label>

          <button
            type="submit"
            disabled={archiving || editing}
            className="rounded-lg border border-red-300 px-5 py-3 font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {archiving ? "Archiving..." : "Archive Report"}
          </button>
        </form>
      </section>
    </div>
  );
}
