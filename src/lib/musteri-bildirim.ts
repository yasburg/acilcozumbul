"use client";

/** Tarayıcı bildirim izni iste */
export async function musteriBildirimIzniIste(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const sonuc = await Notification.requestPermission();
  return sonuc === "granted";
}

/** Yeni teklif geldiğinde tarayıcı bildirimi */
export function musteriYeniTeklifBildir(fiyat: number, cekiciAd: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  try {
    new Notification("Yeni teklif geldi!", {
      body: `${cekiciAd}: ${fiyat} TL — acilcozumbul.com`,
      icon: "/favicon.ico",
      tag: "yeni-teklif",
    });
  } catch {
    /* sessiz */
  }
}
