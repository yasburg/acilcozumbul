"use client";

import { useEffect } from "react";
import { posthogCerezSenkronize } from "@/lib/posthog-client";
import { idleSonra } from "@/lib/idle-sonra";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return idleSonra(() => {
      posthogCerezSenkronize();
    });
  }, []);

  return <>{children}</>;
}
