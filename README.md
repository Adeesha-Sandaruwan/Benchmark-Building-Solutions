# Benchmark Building Solutions

Responsive construction project management workspace built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Current milestone

This branch establishes the application shell and Supabase authentication flows: account registration with email confirmation, sign in, sign out, password recovery, password update, and a protected workspace dashboard. Construction data modules are planned for later milestones.

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
