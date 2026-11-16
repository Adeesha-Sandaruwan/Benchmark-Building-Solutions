"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

export type PresentationDataState = {
  message: string | null;
  error: string | null;
};

const projectIds = {
  harbor: "b2600001-0000-4000-8000-000000000001",
  hospital: "b2600001-0000-4000-8000-000000000002",
  logistics: "b2600001-0000-4000-8000-000000000003",
};

const workerIds = [
  "b2600002-0000-4000-8000-000000000001",
  "b2600002-0000-4000-8000-000000000002",
  "b2600002-0000-4000-8000-000000000003",
  "b2600002-0000-4000-8000-000000000004",
  "b2600002-0000-4000-8000-000000000005",
  "b2600002-0000-4000-8000-000000000006",
  "b2600002-0000-4000-8000-000000000007",
  "b2600002-0000-4000-8000-000000000008",
];

const materialIds = [
  "b2600003-0000-4000-8000-000000000001",
  "b2600003-0000-4000-8000-000000000002",
  "b2600003-0000-4000-8000-000000000003",
  "b2600003-0000-4000-8000-000000000004",
  "b2600003-0000-4000-8000-000000000005",
  "b2600003-0000-4000-8000-000000000006",
  "b2600003-0000-4000-8000-000000000007",
  "b2600003-0000-4000-8000-000000000008",
];

const day = (offset: number) => {
  const date = new Date();
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};

export async function seedPresentationDataAction(
  _previousState: PresentationDataState,
  _formData: FormData,
): Promise<PresentationDataState> {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (authError || typeof userId !== "string") {
    return { message: null, error: "Sign in again before preparing the presentation workspace." };
  }

  const organizations = await getOrganizationOptions();
  const organization = organizations[0];
  if (!organization) {
    return { message: null, error: "Create or join a workspace before adding presentation records." };
  }
  if (!["owner", "admin"].includes(organization.role)) {
    return { message: null, error: "Only a workspace owner or admin can load presentation records." };
  }

  const orgId = organization.id;
  const projectCodes = ["BBS-26-041", "BBS-26-042", "BBS-26-043"];
  const workerCodes = ["WRK-041", "WRK-042", "WRK-043", "WRK-044", "WRK-045", "WRK-046", "WRK-047", "WRK-048"];
  const materialCodes = ["MAT-101", "MAT-102", "MAT-103", "MAT-104", "MAT-105", "MAT-106", "MAT-107", "MAT-108"];

  // Avoid colliding with existing workspace records that use the reserved IDs/codes.
  const [
    { data: existingProjects, error: projectCheckError },
    { data: existingWorkers, error: workerCheckError },
    { data: existingMaterials, error: materialCheckError },
  ] = await Promise.all([
    supabase.from("projects").select("id, code").eq("organization_id", orgId).in("code", projectCodes),
    supabase.from("workers").select("id, worker_code").eq("organization_id", orgId).in("worker_code", workerCodes),
    supabase.from("materials").select("id, material_code").eq("organization_id", orgId).in("material_code", materialCodes),
  ]);
  if (projectCheckError || workerCheckError || materialCheckError) {
    return { message: null, error: "Could not check the workspace before preparing presentation records." };
  }
  const projectIdsByCode = new Map((existingProjects ?? []).map((row) => [row.code, row.id]));
  const workerIdsByCode = new Map((existingWorkers ?? []).map((row) => [row.worker_code, row.id]));
  const materialIdsByCode = new Map((existingMaterials ?? []).map((row) => [row.material_code, row.id]));
  if (projectCodes.some((code, index) => projectIdsByCode.has(code) && projectIdsByCode.get(code) !== Object.values(projectIds)[index]) || workerCodes.some((code, index) => workerIdsByCode.has(code) && workerIdsByCode.get(code) !== workerIds[index]) || materialCodes.some((code, index) => materialIdsByCode.has(code) && materialIdsByCode.get(code) !== materialIds[index])) {
    return { message: null, error: "A reserved presentation record code is already in use. No records were changed." };
  }

  const write = async (table: string, rows: Record<string, unknown>[], label: string) => {
    // Use ordinary INSERTs under the signed-in user's RLS policies. Stable IDs
    // plus this organization-scoped lookup keep reruns safe without upsert.
    const ids = rows.map((row) => String(row.id));
    const { data: existing, error: lookupError } = await supabase
      .from(table)
      .select("id")
      .eq("organization_id", orgId)
      .in("id", ids);
    if (lookupError) throw new Error(`${label} lookup: ${lookupError.message}`);

    const existingIds = new Set((existing ?? []).map((row) => row.id));
    const missingRows = rows.filter((row) => !existingIds.has(String(row.id)));
    if (missingRows.length === 0) return;

    const { error } = await supabase.from(table).insert(missingRows);
    if (error) throw new Error(`${label}: ${error.message}`);
  };

  try {
    await write("projects", [
      { id: projectIds.harbor, organization_id: orgId, code: projectCodes[0], name: "Harbor View Residences", client_name: "Ceylon Urban Developments PLC", description: "Construction of a 24-storey residential tower with two basement parking levels, podium amenities, and associated utility works.", location: "Marine Drive, Colombo 03", status: "active", manager_id: userId, budget: 486000000, currency: "LKR", start_date: day(-190), target_end_date: day(190), created_by: userId },
      { id: projectIds.hospital, organization_id: orgId, code: projectCodes[1], name: "Kandy Regional Medical Centre", client_name: "Central Province Health Services", description: "New clinical block, diagnostic wing, central plant upgrades, and phased refurbishment of the existing outpatient department.", location: "Peradeniya Road, Kandy", status: "active", manager_id: userId, budget: 720000000, currency: "LKR", start_date: day(-320), target_end_date: day(140), created_by: userId },
      { id: projectIds.logistics, organization_id: orgId, code: projectCodes[2], name: "Southern Logistics Hub", client_name: "Southern Gateway Logistics Ltd", description: "A distribution facility with a 12,000 m² warehouse, loading bays, offices, drainage, and site access improvements.", location: "Weligama Industrial Zone, Matara", status: "on_hold", manager_id: userId, budget: 315000000, currency: "LKR", start_date: day(-75), target_end_date: day(230), created_by: userId },
    ], "projects", "Projects");

    const workers = [
      ["Nimal Perera", "Senior Site Engineer", "active"], ["Kavindi Jayawardena", "Quantity Surveyor", "active"],
      ["Chamika Fernando", "Site Foreman", "active"], ["Ruwan Bandara", "Mason", "active"],
      ["Dinesh Silva", "Electrician", "active"], ["Hashini Wickramasinghe", "Health and Safety Officer", "active"],
      ["Tharindu Amarasinghe", "Plant Operator", "active"], ["Sajith Kumara", "Storekeeper", "active"],
    ];
    await write("workers", workers.map(([full_name, trade, employment_status], index) => ({
      id: workerIds[index], organization_id: orgId, worker_code: workerCodes[index], full_name, trade, employment_status,
      start_date: day(-360 + index * 19), notes: `Assigned to the ${index < 5 ? "Harbor View Residences" : "Kandy Regional Medical Centre"} delivery team.`, created_by: userId,
    })), "workers", "Workers");

    const assignmentRows = [
      ...workerIds.slice(0, 5).map((workerId, index) => ({ id: `b2600004-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, organization_id: orgId, project_id: projectIds.harbor, worker_id: workerId, role_on_project: workers[index][1], assigned_by: userId, notes: "Core delivery team" })),
      ...workerIds.slice(3, 8).map((workerId, index) => ({ id: `b2600004-0000-4000-8000-${String(index + 6).padStart(12, "0")}`, organization_id: orgId, project_id: projectIds.hospital, worker_id: workerId, role_on_project: workers[index + 3][1], assigned_by: userId, notes: "Clinical block delivery team" })),
      { id: "b2600004-0000-4000-8000-000000000011", organization_id: orgId, project_id: projectIds.logistics, worker_id: workerIds[0], role_on_project: "Project oversight", assigned_by: userId, notes: "Planning and coordination" },
      { id: "b2600004-0000-4000-8000-000000000012", organization_id: orgId, project_id: projectIds.hospital, worker_id: workerIds[0], role_on_project: "Senior site engineering", assigned_by: userId, notes: "Engineering oversight for foundation and clinical block inspections" },
    ];
    await write("project_worker_assignments", assignmentRows, "assignments", "Project team assignments");

    const catalog = [
      ["MAT-101", "Ready-mix concrete, Grade 30", "Concrete", "m³", "Lanka Ready Mix Ltd"],
      ["MAT-102", "Reinforcement bar, 12 mm", "Steel", "tonne", "Melwire Group"],
      ["MAT-103", "Reinforcement bar, 16 mm", "Steel", "tonne", "Melwire Group"],
      ["MAT-104", "Ordinary Portland cement, 50 kg", "Cement", "bag", "Tokyo Cement Company"],
      ["MAT-105", "Hollow concrete block, 150 mm", "Masonry", "unit", "Nawaloka Construction Materials"],
      ["MAT-106", "Copper electrical cable, 4 mm²", "Electrical", "coil", "ACL Cables PLC"],
      ["MAT-107", "PVC pressure pipe, 110 mm", "Plumbing", "length", "Anton PVC"],
      ["MAT-108", "Waterproofing membrane, 4 mm", "Waterproofing", "roll", "Sika Lanka"],
    ];
    await write("materials", catalog.map(([material_code, name, category, unit, default_supplier], index) => ({ id: materialIds[index], organization_id: orgId, material_code, name, category, unit, default_supplier, created_by: userId })), "materials", "Materials catalog");

    const requests = [
      [projectIds.harbor, 0, 180, 90, 42000, "partially_received", -2, "First structural pour delivered in two batches; balance scheduled for the next slab cycle."],
      [projectIds.harbor, 1, 38, 0, 328000, "ordered", 3, "Reinforcement schedule approved for podium and level 04 columns."],
      [projectIds.harbor, 3, 2400, 1200, 2150, "partially_received", -1, "Store count reconciled against delivery notes."],
      [projectIds.harbor, 7, 64, 0, 18400, "approved", 8, "Basement retaining wall application area confirmed by site engineer."],
      [projectIds.hospital, 0, 95, 95, 42000, "received", -5, "Outpatient department foundation pour completed."],
      [projectIds.hospital, 2, 26, 12, 332000, "partially_received", -1, "Remaining bars expected with the next supplier delivery."],
      [projectIds.hospital, 4, 4200, 0, 980, "requested", 7, "Blockwork for the diagnostic wing, level 02."],
      [projectIds.hospital, 5, 36, 0, 68500, "ordered", 4, "Containment and first-fix cable requirement for the clinical block."],
      [projectIds.logistics, 6, 280, 0, 12500, "requested", 14, "Stormwater drainage run along the eastern service road."],
    ];
    await write("project_materials", requests.map(([project_id, materialIndex, quantity, received, cost, status, neededOffset, notes], index) => ({
      id: `b2600005-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, organization_id: orgId, project_id,
      material_id: materialIds[materialIndex as number], quantity_requested: quantity, quantity_received: received, quantity_used: Math.min(received as number, Math.floor((received as number) * 0.55)), unit_cost: cost, supplier: catalog[materialIndex as number][4], status, needed_by: day(neededOffset as number), notes, requested_by: userId,
    })), "project_materials", "Material requests");

    const expenseRows = [
      [projectIds.harbor, "Equipment", "Colombo Crane Services", "Tower crane and operator, week 46", 485000, -1],
      [projectIds.harbor, "Fuel and transport", "Lanka Haulage Co.", "Reinforcement steel delivery to Marine Drive site", 128500, -2],
      [projectIds.harbor, "Other", "SafePro Industrial", "Replacement harnesses and fall-arrest lanyards", 86400, -4],
      [projectIds.harbor, "Site services", "LECO", "Temporary site electricity, October billing period", 73580, -8],
      [projectIds.hospital, "Equipment", "MedBuild Engineering Supplies", "Temporary access scaffold inspection and hire", 217000, -3],
      [projectIds.hospital, "Fuel and transport", "Hill Country Logistics", "Concrete pump mobilization and return", 96000, -5],
      [projectIds.hospital, "Travel", "Kandy Workforce Lodge", "Crew accommodation, 1–15 November", 152000, -7],
      [projectIds.logistics, "Permits and fees", "Matara Municipal Council", "Temporary traffic management permit", 22500, -9],
    ];
    await write("expenses", expenseRows.map(([project_id, category, merchant, description, amount, dateOffset], index) => ({
      id: `b2600006-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, organization_id: orgId, project_id, category, merchant, description, amount, currency: "LKR", expense_date: day(dateOffset as number), status: "submitted", submitted_by: userId,
    })), "expenses", "Expenses");

    const tasks = [
      [projectIds.harbor, "Complete level 04 column reinforcement inspection", 0, "in_progress", "high", -2, 1],
      [projectIds.harbor, "Confirm concrete pour sequence with supplier", 2, "todo", "medium", 0, 2],
      [projectIds.harbor, "Install basement waterproofing membrane", 3, "in_progress", "high", -5, 2],
      [projectIds.harbor, "Close out podium slab quality checklist", 0, "completed", "medium", -8, -2],
      [projectIds.harbor, "Submit revised level 05 material take-off", 1, "blocked", "critical", -1, 0],
      [projectIds.hospital, "Finish diagnostic wing level 02 blockwork", 3, "in_progress", "high", -3, 2],
      [projectIds.hospital, "Inspect outpatient department foundation", 0, "completed", "high", -12, -4],
      [projectIds.hospital, "Coordinate first-fix electrical containment", 4, "todo", "medium", 1, 5],
      [projectIds.hospital, "Verify drainage falls at west entrance", 6, "in_progress", "medium", -2, 3],
      [projectIds.logistics, "Reconfirm stormwater route with civil consultant", 0, "todo", "high", 0, 8],
      [projectIds.logistics, "Review revised loading-bay steel package", 0, "blocked", "critical", -4, 1],
      [projectIds.logistics, "Update site access and traffic plan", 0, "completed", "low", -10, -3],
    ];
    await write("tasks", tasks.map(([project_id, title, workerIndex, status, priority, startOffset, dueOffset], index) => ({
      id: `b2600007-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, organization_id: orgId, project_id, title,
      description: `Coordinate with the site team, record the inspection outcome, and update the project record for ${title.toString().toLowerCase()}.`,
      assigned_worker_id: workerIds[workerIndex as number], status, priority, start_date: day(startOffset as number), due_date: day(dueOffset as number), created_by: userId,
    })), "tasks", "Tasks");

    const reportRows = [
      [projectIds.harbor, "daily", -1, 64, "Level 04 column reinforcement fixed and inspected. Basement waterproofing continued on the north retaining wall.", "Complete the level 04 pour and receive the balance of Grade 30 concrete.", "Concrete delivery moved to the afternoon due to traffic restrictions."],
      [projectIds.harbor, "weekly", -3, 62, "Podium slab checklist closed. Level 04 reinforcement reached approximately 80% completion.", "Complete the level 04 pour and start the level 05 formwork cycle.", "Revised steel take-off is awaiting consultant confirmation."],
      [projectIds.hospital, "daily", 0, 43, "Diagnostic wing blockwork advanced on level 02. Outpatient foundation inspection signed off.", "Continue blockwork and begin electrical containment in the eastern corridor.", "Two cable drum deliveries remain outstanding."],
      [projectIds.hospital, "weekly", -2, 41, "Outpatient department foundation completed. Diagnostic wing material deliveries reconciled.", "Progress blockwork on level 02 and prepare the west entrance drainage inspection.", ""],
      [projectIds.logistics, "daily", -1, 28, "Updated the loading-bay steel package and reviewed the eastern drainage alignment.", "Confirm the stormwater route and refresh the traffic management plan.", "Work remains paused pending client approval of the revised loading-bay package."],
      [projectIds.logistics, "weekly", -4, 28, "Site access plan updated and the stormwater route reviewed with the civil consultant.", "Resolve outstanding client decisions before remobilizing the drainage crew.", ""],
    ];
    await write("progress_reports", reportRows.map(([project_id, report_type, reportOffset, progress_percentage, completed_work, planned_work, issues], index) => ({
      id: `b2600008-0000-4000-8000-${String(index + 1).padStart(12, "0")}`, organization_id: orgId, project_id, report_type, report_date: day(reportOffset as number), progress_percentage, completed_work, planned_work, issues, created_by: userId,
    })), "progress_reports", "Progress reports");
  } catch (error) {
    return { message: null, error: error instanceof Error ? error.message : "Presentation records could not be loaded. Retry to complete the remaining records." };
  }

  for (const path of ["/protected", "/protected/projects", "/protected/workers", "/protected/materials", "/protected/materials/requests", "/protected/expenses", "/protected/tasks", "/protected/progress-reports"]) {
    revalidatePath(path);
  }
  return { message: "Ready: 3 projects, 8 workers, 8 materials, 9 material requests, 8 expenses, 12 tasks, and 6 progress reports. Existing workspace records were left unchanged.", error: null };
}
