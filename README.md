# Riverside Lawncare — Plant Catalog & Sales Tool

A mobile-first sales tool for Riverside Lawncare. Customers browse the plants we
commonly use; employees log in to manage the catalog, bulk-import from Excel,
and build branded plant lists for customers in the field.

- **Public** — anyone can browse + filter plants, and start a list.
- **Employees only** — add / edit / disable / delete plants, bulk-import from
  Excel, save customer plant lists, download a branded PNG to text/AirDrop.

## Stack

- **Next.js 15** (App Router) + TypeScript + **Tailwind**
- **Supabase** — Postgres, Auth, Storage (free tier is plenty)
- `xlsx` (SheetJS) for the Excel template + parser
- `html-to-image` for the PNG export
- `zod` for validation
- Deploys to **Vercel**

## One-time setup

You'll do this **once**. After this everything is managed from the website itself.

1. **Create a Supabase project** at https://supabase.com (free tier).
2. **Run the schema.** Open the project → SQL Editor → paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql) → Run. This creates all tables,
   row-level security, and the `plant-images` storage bucket.
3. **Add employee logins.** Supabase → Authentication → Users → **Add user**.
   Enter an email + password for each Riverside employee. Disable public
   signups (they're disabled by default — there is no signup UI in the app).
4. **Copy env vars.** In Supabase → Project Settings → API, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (used by the Excel
     importer; **never** commit or expose to the browser)

   Create `.env.local` (copy from `.env.example`) and paste them in.

5. **Drop your logo** at `public/riversidelogo.png`. The header + PNG export
   both pull from there.

## Running locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import on https://vercel.com.
3. Add the same three env vars to Vercel's project settings.
4. Deploy. The free tier covers all initial usage.

## Daily use

- **Browse plants** — `/`
- **Add a plant** — `/admin/plants/new` (after sign-in)
- **Bulk import** — `/admin/import`. Click **Download template**, fill in the
  spreadsheet, upload it. Errors are shown row-by-row before anything is
  written. The `image_url` column lets you point to a public image URL and the
  importer will download & store it automatically.
- **Build a customer list** — browse the catalog, tap **Add** on plants, then
  the floating **Build list** button. Enter customer name, hit
  **Download PNG** for an image you can text the customer, or **Save project**
  (employees only) to keep it under `/admin/projects`.
- **Disable a plant** instead of deleting — keeps it attached to old saved
  projects but hides it from the public catalog.

## What's scoped for follow-up PRs

The data model is already in place for these in `supabase/schema.sql`:

- **Pavers** catalog (`pavers` table)
- **Gallery** of recent jobs with plant tagging (`gallery_jobs`,
  `gallery_job_plants`)
- PDF export and email send (via Resend) — currently PNG only

## Layout

```
app/
  page.tsx                     public catalog
  plants/[id]/                 plant detail
  login/                       employee sign-in
  admin/                       authed-only: plant CRUD, import, saved lists
  builder/                     selection builder + saved projects
  api/import/                  Excel → Supabase
  api/projects/                save customer lists
components/                    UI building blocks
lib/
  supabase/{client,server,admin}.ts
  plants.ts, excel.ts, categories.ts
supabase/schema.sql            paste once into Supabase SQL editor
```
