# Resident Treatment Signup App

This folder now contains two versions:

- `index.html`, `styles.css`, and `script.js`: the original static design preview.
- `app/`, `package.json`, and `public/`: the Vercel/Next.js app for real client use.

## Supabase Setup

Run `supabase/schema.sql` in your Supabase SQL Editor if you have not already created the
`properties` and `submissions` tables.

## Local Environment

Create a file named `.env.local` in this folder with:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-secret-key
ADMIN_PASSWORD=choose-a-private-admin-password
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-cloudflare-turnstile-site-key
TURNSTILE_SECRET_KEY=your-cloudflare-turnstile-secret-key
```

You can find the Supabase keys in Supabase under Project Settings, then API.
The service role key must stay server-side only. Never put it in a public page,
client-side JavaScript, Discord message, or screenshot.

Cloudflare Turnstile is optional locally, but recommended before sending public links.
Create a Turnstile widget in Cloudflare, then add the site key and secret key above.

## First Test Link

After installing dependencies and starting the app, visit:

```text
http://localhost:3000/p/demo-property
```

That page reads the `demo-property` row from Supabase and saves resident submissions
into the `submissions` table.

## Admin Dashboard

After setting `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD`, restart the dev server
and visit:

```text
http://localhost:3000/admin
```

The admin dashboard can view submissions, export CSV, and create property signup links.

## Deployment Notes

When deploying to Vercel, add the same environment variables in the Vercel project
settings before testing the live site.
