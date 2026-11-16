
export const reportTypes = [
    "daily",
    "weekly",
  ] as const;
  
  export type ReportType =
    (typeof reportTypes)[number];
  
  export type ProgressReport = {
    id: string;
    organization_id: string;
    project_id: string;
  
    report_type: ReportType;
    report_date: string;
  
    progress_percentage: number;
  
    completed_work: string;
    planned_work: string;
    issues: string;
  
    created_by: string;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
  };
  
  export type ProgressReportFormValues = {
    project_id: string;
    report_type: ReportType;
    report_date: string;
    progress_percentage: number;
    completed_work: string;
    planned_work: string;
    issues: string;
  };
  
  export const reportTypeLabels: Record<ReportType, string> = {
    daily: "Daily Report",
    weekly: "Weekly Report",
  };
  