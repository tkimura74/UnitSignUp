# Deployment Checklist

Before connecting a production domain:

- Confirm GitHub does not contain `.env`, `.env.local`, `.next`, `node_modules`, or `.vercel`.
- Run `npm.cmd run build` locally and fix any errors.
- Confirm the latest `supabase/schema.sql` has been applied in Supabase.
- Set these Vercel environment variables for Production:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ADMIN_PASSWORD`
  - `SUPER_ADMIN_PASSWORD`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
- Add the Vercel production hostname and any custom domain to Cloudflare Turnstile.
- Create one real test property and verify:
  - public signup works
  - Turnstile passes
  - admin sees the submission
  - manager CSV exports
  - technician link opens on mobile
  - technician completed checkboxes and notes save
  - inactive property pages show the closed message
- Rotate any secret that was ever accidentally committed or shared.
