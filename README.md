# Smart Bookmarks

A bookmark manager with Google sign-in, private storage (Supabase RLS), and real-time sync across tabs.

## What you need

- Node.js 20+
- A [Supabase](https://supabase.com) project
- Google OAuth credentials (for sign-in)

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public** key.

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Enable Google sign-in

**Google Cloud Console**

1. Create an OAuth client (Web application).
2. **Authorized JavaScript origins:** `http://localhost:3000`
3. **Authorized redirect URIs:** `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`

**Supabase**

1. **Authentication → Providers → Google** — enable and paste the Client ID and secret.
2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

Add your Google account as a **test user** on the OAuth consent screen while the app is in testing mode.

### 5. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with Google, and use the dashboard.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server         |
| `npm run build`| Production build         |
| `npm run start`| Run production build     |
| `npm run lint` | Run ESLint               |

## Tech stack

Next.js · React · TypeScript · Tailwind CSS · Supabase (Auth, Postgres, Realtime) · Zod

## License

MIT
