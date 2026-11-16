import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { ProgressReportForm } from "./progress-report-form";

const reportRoles = ["owner", "admin", "project_manager", "supervisor"];

export default async function NewProgressReportPage() {
  const organizations = await getOrganizationOptions();

  if (!organizations.length) {
    return (
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-xl font-semibold">Workspace Required</h1>
        <p className="mt-2 text-slate-500">
          Join a workspace before creating progress reports.
        </p>
        <Link
          href="/protected/join"
          className="mt-4 inline-block text-amber-700 underline"
        >
          Join Workspace
        </Link>
      </section>
    );
  }

  const allowedOrganizations = organizations.filter((org) =>
    reportRoles.includes(org.role)
  );

  if (!allowedOrganizations.length) {
    return (
      <p className="rounded-xl border bg-white p-6">
        You do not have permission to create reports.
      </p>
    );
  }

  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, organization_id")
    .in(
      "organization_id",
      allowedOrganizations.map((org) => org.id)
    )
    .is("archived_at", null)
    .order("name");

  if (error) {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
        Unable to load construction projects.
      </p>
    );
  }

  const organizationNames = new Map(
    allowedOrganizations.map((org) => [org.id, org.name])
  );

  const projectOptions = (projects ?? []).map((project) => ({
    id: project.id,
    name: project.name,
    organizationName:
      organizationNames.get(project.organization_id) ?? "Workspace",
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          href="/protected/progress-reports"
          className="text-sm font-medium text-amber-700 hover:underline"
        >
          ← Back to Progress Reports
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-[#152d4b]">
          Create Progress Report
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Record completed work, upcoming activities, challenges, and overall
          project progress.
        </p>
      </header>

      {projectOptions.length > 0 ? (
        <ProgressReportForm projects={projectOptions} />
      ) : (
        <section className="rounded-xl border bg-white p-6">
          <p className="text-slate-600">
            No accessible active projects are available.
          </p>
          <Link
            href="/protected/projects"
            className="mt-3 inline-block text-amber-700 underline"
          >
            View Projects
          </Link>
        </section>
      )}
    </div>
  );
}
