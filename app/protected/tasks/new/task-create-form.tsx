
"use client";

import { useActionState } from "react";
import {
  createTaskAction,
  type TaskActionState,
} from "../actions";

type ProjectOption = {
  id: string;
  name: string;
  organization_id: string;
};

const initialState: TaskActionState = {
  error: null,
};

export function TaskCreateForm({
  projects,
}: {
  projects: ProjectOption[];
}) {
  const [state, action, pending] = useActionState(
    createTaskAction,
    initialState,
  );

  const inputClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100";

  return (
    <form
      action={action}
      className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state.error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="project_id"
          className="mb-2 block font-medium"
        >
          Construction Project *
        </label>
        <select
          id="project_id"
          name="project_id"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            Select a project
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block font-medium"
        >
          Task Title *
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={2}
          maxLength={150}
          placeholder="e.g. Complete foundation excavation"
          className={inputClass}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-medium"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={5000}
          placeholder="Describe the construction activity..."
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="priority"
            className="mb-2 block font-medium"
          >
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue="medium"
            className={inputClass}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="start_date"
            className="mb-2 block font-medium"
          >
            Start Date
          </label>
          <input
            id="start_date"
            name="start_date"
            type="date"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="due_date"
            className="mb-2 block font-medium"
          >
            Due Date
          </label>
          <input
            id="due_date"
            name="due_date"
            type="date"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3 border-t pt-5">
        <button
          type="reset"
          disabled={pending}
          className="rounded-lg border px-5 py-3"
        >
          Reset
        </button>

        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-[#152d4b] px-6 py-3 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
