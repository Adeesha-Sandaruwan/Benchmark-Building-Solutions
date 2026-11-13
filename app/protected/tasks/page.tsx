
import Link from "next/link";
import { ClipboardList, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganizationOptions } from "@/lib/data/organizations";

export default async function TasksPage() {
  const organizations = await getOrganizationOptions();
  const organization = organizations[0];

  if (!organization) {
    return (
      <div className="rounded-xl bg-white p-6">
        No workspace found.
      </div>
    );
  }

  const supabase = await createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, code, status")
    .eq("organization_id", organization.id)
    .is("archived_at", null)
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-amber-700">
          {organization.name}
        </p>

        <h1 className="mt-1 text-3xl font-semibold text-[#152d4b]">
          Task Management
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage construction tasks across your projects.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <ClipboardList className="text-amber-600" size={24} />
          <h2 className="text-xl font-semibold text-[#152d4b]">
            Select a Project
          </h2>
        </div>

        {error ? (
          <p role="alert" className="text-red-600">
            Projects could not be loaded.
          </p>
        ) : !projects?.length ? (
          <p className="text-slate-500">
            No available projects found.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/protected/projects/${project.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 transition hover:border-amber-400 hover:bg-amber-50"
              >
                <div>
                  <p className="text-xs text-slate-500">
                    {project.code}
                  </p>
                  <h3 className="font-semibold text-[#152d4b]">
                    {project.name}
                  </h3>
                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {project.status.replaceAll("_", " ")}
                  </p>
                </div>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
