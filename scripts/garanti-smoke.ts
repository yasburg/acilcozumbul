/**
 * Garanti test ortamı duman testi (sunucu tarafı, 1 TL = 100 kuruş).
 * Kullanım: npx tsx --env-file=.env scripts/garanti-smoke.ts
 *
 * .env içinde (sadece test; commit etmeyin):
 *   GARANTI_SMOKE_CARD=...
 *   GARANTI_SMOKE_CVV=...
 *   GARANTI_SMOKE_EXPIRY_MONTH=01
 *   GARANTI_SMOKE_EXPIRY_YEAR=28
 */
import {
  garantiYapilandirildi,
  garantiYapilandirmaOzeti,
} from "../src/lib/garanti/config";
import { garantiKrediOdemesiYap } from "../src/lib/garanti/payment";
import { krediTutarKurus } from "../src/lib/kredi-fiyat";

async function main() {
  if (!garantiYapilandirildi()) {
    console.error("Garanti yapılandırması eksik (TERMINAL_ID, POST_URL, vb.).");
    process.exit(1);
  }

  const { garantiSmokeKartOku } = await import("../src/lib/garanti/smoke-kart");
  const smokeKart = garantiSmokeKartOku();
  if (!smokeKart) {
    console.error(
      "Test kartı için .env:\n" +
        "  GARANTI_TEST_CARD / GARANTI_TEST_CVV / GARANTI_TEST_EXPIRY_* veya\n" +
        "  GARANTI_SMOKE_*"
    );
    process.exit(1);
  }

  const orderId = `test${Date.now()}`.slice(0, 24);
  const krediAdet = 1;
  const amountKurus = krediTutarKurus(krediAdet);

  const ozet = garantiYapilandirmaOzeti();
  console.log("Garanti smoke test:", {
    profil: ozet.profil,
    mod: ozet.mod,
    postUrl: ozet.postUrl,
    terminalId: ozet.terminalId,
    merchantId: ozet.merchantId,
    orderId,
    amountKurus,
    krediAdet,
  });
  if (ozet.uyarilar.length) console.warn("Uyarilar:", ozet.uyarilar);

  const [ay, yil] = smokeKart.sonKullanma.split("/");
  const sonuc = await garantiKrediOdemesiYap({
    orderId,
    amountKurus,
    cardNumber: smokeKart.kartNo,
    expiryMonth: ay,
    expiryYear: yil,
    cvv: smokeKart.cvv,
    clientIp: "192.168.0.1",
  });

  if (sonuc.basarili) {
    console.log("BAŞARILI", { refNo: sonuc.refNo, respCode: sonuc.respCode });
    process.exit(0);
  }

  if (sonuc.respCode === "92") {
    console.error(
      "\n→ 92: Terminal/şifre uyuşmuyor. .env içine yazın:\n" +
        "  GARANTI_TEST_TERMINAL_ID=30691297\n" +
        "  GARANTI_TEST_MERCHANT_ID=7000679\n" +
        "  GARANTI_TEST_PASSWORD=123qweASD/\n"
    );
  }
  if (sonuc.respCode === "53") {
    console.error(
      "\n→ 53: Kart/hesap reddi (terminal doğru; refNo alındı).\n" +
        "  PARACARD 979236… VPServlet peşin satışta genelde 53 verir.\n" +
        "  Deneyin: Simülatör 4282209004348015 (08/27, CVV 123) veya\n" +
        "  BONUS 5549603469426017 (01/27, CVV 916) — dev.garantibbva.com.tr/test-kartlari\n"
    );
  }
  console.error("REDDEDİLDİ", sonuc);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
