"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function AuthErrorToast({ message }: { message: string }) {
  useEffect(() => {
    toast.error("Sign-in failed", { description: message });
  }, [message]);
  return null;
}
