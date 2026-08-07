/** Sticky alt CTA yüksekliği — çerez banner bunun üstüne oturur */
export const STICKY_CTA_H_VAR = "--acil-sticky-cta-h";

export function stickyCtaOffsetAyarla(heightPx: number): void {
  if (typeof document === "undefined") return;
  if (heightPx > 0) {
    document.documentElement.style.setProperty(
      STICKY_CTA_H_VAR,
      `${Math.round(heightPx)}px`
    );
  } else {
    document.documentElement.style.removeProperty(STICKY_CTA_H_VAR);
  }
  window.dispatchEvent(new Event("acil-sticky-cta"));
}

export function stickyCtaOffsetTemizle(): void {
  stickyCtaOffsetAyarla(0);
}
