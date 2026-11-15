
import Link from "next/link";

export type ReportFiltersValue = {
  search: string;
  project: string;
  type: string;
  from: string;
  to: string;
};

type ProjectOption = {
  id: string;
  name: string;
};

type ReportFiltersProps = {
  projects: ProjectOption[];
  filters: ReportFiltersValue;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-100";

export function ReportFilters({
  projects,
  filters,
}: ReportFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[#152d4b]">
          Search & Filter Reports
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Find construction updates by project,
          report type, or reporting date.
        </p>
      </div>

      <form
        method="GET"
        action="/protected/progress-reports"
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="search"
            className="mb-2 block text-sm font-medium"
          >
            Search Completed Work
          </label>

          <input
            id="search"
            name="search"
            type="search"
            defaultValue={filters.search}
            maxLength={100}
            placeholder="Search construction activities..."
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label
              htmlFor="project"
              className="mb-2 block text-sm font-medium"
            >
              Project
            </label>

            <select
              id="project"
              name="project"
              defaultValue={filters.project}
              className={inputClass}
            >
              <option value="">All Projects</option>

              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="type"
              className="mb-2 block text-sm font-medium"
            >
              Report Type
            </label>

            <select
              id="type"
              name="type"
              defaultValue={filters.type}
              className={inputClass}
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="from"
              className="mb-2 block text-sm font-medium"
            >
              From Date
            </label>

            <input
              id="from"
              name="from"
              type="date"
              defaultValue={filters.from}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="to"
              className="mb-2 block text-sm font-medium"
            >
              To Date
            </label>

            <input
              id="to"
              name="to"
              type="date"
              defaultValue={filters.to}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <button
            type="submit"
            className="rounded-lg bg-[#152d4b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#203e64]"
          >
            Apply Filters
          </button>

          <Link
            href="/protected/progress-reports"
            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </Link>
        </div>
      </form>
    </section>
  );
}
