
type ProjectProgress = {
    projectId: string;
    projectName: string;
    percentage: number;
    reportDate: string;
  };
  
  export type ReportSummaryData = {
    totalReports: number;
    reportingProjects: number;
    reportsWithIssues: number;
    dailyReports: number;
    weeklyReports: number;
    latestProjectProgress: ProjectProgress[];
  };
  
  type Props = {
    summary: ReportSummaryData;
    limited: boolean;
  };
  
  export function ReportSummary({
    summary,
    limited,
  }: Props) {
    const stats = [
      {
        label: "Total Reports",
        value: summary.totalReports,
      },
      {
        label: "Reporting Projects",
        value: summary.reportingProjects,
      },
      {
        label: "Daily Reports",
        value: summary.dailyReports,
      },
      {
        label: "Weekly Reports",
        value: summary.weeklyReports,
      },
      {
        label: "Reports With Issues",
        value: summary.reportsWithIssues,
      },
    ];
  
    return (
      <section className="space-y-5">
        <div>
          <h2 className="text-xl font-semibold text-[#152d4b]">
            Progress Overview
          </h2>
  
          <p className="mt-1 text-sm text-slate-500">
            Summary of reports matching your selected filters.
          </p>
        </div>
  
        {limited && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Showing a maximum of 200 reports. Summary values
            may not include older matching records.
          </p>
        )}
  
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {stat.label}
              </p>
  
              <p className="mt-3 text-3xl font-bold text-[#152d4b]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
  
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-[#152d4b]">
            Latest Reported Progress by Project
          </h3>
  
          <p className="mt-1 text-sm text-slate-500">
            Latest report percentage for each project
            in the filtered results.
          </p>
  
          {summary.latestProjectProgress.length === 0 ? (
            <p className="mt-5 text-sm text-slate-500">
              No project progress reports available.
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              {summary.latestProjectProgress.map((project) => (
                <div key={project.projectId}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-[#152d4b]">
                        {project.projectName}
                      </h4>
  
                      <p className="text-xs text-slate-500">
                        Latest report: {project.reportDate}
                      </p>
                    </div>
  
                    <span className="font-semibold text-[#152d4b]">
                      {project.percentage}%
                    </span>
                  </div>
  
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-200"
                    role="progressbar"
                    aria-label={`${project.projectName} reported progress`}
                    aria-valuenow={project.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{
                        width: `${project.percentage}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    );
  }
  