
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function ProgressReportsPage() {
  const organizations = await getOrganizationOptions();

  if (!organizations.length) {
    return (
      <section className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-semibold">
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

  const supabase = await createClient();

  const { data: reports, error } = await supabase
    .from("progress_reports")
    .select(
      "id, project_id, report_type, report_date, progress_percentage, completed_work"
    )
    .in(
      "organization_id",
      organizations.map((org) => org.id),
    )
    .is("archived_at", null)
    .order("report_date", { ascending: false })
    .limit(50);

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .in(
      "organization_id",
      organizations.map((org) => org.id),
    );

  const projectNames = new Map(
    (projects ?? []).map((project) => [
      project.id,
      project.name,
    ]),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-[#152d4b]">
            Progress Reports
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track construction progress and site updates.
          </p>
        </div>

        <Link
          href="/protected/progress-reports/new"
          className="rounded-lg bg-[#152d4b] px-5 py-3 text-sm font-semibold text-white"
        >
          + Create Report
        </Link>
      </header>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">
          Unable to load reports. Check migrations and access permissions.
        </p>
      ) : !reports?.length ? (
        <section className="rounded-xl border border-dashed bg-white p-10 text-center">
          <h2 className="text-xl font-semibold">
            No progress reports found
          </h2>
          <p className="mt-2 text-slate-500">
            Reports will appear here once they are submitted.
          </p>
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-700">
                    {report.report_type} report
                  </p>
                  <h2 className="mt-1 font-semibold text-[#152d4b]">
                    {projectNames.get(report.project_id) ??
                      "Project"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {report.report_date}
                  </p>
                </div>

                <span className="text-xl font-bold text-[#152d4b]">
                  {report.progress_percentage}%
                </span>
              </div>

              <div
                className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"
                role="progressbar"
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

              <p className="mt-4 line-clamp-3 whitespace-pre-wrap text-sm text-slate-600">
                {report.completed_work}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
