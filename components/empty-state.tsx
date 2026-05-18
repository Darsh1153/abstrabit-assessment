import { Bookmark } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

export function EmptyState({
  title = "No bookmarks yet",
  description = "Paste a URL above to save your first bookmark.",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--muted)]">
        <Bookmark
          className="h-6 w-6 text-[var(--muted-foreground)]"
          aria-hidden
        />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}

export function NoMatchesState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center">
      <h3 className="text-base font-semibold">No matching bookmarks</h3>
      <p className="mt-1 max-w-sm text-sm text-[var(--muted-foreground)]">
        Try a different search term or clear your filters.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 inline-flex h-9 items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium transition hover:bg-[var(--muted)]"
      >
        Clear filters
      </button>
    </div>
  );
}
