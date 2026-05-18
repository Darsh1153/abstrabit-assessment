"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Globe, Trash2 } from "lucide-react";
import type { Bookmark } from "@/lib/types";
import {
  formatRelativeTime,
  getFaviconUrl,
  getHostname,
} from "@/lib/utils";

type Props = {
  bookmark: Bookmark;
  onDelete: () => void;
  onTagClick?: (tag: string) => void;
  activeTags?: string[];
};

export function BookmarkCard({
  bookmark,
  onDelete,
  onTagClick,
  activeTags = [],
}: Props) {
  const [faviconError, setFaviconError] = useState(false);
  const favicon = getFaviconUrl(bookmark.url);
  const host = getHostname(bookmark.url);

  return (
    <article className="group animate-fade-in relative flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)] hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--muted)]">
          {favicon && !faviconError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={favicon}
              alt=""
              className="h-5 w-5"
              onError={() => setFaviconError(true)}
              referrerPolicy="no-referrer"
            />
          ) : (
            <Globe
              className="h-4.5 w-4.5 text-[var(--muted-foreground)]"
              aria-hidden
            />
          )}
        </div>

        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/link min-w-0 flex-1"
        >
          <h3 className="line-clamp-2 text-sm leading-snug font-medium break-words group-hover/link:underline">
            {bookmark.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <span className="truncate">{host}</span>
            <ExternalLink
              className="h-3 w-3 shrink-0 opacity-0 transition group-hover/link:opacity-100"
              aria-hidden
            />
          </div>
        </a>

        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${bookmark.title}`}
          className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--muted-foreground)] opacity-0 transition hover:bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)] hover:text-[var(--destructive)] group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {bookmark.tags.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick?.(tag)}
              className={
                active
                  ? "inline-flex h-5.5 items-center rounded-full bg-[var(--primary)] px-2 text-[10.5px] font-medium tracking-wide text-[var(--primary-foreground)] uppercase"
                  : "inline-flex h-5.5 items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 text-[10.5px] font-medium tracking-wide text-[var(--muted-foreground)] uppercase transition hover:border-[var(--border-strong)] hover:text-[var(--foreground)]"
              }
            >
              {tag}
            </button>
          );
        })}
        <RelativeTime iso={bookmark.created_at} />
      </div>
    </article>
  );
}

function RelativeTime({ iso }: { iso: string }) {
  // Stable on server + first paint so hydration matches; switch to relative after mount
  const [label, setLabel] = useState(() =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  );

  useEffect(() => {
    setLabel(formatRelativeTime(iso));
  }, [iso]);

  return (
    <span className="ml-auto text-[11px] text-[var(--muted-foreground)]">
      {label}
    </span>
  );
}
