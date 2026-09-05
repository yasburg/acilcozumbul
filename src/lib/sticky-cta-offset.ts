/** Sticky alt CTA yüksekliği — çerez banner bunun üstüne oturur */
export const STICKY_CTA_H_VAR = "--acil-sticky-cta-h";

/**
 * Gerçek görsel yükseklik — progress noktaları negatif margin (-mt-8) ile
 * üste taştığından `el.offsetHeight` / yalnızca ilk çocuğun kutusu bunu
 * saymaz; sonuç çerez şeridinin noktaların ve CTA'nın üstüne binmesine
 * yol açar (kayıt sihirbazı mobil).
 * Kök + tüm torunların üst kenarını birleştirerek ölçer.
 */
export function stickyCtaGercekYukseklik(el: HTMLElement): number {
  const kutu = el.getBoundingClientRect();
  let enUst = kutu.top;
  for (const node of el.querySelectorAll("*")) {
    const t = (node as HTMLElement).getBoundingClientRect().top;
    if (Number.isFinite(t)) enUst = Math.min(enUst, t);
  }
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
