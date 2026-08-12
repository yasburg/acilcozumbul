"use client";

import type { ReactNode } from "react";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";

type TrustBadgeVariant = "verified" | "rating" | "neutral" | "warn";

const VARIANT: Record<TrustBadgeVariant, string> = {
  verified:
    "bg-[color-mix(in_srgb,var(--acb-green)_12%,white)] text-[var(--acb-dark)] border-[color-mix(in_srgb,var(--acb-green)_35%,white)]",
  rating:
    "bg-[var(--acb-soft)] text-[var(--acb-dark)] border-[var(--acb-border)]",
  neutral: "bg-white text-[var(--acb-dark)] border-[var(--acb-border)]",
  warn: "bg-[color-mix(in_srgb,var(--acb-orange)_14%,white)] text-[var(--acb-dark)] border-[color-mix(in_srgb,var(--acb-orange)_40%,white)]",
};

export function TrustBadge({
  children,
  variant = "neutral",
  className = "",
}: {
  children: ReactNode;
  variant?: TrustBadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[0.625rem] border px-2 py-1 text-xs font-semibold leading-none shadow-[0_1px_1px_rgba(27,45,42,0.03)] ${VARIANT[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function VerifiedBadge({
  label = "Belgeli Çekici",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const Shield = AcbIcons.verified;
  return (
    <TrustBadge variant="verified" className={compact ? "!text-[11px]" : ""}>
      <Shield
        className="size-3.5 text-[var(--acb-green)]"
        strokeWidth={ACB_ICON_STROKE}
        aria-hidden
      />
      {label}
    </TrustBadge>
  );
}
