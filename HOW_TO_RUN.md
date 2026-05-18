# How to Run & Verify — Smart Bookmarks

A hands-on walkthrough for running the app locally and confirming every requirement works. Follow the steps in order. Each section ends with a **Verify** checklist.

> Total time: ~15 minutes (most of it is waiting for Supabase to provision).

---

## Table of contents

- [Prerequisites](#prerequisites)
- [Part 1 — Install dependencies](#part-1--install-dependencies)
- [Part 2 — Create the Supabase project](#part-2--create-the-supabase-project)
- [Part 3 — Run the SQL schema (table, RLS, realtime)](#part-3--run-the-sql-schema-table-rls-realtime)
- [Part 4 — Set up Google OAuth](#part-4--set-up-google-oauth)
- [Part 5 — Configure Supabase Auth redirects](#part-5--configure-supabase-auth-redirects)
- [Part 6 — Add environment variables](#part-6--add-environment-variables)
- [Part 7 — Start the dev server](#part-7--start-the-dev-server)
- [Part 8 — Verify each feature](#part-8--verify-each-feature)
  - [1. Google OAuth login](#1-google-oauth-login)
  - [2. Add a bookmark (with validation)](#2-add-a-bookmark-with-validation)
  - [3. Private bookmarks via RLS](#3-private-bookmarks-via-rls)
  - [4. Real-time sync across tabs](#4-real-time-sync-across-tabs)
  - [5. Delete with confirmation](#5-delete-with-confirmation)
  - [6. Polished UI (responsive, dark mode, loading, empty states)](#6-polished-ui-responsive-dark-mode-loading-empty-states)
  - [7. Bonus: tag-based search + filter](#7-bonus-tag-based-search--filter)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js 20.13+** (check with `node -v`)
- **npm 10+** (ships with Node)
- A **Google account** (for OAuth sign-in)
- A free **Supabase account** at <https://supabase.com>
- A free **Google Cloud Console** project at <https://console.cloud.google.com>

---

## Part 1 — Install dependencies

From the project root:

```bash
npm install
```

Wait for it to finish (~30 s on a warm cache).

> If you see `EBADENGINE` warnings about ESLint requiring a newer Node, you can ignore them — the app builds and runs fine on Node 20.13.

**Verify:**

```bash
npm run lint
npm run build
```

Both should exit `0`. The build prints a route table ending with `ƒ Proxy (Middleware)`.

---

## Part 2 — Create the Supabase project

1. Open <https://supabase.com/dashboard> and sign in.
2. Click **New project**.
3. Pick any org, name it (e.g. `smart-bookmarks-local`), choose a region close to you, and set a strong **database password** (you won't need it for this app, but Supabase requires one).
4. Click **Create new project** and wait ~1 minute for it to provision.

**Verify:** the project dashboard loads and shows the **Home** page with your project ref (something like `abcd1234efgh`).

---

## Part 3 — Run the SQL schema (table, RLS, realtime)

1. In your Supabase project, click **SQL Editor** in the left sidebar.
2. Click **+ New query**.
3. Open `supabase/schema.sql` in this repo, copy its entire contents, and paste into the editor.
4. Click **Run** (or press ⌘/Ctrl + Enter).

You should see: `Success. No rows returned`.

**Verify:**

1. Go to **Table Editor → public → bookmarks**. The table exists with columns `id, user_id, url, title, tags, created_at`.
2. Go to **Database → Tables → bookmarks → Policies**. You should see three policies:
   - `select own bookmarks`
   - `insert own bookmarks`
   - `delete own bookmarks`
3. Go to **Database → Publications**. Click `supabase_realtime`. The `bookmarks` table should be listed.

> If any of the three policies are missing or realtime isn't enabled, paste the SQL again — it's idempotent.

---

## Part 4 — Set up Google OAuth

### 4a. Create an OAuth consent screen

1. Open <https://console.cloud.google.com/>.
2. Top-left → create a new project (or pick one) — name it `smart-bookmarks` (any name).
3. In the sidebar: **APIs & Services → OAuth consent screen**.
4. Choose **External** → **Create**.
5. Fill in:
   - **App name:** `Smart Bookmarks` (any name)
   - **User support email:** your email
   - **Developer contact:** your email
6. Click **Save and continue** through Scopes (skip — no extra scopes needed) and Test users.
7. On the **Test users** step, click **+ Add users** and add the Google email you'll be signing in with. (The app is in "testing" mode — only listed test users can sign in.)
8. **Save and continue** → **Back to dashboard**.

### 4b. Create OAuth credentials

1. In the sidebar: **APIs & Services → Credentials**.
2. Click **+ Create credentials → OAuth client ID**.
3. **Application type:** Web application.
4. **Name:** `Smart Bookmarks local`.
5. **Authorized JavaScript origins:** add
   - `http://localhost:3000`
6. **Authorized redirect URIs:** add **exactly this** (replace `YOUR-PROJECT-REF` with your Supabase project ref from Part 2):
   - `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
7. Click **Create**.
8. A modal pops up with your **Client ID** and **Client secret** — keep this open for the next step.

> The Supabase callback URL is `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`. You can find your project ref in your Supabase URL (e.g. for `https://abcd1234.supabase.co`, the ref is `abcd1234`).

### 4c. Enable Google in Supabase

1. Back in Supabase, go to **Authentication → Providers**.
2. Scroll to **Google** and toggle it **on**.
3. Paste:
   - **Client ID** (from Google)
   - **Client Secret** (from Google)
4. Leave the rest at defaults. Click **Save**.

**Verify:** the Google provider card now shows a green "Enabled" badge.

---

## Part 5 — Configure Supabase Auth redirects

1. In Supabase, go to **Authentication → URL Configuration**.
2. **Site URL:** set to `http://localhost:3000`.
3. **Redirect URLs:** click **Add URL** and add:
   - `http://localhost:3000/auth/callback`
4. Click **Save**.

**Verify:** both fields show your localhost URL.

---

## Part 6 — Add environment variables

1. In your Supabase project, go to **Project Settings → API**.
2. Copy:
   - **Project URL** (e.g. `https://abcd1234.supabase.co`)
   - **anon public** key (the long `eyJ...` JWT in the "Project API keys" section)

3. From the project root:

```bash
cp .env.local.example .env.local
```

4. Open `.env.local` and paste your values:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcd1234.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> The anon key is **safe to expose** — it's protected by the RLS policies we installed in Part 3.

---

## Part 7 — Start the dev server

```bash
npm run dev
```

Wait until you see:

```
✓ Ready in ~2s
- Local:   http://localhost:3000
```

Open <http://localhost:3000> in your browser.

**Verify:** you see the landing page with the title **"Save anything. Find it instantly."** and a **"Continue with Google"** button.

---

## Part 8 — Verify each feature

Work through each section in order. Keep the dev server running and the Supabase **Table Editor** open in another tab — you'll use both.

### 1. Google OAuth login

**Do:**

1. Click **Continue with Google** on the landing page.
2. You'll be redirected to Google's consent screen. Pick your Google account (the one you added as a test user in Part 4a).
3. Approve the permissions.

**Expected:** you land on `/dashboard` with the header "Your bookmarks", your avatar in the top-right, and the add-bookmark form below.

**Verify:**

- ✅ Top-right avatar shows your Google profile picture (or your initial if no picture).
- ✅ Click the avatar → dropdown shows your name + email, with a **Sign out** action.
- ✅ Open <http://localhost:3000/> in the same browser → you're auto-redirected to `/dashboard`. (Already signed in.)
- ✅ Click **Sign out** → you're back on the landing page.
- ✅ Try visiting `http://localhost:3000/dashboard` while signed out → redirected to `/` (route protection working via `proxy.ts`).

> If sign-in fails with `redirect_uri_mismatch`, recheck Part 4b step 6 — the Supabase callback URL must match **exactly**, including `https://` and `/auth/v1/callback`.

### 2. Add a bookmark (with validation)

Sign back in.

**Do — happy path:**

1. In the URL field, type: `https://nextjs.org`
2. In the Title field, type: `Next.js documentation`
3. In the Tags field, type `docs`, press Enter, then type `react`, press Enter.
4. Click **Save bookmark**.

**Expected:** a toast appears ("Bookmark saved"), the form resets, and a new card appears in the grid below with favicon, title, hostname, and the two tag chips.

**Verify validation — try each of these and confirm the inline error:**

- ✅ Empty URL → "URL is required"
- ✅ `not a real url` → "Enter a valid URL"
- ✅ `ftp://example.com` → "Only http(s) URLs are allowed"
- ✅ Empty title → "Title is required"
- ✅ Title > 200 chars → input cuts off at 200 (`maxLength`)
- ✅ A tag like `UPPER CASE!` → coerced to `upper-case` and the `!` is rejected with a clear error
- ✅ Add 6 tags → "Up to 5 tags"

**Verify auto-protocol:** type `example.com` (no `https://`) in the URL field → it's saved as `https://example.com`.

**Verify Backspace shortcut in tag input:** add some tags, clear the tag input text, press Backspace → the last tag is removed.

### 3. Private bookmarks via RLS

This is the most important security check.

**Do:**

1. In your **first browser** (signed in as User A), confirm you can see the bookmark you just saved.
2. Open an **incognito / private window** (or a different browser).
3. Visit <http://localhost:3000> → sign in with a **different Google account** (User B). If you only have one Google account, you can still verify via SQL (below).

**Expected:** User B's dashboard is empty. They cannot see User A's bookmark.

**Verify at the database level (most rigorous):**

1. In Supabase, open **SQL Editor → New query**.
2. Run:
   ```sql
   select id, user_id, title, url from public.bookmarks;
   ```
   This runs as the **service role** — you'll see all bookmarks from all users.
3. Now check that the policies actually prevent cross-user access. Run:
   ```sql
   select policyname, cmd, qual, with_check
   from pg_policies
   where schemaname = 'public' and tablename = 'bookmarks';
   ```
   You should see three rows, each with `(auth.uid() = user_id)` in either `qual` or `with_check`.

The policies guarantee that **even if a malicious user opened DevTools and ran `supabase.from('bookmarks').select('*')` directly**, they would only see rows where `user_id = auth.uid()`. The frontend doesn't filter anything — Postgres does, before the data ever leaves the database.

**Verify:**

- ✅ User B sees an empty dashboard.
- ✅ The SQL `select` from the service role shows both users' rows.
- ✅ `pg_policies` shows three policies enforcing `auth.uid() = user_id`.

### 4. Real-time sync across tabs

**Do:**

1. In the **same** browser (signed in as User A), open `/dashboard` in **two tabs** side by side.
2. In **Tab 1**, add a new bookmark (URL: `https://supabase.com`, Title: `Supabase`, no tags needed).
3. Watch **Tab 2** — within ~1 second, the new card should appear at the top of the grid without any refresh.

**Expected:** instant sync.

**Verify a few more events:**

- ✅ Delete a bookmark in Tab 1 → it disappears in Tab 2 within ~1 second.
- ✅ Open a **third tab** at `/dashboard`, add a bookmark in Tab 3, and verify it appears in **both** Tab 1 and Tab 2.
- ✅ Open DevTools → Network → filter by `WS` (WebSocket). You should see an active WebSocket connection to `wss://YOUR-PROJECT-REF.supabase.co/realtime/...`.

> The subscription filter is `user_id=eq.<your-user-id>`, so you only receive events for **your own** bookmarks. The filter is defense-in-depth — RLS would already restrict the stream.

### 5. Delete with confirmation

**Do:**

1. Hover over any bookmark card → a red trash icon appears in the top-right.
2. Click it.

**Expected:** a centered modal opens with:
- A warning icon
- "Delete this bookmark?" title
- The bookmark's title and URL preview
- **Cancel** and **Delete** buttons
- A backdrop overlay

**Verify accessibility:**

- ✅ Press **Escape** → modal closes, nothing deleted.
- ✅ Click the dimmed area outside the modal → modal closes.
- ✅ Open the modal, press **Tab** repeatedly → focus stays trapped inside the modal (cycles between Cancel and Delete).
- ✅ Click **Delete** → button shows a spinner "Deleting…", then the card is removed and a toast appears.
- ✅ If you Delete with two tabs open, both tabs update in real-time (from feature 4).

### 6. Polished UI (responsive, dark mode, loading, empty states)

**Responsive layout:**

- ✅ Resize your browser to ~400 px wide → cards stack to 1 column, header stays usable.
- ✅ Resize to ~700 px → 2 columns.
- ✅ Resize to ~1100 px → 3 columns.

**Dark mode (driven by `prefers-color-scheme`):**

- ✅ macOS: System Settings → Appearance → toggle Light/Dark. The app should switch instantly on reload.
- ✅ Windows/Linux: change OS theme similarly. Or use Chrome DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme".

**Loading state:**

- ✅ In DevTools, throttle the network to **Slow 3G**, then navigate to `/dashboard`. You should briefly see the shimmer skeleton placeholders before the real cards load.

**Empty state:**

- ✅ Delete all your bookmarks. The dashboard should show a friendly empty state with a bookmark icon and the message "No bookmarks yet". Add one — empty state disappears.

**Other polish:**

- ✅ Cards show a subtle hover state (border darkens, faint shadow).
- ✅ Hovering a bookmark title underlines it; an `↗` icon appears.
- ✅ Clicking a card title opens the link in a new tab (`target="_blank" rel="noopener noreferrer"`).
- ✅ The favicon next to each card loads from Google's favicon service. If a site has no favicon, a globe icon shows instead.
- ✅ Each card shows a relative timestamp like "2 minutes ago" in the bottom-right.

### 7. Bonus: tag-based search + filter

**Do:**

1. Add a few bookmarks with varied tags. Suggestions:
   - `https://nextjs.org` — title `Next.js` — tags `docs, react`
   - `https://supabase.com/docs` — title `Supabase docs` — tags `docs, db`
   - `https://tailwindcss.com` — title `Tailwind CSS` — tags `docs, design`
   - `https://github.com` — title `GitHub` — tags `dev`

**Verify search:**

- ✅ Type `next` in the search bar → only the Next.js card shows.
- ✅ Type `github.com` → only the GitHub card shows (search matches the URL too, not just the title).
- ✅ Clear search by clicking the **×** in the input.

**Verify tag filter:**

- ✅ The "Tags:" row above the grid shows every unique tag across your bookmarks (alphabetized).
- ✅ Click the `docs` chip → only `docs` bookmarks remain. The chip is highlighted (filled dark).
- ✅ Click `react` → now only bookmarks tagged **both** `docs` AND `react` remain (AND-semantic).
- ✅ Click `docs` again to remove it from the filter → only `react` filter remains.
- ✅ The count at the top updates: `"1 of 4 bookmarks"`, etc.
- ✅ Click any tag chip on a **card** → it also activates the filter (same toggle).
- ✅ Click the **Clear** button or the **×** to reset all filters.

**Verify it's truly client-side:**

- ✅ Open DevTools → Network. Filter to `XHR/Fetch`. Type in the search bar. **No new network requests fire** — all filtering is local to the realtime-synced list.

---

## Troubleshooting

### "Sign-in failed" or `redirect_uri_mismatch`

- Open Google Cloud Console → **APIs & Services → Credentials** → your OAuth client.
- Confirm the redirect URI is **exactly** `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback` (no trailing slash, no `http://`, correct project ref).

### Sign-in succeeds in Google but redirects to landing page with an error toast

- This means the code-for-session exchange failed. Check that the **anon key** in `.env.local` matches the one in **Supabase → Project Settings → API → anon public**.
- Also confirm **Authentication → URL Configuration → Redirect URLs** in Supabase includes `http://localhost:3000/auth/callback`.

### Bookmarks added in one tab don't show up in another

- Open DevTools → Network → filter `WS`. If there's no WebSocket connection, the realtime publication isn't set up.
- Re-run `supabase/schema.sql` in the SQL editor — the `do $$ ... $$` block at the bottom adds the table to the `supabase_realtime` publication idempotently.
- Verify in **Database → Publications → supabase_realtime** that `bookmarks` is listed.

### "Failed to load bookmarks" or empty dashboard for a signed-in user

- Open DevTools → Console. Look for an error from the server log.
- The most common cause is missing RLS policies — re-run `supabase/schema.sql`.

### Dev server fails to start with "Missing env"

- Make sure `.env.local` exists (not `.env.local.example`) and both keys are set.
- Restart `npm run dev` after creating/editing `.env.local` — Next.js reads it only on startup.

### `EBADENGINE` warnings during `npm install`

- Safe to ignore. The app works on Node 20.13+.

---

## Quick smoke-test script

If you just want a 60-second sanity check after setup:

1. `npm run dev`
2. Sign in with Google.
3. Add `https://example.com` / `Example` / tag `test`.
4. Open the dashboard in a second tab.
5. In tab 1, click the trash icon and confirm.
6. Watch tab 2 — bookmark disappears.

If all six steps work, every core requirement is functioning.
