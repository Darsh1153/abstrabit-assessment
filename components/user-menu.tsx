"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

type Props = {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

export function UserMenu({ email, name, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  async function handleSignOut() {
    setPending(true);
    try {
      const res = await fetch("/auth/signout", { method: "POST" });
      if (!res.ok) throw new Error("Sign-out failed");
      window.location.href = "/";
    } catch (err) {
      setPending(false);
      toast.error("Could not sign out", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  const initial = (name || email).trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] text-sm font-medium transition hover:border-[var(--border-strong)]"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name ?? email}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span aria-hidden>{initial}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-fade-in absolute right-0 z-40 mt-2 w-64 origin-top-right rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-1 shadow-lg"
        >
          <div className="px-3 py-2.5">
            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <UserIcon className="h-3.5 w-3.5" aria-hidden />
              <span>Signed in as</span>
            </div>
            <div className="mt-0.5 truncate text-sm font-medium">
              {name || email}
            </div>
            {name && (
              <div className="truncate text-xs text-[var(--muted-foreground)]">
                {email}
              </div>
            )}
          </div>
          <div className="my-1 h-px bg-[var(--border)]" />
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            disabled={pending}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-[var(--muted)] disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span>{pending ? "Signing out…" : "Sign out"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
