export const organizationRoles = [
  "owner",
  "admin",
  "project_manager",
  "supervisor",
  "finance",
  "worker",
  "viewer",
] as const;

export type OrganizationRole = (typeof organizationRoles)[number];

export const projectStatuses = [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];

export const projectStatusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export interface ProjectSummary {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  client_name: string | null;
  description: string;
  location: string;
  status: ProjectStatus;
  manager_id: string | null;
  budget: number | null;
  currency: string;
  start_date: string | null;
  target_end_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface ProfileSummary {
  id: string;
  full_name: string;
  email: string;
}
