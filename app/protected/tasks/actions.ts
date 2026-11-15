
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";
import {
  taskPriorities,
  taskStatuses,
} from "@/lib/tasks/types";

export type TaskActionState = {
  error: string | null;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createTaskAction(
  _previousState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const projectId = String(
    formData.get("project_id") ?? "",
  ).trim();

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  const description = String(
    formData.get("description") ?? "",
  ).trim();

  const priority = String(
    formData.get("priority") ?? "medium",
  );

  const status = "todo";

  const startDate =
    String(formData.get("start_date") ?? "") || null;

  const dueDate =
    String(formData.get("due_date") ?? "") || null;

  // Input validation
  if (!uuidPattern.test(projectId)) {
    return { error: "Please select a valid project." };
  }

  if (title.length < 2 || title.length > 150) {
    return {
      error: "Task title must contain 2–150 characters.",
    };
  }

  if (description.length > 5000) {
    return {
      error: "Description must be under 5000 characters.",
    };
  }

  if (
    !taskPriorities.includes(
      priority as (typeof taskPriorities)[number],
    )
  ) {
    return { error: "Invalid task priority." };
  }

  if (
    !taskStatuses.includes(
      status as (typeof taskStatuses)[number],
    )
  ) {
    return { error: "Invalid task status." };
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  const validDate = (value: string | null) => {
    if (!value) return true;
    if (!datePattern.test(value)) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  };

  if (!validDate(startDate) || !validDate(dueDate)) {
    return { error: "Please enter valid dates." };
  }

  if (startDate && dueDate && dueDate < startDate) {
    return {
      error: "Due date cannot be before start date.",
    };
  }

  // Authentication
  const supabase = await createClient();

  const { data: claims, error: authError } =
    await supabase.auth.getClaims();

  const userId = claims?.claims?.sub;

  if (authError || !userId) {
    return {
      error: "Session expired. Please sign in again.",
    };
  }

  // Organization membership
  const organizations = await getOrganizationOptions();

  if (!organizations.length) {
    return {
      error: "You must join a workspace first.",
    };
  }

  // Resolve the organization from the selected project.
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

  const organization = organizations.find(
    (item) => item.id === project.organization_id,
  );

  if (!organization) {
    return {
      error: "You do not belong to this workspace.",
    };
  }

  if (
    ![
      "owner",
      "admin",
      "project_manager",
      "supervisor",
    ].includes(organization.role)
  ) {
    return {
      error: "You do not have permission to create tasks.",
    };
  }

  // Save actual task to Supabase.
  const { error } = await supabase
    .from("tasks")
    .insert({
      organization_id: organization.id,
      project_id: projectId,
      title,
      description,
      priority,
      status,
      start_date: startDate,
      due_date: dueDate,
      created_by: userId,
    });

  if (error) {
    console.error("Task creation failed:", {
      code: error.code,
      message: error.message,
    });

    return {
      error: "Unable to create task. Check database setup and permissions.",
    };
  }

  revalidatePath("/protected/tasks");
  redirect("/protected/tasks");
}





export async function updateTaskStatusAction(
    formData: FormData,
  ): Promise<void> {
    const taskId = String(formData.get("task_id") ?? "");
    const status = String(formData.get("status") ?? "");
  
    if (!uuidPattern.test(taskId)) {
      throw new Error("Invalid task ID.");
    }
  
    if (
      !taskStatuses.includes(
        status as (typeof taskStatuses)[number],
      )
    ) {
      throw new Error("Invalid task status.");
    }
  
    const supabase = await createClient();
  
    const { data: auth, error: authError } =
      await supabase.auth.getClaims();
  
    if (authError || !auth?.claims?.sub) {
      throw new Error("Authentication required.");
    }
  
    // Fetch only tasks visible under Supabase RLS.
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, project_id, organization_id")
      .eq("id", taskId)
      .is("archived_at", null)
      .maybeSingle();
  
    if (taskError || !task) {
      throw new Error("Task not found or access denied.");
    }
  
    const organizations = await getOrganizationOptions();
  
    const canManage = organizations.some(
      (organization) =>
        organization.id === task.organization_id &&
        [
          "owner",
          "admin",
          "project_manager",
          "supervisor",
        ].includes(organization.role),
    );
  
    if (!canManage) {
      throw new Error("You cannot update this task.");
    }
  
    // RLS provides the final project-level access check.
    const { data: updated, error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId)
      .eq("organization_id", task.organization_id)
      .eq("project_id", task.project_id)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();
  
    if (error || !updated) {
      throw new Error("Unable to update task status.");
    }
  
    revalidatePath("/protected/tasks");
  }
  

  const taskManagerRoles = [
    "owner",
    "admin",
    "project_manager",
    "supervisor",
  ];
  
  export async function updateTaskAction(
    _previousState: TaskActionState,
    formData: FormData,
  ): Promise<TaskActionState> {
    const taskId = String(formData.get("task_id") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const priority = String(formData.get("priority") ?? "");
    const workerId = String(formData.get("assigned_worker_id") ?? "").trim();
    const startDate = String(formData.get("start_date") ?? "") || null;
    const dueDate = String(formData.get("due_date") ?? "") || null;
  
    if (!uuidPattern.test(taskId)) {
      return { error: "Invalid task ID." };
    }
  
    if (title.length < 2 || title.length > 150) {
      return { error: "Task title must be 2–150 characters." };
    }
  
    if (description.length > 5000) {
      return { error: "Description is too long." };
    }
  
    if (!taskPriorities.some((value) => value === priority)) {
      return { error: "Invalid priority." };
    }
  
    if (workerId && !uuidPattern.test(workerId)) {
      return { error: "Invalid worker." };
    }
  
    function isValidDate(value: string | null) {
      if (!value) return true;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
      const parsed = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(parsed.getTime())
        && parsed.toISOString().slice(0, 10) === value;
    }
  
    if (!isValidDate(startDate) || !isValidDate(dueDate)) {
      return { error: "Invalid date." };
    }
  
    if (startDate && dueDate && dueDate < startDate) {
      return { error: "Due date must follow start date." };
    }
  
    const supabase = await createClient();
  
    const { data: auth, error: authError } =
      await supabase.auth.getClaims();
  
    if (authError || !auth?.claims?.sub) {
      return { error: "Please sign in again." };
    }
  
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, project_id, organization_id")
      .eq("id", taskId)
      .is("archived_at", null)
      .maybeSingle();
  
    if (taskError || !task) {
      return { error: "Task not found or access denied." };
    }
  
    const organizations = await getOrganizationOptions();
  
    if (!organizations.some((org) =>
      org.id === task.organization_id &&
      taskManagerRoles.includes(org.role)
    )) {
      return { error: "You cannot edit this task." };
    }
  
    if (workerId) {
      const { data: assignment, error: assignmentError } =
        await supabase
          .from("project_worker_assignments")
          .select("worker_id")
          .eq("project_id", task.project_id)
          .eq("organization_id", task.organization_id)
          .eq("worker_id", workerId)
          .is("removed_at", null)
          .maybeSingle();
  
      if (assignmentError || !assignment) {
        return {
          error: "Worker is not assigned to this project.",
        };
      }
  
      const { data: worker } = await supabase
        .from("workers")
        .select("id")
        .eq("id", workerId)
        .eq("organization_id", task.organization_id)
        .eq("employment_status", "active")
        .is("archived_at", null)
        .maybeSingle();
  
      if (!worker) {
        return { error: "Worker is not active." };
      }
    }
  
    const { data: updated, error } = await supabase
      .from("tasks")
      .update({
        title,
        description,
        priority,
        assigned_worker_id: workerId || null,
        start_date: startDate,
        due_date: dueDate,
      })
      .eq("id", taskId)
      .eq("organization_id", task.organization_id)
      .eq("project_id", task.project_id)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();
  
    if (error || !updated) {
      return {
        error: "Task update failed. Check permissions and data.",
      };
    }
  
    revalidatePath("/protected/tasks");
    revalidatePath(`/protected/tasks/${taskId}/edit`);
    redirect("/protected/tasks");
  }
  
  export async function archiveTaskAction(
    formData: FormData,
  ): Promise<void> {
    const taskId = String(formData.get("task_id") ?? "");
  
    if (!uuidPattern.test(taskId)) {
      throw new Error("Invalid task ID.");
    }
  
    const supabase = await createClient();
  
    const { data: auth, error: authError } =
      await supabase.auth.getClaims();
  
    if (authError || !auth?.claims?.sub) {
      throw new Error("Authentication required.");
    }
  
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("id, organization_id, project_id")
      .eq("id", taskId)
      .is("archived_at", null)
      .maybeSingle();
  
    if (taskError || !task) {
      throw new Error("Task not found.");
    }
  
    const organizations = await getOrganizationOptions();
  
    if (!organizations.some((org) =>
      org.id === task.organization_id &&
      taskManagerRoles.includes(org.role)
    )) {
      throw new Error("Permission denied.");
    }
  
    const { data: archived, error } = await supabase
      .from("tasks")
      .update({ archived_at: new Date().toISOString() })
      .eq("id", taskId)
      .eq("organization_id", task.organization_id)
      .eq("project_id", task.project_id)
      .is("archived_at", null)
      .select("id")
      .maybeSingle();
  
    if (error || !archived) {
      throw new Error("Unable to archive task.");
    }
  
    revalidatePath("/protected/tasks");
    redirect("/protected/tasks");
  }
  