/** Sticky alt CTA yüksekliği — çerez banner bunun üstüne oturur */
export const STICKY_CTA_H_VAR = "--acil-sticky-cta-h";

/**
 * Gerçek görsel yükseklik — progress noktaları negatif margin (-mt-8) ile
 * üste taştığından `el.offsetHeight` bunu saymaz; sonuç sayfa içeriğinin
 * dar/kısa ekranlarda dokunun altında kalmasına yol açar (bkz. özet ekranı).
 * İlk çocuğun taşan üst kenarını da hesaba katar.
 */
export function stickyCtaGercekYukseklik(el: HTMLElement): number {
  const kutu = el.getBoundingClientRect();
  const ilkCocuk = el.firstElementChild as HTMLElement | null;
  const enUst = ilkCocuk
    ? Math.min(kutu.top, ilkCocuk.getBoundingClientRect().top)
    : kutu.top;
  return Math.max(0, kutu.bottom - enUst);
}

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
