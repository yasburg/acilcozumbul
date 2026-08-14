/**
 * Onaylı profil foto sahiplerine toplu onay SMS’i kuyruğa alır ve tetikler.
 * Kullanım: npx tsx --env-file=.env scripts/profil-foto-onay-sms-toplu.ts
 */
import { profilFotoOnaySmsTopluKuyrugaAl } from "../src/lib/cekici-karar-sms";
import { getCekiciler } from "../src/lib/db";
import { ensureSeedData } from "../src/lib/seed";
import { smsDurumu } from "../src/lib/sms-provider";
import { telefonGecerliMi } from "../src/lib/telefon";

async function main() {
  await ensureSeedData();
  const cekiciler = await getCekiciler();
  const onaylilar = cekiciler.filter(
    (c) =>
      !c.testerHesap &&
      c.profilFotoDurum === "onaylandi" &&
      Boolean(c.profilFotoUrl?.trim()) &&
      telefonGecerliMi(c.telefon)
  );

  console.log("Onaylı alıcı:", onaylilar.length);
  for (const c of onaylilar.slice(0, 20)) {
    console.log(`  - ${c.ad} · ${c.telefon} · ${c.sehir}`);
  }
  if (onaylilar.length > 20) {
    console.log(`  … +${onaylilar.length - 20} kişi`);
  }

  if (onaylilar.length === 0) {
    console.log("Gönderilecek kimse yok.");
    return;
  }

  const durum = smsDurumu();
  console.log("SMS sağlayıcı:", durum.saglayici, {
    gercekGonderim: durum.gercekGonderim,
  });

  const sonuc = await profilFotoOnaySmsTopluKuyrugaAl({
    alicilar: onaylilar.map((c) => ({ telefon: c.telefon, ad: c.ad })),
    gonderenEposta: "script:profil-foto-onay-toplu",
    tetikleMod: "await",
  });

  if (!sonuc.ok) {
    console.error("Başarısız:", sonuc.hata);
    process.exit(1);
  }

  console.log("Kuyruk OK", {
    isId: sonuc.isId,
    aliciSayisi: sonuc.aliciSayisi,
  });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
