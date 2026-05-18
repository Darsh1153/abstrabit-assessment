import { BookmarkSkeletonGrid, Skeleton } from "@/components/skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-12 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </header>

      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-72" />

      <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="mt-3 h-10 w-full" />
        <div className="mt-4 flex justify-end">
          <Skeleton className="h-10 w-36" />
        </div>
      </div>

      <div className="mt-8 flex-1">
        <BookmarkSkeletonGrid />
      </div>
    </main>
  );
}
