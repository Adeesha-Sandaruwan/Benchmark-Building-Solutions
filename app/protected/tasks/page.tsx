
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  Search,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import {
  taskStatuses,
  taskStatusLabels,
  taskPriorityLabels,
  type TaskStatus,
  type TaskPriority,
} from "@/lib/tasks/types";
import { updateTaskStatusAction } from "./actions";

type SearchParams = {
  q?: string;
  project?: string;
  status?: string;
};

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-blue-50 text-blue-700",
  blocked: "bg-red-50 text-red-700",
  completed: "bg-emerald-50 text-emerald-700",
};

const priorityStyles: Record<TaskPriority, string> = {
  low: "text-slate-600",
  medium: "text-blue-700",
  high: "text-orange-700",
  critical: "text-red-700",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const organizations = await getOrganizationOptions();
  const organization = organizations[0];

  if (!organization) {
    return (
      <section className="rounded-xl border bg-white p-8">
        <h1 className="text-2xl font-semibold text-[#152d4b]">
          Workspace Required
        </h1>
        <p className="mt-2 text-slate-500">
          Join a workspace to manage construction tasks.
        </p>
        <Link
          href="/protected/join"
          className="mt-5 inline-block text-amber-700 underline"
        >
          Join a workspace
        </Link>
      </section>
    );
  }

  const supabase = await createClient();

  const { data: projects, error: projectsError } =
    await supabase
      .from("projects")
      .select("id, name")
      .eq("organization_id", organization.id)
      .is("archived_at", null)
      .order("name");

  if (projectsError) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
        Unable to load projects.
      </p>
    );
  }

  const projectOptions = projects ?? [];

  const selectedProject = projectOptions.some(
    (project) => project.id === params.project,
  )
    ? params.project!
    : "";

  const selectedStatus = taskStatuses.includes(
    params.status as TaskStatus,
  )
    ? (params.status as TaskStatus)
    : "";

  const search = (params.q ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .slice(0, 80);

  let query = supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, due_date, project_id, created_at",
    )
    .eq("organization_id", organization.id)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .limit(100);

  if (selectedProject) {
    query = query.eq("project_id", selectedProject);
  }

  if (selectedStatus) {
    query = query.eq("status", selectedStatus);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data: tasks, error: tasksError } = await query;

  const projectNames = new Map(
    projectOptions.map((project) => [
      project.id,
      project.name,
    ]),
  );

  const canManage = [
    "owner",
    "admin",
    "project_manager",
    "supervisor",
  ].includes(organization.role);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-700">
            {organization.name}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-[#152d4b]">
            Task Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track and manage construction project activities.
          </p>
        </div>

        {canManage && (
          <Link
            href="/protected/tasks/new"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#152d4b] px-5 text-sm font-semibold text-white hover:bg-[#203e64]"
          >
            <Plus size={17} />
            Create Task
          </Link>
        )}
      </header>

      <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_1fr_auto]">
        <label className="relative">
          <span className="sr-only">Search tasks</span>
          <Search
            size={17}
            className="absolute left-3 top-3.5 text-slate-400"
          />
          <input
            name="q"
            defaultValue={search}
            placeholder="Search tasks"
            className="h-11 w-full rounded-lg border border-slate-300 pl-10 pr-3"
          />
        </label>

        <select
          name="project"
          aria-label="Filter by project"
          defaultValue={selectedProject}
          className="h-11 rounded-lg border border-slate-300 bg-white px-3"
        >
          <option value="">All Projects</option>
          {projectOptions.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          name="status"
          aria-label="Filter by status"
          defaultValue={selectedStatus}
          className="h-11 rounded-lg border border-slate-300 bg-white px-3"
        >
          <option value="">All Statuses</option>
          {taskStatuses.map((status) => (
            <option key={status} value={status}>
              {taskStatusLabels[status]}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="h-11 rounded-lg border border-slate-300 px-5 font-medium hover:bg-slate-50"
        >
          Apply
        </button>
      </form>

      {tasksError ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          Unable to load tasks. Check database migrations
          and access permissions.
        </div>
      ) : !tasks?.length ? (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <ClipboardList
            size={36}
            className="mx-auto text-slate-400"
          />
          <h2 className="mt-4 text-xl font-semibold text-[#152d4b]">
            No tasks found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create your first task or adjust the filters.
          </p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-[#152d4b]">
              Construction Tasks
            </h2>
            <p className="text-xs text-slate-500">
              Showing up to 100 matching tasks
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {tasks.map((task) => (
              <article
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5 hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="font-semibold text-[#152d4b]">
                    {task.title}
                  </h3>

                  <p className="text-sm text-slate-500">
                    {projectNames.get(task.project_id) ??
                      "Accessible project"}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span
                      className={`rounded-full px-2.5 py-1 font-semibold ${
                        statusStyles[task.status as TaskStatus] ??
                        "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {taskStatusLabels[
                        task.status as TaskStatus
                      ] ?? task.status}
                    </span>

                    <span
                      className={`font-semibold ${
                        priorityStyles[task.priority as TaskPriority] ??
                        "text-slate-600"
                      }`}
                    >
                      {taskPriorityLabels[
                        task.priority as TaskPriority
                      ] ?? task.priority}
                    </span>

                    {task.due_date && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <CalendarDays size={14} />
                        Due {task.due_date}
                      </span>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/protected/tasks/${task.id}/edit`}
                      className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-4 text-sm font-medium text-[#152d4b] hover:bg-slate-100"
                    >
                      Edit Task
                    </Link>
                    <form
                      action={updateTaskStatusAction}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="hidden"
                      name="task_id"
                      value={task.id}
                    />

                    <select
                      name="status"
                      aria-label={`Change status for ${task.title}`}
                      defaultValue={task.status}
                      className="h-10 rounded-lg border border-slate-300 bg-white px-2 text-sm"
                    >
                      {taskStatuses.map((status) => (
                        <option key={status} value={status}>
                          {taskStatusLabels[status]}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="h-10 rounded-lg bg-[#152d4b] px-4 text-sm font-medium text-white hover:bg-[#203e64]"
                    >
                      Save
                    </button>
                    </form>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
