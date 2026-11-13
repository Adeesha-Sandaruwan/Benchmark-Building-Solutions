
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
