
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { ReportEditForm } from "./report-edit-form";
import { reportTypes, type ReportType } from "@/lib/progress-reports/types";

export default async function EditProgressReportPage({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  const supabase = await createClient();

  const { data: report, error } = await supabase
    .from("progress_reports")
    .select(
      "id, organization_id, project_id, report_type, report_date, progress_percentage, completed_work, planned_work, issues"
    )
    .eq("id", reportId)
    .is("archived_at", null)
    .maybeSingle();

  if (error || !report) {
    notFound();
  }

  const organizations = await getOrganizationOptions();

  const canManage = organizations.some(
    (organization) =>
      organization.id === report.organization_id &&
      ["owner", "admin", "project_manager", "supervisor"]
        .includes(organization.role),
  );

  if (!canManage) {
    notFound();
  }

  if (!reportTypes.some((type) => type === report.report_type)) {
    notFound();
  }

  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", report.project_id)
    .eq("organization_id", report.organization_id)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/protected/progress-reports"
        className="text-sm font-medium text-amber-700 hover:underline"
      >
        ← Back to Progress Reports
      </Link>

      <header>
        <h1 className="text-3xl font-semibold text-[#152d4b]">
          Edit Progress Report
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Project: {project?.name ?? "Construction Project"}
        </p>
      </header>

      <ReportEditForm
        report={{
          ...report,
          report_type: report.report_type as ReportType,
        }}
      />
    </div>
  );
}
