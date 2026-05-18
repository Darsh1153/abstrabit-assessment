import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { BookmarksSection } from "@/components/bookmarks-section";
import { UserMenu } from "@/components/user-menu";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Bookmark as BookmarkType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load bookmarks:", error.message);
  }

  const initialBookmarks: BookmarkType[] = bookmarks ?? [];
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;
  const avatarUrl =
    (user.user_metadata?.avatar_url as string | undefined) ??
    (user.user_metadata?.picture as string | undefined) ??
    null;

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)]">
            <Bookmark className="h-4 w-4" aria-hidden />
          </div>
          <span className="text-sm font-semibold tracking-tight">
            Smart Bookmarks
          </span>
        </div>

        <UserMenu
          email={user.email ?? "user"}
          name={name}
          avatarUrl={avatarUrl}
        />
      </header>

      <section className="mt-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Your bookmarks
        </h1>
      </section>

      <BookmarksSection
        userId={user.id}
        initialBookmarks={initialBookmarks}
      />
    </main>
  );
}
