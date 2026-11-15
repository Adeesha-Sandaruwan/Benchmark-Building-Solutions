
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

const managerRoles = [
  "owner",
  "admin",
  "project_manager",
  "supervisor",
];

export default async function ProgressReportsPage() {
  // Step 1: Load organizations accessible to the user.
  const organizations = await getOrganizationOptions();

  if (!organizations.length) {
    return (
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#152d4b]">
          Workspace Required
        </h1>

        <p className="mt-2 text-slate-500">
          Join a workspace to view progress reports.
        </p>

        <Link
          href="/protected/join"
          className="mt-3 inline-block text-amber-700 underline"
        >
          Join Workspace
        </Link>
      </section>
    );
  }

  // Step 2: Find organizations where the user
  // has permission to manage progress reports.
  const editableOrganizationIds = new Set(
    organizations
      .filter((organization) =>
        managerRoles.includes(organization.role)
      )
      .map((organization) => organization.id)
  );

  const supabase = await createClient();

  // Step 3: Load active progress reports.
  const { data: reports, error: reportsError } = await supabase
    .from("progress_reports")
    .select(
      "id, organization_id, project_id, report_type, report_date, progress_percentage, completed_work"
    )
    .in(
      "organization_id",
      organizations.map((organization) => organization.id)
    )
    .is("archived_at", null)
    .order("report_date", { ascending: false })
    .limit(50);

  // Step 4: Load construction projects.
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, organization_id, name")
    .in(
      "organization_id",
      organizations.map((organization) => organization.id)
    );

  const projectNames = new Map(
    (projects ?? []).map((project) => [
      `${project.organization_id}:${project.id}`,
      project.name,
    ])
  );

  const canCreateReports = editableOrganizationIds.size > 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#152d4b]">
            Progress Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track construction progress, completed activities,
            and project updates.
          </p>
        </div>

        {canCreateReports && (
          <Link
            href="/protected/progress-reports/new"
            className="inline-flex items-center rounded-lg bg-[#152d4b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#203e64]"
          >
            + Create Report
          </Link>
        )}
      </header>

      {/* Database error */}
      {reportsError || projectsError ? (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-semibold text-red-700">
            Unable to load progress reports
          </h2>

          <p className="mt-2 text-sm text-red-600">
            Please check the database migration,
            project access, and Supabase permissions.
          </p>
        </section>
      ) : !reports?.length ? (
        /* Empty reports state */
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-xl font-semibold text-[#152d4b]">
            No progress reports found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Reports will appear here once they are submitted.
          </p>

          {canCreateReports && (
            <Link
              href="/protected/progress-reports/new"
              className="mt-5 inline-flex rounded-lg bg-[#152d4b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#203e64]"
            >
              Create First Report
            </Link>
          )}
        </section>
      ) : (
        /* Reports cards */
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => {
            const canEdit = editableOrganizationIds.has(
              report.organization_id
            );

            const projectName =
              projectNames.get(
                `${report.organization_id}:${report.project_id}`
              ) ?? "Construction Project";

            return (
              <article
                key={report.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                {/* Report information */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                      {report.report_type === "daily"
                        ? "Daily Report"
                        : report.report_type === "weekly"
                        ? "Weekly Report"
                        : "Progress Report"}
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-[#152d4b]">
                      {projectName}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Report Date: {report.report_date}
                    </p>
                  </div>

                  <span className="text-2xl font-bold text-[#152d4b]">
                    {report.progress_percentage}%
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
                  role="progressbar"
                  aria-label={`${projectName} reported progress`}
                  aria-valuenow={report.progress_percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all"
                    style={{
                      width: `${report.progress_percentage}%`,
                    }}
                  />
                </div>

                {/* Completed work */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-[#152d4b]">
                    Completed Work
                  </h3>

                  <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                    {report.completed_work}
                  </p>
                </div>

                {/* Edit button - authorized roles only */}
                {canEdit && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <Link
                      href={`/protected/progress-reports/${report.id}/edit`}
                      className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#152d4b] transition hover:bg-slate-50"
                    >
                      Edit Report
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
