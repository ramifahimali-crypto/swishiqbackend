# Fixing the waitlist + adding your new content

You've got two separate Vercel projects (frontend + backend) — this guide
matches that setup exactly.

## What's in this delivery

- `swishiq-website.html` — your updated site. Replace the file in your
  **frontend** repo with this one.
- `waitlist.js` — new. Add this to your **backend** repo, inside its `api`
  folder (next to your existing `chat.js`).

## Step 1 — Add waitlist.js to your backend repo

1. Open your **backend** GitHub repo (the one with `api/chat.js` in it).
2. Go into the `api` folder.
3. Click **Add file -> Upload files**, upload `waitlist.js`, and commit.

Your backend repo's `api` folder should now contain both `chat.js` and
`waitlist.js`.

## Step 2 — Set up Supabase (so you can view submitted emails)

1. Go to supabase.com, sign up, create a new project (any name/password).
2. Click **SQL Editor -> New query**, paste this in, click **Run**:

   ```sql
   create table waitlist (
     id uuid primary key default gen_random_uuid(),
     email text not null unique,
     created_at timestamp with time zone default now()
   );
   ```

3. Click the gear icon -> **API**. Copy the **Project URL** and the
   **service_role** key (click "Reveal" first).

## Step 3 — Add Supabase keys to your BACKEND Vercel project

Important: these go on the backend project specifically, not the frontend
one — that's where `waitlist.js` actually runs.

1. Vercel -> your **backend** project -> **Settings -> Environment
   Variables**.
2. Add `SUPABASE_URL` = the Project URL from Step 2.
3. Add `SUPABASE_SERVICE_ROLE_KEY` = the service_role key from Step 2.
4. Go to **Deployments**, click **...** on the latest one, click
   **Redeploy** (env vars only apply to new deployments).

## Step 4 — Point the website at your real backend URL

1. Open your backend project in Vercel and copy its URL from the top of the
   page (something like `https://swishiq-backend-abc123.vercel.app`).
2. Open `swishiq-website.html` in a text editor, search for
   `BACKEND_BASE_URL`, and replace the placeholder with that real URL:

   ```js
   const BACKEND_BASE_URL = 'https://swishiq-backend-abc123.vercel.app';
   ```

   (This one line now feeds both the chat and the waitlist form, so you
   only ever need to update it in this one place.)

## Step 5 — Deploy the updated website

1. Upload this new `swishiq-website.html` to your **frontend** repo,
   replacing the old one (rename it to match whatever your frontend
   project expects as its entry file, e.g. `index.html`, if needed).
2. Commit. Vercel redeploys automatically.

## Step 6 — Test it

1. Visit swish-iq.com.
2. Submit a test email in the waitlist form — it should now show the
   success message instead of the error.
3. Go to Supabase -> **Table Editor** -> `waitlist` table — your test
   email should be sitting there as a row.
4. Scroll through the new **Shot Arc** slider and **Specs** sections to see
   the new content.

## Viewing signups going forward

Anytime: supabase.com -> your project -> **Table Editor** -> `waitlist`.
Click **Export** there for a CSV of everyone, whenever you want it.
