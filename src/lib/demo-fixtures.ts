import { randomUUID } from "crypto";
import type { Cekici, Talep } from "./types";
import { IHALE_SURE_DK } from "./ihale";
import { cekiciHizmetBolgeleri } from "./cekici-hizmet-bolge";

export const DEMO_TALEP_PREFIX = "demo-";

export type DemoSmsKaydi = {
  id: string;
  aliciTipi: "cekici" | "musteri";
  telefon: string;
  mesaj: string;
  link?: string;
  gonderim: string;
};

export type DemoOturumDurum = {
  talepler: Talep[];
  sms: DemoSmsKaydi[];
  anaTalepId: string;
  /** Demo çekici teklif verdikten sonra otomatik müşteri seçimi */
  otomatikKabul?: {
    talepId: string;
    teklifId: string;
    at: string;
  } | null;
};

/** Demo teklif → müşteri seçimi gecikmesi (sn) */
export function demoTeklifKabulGecikmeSn(): number {
  const ham = process.env.DEMO_TEKLIF_KABUL_SN?.trim();
  if (ham && /^\d+$/.test(ham)) {
    const n = Number(ham);
    if (n >= 5 && n <= 120) return n;
  }
  return 20;
}

export function isDemoTalepId(id: string): boolean {
  return id.startsWith(DEMO_TALEP_PREFIX);
}

export function demoRakipCekiciId(): string {
  return "demo-rakip-cekici";
}

export function demoRakipAd(): string {
  return "Mehmet Demir";
}

function ilceForCekici(cekici: Cekici): string {
  const bolgeler = cekiciHizmetBolgeleri(cekici);
  const ilceler = bolgeler[cekici.sehir];
  if (ilceler?.length) return ilceler[0]!;
  return "Merkez";
}

function ihaleBitis(): string {
  return new Date(Date.now() + IHALE_SURE_DK * 60 * 1000).toISOString();
}

/** Demo oturumu için başlangıç talepleri (gerçek DB'ye yazılmaz) */
export function demoBaslangicDurumu(cekici: Cekici): DemoOturumDurum {
  const ilce = ilceForCekici(cekici);
  const il = cekici.sehir;
  const anaId = `${DEMO_TALEP_PREFIX}${randomUUID()}`;
  const gizliId = `${DEMO_TALEP_PREFIX}${randomUUID()}`;
  const simdi = new Date().toISOString();
  const bitis = ihaleBitis();

  const anaTalep: Talep = {
    id: anaId,
    ad: "Ayşe",
    soyad: "Demir",
    telefon: "05551234567",
    konum: {
      lat: 41.0082,
      lng: 28.9784,
      adres: `${ilce}, ${il}`,
    },
    konumIl: il,
    konumIlce: ilce,
    hedefKonum: {
      lat: 41.02,
      lng: 29.01,
      adres: `Oto Sanayi, ${ilce}, ${il}`,
    },
    sorun: "ariza",
    sorunTipi: "ariza",
    sorunDetay: "Araç çalışmıyor, yol kenarında bekliyorum.",
    aracModeli: "Volkswagen Golf",
    durum: "ihalede",
    olusturulma: simdi,
    ihaleBitis: bitis,
    bildirilenCekiciIds: [cekici.id],
    teklifler: [
      {
        id: `${DEMO_TALEP_PREFIX}seed-rakip-${anaId.slice(-8)}`,
        cekiciId: demoRakipCekiciId(),
        cekiciAd: demoRakipAd(),
        fiyat: 2600,
        ilkFiyat: 2600,
        fiyatDegisti: false,
        tahminiSureDk: 30,
        mesaj: "Yarım saatte çıkarım.",
        tarih: simdi,
        durum: "aktif",
      },
    ],
    haricTutulanCekiciIds: [],
  };

  const gizliTalep: Talep = {
    id: gizliId,
    ad: "Mehmet",
    soyad: "Kaya",
    telefon: "05559876543",
    konum: {
      lat: 41.015,
      lng: 28.97,
      adres: `Bağdat Cd., ${ilce}, ${il}`,
    },
    konumIl: il,
    konumIlce: ilce,
    sorun: "lastik",
    sorunTipi: "lastik",
    sorunDetay: "Lastik patladı, stepne yok.",
    aracModeli: "Toyota Corolla",
    durum: "ihalede",
    olusturulma: simdi,
    ihaleBitis: bitis,
    bildirilenCekiciIds: [],
    teklifler: [],
    haricTutulanCekiciIds: [],
  };

  return {
    talepler: [anaTalep, gizliTalep],
    sms: [],
    anaTalepId: anaId,
  };
}
