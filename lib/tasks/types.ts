
export const taskStatuses = [
    "todo",
    "in_progress",
    "blocked",
    "completed",
  ] as const;
  
  export const taskPriorities = [
    "low",
    "medium",
    "high",
    "critical",
  ] as const;
  
  export type TaskStatus =
    (typeof taskStatuses)[number];
  
  export type TaskPriority =
    (typeof taskPriorities)[number];
  
  export interface ConstructionTask {
    id: string;
    organization_id: string;
    project_id: string;
  
    title: string;
    description: string;
  
    assigned_worker_id: string | null;
  
    status: TaskStatus;
    priority: TaskPriority;
  
    start_date: string | null;
    due_date: string | null;
    completed_at: string | null;
  
    created_by: string;
    created_at: string;
    updated_at: string;
    archived_at: string | null;
  }
  
  export type TaskFormValues = {
    project_id: string;
    title: string;
    description: string;
    assigned_worker_id: string | null;
    status: TaskStatus;
    priority: TaskPriority;
    start_date: string | null;
    due_date: string | null;
  };
  
  export const taskStatusLabels: Record<TaskStatus, string> = {
    todo: "To Do",
    in_progress: "In Progress",
    blocked: "Blocked",
    completed: "Completed",
  };
  
  export const taskPriorityLabels: Record<TaskPriority, string> = {
    low: "Low",
    medium: "Medium",
    high: "High",
    critical: "Critical",
  };
  