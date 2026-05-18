"use client";

import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { BookmarkCard } from "./bookmark-card";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { EmptyState, NoMatchesState } from "./empty-state";
import { SearchBar } from "./search-bar";

type Props = {
  items: Bookmark[];
  setItems: Dispatch<SetStateAction<Bookmark[]>>;
};

export function BookmarkList({ items, setItems }: Props) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Bookmark | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const b of items) for (const t of b.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((b) => {
      if (
        q &&
        !b.title.toLowerCase().includes(q) &&
        !b.url.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (activeTags.length > 0) {
        return activeTags.every((t) => b.tags.includes(t));
      }
      return true;
    });
  }, [items, query, activeTags]);

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }, []);

  const clearFilters = useCallback(() => {
    setQuery("");
    setActiveTags([]);
  }, []);

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeletePending(true);
    const supabase = createSupabaseBrowserClient();
    const idToRemove = pendingDelete.id;

    const previous = items;
    setItems((prev) => prev.filter((b) => b.id !== idToRemove));

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", idToRemove);

    setDeletePending(false);
    setPendingDelete(null);

    if (error) {
      setItems(previous);
      toast.error("Could not delete bookmark", { description: error.message });
      return;
    }
    toast.success("Bookmark deleted");
  }

  const isEmpty = items.length === 0;
  const noMatches = !isEmpty && filtered.length === 0;

  return (
    <div className="space-y-4">
      {!isEmpty && (
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          allTags={allTags}
          activeTags={activeTags}
          onToggleTag={toggleTag}
          onClear={clearFilters}
        />
      )}

      {isEmpty ? (
        <EmptyState />
      ) : noMatches ? (
        <NoMatchesState onClear={clearFilters} />
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <span>
              {filtered.length} of {items.length}{" "}
              {items.length === 1 ? "bookmark" : "bookmarks"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                onDelete={() => setPendingDelete(b)}
                onTagClick={toggleTag}
                activeTags={activeTags}
              />
            ))}
          </div>
        </>
      )}

      <DeleteConfirmDialog
        open={!!pendingDelete}
        title="Delete this bookmark?"
        description={
          pendingDelete ? (
            <span>
              <span className="font-medium text-[var(--foreground)]">
                {pendingDelete.title}
              </span>
              <br />
              <span className="text-xs break-all">{pendingDelete.url}</span>
            </span>
          ) : null
        }
        pending={deletePending}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deletePending && setPendingDelete(null)}
      />
    </div>
  );
}
