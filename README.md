# Smart Bookmarks

A minimal, real-time bookmark manager. Sign in with Google, save a link in one tab, and watch it appear instantly in every other tab — secured by Postgres row-level security so nobody else can see your bookmarks.

> Built for the Abstrabit Smart Bookmark App assessment.

---

## Features

- **Google sign-in only** — passwordless OAuth via Supabase Auth (PKCE).
- **Add bookmarks** — clean form with Zod-powered URL/title/tag validation.
- **Private by default** — every read, insert, and delete is enforced by RLS on `auth.uid() = user_id`. Even with the public anon key on the client, one user cannot see another user's rows.
- **Real-time sync** — `postgres_changes` subscription on the `bookmarks` table; INSERT/DELETE events update the UI without a refresh. Open two tabs to see it live.
- **Delete with confirmation** — accessible modal with focus trap, Escape/click-outside, and a destructive action button (no accidental deletes).
- **Deployed on Vercel** — see "Deploy" section below.
- **Polished UI** — Inter typography, custom design tokens, light/dark theme via `prefers-color-scheme`, gradient background, skeleton loading states, empty states, responsive grid, and Sonner toast notifications.

### Bonus feature: Tags + instant search

A bookmark manager becomes unusable past 20 items without a way to retrieve things. I added:

- **Tag chips on the add form** — type, press Enter or comma, up to 5 tags per bookmark.
- **Search bar** — instant client-side filter by title or URL.
- **Tag filtering** — click any tag (on a card or in the toolbar) to filter by it; multi-select uses AND semantics.
- **All client-side** over the realtime-synced list — zero extra network calls, immediate response.

Why this one: organization is the difference between a bookmark *collection* and a bookmark *system*. It also let me demonstrate Postgres array columns (`text[]`), a GIN index, a custom chip input, and `useMemo`-derived state on top of a live subscription.

---

## Tech stack

| Layer        | Choice                                      |
| ------------ | ------------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19          |
| Language     | TypeScript                                  |
| Styling      | Tailwind CSS v4 with custom design tokens   |
| Auth + DB    | Supabase (Postgres, Auth, Realtime, RLS)    |
| Validation   | Zod                                         |
| Icons        | Lucide                                      |
| Toasts       | Sonner                                      |
| Hosting      | Vercel                                      |

---

## Project structure

```
app/
  layout.tsx                 root layout (Inter font, Toaster)
  globals.css                Tailwind v4 + design tokens
  page.tsx                   landing/login (server-redirects when signed in)
  auth/callback/route.ts     PKCE code -> session exchange
  auth/signout/route.ts      signs out and clears cookies
  dashboard/page.tsx         protected dashboard (server-rendered)
  dashboard/loading.tsx      skeleton during streaming
components/
  add-bookmark-form.tsx      validated form with chip-style tag input
  bookmark-card.tsx          card with favicon, title, host, tags, delete
  bookmark-list.tsx          client island: realtime + filter logic
  search-bar.tsx             text search + tag filter chips
  delete-confirm-dialog.tsx  custom modal w/ focus trap
  login-button.tsx           "Continue with Google" CTA
  user-menu.tsx              avatar + sign-out
  skeleton.tsx               shimmer loading placeholders
  empty-state.tsx            empty + no-matches states
  auth-error-toast.tsx       surfaces ?auth_error= in the URL
lib/
  supabase/client.ts         browser Supabase client
  supabase/server.ts         server Supabase client (Next 16 async cookies)
  supabase/proxy.ts          session refresh + route protection
  schemas.ts                 Zod schema for the bookmark form
  utils.ts                   cn(), favicon URL, relative time, normalize URL
  types.ts                   Bookmark + Database types
proxy.ts                     Next.js 16 proxy (formerly middleware)
supabase/schema.sql          DDL + RLS policies + realtime publication
```

> **Next.js 16 note:** Middleware is now called **Proxy** (`proxy.ts`). Functionality is the same.

---

## Local setup

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**.
2. Pick any name (e.g. `smart-bookmarks`) and a region close to you.
3. When the project is ready, open **Project Settings → API** and copy:
   - **Project URL** (looks like `https://abcd1234.supabase.co`)
   - **anon public key** (a long `eyJ...` JWT)

### 3. Configure environment variables

Copy the example file and paste your values:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 4. Create the table + RLS policies

In the Supabase dashboard, open **SQL Editor → New query**, paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates the `bookmarks` table, the three RLS policies, the indexes, and adds the table to the realtime publication.

### 5. Enable Google sign-in

1. **Google Cloud Console** → <https://console.cloud.google.com/> → create a project (or pick an existing one).
2. **APIs & Services → OAuth consent screen** → set up an "External" app, fill in app name + support email, add your email under "Test users" (so you can sign in while the app is unpublished).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - **Application type:** Web application
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - your Vercel production URL once deployed (e.g. `https://smart-bookmarks.vercel.app`)
   - **Authorized redirect URIs:**
     - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
4. Copy the generated **Client ID** and **Client secret**.
5. Back in **Supabase → Authentication → Providers → Google**:
   - Toggle Google **enabled**.
   - Paste the Client ID and Client secret.
   - Save.
6. **Supabase → Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (you'll switch this to your Vercel URL after deploy).
   - **Redirect URLs:** add `http://localhost:3000/auth/callback` and `https://*.vercel.app/auth/callback` (the wildcard covers preview deployments).

### 6. Run the dev server

```bash
npm run dev
```

Open <http://localhost:3000>, click **Continue with Google**, and you should land on `/dashboard`.

---

## Verifying the core requirements

| Requirement                | How to verify                                                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Google OAuth only          | Landing page has only the Google button. No email/password forms.                                                                          |
| Add bookmarks              | Form rejects invalid URLs, empty titles, and malformed tags. Toast on success.                                                             |
| Private bookmarks (RLS)    | Open the SQL editor → `select * from public.bookmarks;` returns everything (you're using the service role there). The anon-key client used by the browser cannot return another user's rows because of the policies. Try signing in as a second Google account in an incognito window — the dashboard will be empty. |
| Real-time sync             | Open two browser tabs (or two browsers) on `/dashboard` while signed in. Add a bookmark in one → it appears in the other within ~1 second. Delete in one → it disappears in the other. |
| Delete with confirmation   | Hover a card → trash icon. Click it → modal with title + URL preview and a destructive button. Escape/click-outside cancels.                |
| Polished UI                | Try light & dark color schemes, narrow the viewport to mobile (cards collapse to 1 col), reload to see skeleton shimmer.                    |

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Go to <https://vercel.com/new> → import the repo.
3. **Environment Variables:** add both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (same values as your local `.env.local`).
4. Click **Deploy**.
5. After it deploys, copy the production URL and:
   - **Supabase → Authentication → URL Configuration:** change **Site URL** to the Vercel URL and ensure `https://<your-app>.vercel.app/auth/callback` is in **Redirect URLs**.
   - **Google Cloud Console → OAuth client → Authorized JavaScript origins:** add the Vercel URL.
6. Open the production URL and sign in. Done.

> Tip: if you set up a custom domain later, add it to both **Supabase Redirect URLs** and **Google Authorized origins**.

---

## Scripts

```bash
npm run dev        # local dev server
npm run build      # production build
npm run start      # run the production build
npm run lint       # eslint
```

---

## Security notes

- **RLS is the boundary**, not the frontend. The anon key is safe to expose. Try this query in the SQL editor while logged in via the dashboard, then with another user's session — you'll only ever see your own rows because of the `select own bookmarks` policy.
- The realtime channel filter (`user_id=eq.${userId}`) is defense-in-depth. RLS already filters the stream — the explicit filter just keeps the payload minimal.
- Cookies are HttpOnly and refreshed on every request by `proxy.ts` so sessions stay alive across server-rendered pages.

## License

MIT
