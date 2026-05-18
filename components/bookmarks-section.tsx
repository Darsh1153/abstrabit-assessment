"use client";

import { useCallback, useEffect, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { AddBookmarkForm } from "./add-bookmark-form";
import { BookmarkList } from "./bookmark-list";

type Props = {
  userId: string;
  initialBookmarks: Bookmark[];
};

export function BookmarksSection({ userId, initialBookmarks }: Props) {
  const [items, setItems] = useState<Bookmark[]>(initialBookmarks);

  const handleAdded = useCallback((bookmark: Bookmark) => {
    setItems((prev) => {
      if (prev.some((b) => b.id === bookmark.id)) return prev;
      return [bookmark, ...prev];
    });
  }, []);

  // Realtime keeps other tabs / devices in sync. The form already pushes
  // its own inserts via `onAdded`, so we dedupe by id here.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel: RealtimeChannel = supabase
      .channel(`bookmarks:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const incoming = payload.new as Bookmark;
          setItems((prev) =>
            prev.some((b) => b.id === incoming.id) ? prev : [incoming, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const removed = payload.old as Partial<Bookmark>;
          if (!removed.id) return;
          setItems((prev) => prev.filter((b) => b.id !== removed.id));
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <>
      <section className="mt-6">
        <AddBookmarkForm userId={userId} onAdded={handleAdded} />
      </section>

      <section className="mt-8 flex-1">
        <BookmarkList items={items} setItems={setItems} />
      </section>
    </>
  );
}
