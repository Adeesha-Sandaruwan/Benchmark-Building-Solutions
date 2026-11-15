
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import {
  ReportFilters,
  type ReportFiltersValue,
} from "./report-filters";
import {
  ReportSummary,
  type ReportSummaryData,
} from "./report-summary";

const managerRoles = [
  "owner",
  "admin",
  "project_manager",
  "supervisor",
];

type SearchParams = {
  search?: string | string[];
  project?: string | string[];
  type?: string | string[];
  from?: string | string[];
  to?: string | string[];
};

function firstValue(value?: string | string[]) {
  return typeof value === "string" ? value : "";
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function ProgressReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  // Read filters from the URL.
  const requestedFilters: ReportFiltersValue = {
    search: firstValue(params.search).trim().slice(0, 100),
    project: firstValue(params.project),
    type: firstValue(params.type),
    from: firstValue(params.from),
    to: firstValue(params.to),
  };

  // Load organizations available to this user.
  const organizations = await getOrganizationOptions();

  if (!organizations.length) {
    return (
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-semibold text-[#152d4b]">
          Workspace Required
        </h1>

        <p className="mt-2 text-slate-500">
          Join a workspace before viewing progress reports.
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

  const organizationIds = organizations.map((org) => org.id);

  const editableOrganizationIds = new Set(
    organizations
      .filter((org) => managerRoles.includes(org.role))
      .map((org) => org.id)
  );

  const supabase = await createClient();

  // Load accessible construction projects.
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, organization_id, name")
    .in("organization_id", organizationIds)
    .is("archived_at", null)
    .order("name");

  if (projectsError) {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700"
      >
        Unable to load construction projects.
      </p>
    );
  }

  const projectOptions = (projects ?? []).map((project) => ({
    id: project.id,
    name: project.name,
  }));

  const projectNames = new Map(
    (projects ?? []).map((project) => [
      `${project.organization_id}:${project.id}`,
      project.name,
    ])
  );

  const accessibleProjectIds = new Set(
    (projects ?? []).map((project) => project.id)
  );

  // Normalize and validate filter values.
  const filters: ReportFiltersValue = {
    search: requestedFilters.search,
    project: accessibleProjectIds.has(requestedFilters.project)
      ? requestedFilters.project
      : "",
    type: ["daily", "weekly"].includes(requestedFilters.type)
      ? requestedFilters.type
      : "",
    from: validDate(requestedFilters.from)
      ? requestedFilters.from
      : "",
    to: validDate(requestedFilters.to)
      ? requestedFilters.to
      : "",
  };

  const invalidDateRange = Boolean(
    filters.from && filters.to && filters.from > filters.to
  );

  // Build a Supabase query using approved filter values.
  let query = supabase
    .from("progress_reports")
    .select(
      "id, organization_id, project_id, report_type, report_date, progress_percentage, completed_work, planned_work, issues, created_at"
    )
    .in("organization_id", organizationIds)
    .is("archived_at", null);

  if (filters.project) {
    query = query.eq("project_id", filters.project);
  }

  if (filters.type) {
    query = query.eq("report_type", filters.type);
  }

  if (filters.from) {
    query = query.gte("report_date", filters.from);
  }

  if (filters.to) {
    query = query.lte("report_date", filters.to);
  }

  if (filters.search) {
    query = query.ilike(
      "completed_work",
      `%${escapeLike(filters.search)}%`
    );
  }

  // Limit the initial dashboard result set.
  const { data: reports, error: reportsError } = invalidDateRange
    ? { data: [], error: null }
    : await query
        .order("report_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);

  const visibleReports = reports ?? [];

  // Create dashboard statistics from filtered reports.
  const latestByProject = new Map<
    string,
    {
      projectId: string;
      projectName: string;
      percentage: number;
      reportDate: string;
    }
  >();

  for (const report of visibleReports) {
    const key = `${report.organization_id}:${report.project_id}`;

    // Query is sorted newest first.
    if (!latestByProject.has(key)) {
      latestByProject.set(key, {
        projectId: key,
        projectName:
          projectNames.get(key) ?? "Construction Project",
        percentage: report.progress_percentage,
        reportDate: report.report_date,
      });
    }
  }

  const summary: ReportSummaryData = {
    totalReports: visibleReports.length,

    reportingProjects: latestByProject.size,

    dailyReports: visibleReports.filter(
      (report) => report.report_type === "daily"
    ).length,

    weeklyReports: visibleReports.filter(
      (report) => report.report_type === "weekly"
    ).length,

    reportsWithIssues: visibleReports.filter(
      (report) => report.issues.trim().length > 0
    ).length,

    latestProjectProgress: Array.from(
      latestByProject.values()
    ),
  };

  const canCreateReports = editableOrganizationIds.size > 0;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#152d4b]">
            Progress Reports
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor construction activities, reporting
            history, and project progress.
          </p>
        </div>

        {canCreateReports && (
          <Link
            href="/protected/progress-reports/new"
            className="rounded-lg bg-[#152d4b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#203e64]"
          >
            + Create Report
          </Link>
        )}
      </header>

      {/* Search and filters */}
      <ReportFilters
        projects={projectOptions}
        filters={filters}
      />

      {invalidDateRange ? (
        <p
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-800"
        >
          The From Date cannot be later than the To Date.
        </p>
      ) : reportsError ? (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700"
        >
          Unable to load reports. Check database migrations
          and Supabase access permissions.
        </p>
      ) : (
        <>
          {/* Dashboard summary */}
          <ReportSummary
            summary={summary}
            limited={visibleReports.length === 200}
          />

          {/* Reports list */}
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[#152d4b]">
                Report History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {visibleReports.length} matching reports shown
              </p>
            </div>

            {visibleReports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h3 className="text-lg font-semibold text-[#152d4b]">
                  No matching progress reports
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your filters or create
                  a new progress report.
                </p>

                <Link
                  href="/protected/progress-reports"
                  className="mt-4 inline-block text-amber-700 underline"
                >
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {visibleReports.map((report) => {
                  const projectKey =
                    `${report.organization_id}:${report.project_id}`;

                  const projectName =
                    projectNames.get(projectKey) ??
                    "Construction Project";

                  const canEdit = editableOrganizationIds.has(
                    report.organization_id
                  );

                  return (
                    <article
                      key={report.id}
                      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                            {report.report_type === "daily"
                              ? "Daily Report"
                              : "Weekly Report"}
                          </p>

                          <h3 className="mt-2 text-lg font-semibold text-[#152d4b]">
                            {projectName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {report.report_date}
                          </p>
                        </div>

                        <span className="text-2xl font-bold text-[#152d4b]">
                          {report.progress_percentage}%
                        </span>
                      </div>

                      {/* Reported progress */}
                      <div
                        className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
                        role="progressbar"
                        aria-label={`${projectName} reported progress`}
                        aria-valuenow={report.progress_percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <div
                          className="h-full rounded-full bg-amber-500"
                          style={{
                            width: `${report.progress_percentage}%`,
                          }}
                        />
                      </div>

                      {/* Completed work */}
                      <div className="mt-5">
                        <h4 className="text-sm font-semibold text-[#152d4b]">
                          Completed Work
                        </h4>

                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                          {report.completed_work}
                        </p>
                      </div>

                      {/* Reported issues */}
                      {report.issues.trim() && (
                        <div className="mt-4 rounded-lg bg-amber-50 p-3">
                          <h4 className="text-sm font-semibold text-amber-900">
                            Issues / Delays
                          </h4>

                          <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-sm text-amber-800">
                            {report.issues}
                          </p>
                        </div>
                      )}

                      {/* Edit report */}
                      {canEdit && (
                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <Link
                            href={`/protected/progress-reports/${report.id}/edit`}
                            className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#152d4b] hover:bg-slate-50"
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
          </section>
        </>
      )}
    </div>
  );
}
