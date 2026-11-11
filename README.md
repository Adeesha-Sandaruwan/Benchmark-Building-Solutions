# Benchmark Building Solutions

Responsive construction project management workspace built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Current milestone

The application includes Supabase authentication, organization onboarding and invitations, a responsive project register with create/edit/archive and workforce assignment, worker directory and profiles, a materials catalog and request-to-usage workflow, and project expense submission, private receipts, and approval review. Tasks and Progress Reports are developed in a separate team workstream.

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project

## Run locally

1. Install packages: `npm install`
2. Copy `.env.example` to `.env.local`.
3. In `.env.local`, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your Supabase project API settings. A legacy anon key also works as the publishable key value.
4. In Supabase Authentication URL Configuration, set the site URL to `http://localhost:3000` and add `http://localhost:3000/**` as a redirect URL.
5. Start the app: `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000).

## Apply the construction data schema

Before using the construction modules, apply every unapplied SQL migration file in `supabase/migrations/` in timestamp order. In the Supabase dashboard, open **SQL Editor**, create a query for each file, paste its full contents, and run it. If the original eight migrations were already applied, continue from the first migration that has not been run; never run a migration twice. Wait for each file to succeed before moving to the next. The later migrations add workforce assignments, atomic material receiving/usage, expense review rules, and organization invitations. Coordinate schema changes with the Tasks and Progress Reports contributor because those modules reference the shared organization and project IDs.

The migration SQL is version-controlled in this repository. Keep subsequent schema changes in new migration files rather than editing a migration already applied to a shared database.

## Workspace invitations

Workspace owners and admins can create seven-day invitation codes at `/protected/team`. The app does not send email; share the code through your team’s normal channel. Invitees create and verify an account, sign in, then enter the code at `/protected/join`. Invitations can optionally be restricted to an email address.

## Construction modules

- **Projects:** create, search, filter, edit, archive, and review project details.
- **Workers:** maintain profiles and assign or remove workers from project teams.
- **Materials:** maintain a catalog, request materials for active projects, approve and order requests, record partial/full deliveries, and track usage.
- **Expenses:** submit categorized project expenses, attach private receipts, and approve or reject submissions with a review note. A user cannot approve their own expense.
- **Tasks and Progress Reports:** owned by the separate team workstream; use `docs/team-data-contract.md` for shared keys and access helpers.

Never place a Supabase `service_role` or secret key in a `NEXT_PUBLIC_` variable or commit it to Git. The local `.env.local` file is ignored by Git.

## Authentication routes

| Route | Purpose |
| --- | --- |
| `/auth/login` | Sign in with email and password |
| `/auth/sign-up` | Create an account and request email confirmation |
| `/auth/forgot-password` | Request a password reset link |
| `/auth/update-password` | Set a new password after following the reset email |
| `/protected` | Authenticated workspace overview |
| `/auth/confirm` | Verify Supabase email links |

## Email templates

For email confirmation, configure the Supabase confirmation email template to direct users to the app callback with `token_hash` and `type` parameters, for example:

```text
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/protected
```

Configure the password recovery email redirect URL to `/auth/update-password`. Add your local and deployed origins to Supabase's allowed redirect URLs.

## Checks

- `npm run lint`
- `npm run build`

## Deployment

Import the GitHub repository into Vercel, set the two Supabase public environment variables for Preview and Production, then deploy. Add the Vercel production domain and any preview URL patterns you use to Supabase's allowed redirect URLs. Configure the Supabase Site URL to your production domain.

## Team workflow

Work on feature branches and open a pull request into `main`. Keep `.env.local`, credentials, and service secrets out of commits.
