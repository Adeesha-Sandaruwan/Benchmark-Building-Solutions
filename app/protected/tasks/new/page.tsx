
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { TaskCreateForm } from "./task-create-form";

export default async function NewTaskPage() {
  const organizations = await getOrganizationOptions();

  if (!organizations.length) {
    return (
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">
          Workspace required
        </h1>
        <p className="mt-2 text-slate-600">
          Join a workspace before creating tasks.
        </p>
        <Link
          href="/protected/join"
          className="mt-4 inline-block text-amber-700 underline"
        >
          Join workspace
        </Link>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, organization_id")
    .in(
      "organization_id",
      organizations.map((org) => org.id),
    )
    .is("archived_at", null)
    .order("name");

  if (error) {
    return (
      <p role="alert" className="text-red-600">
        Unable to load available projects.
      </p>
    );
  }

  const allowedOrganizations = new Set(
    organizations
      .filter((org) =>
        ["owner", "admin", "project_manager", "supervisor"]
          .includes(org.role),
      )
      .map((org) => org.id),
  );

  const availableProjects = (projects ?? []).filter(
    (project) =>
      allowedOrganizations.has(project.organization_id),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href="/protected/tasks"
          className="text-sm text-amber-700 hover:underline"
        >
          ← Back to Tasks
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-slate-900">
          Create New Task
        </h1>

        <p className="mt-2 text-slate-500">
          Plan and track construction project activities.
        </p>
      </header>

      {availableProjects.length ? (
        <TaskCreateForm projects={availableProjects} />
      ) : (
        <div className="rounded-xl border bg-white p-6">
          No projects are available for task creation.
        </div>
      )}
    </div>
  );
}
