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

export const workerStatuses = ["active", "on_leave", "inactive"] as const;
export type WorkerStatus = (typeof workerStatuses)[number];

export const materialRequestStatuses = ["requested", "approved", "ordered", "partially_received", "received", "cancelled"] as const;
export type MaterialRequestStatus = (typeof materialRequestStatuses)[number];

export interface MaterialRecord {
  id: string;
  organization_id: string;
  material_code: string;
  name: string;
  category: string;
  unit: string;
  default_supplier: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface WorkerRecord {
  id: string;
  organization_id: string;
  user_id: string | null;
  worker_code: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  trade: string;
  employment_status: WorkerStatus;
  start_date: string | null;
  notes: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

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
