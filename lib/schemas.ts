import { z } from "zod";
import { normalizeUrl } from "@/lib/utils";

export const TAG_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,18}[a-z0-9])?$/;
export const MAX_TAGS = 5;

export const bookmarkFormSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(2048, "URL is too long")
    .transform((v) => normalizeUrl(v))
    .pipe(
      z
        .string()
        .url("Enter a valid URL")
        .refine((v) => /^https?:\/\//i.test(v), "Only http(s) URLs are allowed"),
    ),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or fewer"),
  tags: z
    .array(z.string())
    .max(MAX_TAGS, `Up to ${MAX_TAGS} tags`)
    .default([])
    .transform((arr) => {
      const cleaned = arr
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);
      return Array.from(new Set(cleaned));
    })
    .pipe(
      z.array(
        z
          .string()
          .regex(
            TAG_REGEX,
            "Tags can only contain lowercase letters, numbers, and hyphens",
          )
          .max(20, "Tags must be 20 characters or fewer"),
      ),
    ),
});

export type BookmarkFormInput = z.input<typeof bookmarkFormSchema>;
export type BookmarkFormOutput = z.output<typeof bookmarkFormSchema>;
