import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addTalep } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { notifyKrediHatirlatma } from "@/lib/kredi-hatirlatma-db";
import { notifyCekiciler, notifyMusteri } from "@/lib/sms";
import { funnelOlayKaydet } from "@/lib/funnel";
import {
  guvenlikOlayiKaydet,
  talepFraudKontrol,
} from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";
import { ihaleBitisHesapla, ihaleSureTipiNormalize } from "@/lib/ihale";
import { parseIlIlce } from "@/lib/konum-parse";
import {
  sorunAracModeliAlaniGoster,
  sorunAracModeliGerekliMi,
  sorunFotografGerekliMi,
  sorunHedefKonumGerekliMi,
  sorunMetniOlustur,
  sorunTipiBul,
} from "@/lib/sorun-tipleri";
import { talepFotografYukle } from "@/lib/talep-fotograf";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { telefonGecerliMi, telefonNormalize } from "@/lib/telefon";
import type { KonumKaynak, Talep } from "@/lib/types";

export async function POST(request: NextRequest) {
  await ensureSeedData();

  const body = await request.json();
  const {
    ad,
    soyad,
    telefon,
    konum,
    hedefKonum,
    hedefBilinmiyor: hedefBilinmiyorRaw,
    sorunTipi,
    sorunDetay,
    sorun,
    aracModeli,
    fotograf,
    ihaleSureTipi: ihaleSureTipiRaw,
    ihaleOzelBitis: ihaleOzelBitisRaw,
  } = body;

  const hedefBilinmiyor = Boolean(hedefBilinmiyorRaw);

  const tip = sorunTipi?.trim() || "diger";
  if (!sorunTipiBul(tip) && !sorun) {
    return NextResponse.json({ error: "Geçerli bir sorun seçin." }, { status: 400 });
  }

  const sorunMetni =
    sorun?.trim() || sorunMetniOlustur(tip, sorunDetay?.trim());

  if (tip === "diger" && !sorunDetay?.trim() && !sorun?.trim()) {
    return NextResponse.json(
      { error: "Lütfen sorununuzu kısaca açıklayın." },
      { status: 400 }
    );
  }

  if (sorunAracModeliGerekliMi(tip) && !aracModeli?.trim()) {
    return NextResponse.json(
      { error: "Araç modelini girin (ör. Audi A3 sedan)." },
      { status: 400 }
    );
  }

  if (sorunFotografGerekliMi(tip) && !fotograf?.trim()) {
    return NextResponse.json(
      { error: "Arıza fotoğrafı gerekli." },
      { status: 400 }
    );
  }

  if (!konum?.adres || !sorunMetni) {
    return NextResponse.json(
      { error: "Konum ve sorun bilgisi gerekli." },
      { status: 400 }
    );
  }

  /* İletişim (ad/soyad/telefon) teklif seçiminde alınır — oluşturmada opsiyonel */
  const adMetin = typeof ad === "string" ? ad.trim() : "";
  const soyadMetin = typeof soyad === "string" ? soyad.trim() : "";
  const telHam = typeof telefon === "string" ? telefon.trim() : "";
  const telNorm = telHam ? telefonNormalize(telHam) : "";
  if (telHam && !telefonGecerliMi(telNorm)) {
    return NextResponse.json(
      { error: "Geçerli bir Türkiye cep telefonu girin." },
      { status: 400 }
    );
  }

  if (
    sorunHedefKonumGerekliMi(tip) &&
    !hedefBilinmiyor &&
    !hedefKonum?.adres
  ) {
    return NextResponse.json(
      { error: "Aracın çekileceği adres gerekli." },
      { status: 400 }
    );
  }

  const ip = istekIp(request);
  const hash = ipHash(ip);

  const fraud = await talepFraudKontrol(telNorm || null, hash);
  if (!fraud.ok) {
    return NextResponse.json({ error: fraud.hata }, { status: 429 });
  }

  const olusturulma = new Date();
  const ihaleSureTipi = ihaleSureTipiNormalize(ihaleSureTipiRaw);
  const ihaleHesap = ihaleBitisHesapla(ihaleSureTipi, {
    ozelBitis:
      typeof ihaleOzelBitisRaw === "string" ? ihaleOzelBitisRaw : undefined,
    simdi: olusturulma,
  });
  if (!ihaleHesap.ok) {
    return NextResponse.json({ error: ihaleHesap.hata }, { status: 400 });
  }
  const ihaleBitis = ihaleHesap.bitis;
  const { il: konumIl, ilce: konumIlce } = parseIlIlce(konum.adres.trim());

  const talepId = randomUUID();
  const fotografUrls: string[] = [];
  if (fotograf?.trim()) {
    const url = await talepFotografYukle(talepId, fotograf.trim());
    if (url) fotografUrls.push(url);
    else if (sorunFotografGerekliMi(tip)) {
      return NextResponse.json(
        { error: "Fotoğraf yüklenemedi. Lütfen tekrar deneyin." },
        { status: 400 }
      );
    }
  }

  const modelMetni = aracModeli?.trim();
  const sorunTam =
    modelMetni && sorunAracModeliAlaniGoster(tip)
      ? `${sorunMetni} · Araç: ${modelMetni}`
      : sorunMetni;

  const konumKaynak: KonumKaynak | undefined =
    konum.kaynak === "gps" || konum.kaynak === "manuel"
      ? konum.kaynak
      : undefined;

  const talep: Talep = {
    id: talepId,
    ad: adMetin,
    soyad: soyadMetin,
    telefon: telNorm,
    konum: {
      lat: konum.lat ?? 0,
      lng: konum.lng ?? 0,
      adres: konum.adres.trim(),
      ...(konumKaynak ? { kaynak: konumKaynak } : {}),
    },
    konumIl: konumIl ?? undefined,
    konumIlce: konumIlce ?? undefined,
    ...(sorunHedefKonumGerekliMi(tip) && !hedefBilinmiyor && hedefKonum?.adres
      ? {
          hedefKonum: {
            lat: hedefKonum.lat ?? 0,
            lng: hedefKonum.lng ?? 0,
            adres: hedefKonum.adres.trim(),
          },
        }
      : {}),
    ...(hedefBilinmiyor ? { hedefBilinmiyor: true } : {}),
    sorun: sorunTam,
    sorunTipi: tip,
    sorunDetay: sorunDetay?.trim(),
    aracModeli: modelMetni,
    fotografUrls: fotografUrls.length ? fotografUrls : undefined,
    durum: "ihalede",
    olusturulma: olusturulma.toISOString(),
    ihaleBitis: ihaleBitis.toISOString(),
    bildirilenCekiciIds: [],
    teklifler: [],
  };

  const baseUrl = smsBaseUrl(
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );

  const bildirilenIds = await notifyCekiciler(talep, baseUrl);
  talep.bildirilenCekiciIds = bildirilenIds;

  await addTalep(talep);
  if (telefonGecerliMi(talep.telefon)) {
    await notifyMusteri(talep, "talep_alindi", baseUrl);
  }

  try {
    await notifyKrediHatirlatma(talep, baseUrl, bildirilenIds);
  } catch (e) {
    console.error("[kredi-hatirlatma] otomatik", e);
  }

  await guvenlikOlayiKaydet({
    anahtar: hash ? `ip:${hash}` : telNorm ? `tel:${telNorm}` : `talep:${talepId}`,
    olayTipi: "talep_olustur",
    ipHash: hash,
    telefon: telNorm || null,
  });
  await funnelOlayKaydet({
    olay: "talep_olustur",
    telefon: telNorm || null,
    ipHash: hash,
    talepId: talep.id,
  });

  return NextResponse.json({
    id: talep.id,
    bildirilenSayisi: bildirilenIds.length,
  });
}
