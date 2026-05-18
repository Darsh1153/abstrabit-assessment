import { redirect } from "next/navigation";
import { Bookmark, Search, Zap, Lock } from "lucide-react";
import { LoginButton } from "@/components/login-button";
import { AuthErrorToast } from "@/components/auth-error-toast";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{ auth_error?: string }>;
};

export default async function LandingPage({ searchParams }: PageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const params = await searchParams;
  const authError = params.auth_error;

  return (
    <main className="flex flex-1 flex-col">
      {authError && <AuthErrorToast message={authError} />}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Bookmark className="h-4 w-4" aria-hidden />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Smart Bookmarks
          </span>
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:py-20">

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Save anything. Find it instantly.
        </h1>
        <p className="mt-5 max-w-xl text-base text-pretty text-[var(--muted-foreground)] sm:text-lg">
          A focused bookmark manager that stays in sync. Organize with tags,
          search the moment you start typing, and never lose a link again.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:items-center">
          <LoginButton />
        </div>

      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-left">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--foreground)]">
        {icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}
