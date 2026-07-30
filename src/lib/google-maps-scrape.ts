import { mesafeKmHaversine } from "./geo";
import { otoTamirAramaSorgusu, type KonumOneri } from "./hedef-oneri-data";

type ScrapeHam = {
  ad: string;
  adres: string;
  lat: number | null;
  lng: number | null;
  puan: number | null;
  puanSayisi: number | null;
  placeUrl: string;
  placeId: string;
};

/**
 * GoogleMapsScraper ile aynı yöntem: Playwright ile Maps arama feed’i.
 * Places API kapalı/hatalıyken Maps’teki gerçek sonuçları getirir.
 */
export async function googleMapsScrapeOtoTamir(
  lat: number,
  lng: number,
  opts: { semt?: string | null; il?: string | null; limit?: number } = {}
): Promise<{ oneriler: KonumOneri[]; hata?: string }> {
  const limit = opts.limit ?? 5;
  const sorgu = otoTamirAramaSorgusu({
    semt: opts.semt,
    il: opts.il,
  });

  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    return {
      oneriler: [],
      hata: "Playwright yüklü değil (npm i playwright).",
    };
  }

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  try {
    const page = await browser.newPage({
      locale: "tr-TR",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    });

    const url = `https://www.google.com/maps/search/${encodeURIComponent(sorgu)}?hl=tr`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    for (const sel of [
      'button:has-text("Tümünü kabul et")',
      'button:has-text("Accept all")',
      'button:has-text("Accept")',
    ]) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 1200 })) {
          await btn.click({ timeout: 2000 });
          break;
        }
      } catch {
        /* ignore */
      }
    }

    try {
      await page.waitForSelector('div[role="feed"]', { timeout: 15000 });
    } catch {
      return { oneriler: [], hata: "Google Maps sonuç listesi yüklenemedi." };
    }

    const feed = page.locator('div[role="feed"]').first();
    for (let i = 0; i < 6; i++) {
      const count = await page
        .locator('div[role="feed"] a[href*="/maps/place/"]')
        .count();
      if (count >= limit + 2) break;
      await feed.evaluate((el) => {
        el.scrollBy(0, el.scrollHeight);
      });
      await page.waitForTimeout(700);
    }

    const ham = await page.evaluate((max) => {
      const out: ScrapeHam[] = [];
      const feedEl = document.querySelector('div[role="feed"]');
      if (!feedEl) return out;
      const seen = new Set<string>();
      const anchors = Array.from(
        feedEl.querySelectorAll('a[href*="/maps/place/"]')
      ) as HTMLAnchorElement[];

      for (const anchor of anchors) {
        if (out.length >= max) break;
        const href = anchor.href || "";
        if (!href || seen.has(href)) continue;
        seen.add(href);

        const card =
          (anchor.closest("div[jsaction]") as HTMLElement | null) ||
          (anchor.parentElement?.parentElement as HTMLElement | null) ||
          anchor;
        const ad =
          anchor.getAttribute("aria-label")?.trim() ||
          card.querySelector(".fontHeadlineSmall")?.textContent?.trim() ||
          "";
        if (!ad) continue;

        const text = (card.textContent || "").replace(/\s+/g, " ").trim();
        let puan: number | null = null;
        let puanSayisi: number | null = null;
        const ratingMatch = text.match(/([0-5](?:\.\d)?)\s*\(([0-9.]+)\)/);
        if (ratingMatch) {
          puan = Number(ratingMatch[1]);
          puanSayisi = Number(ratingMatch[2].replace(/[^\d]/g, ""));
        }

        let latN: number | null = null;
        let lngN: number | null = null;
        const ll = href.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (ll) {
          latN = Number(ll[1]);
          lngN = Number(ll[2]);
        }

        let placeId = "";
        const idMatch =
          href.match(/!1s([^!&]+)/) || href.match(/place_id:([^&]+)/);
        if (idMatch) placeId = decodeURIComponent(idMatch[1]);

        /* Kart metninden adres satırı (puan/yorum sonrası) */
        let adres = "";
        const parts = text
          .split("·")
          .map((p) => p.trim())
          .filter(Boolean);
        for (const p of parts) {
          if (
            /mah|cad|sk\.|sok|no:|\/|istanbul|ankara|izmir/i.test(p) &&
            !/açık|kapalı|open|closed|yorum/i.test(p)
          ) {
            adres = p.replace(/^\d+[.,]\d+\s*\(\d+\)\s*/, "").trim();
            if (adres.length > 8) break;
          }
        }

        out.push({
          ad,
          adres,
          lat: latN,
          lng: lngN,
          puan,
          puanSayisi,
          placeUrl: href.split("&")[0],
          placeId,
        });
      }
      return out;
    }, limit + 4);

    const oneriler: KonumOneri[] = [];
    for (const item of ham) {
      if (oneriler.length >= limit) break;
      let itemLat = item.lat;
      let itemLng = item.lng;
      let adres = item.adres;

      if ((!itemLat || !itemLng || !adres) && item.placeUrl) {
        try {
          await page.goto(item.placeUrl, {
            waitUntil: "domcontentloaded",
            timeout: 25000,
          });
          await page.waitForTimeout(900);
          const detay = await page.evaluate(() => {
            const addressBtn = document.querySelector(
              'button[data-item-id="address"]'
            );
            let address =
              addressBtn?.getAttribute("aria-label") ||
              addressBtn?.textContent?.trim() ||
              "";
            address = address.replace(/^(Address|Adres):\s*/i, "").trim();
            let latitude: number | null = null;
            let longitude: number | null = null;
            const u = location.href;
            const ll =
              u.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ||
              u.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (ll) {
              latitude = Number(ll[1]);
              longitude = Number(ll[2]);
            }
            return { address, latitude, longitude };
          });
          if (detay.address) adres = detay.address;
          if (detay.latitude != null) itemLat = detay.latitude;
          if (detay.longitude != null) itemLng = detay.longitude;
        } catch {
          /* skip enrich */
        }
      }

      if (itemLat == null || itemLng == null) continue;
      if (!adres) {
        adres = [item.ad, opts.semt, opts.il].filter(Boolean).join(", ");
      }

      oneriler.push({
        ad: item.ad,
        adres,
        lat: itemLat,
        lng: itemLng,
        mesafeKm:
          Math.round(mesafeKmHaversine(lat, lng, itemLat, itemLng) * 10) / 10,
        placeId: item.placeId || undefined,
        puan: item.puan ?? undefined,
        puanSayisi: item.puanSayisi ?? undefined,
        kategori: "oto_tamir",
        etiketNo: oneriler.length + 1,
      });
    }

    oneriler.sort((a, b) => (a.mesafeKm ?? 99) - (b.mesafeKm ?? 99));
    oneriler.forEach((o, i) => {
      o.etiketNo = i + 1;
    });

    return { oneriler: oneriler.slice(0, limit) };
  } catch (e) {
    return {
      oneriler: [],
      hata: e instanceof Error ? e.message : "Maps scrape başarısız.",
    };
  } finally {
    await browser.close().catch(() => {});
  }
}
