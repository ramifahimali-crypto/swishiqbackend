# SwishIQ — Full Deployment Package

Everything to get SwishIQ live on your own domain: the website, the AI chat
backend, and a waitlist backend you can actually view signups in.

## What's in this folder

```
index.html        <- your website (drop-in replacement for your old file)
api/
  chat.js         <- powers the AI chat assistant
  waitlist.js     <- saves waitlist emails so you can see them later
package.json
```

## Part 1 — Update your existing GitHub repo

You already created a repo with `api/chat.js` and `package.json` for the
chat backend. Now, in that same repo:

1. Add `index.html` to the root.
2. Add `api/waitlist.js` alongside your existing `api/chat.js`.
3. Commit and push those changes.

Vercel redeploys automatically. Once it's done, visiting your Vercel URL
directly (e.g. `https://your-project.vercel.app`) shows your actual
website, not just a bare API.

## Part 2 — Set up Supabase (this is how you'll view waitlist emails)

Supabase gives you a free database with a simple, spreadsheet-like table
view — this is what you'll check whenever you want to see who joined.

1. Go to https://supabase.com and sign up (free).
2. Create a new project. Any name and password are fine — save the password
   somewhere safe, you won't need it often.
3. Once the project is ready, click **SQL Editor** in the sidebar, paste
   this in, and click **Run**:

   ```sql
   create table waitlist (
     id uuid primary key default gen_random_uuid(),
     email text not null unique,
     created_at timestamp with time zone default now()
   );
   ```

4. Click **Project Settings -> API** in the sidebar. You need two values
   from here:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **service_role key** (under "Project API keys" — click Reveal). Keep
     this one private; it never goes in the website's code, only in Vercel.

## Part 3 — Add your Supabase keys to Vercel

1. In your Vercel project: **Settings -> Environment Variables**.
2. Add:
   - `SUPABASE_URL` = your Project URL from Part 2
   - `SUPABASE_SERVICE_ROLE_KEY` = your service_role key from Part 2
3. Go to **Deployments** and redeploy (or push any small change to trigger
   one) so the new variables take effect.

## Part 4 — Point your GoDaddy domain at Vercel

1. In your Vercel project: **Settings -> Domains**, type in your `.com`
   domain, click Add.
2. Vercel shows one or two DNS records to add (usually an A record and/or a
   CNAME).
3. In GoDaddy: open your domain's **DNS Management** and add those exact
   records.
4. DNS changes can take minutes to a few hours. Vercel's Domains page shows
   a checkmark once it's live.

## Viewing your waitlist signups

Anytime: go to supabase.com, open your project, click **Table Editor**,
click the `waitlist` table. Every submitted email is a row there, with the
date it came in. Click **Export** on that page to download the whole list
as a CSV whenever you want to email everyone at once.

## What changed from the earlier version

Both `CHAT_API_URL` and `WAITLIST_API_URL` inside `index.html` now use
relative paths (`/api/chat`, `/api/waitlist`) instead of full addresses.
That's intentional: once your website and these two routes live in the same
Vercel project, relative paths just work with nothing left to manually
type in. The trade-off: neither the chat nor the waitlist form will work
inside a Claude preview anymore, since a preview has no `/api/chat` or
`/api/waitlist` of its own. Both come alive once this is actually deployed.

## Notes

- Waitlist signups are rate-limited (5 per minute per visitor) and reject
  duplicate emails automatically without showing the visitor an error.
- If the chat or waitlist form stop working once live, check Vercel's
  **Deployments -> Functions -> Logs** for the specific error — it's almost
  always a missing or mistyped environment variable.
