
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import { reportTypes } from "@/lib/progress-reports/types";

export type ReportActionState = {
  error: string | null;
};

const managerRoles = [
  "owner",
  "admin",
  "project_manager",
  "supervisor",
];

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function getValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export async function createProgressReportAction(
  _previousState: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const projectId = getValue(formData, "project_id");
  const reportType = getValue(formData, "report_type");
  const reportDate = getValue(formData, "report_date");
  const progressInput = getValue(
    formData,
    "progress_percentage",
  );

  const completedWork = getValue(
    formData,
    "completed_work",
  );
  const plannedWork = getValue(
    formData,
    "planned_work",
  );
  const issues = getValue(formData, "issues");

  // Validate all user inputs.
  if (!uuidPattern.test(projectId)) {
    return { error: "Select a valid construction project." };
  }

  if (!reportTypes.some((type) => type === reportType)) {
    return { error: "Invalid report type." };
  }

  if (!validDate(reportDate)) {
    return { error: "Enter a valid report date." };
  }

  if (!/^\d{1,3}$/.test(progressInput)) {
    return { error: "Progress must be a whole number." };
  }

  const progressPercentage = Number(progressInput);

  if (
    !Number.isInteger(progressPercentage) ||
    progressPercentage < 0 ||
    progressPercentage > 100
  ) {
    return { error: "Progress must be between 0 and 100." };
  }

  if (
    completedWork.length < 2 ||
    completedWork.length > 5000
  ) {
    return {
      error: "Completed work must contain 2–5000 characters.",
    };
  }

  if (plannedWork.length > 5000 || issues.length > 5000) {
    return {
      error: "Planned work and issues must be under 5000 characters.",
    };
  }

  // Confirm authenticated session.
  const supabase = await createClient();

  const { data: auth, error: authError } =
    await supabase.auth.getClaims();

  const userId = auth?.claims?.sub;

  if (authError || !userId) {
    return { error: "Please sign in again." };
  }

  // Fetch the selected project through its RLS policy.
  const { data: project, error: projectError } =
    await supabase
      .from("projects")
      .select("id, organization_id")
      .eq("id", projectId)
      .is("archived_at", null)
      .maybeSingle();

  if (projectError || !project) {
    return {
      error: "Project not found or access denied.",
    };
  }

  // Confirm the user's organization role.
  const organizations = await getOrganizationOptions();

  const canCreate = organizations.some(
    (organization) =>
      organization.id === project.organization_id &&
      managerRoles.includes(organization.role),
  );

  if (!canCreate) {
    return {
      error: "You don't have permission to submit reports.",
    };
  }

  // Insert into the real Supabase database.
  const { error } = await supabase
    .from("progress_reports")
    .insert({
      organization_id: project.organization_id,
      project_id: projectId,
      report_type: reportType,
      report_date: reportDate,
      progress_percentage: progressPercentage,
      completed_work: completedWork,
      planned_work: plannedWork,
      issues,
      created_by: userId,
    });

  if (error) {
    console.error("Progress report creation failed:", {
      code: error.code,
      message: error.message,
    });

    return {
      error: "Unable to save report. Check database setup and permissions.",
    };
  }

  revalidatePath("/protected/progress-reports");
  revalidatePath("/protected");

  redirect("/protected/progress-reports");
}



export async function updateProgressReportAction(
    _previousState: ReportActionState,
    formData: FormData,
  ): Promise<ReportActionState> {
    const reportId = getValue(formData, "report_id");
    const reportType = getValue(formData, "report_type");
    const reportDate = getValue(formData, "report_date");
    const percentage = getValue(formData, "progress_percentage");
    const completedWork = getValue(formData, "completed_work");
    const plannedWork = getValue(formData, "planned_work");
    const issues = getValue(formData, "issues");
  
    if (!uuidPattern.test(reportId)) {
      return { error: "Invalid report ID." };
    }
  
    if (!reportTypes.some((type) => type === reportType)) {
      return { error: "Invalid report type." };
    }
  
    if (!validDate(reportDate)) {
      return { error: "Invalid report date." };
    }
  
    if (!/^\d{1,3}$/.test(percentage)) {
      return { error: "Progress must be a whole number." };
    }
  
    const progress = Number(percentage);
  
    if (progress < 0 || progress > 100) {
      return { error: "Progress must be between 0 and 100." };
    }
  
    if (completedWork.length < 2 || completedWork.length > 5000) {
      return { error: "Completed work must contain 2–5000 characters." };
    }
  
    if (plannedWork.length > 5000 || issues.length > 5000) {
      return { error: "Text fields must be under 5000 characters." };
    }
  
    const supabase = await createClient();
  
    const { data: auth, error: authError } =
      await supabase.auth.getClaims();
  
    if (authError || !auth?.claims?.sub) {
      return { error: "Please sign in again." };
    }
  
    const { data: report, error: readError } = await supabase
      .from("progress_reports")
      .select("id, organization_id, project_id")
      .eq("id", reportId)
      .is("archived_at", null)
      .maybeSingle();
  
    if (readError || !report) {
      return { error: "Report not found or access denied." };
    }
  
    const organizations = await getOrganizationOptions();
  
    const canManage = organizations.some(
      (organization) =>
        organization.id === report.organization_id &&
        managerRoles.includes(organization.role),
    );
  
    if (!canManage) {
      return { error: "You cannot edit this report." };
    }
  
    const { data: updated, error } = await supabase
      .from("progress_reports")
      .update({
        report_type: reportType,
        report_date: reportDate,
        progress_percentage: progress,
        completed_work: completedWork,
        planned_work: plannedWork,
        issues,
      })
      .eq("id", reportId)
      .eq("organization_id", report.organization_id)
      .eq("project_id", report.project_id)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();
  
    if (error || !updated) {
      return { error: "Unable to update report." };
    }
  
    revalidatePath("/protected/progress-reports");
    revalidatePath(`/protected/progress-reports/${reportId}/edit`);
  
    redirect("/protected/progress-reports");
  }
  
  export async function archiveProgressReportAction(
    _previousState: ReportActionState,
    formData: FormData,
  ): Promise<ReportActionState> {
    const reportId = getValue(formData, "report_id");
  
    if (!uuidPattern.test(reportId)) {
      return { error: "Invalid report ID." };
    }
  
    const supabase = await createClient();
  
    const { data: auth, error: authError } =
      await supabase.auth.getClaims();
  
    if (authError || !auth?.claims?.sub) {
      return { error: "Please sign in again." };
    }
  
    const { data: report, error: readError } = await supabase
      .from("progress_reports")
      .select("id, organization_id, project_id")
      .eq("id", reportId)
      .is("archived_at", null)
      .maybeSingle();
  
    if (readError || !report) {
      return { error: "Report not found or access denied." };
    }
  
    const organizations = await getOrganizationOptions();
  
    const canManage = organizations.some(
      (organization) =>
        organization.id === report.organization_id &&
        managerRoles.includes(organization.role),
    );
  
    if (!canManage) {
      return { error: "You cannot archive this report." };
    }
  
    const { data: archived, error } = await supabase
      .from("progress_reports")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", reportId)
      .eq("organization_id", report.organization_id)
      .eq("project_id", report.project_id)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();
  
    if (error || !archived) {
      return { error: "Unable to archive report." };
    }
  
    revalidatePath("/protected/progress-reports");
  
    redirect("/protected/progress-reports");
  }
  