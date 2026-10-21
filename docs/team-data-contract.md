# Shared construction data contract

This contract covers shared records used by the Projects, Workers, Materials, Expenses, Tasks, and Progress Reports workstreams. Module owners can build their tables and screens independently as long as they reference these shared identities and access helpers.

## Ownership

- This workstream owns `organizations`, `profiles`, `organization_memberships`, `projects`, `project_memberships`, `workers`, `materials`, `project_materials`, and `expenses`.
- The Tasks and Progress Reports workstream owns its task and report tables, forms, and routes. It must not recreate the organization, profile, membership, project, worker, material, or expense tables.
- Database changes belong in separate timestamped files under `supabase/migrations/`. Coordinate migration order before applying shared changes to the hosted database.

## Shared keys and tenancy

- `auth.users.id` is the authenticated identity. `profiles.id` references it.
- Every business record has an `organization_id` foreign key.
- `projects.id` is the canonical project identifier. Tasks and progress reports should reference it with a foreign key and include `organization_id` for row-level security and reporting.
- `organization_memberships` grants company-wide access. `project_memberships` grants access to a particular project. The SQL helper functions `is_organization_member(uuid)`, `has_organization_role(uuid, text[])`, and `can_access_project(uuid)` are the shared RLS interface.
- A `workers` row represents a person working on a project; it is distinct from an authenticated app user. `workers.user_id` is optional and may link a worker to a profile when that person has an account.

## Roles and privacy

Organization roles are `owner`, `admin`, `project_manager`, `supervisor`, `finance`, `worker`, and `viewer`. Keep authorization in PostgreSQL RLS policies as well as in the UI. Never expose a service role key to browser code.

## Integration expectations

- Use `project_id` to connect module records to projects, and `created_by` for the authenticated author where appropriate.
- A project is visible to an organization member if no project-specific assignments have been created for it yet; after assignments exist, require organization owner/admin or project membership. This supports gradual rollout while project access management is built.
- Use UTC `timestamptz` values for event timestamps. Keep money as `numeric(14,2)` plus an ISO currency code; do not use floating point.
- Prefer soft archive/status fields over deleting business records needed for audit history.
