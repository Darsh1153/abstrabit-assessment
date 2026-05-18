"use client";

import { useState, type KeyboardEvent } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { ZodError } from "zod";
import {
  bookmarkFormSchema,
  MAX_TAGS,
  TAG_REGEX,
} from "@/lib/schemas";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Bookmark } from "@/lib/types";
import { cn } from "@/lib/utils";

type FieldErrors = Partial<{
  url: string;
  title: string;
  tags: string;
}>;

type Props = {
  userId: string;
  onAdded?: (bookmark: Bookmark) => void;
};

export function AddBookmarkForm({ userId, onAdded }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function addTag(raw: string) {
    const cleaned = raw.trim().toLowerCase().replace(/\s+/g, "-");
    if (!cleaned) return;
    if (tags.includes(cleaned)) {
      setTagInput("");
      return;
    }
    if (tags.length >= MAX_TAGS) {
      setErrors((e) => ({ ...e, tags: `Up to ${MAX_TAGS} tags` }));
      return;
    }
    if (!TAG_REGEX.test(cleaned)) {
      setErrors((e) => ({
        ...e,
        tags: "Tags: lowercase letters, numbers, hyphens (2–20 chars)",
      }));
      return;
    }
    setTags((t) => [...t, cleaned]);
    setTagInput("");
    setErrors((e) => ({ ...e, tags: undefined }));
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((t) => t.slice(0, -1));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    try {
      const parsed = bookmarkFormSchema.parse({ url, title, tags });

      setPending(true);
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("bookmarks")
        .insert({
          user_id: userId,
          url: parsed.url,
          title: parsed.title,
          tags: parsed.tags,
        })
        .select("*")
        .single();

      if (error) throw error;

      if (data) onAdded?.(data);

      setUrl("");
      setTitle("");
      setTags([]);
      setTagInput("");
      toast.success("Bookmark saved", {
        description: parsed.title,
      });
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: FieldErrors = {};
        for (const issue of err.issues) {
          const key = issue.path[0] as keyof FieldErrors;
          if (key && !fieldErrors[key]) {
            fieldErrors[key] = issue.message;
          }
        }
        setErrors(fieldErrors);
      } else {
        toast.error("Could not save bookmark", {
          description: err instanceof Error ? err.message : "Try again.",
        });
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5"
    >
      <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr]">
        <div className="space-y-1.5">
          <label
            htmlFor="bm-url"
            className="text-xs font-medium text-[var(--muted-foreground)]"
          >
            URL
          </label>
          <input
            id="bm-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            placeholder="https://example.com/article"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() =>
              setErrors((er) => ({ ...er, url: undefined }))
            }
            aria-invalid={!!errors.url}
            className={cn(
              "h-10 w-full rounded-lg border bg-[var(--surface-elevated)] px-3 text-sm transition placeholder:text-[var(--muted-foreground)]/70 focus:outline-none",
              errors.url
                ? "border-[var(--destructive)]"
                : "border-[var(--border)] focus:border-[var(--border-strong)]",
            )}
          />
          {errors.url && (
            <p className="text-xs text-[var(--destructive)]">{errors.url}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="bm-title"
            className="text-xs font-medium text-[var(--muted-foreground)]"
          >
            Title
          </label>
          <input
            id="bm-title"
            type="text"
            placeholder="What is this bookmark about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() =>
              setErrors((er) => ({ ...er, title: undefined }))
            }
            aria-invalid={!!errors.title}
            maxLength={200}
            className={cn(
              "h-10 w-full rounded-lg border bg-[var(--surface-elevated)] px-3 text-sm transition placeholder:text-[var(--muted-foreground)]/70 focus:outline-none",
              errors.title
                ? "border-[var(--destructive)]"
                : "border-[var(--border)] focus:border-[var(--border-strong)]",
            )}
          />
          {errors.title && (
            <p className="text-xs text-[var(--destructive)]">{errors.title}</p>
          )}
        </div>
      </div>

      <div className="mt-3 space-y-1.5">
        <label
          htmlFor="bm-tags"
          className="text-xs font-medium text-[var(--muted-foreground)]"
        >
          Tags{" "}
          <span className="font-normal opacity-70">
            (optional · press Enter or comma to add · up to {MAX_TAGS})
          </span>
        </label>
        <div
          className={cn(
            "flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border bg-[var(--surface-elevated)] px-2 py-1.5 text-sm transition focus-within:border-[var(--border-strong)]",
            errors.tags
              ? "border-[var(--destructive)]"
              : "border-[var(--border)]",
          )}
        >
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-[var(--muted)] py-0.5 pr-1 pl-2 text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--muted-foreground)] hover:bg-[var(--border)] hover:text-[var(--foreground)]"
                aria-label={`Remove tag ${tag}`}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          ))}
          <input
            id="bm-tags"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
            onBlur={() => {
              if (tagInput) addTag(tagInput);
            }}
            placeholder={
              tags.length === 0 ? "e.g. reading, design, react" : ""
            }
            maxLength={20}
            className="min-w-[120px] flex-1 bg-transparent px-1 py-0.5 text-sm placeholder:text-[var(--muted-foreground)]/70 focus:outline-none"
          />
        </div>
        {errors.tags && (
          <p className="text-xs text-[var(--destructive)]">{errors.tags}</p>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="h-4 w-4" aria-hidden />
          )}
          <span>{pending ? "Saving…" : "Save bookmark"}</span>
        </button>
      </div>
    </form>
  );
}
