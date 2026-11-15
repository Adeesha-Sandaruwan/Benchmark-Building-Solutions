
"use client";

import { useActionState } from "react";
import {
  updateTaskAction,
  archiveTaskAction,
  type TaskActionState,
} from "../../actions";
import {
  taskPriorities,
  taskPriorityLabels,
  type TaskPriority,
} from "@/lib/tasks/types";

type EditableTask = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  assigned_worker_id: string | null;
  start_date: string | null;
  due_date: string | null;
};

type Worker = {
  id: string;
  full_name: string;
};

const initialState: TaskActionState = { error: null };

export function TaskEditForm({
  task,
  workers,
}: {
  task: EditableTask;
  workers: Worker[];
}) {
  const [state, action, pending] = useActionState(
    updateTaskAction,
    initialState
  );

  const fieldClass =
    "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <form action={action} className="space-y-5">
        <input type="hidden" name="task_id" value={task.id} />

        {state.error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </p>
        )}

        <div>
          <label htmlFor="title" className="mb-2 block font-medium">
            Task Title *
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={2}
            maxLength={150}
            defaultValue={task.title}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-2 block font-medium">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={task.description}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="priority" className="mb-2 block font-medium">
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            defaultValue={task.priority}
            className={fieldClass}
          >
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>
                {taskPriorityLabels[priority]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="assigned_worker_id"
            className="mb-2 block font-medium"
          >
            Assign Worker
          </label>
          <select
            id="assigned_worker_id"
            name="assigned_worker_id"
            defaultValue={task.assigned_worker_id ?? ""}
            className={fieldClass}
          >
            <option value="">Unassigned</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.full_name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-slate-500">
            Only active project workers are available.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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
              defaultValue={task.start_date ?? ""}
              className={fieldClass}
            />
          </div>

          <div>
            <label htmlFor="due_date" className="mb-2 block font-medium">
              Due Date
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              defaultValue={task.due_date ?? ""}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="border-t pt-5">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-[#152d4b] px-6 py-3 font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <div className="mt-8 border-t border-red-100 pt-5">
        <h2 className="font-semibold text-red-700">
          Archive Task
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Remove this task from active task lists without deleting its record.
        </p>

        <form action={archiveTaskAction} className="mt-3">
          <input type="hidden" name="task_id" value={task.id} />
          <button
            type="submit"
            className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Archive Task
          </button>
        </form>
      </div>
    </div>
  );
}
