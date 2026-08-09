"use client";

import { useEffect, type ReactNode } from "react";

/**
 * Lightweight bottom sheet for map + offers / emergency overlays.
 * Keeps content in-flow friendly on mobile; does not trap focus aggressively.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {onClose ? (
        <button
          type="button"
          className="fixed inset-0 z-0 bg-[var(--acb-dark)]/25 pointer-events-auto"
          aria-label="Kapat"
          onClick={onClose}
        />
      ) : null}
      <div
        className={`pointer-events-auto relative z-10 w-full max-w-lg max-h-[min(70dvh,560px)] overflow-y-auto rounded-t-[var(--acb-radius-lg)] border border-b-0 border-[var(--acb-border)] bg-white shadow-[0_-8px_28px_rgb(27_45_42/0.12)] pb-[max(0.75rem,env(safe-area-inset-bottom))] animate-fade-in ${className}`}
      >
        <div className="sticky top-0 z-10 flex flex-col items-center bg-white/95 px-4 pt-2 pb-2 backdrop-blur-md">
          <div
            className="mb-2 h-1 w-10 rounded-full bg-slate-300"
            aria-hidden
          />
          {title ? (
            <h2 className="w-full text-center text-base font-bold text-[var(--acb-dark)]">
              {title}
            </h2>
          ) : null}
        </div>
        <div className="px-4 pb-3">{children}</div>
      </div>
    </div>
  );
}
