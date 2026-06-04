import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addTalep } from "@/lib/db";
import { getDogrulanmisTelefon } from "@/lib/musteri-auth";
import { ensureSeedData } from "@/lib/seed";
import { notifyCekiciler, notifyMusteri } from "@/lib/sms";
import { funnelOlayKaydet } from "@/lib/funnel";
import {
  guvenlikOlayiKaydet,
  talepFraudKontrol,
} from "@/lib/talep-fraud";
import { ipHash, istekIp } from "@/lib/request-ip";
import { IHALE_SURE_DK } from "@/lib/ihale";
import { parseIlIlce } from "@/lib/konum-parse";
import {
  sorunAracModeliGerekliMi,
  sorunFotografGerekliMi,
  sorunMetniOlustur,
  sorunTipiBul,
} from "@/lib/sorun-tipleri";
import { talepFotografYukle } from "@/lib/talep-fotograf";
import { smsBaseUrl } from "@/lib/sms-base-url";
import { telefonNormalize } from "@/lib/telefon";
import type { Talep } from "@/lib/types";

export async function POST(request: NextRequest) {
  await ensureSeedData();

  const body = await request.json();
  const {
    ad,
    soyad,
    telefon,
    konum,
    hedefKonum,
    sorunTipi,
    sorunDetay,
    sorun,
    aracModeli,
    fotograf,
  } = body;

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

  if (!ad || !soyad || !telefon || !konum?.adres || !sorunMetni) {
    return NextResponse.json(
      { error: "Tüm alanları doldurun." },
      { status: 400 }
    );
  }

  const dogrulanmisTel = await getDogrulanmisTelefon();
  if (!dogrulanmisTel || dogrulanmisTel !== telefonNormalize(telefon)) {
    return NextResponse.json(
      { error: "Telefon doğrulaması gerekli. Lütfen SMS kodunu onaylayın." },
      { status: 403 }
    );
  }

  if (!hedefKonum?.adres) {
    return NextResponse.json(
      { error: "Aracın çekileceği adres gerekli." },
      { status: 400 }
    );
  }

  const ip = istekIp(request);
  const hash = ipHash(ip);
  const telNorm = telefonNormalize(telefon);

  const fraud = await talepFraudKontrol(telNorm, hash);
  if (!fraud.ok) {
    return NextResponse.json({ error: fraud.hata }, { status: 429 });
  }

  const olusturulma = new Date();
  const ihaleBitis = new Date(olusturulma.getTime() + IHALE_SURE_DK * 60 * 1000);
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
    modelMetni && sorunAracModeliGerekliMi(tip)
      ? `${sorunMetni} · Araç: ${modelMetni}`
      : sorunMetni;

  const talep: Talep = {
    id: talepId,
    ad: ad.trim(),
    soyad: soyad.trim(),
    telefon: telefon.trim(),
    konum: {
      lat: konum.lat ?? 0,
      lng: konum.lng ?? 0,
      adres: konum.adres.trim(),
    },
    konumIl: konumIl ?? undefined,
    konumIlce: konumIlce ?? undefined,
    hedefKonum: {
      lat: hedefKonum.lat ?? 0,
      lng: hedefKonum.lng ?? 0,
      adres: hedefKonum.adres.trim(),
    },
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
  await notifyMusteri(talep, "talep_alindi", baseUrl);

  await guvenlikOlayiKaydet({
    anahtar: hash ? `ip:${hash}` : `tel:${telNorm}`,
    olayTipi: "talep_olustur",
    ipHash: hash,
    telefon: telNorm,
  });
  await funnelOlayKaydet({
    olay: "talep_olustur",
    telefon: telNorm,
    ipHash: hash,
    talepId: talep.id,
  });

  return NextResponse.json({
    id: talep.id,
    bildirilenSayisi: bildirilenIds.length,
  });
}
