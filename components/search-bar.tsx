"use client";

import { Search, X } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  allTags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  onClear: () => void;
};

export function SearchBar({
  query,
  onQueryChange,
  allTags,
  activeTags,
  onToggleTag,
  onClear,
}: Props) {
  const hasFilters = activeTags.length > 0 || query.length > 0;

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by title or URL…"
          aria-label="Search bookmarks"
          className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pr-10 pl-9 text-sm transition placeholder:text-[var(--muted-foreground)]/70 focus:border-[var(--border-strong)] focus:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            aria-label="Clear search"
            className="absolute top-1/2 right-2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--muted-foreground)]">Tags:</span>
          {allTags.map((tag) => {
            const active = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                aria-pressed={active}
                className={
                  active
                    ? "inline-flex h-6 items-center rounded-full bg-[var(--primary)] px-2.5 text-[11px] font-medium tracking-wide text-[var(--primary-foreground)] uppercase"
                    : "inline-flex h-6 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[11px] font-medium tracking-wide text-[var(--muted-foreground)] uppercase transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
                }
              >
                {tag}
              </button>
            );
          })}
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="ml-1 inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-medium text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              <X className="h-3 w-3" aria-hidden />
              <span>Clear</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
