
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { TaskEditForm } from "./task-edit-form";
import type {
  TaskPriority,
} from "@/lib/tasks/types";

export default async function EditTaskPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = await params;
  const supabase = await createClient();

  const { data: task, error } = await supabase
    .from("tasks")
    .select(
      "id, organization_id, project_id, title, description, priority, assigned_worker_id, start_date, due_date"
    )
    .eq("id", taskId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !task) notFound();

  const organizations = await getOrganizationOptions();
  const canManage = organizations.some(
    (org) =>
      org.id === task.organization_id &&
      ["owner", "admin", "project_manager", "supervisor"]
        .includes(org.role)
  );

  if (!canManage) notFound();

  const { data: assignments, error: assignmentError } =
    await supabase
      .from("project_worker_assignments")
      .select("worker_id")
      .eq("project_id", task.project_id)
      .eq("organization_id", task.organization_id)
      .is("removed_at", null);

  if (assignmentError) {
    return <p role="alert">Unable to load worker assignments.</p>;
  }

  const workerIds = (assignments ?? []).map(
    (assignment) => assignment.worker_id
  );

  const { data: workers, error: workersError } =
    workerIds.length
      ? await supabase
          .from("workers")
          .select("id, full_name")
          .in("id", workerIds)
          .eq("organization_id", task.organization_id)
          .eq("employment_status", "active")
          .is("archived_at", null)
          .order("full_name")
      : {
          data: [] as { id: string; full_name: string }[],
          error: null,
        };

  if (workersError) {
    return <p role="alert">Unable to load workers.</p>;
  }

  const selectedWorkerStillActive = (workers ?? []).some(
    (worker) => worker.id === task.assigned_worker_id
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/protected/tasks"
        className="text-sm font-medium text-amber-700"
      >
        ← Back to Tasks
      </Link>

      <header>
        <h1 className="text-3xl font-semibold text-[#152d4b]">
          Edit Task
        </h1>
        <p className="mt-2 text-slate-500">
          Update task details and worker assignment.
        </p>
      </header>

      <TaskEditForm
        task={{
          ...task,
          priority: task.priority as TaskPriority,
          assigned_worker_id: selectedWorkerStillActive
            ? task.assigned_worker_id
            : null,
        }}
        workers={workers ?? []}
      />
    </div>
  );
}
