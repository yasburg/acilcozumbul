"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field, TextArea } from "@/components/ui";
import {
  NETGSM_TOPLU_SMS_BIRIM,
  NETGSM_TOPLU_SMS_MAX_BIRIM,
  netgsmSmsMesajGecerliMi,
} from "@/lib/sms-karakter";
import {
  elleTelefonEkle,
  excelAlicilariListeyeEkle,
  exceldenTopluSmsAliciOku,
  topluSmsExcelSablonIndir,
  type ExcelYukleOzet,
  type TopluSmsAlici,
} from "@/lib/toplu-sms-excel";
import { telefonMaskele } from "@/lib/telefon";
import {
  SMS50_KAMPANYA_KODU,
  SMS50_KISISEL_LINK_PH,
  SMS50_TEST_VARYANT,
  SMS50_VARYANTLAR,
  sms50KisaUrl,
  sms50MesajBirimOnizleme,
  type Sms50Varyant,
} from "@/lib/sms50-kampanya";
import {
  TOPLU_SMS_TEMPO_PRESETLER,
  TOPLU_SMS_TEMPO_VARSAYILAN,
  topluSmsSureMetni,
  topluSmsTahminiSureSn,
  topluSmsTempoNormalize,
  type TopluSmsTempo,
  type TopluSmsTempoPresetId,
} from "@/lib/toplu-sms-tempo";
import { Sms50TiklamaSaatTablosu } from "@/components/panel/Sms50TiklamaSaatTablosu";

type KuyrukIs = {
  id: string;
  durum: "beklemede" | "suruyor" | "bitti" | "iptal" | "hata";
  partiIndex: number;
  partiToplam: number;
  basarili: number;
  basarisiz: number;
  oncekiAtlandi: number;
  kalanSn: number | null;
  sonrakiPartiAt?: string | null;
  hata: string | null;
  listeId: string | null;
  mesajParca: number | null;
  mesaj?: string;
  aliciSayisi?: number;
};

function kuyrukIsAktifMi(is: KuyrukIs) {
  return is.durum === "beklemede" || is.durum === "suruyor";
}

function kuyrukIsBaslik(is: KuyrukIs) {
  if (
    is.durum === "beklemede" &&
    is.partiIndex === 0 &&
    is.sonrakiPartiAt &&
    (is.kalanSn ?? 0) > 30
  ) {
    return `Zamanlandı · başlangıç ${tarihKisa(is.sonrakiPartiAt)}${
      is.kalanSn != null ? ` · ~${topluSmsSureMetni(is.kalanSn)} kaldı` : ""
    }`;
  }
  if (is.durum === "beklemede") return "Kuyruk başlıyor…";
  if (is.kalanSn != null && is.kalanSn > 0) {
    return `Parti ${is.partiIndex}/${is.partiToplam} bitti · sonraki için ~${is.kalanSn} sn`;
  }
  return `Parti ${Math.min(is.partiIndex + 1, is.partiToplam)}/${is.partiToplam} gönderiliyor…`;
}

type Sekme = "gonder" | "testler" | "listeler" | "genel";
type OncekiMod = "atla" | "yine";
type ZamanlamaMod = "simdi" | "zamanli";

type ListeOzet = {
  id: string;
  olusturulma: string;
  gonderenEposta: string | null;
  mesaj: string;
  aliciSayisi: number;
  basarili: number;
  basarisiz: number;
  mesajParca: number | null;
  kampanyaKodu?: string | null;
  varyant?: string | null;
};

type GenelTelefon = {
  telefon: string;
  ad: string | null;
  ilkGonderim: string;
  sonGonderim: string;
  gonderimSayisi: number;
  basariliSayisi: number;
  linkActi?: boolean | null;
  ilkTiklama?: string | null;
  kayitli?: boolean;
  kayitAt?: string | null;
};

type ListeAlici = {
  telefon: string;
  ad: string | null;
  basarili: boolean;
  hata: string | null;
};

type TestLinkOzet = {
  varyant: Sms50Varyant;
  kisaUrl: string;
  gonderilen: number;
  tiklama: number;
  ctr: number | null;
  kayit: number;
  kayitOranGonderim: number | null;
  kayitOranTiklama: number | null;
  sonTiklama: string | null;
};

function yuzdeOran(v: number | null | undefined) {
  if (v == null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

type SaatIzgarasi = {
  grid: number[][];
  gunToplam: number[];
  saatToplam: number[];
  toplam: number;
  maxHucre: number;
};

type KampanyaSablon = { id: string; etiket: string; govde: string };

function tarihKisa(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/** datetime-local için yerel YYYY-MM-DDTHH:mm */
function yerelDatetimeDegeri(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function varsayilanZamanlamaDegeri() {
  return yerelDatetimeDegeri(new Date(Date.now() + 60 * 60 * 1000));
}

export default function PanelTopluSmsPage() {
  const [sekme, setSekme] = useState<Sekme>("gonder");
  const [alicilar, setAlicilar] = useState<TopluSmsAlici[]>([]);
  const [elleTel, setElleTel] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [excelUyari, setExcelUyari] = useState("");
  const [excelOzet, setExcelOzet] = useState<ExcelYukleOzet | null>(null);
  const [elleHata, setElleHata] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const [aktifIsler, setAktifIsler] = useState<KuyrukIs[]>([]);
  const [tempo, setTempo] = useState<TopluSmsTempo>(TOPLU_SMS_TEMPO_VARSAYILAN);
  const [tempoPreset, setTempoPreset] =
    useState<TopluSmsTempoPresetId | "ozel">("dengeli");
  const [zamanlamaMod, setZamanlamaMod] = useState<ZamanlamaMod>("simdi");
  const [baslangicYerel, setBaslangicYerel] = useState(varsayilanZamanlamaDegeri);
  const [sonuc, setSonuc] = useState<{
    basarili: number;
    basarisiz: number;
    mesajParca?: number;
    oncekiAtlandi?: number;
    partiSayisi?: number;
  } | null>(null);
  const [hata, setHata] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [oncekiSet, setOncekiSet] = useState<Set<string>>(new Set());
  const [oncekiKontrol, setOncekiKontrol] = useState(false);
  const [oncekiMod, setOncekiMod] = useState<OncekiMod>("atla");
  const [gecmisUyari, setGecmisUyari] = useState("");

  const [listeler, setListeler] = useState<ListeOzet[]>([]);
  const [genelTelefonlar, setGenelTelefonlar] = useState<GenelTelefon[]>([]);
  const [gecmisYukleniyor, setGecmisYukleniyor] = useState(false);
  const [gecmisHata, setGecmisHata] = useState("");
  const [acikListeId, setAcikListeId] = useState<string | null>(null);
  const [listeAlicilar, setListeAlicilar] = useState<ListeAlici[]>([]);
  const [listeAliciYukleniyor, setListeAliciYukleniyor] = useState(false);

  const [sms50Varyant, setSms50Varyant] = useState<Sms50Varyant | "">("");
  const [kisiBazliTakip, setKisiBazliTakip] = useState(false);
  const [sms50Sablonlar, setSms50Sablonlar] = useState<KampanyaSablon[]>([]);
  const [seciliSablonId, setSeciliSablonId] = useState("");
  const [sms50Footer, setSms50Footer] = useState<string[]>([]);
  const [sms50FooterEkle, setSms50FooterEkle] = useState(true);
  const [testLinkler, setTestLinkler] = useState<TestLinkOzet[]>([]);
  const [tiklamaSaatIzgarasi, setTiklamaSaatIzgarasi] =
    useState<SaatIzgarasi | null>(null);
  const [testLinkHata, setTestLinkHata] = useState("");
  const [testLinkYukleniyor, setTestLinkYukleniyor] = useState(false);

  const etkiliTempo = useMemo(
    () =>
      kisiBazliTakip && sms50Varyant
        ? topluSmsTempoNormalize({ ...tempo, partiBoyutu: 1 })
        : tempo,
    [kisiBazliTakip, sms50Varyant, tempo]
  );

  const mesajDurum = useMemo(() => {
    if (kisiBazliTakip && sms50Varyant) {
      return netgsmSmsMesajGecerliMi(
        sms50MesajBirimOnizleme({
          govde: mesaj,
          varyant: sms50Varyant,
        })
      );
    }
    return netgsmSmsMesajGecerliMi(mesaj);
  }, [mesaj, kisiBazliTakip, sms50Varyant]);

  const gecerliAlicilar = useMemo(
    () => alicilar.filter((a) => !a.hata),
    [alicilar]
  );
  const hataliAlicilar = useMemo(
    () => alicilar.filter((a) => a.hata),
    [alicilar]
  );

  const oncekiAdet = useMemo(
    () => gecerliAlicilar.filter((a) => oncekiSet.has(a.telefon)).length,
    [gecerliAlicilar, oncekiSet]
  );
  const yeniAdet = gecerliAlicilar.length - oncekiAdet;
  const gonderilecekAdet =
    oncekiAdet > 0 && oncekiMod === "atla"
      ? yeniAdet
      : gecerliAlicilar.length;

  const tahminiSureSn = useMemo(
    () => topluSmsTahminiSureSn(gonderilecekAdet, etkiliTempo),
    [gonderilecekAdet, etkiliTempo]
  );
  const partiTahmini = useMemo(
    () =>
      Math.ceil(
        Math.max(0, gonderilecekAdet) / Math.max(1, etkiliTempo.partiBoyutu)
      ),
    [gonderilecekAdet, etkiliTempo.partiBoyutu]
  );

  const oncekileriKontrolEt = useCallback(async (liste: TopluSmsAlici[]) => {
    const telefonlar = liste.filter((a) => !a.hata).map((a) => a.telefon);
    if (telefonlar.length === 0) {
      setOncekiSet(new Set());
      setGecmisUyari("");
      return;
    }
    setOncekiKontrol(true);
    try {
      const res = await fetch("/api/panel/sms/toplu/kontrol", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefonlar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setOncekiSet(new Set());
        return;
      }
      if (data.gecmisYok) {
        setGecmisUyari(String(data.uyari ?? ""));
        setOncekiSet(new Set());
        return;
      }
      setGecmisUyari("");
      setOncekiSet(new Set((data.oncekiler as string[]) ?? []));
      if ((data.adet as number) > 0) setOncekiMod("atla");
    } catch {
      setOncekiSet(new Set());
    } finally {
      setOncekiKontrol(false);
    }
  }, []);

  useEffect(() => {
    void oncekileriKontrolEt(alicilar);
  }, [alicilar, oncekileriKontrolEt]);

  async function gecmisYukle(tip: "listeler" | "genel") {
    setGecmisYukleniyor(true);
    setGecmisHata("");
    try {
      const res = await fetch(`/api/panel/sms/toplu/gecmis?tip=${tip}`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Geçmiş yüklenemedi.");
      if (tip === "listeler") setListeler(data.listeler ?? []);
      else setGenelTelefonlar(data.telefonlar ?? []);
    } catch (e) {
      setGecmisHata(e instanceof Error ? e.message : "Geçmiş yüklenemedi.");
    } finally {
      setGecmisYukleniyor(false);
    }
  }

  useEffect(() => {
    if (sekme === "listeler") void gecmisYukle("listeler");
    if (sekme === "genel") void gecmisYukle("genel");
    if (sekme === "testler") void testLinkleriYukle();
  }, [sekme]);

  useEffect(() => {
    void fetch("/api/panel/sms/toplu/kampanya", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d) return;
        setSms50Sablonlar(d.sablonlar ?? []);
        setSms50Footer(Array.isArray(d.footerSatirlari) ? d.footerSatirlari : []);
      })
      .catch(() => undefined);
  }, []);

  async function testLinkleriYukle() {
    setTestLinkYukleniyor(true);
    setTestLinkHata("");
    try {
      const res = await fetch(
        `/api/panel/sms/toplu/varyantlar?kampanya=${encodeURIComponent(SMS50_KAMPANYA_KODU)}`,
        { credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Test linkleri yüklenemedi.");
      setTestLinkler(data.liste ?? []);
      setTiklamaSaatIzgarasi(data.saatIzgarasi ?? null);
    } catch (e) {
      setTestLinkHata(
        e instanceof Error ? e.message : "Test linkleri yüklenemedi."
      );
      setTiklamaSaatIzgarasi(null);
    } finally {
      setTestLinkYukleniyor(false);
    }
  }

  function sablonUygula(govde: string, varyant?: Sms50Varyant | "") {
    const harf = varyant !== undefined ? varyant : sms50Varyant;
    let metin = govde.trim();
    if (metin.includes("{{LINK}}")) {
      if (!harf) {
        setHata("Şablonda {{LINK}} var — önce test linki harfini (a–z) seçin.");
        return;
      }
      metin = metin.replaceAll("{{LINK}}", sms50KisaUrl(harf));
    }
    /* Şablonda sabit link varsa olduğu gibi bırak — ikinci kez ekleme */
    if (sms50FooterEkle && sms50Footer.length > 0) {
      metin = `${metin}\n${sms50Footer.join(" — ")}`;
    }
    setMesaj(metin.trim());
    setHata("");
  }

  function sablonSec(id: string) {
    setSeciliSablonId(id);
    const s = sms50Sablonlar.find((x) => x.id === id);
    if (s) sablonUygula(s.govde);
  }

  function linkiMesajaEkle() {
    if (!sms50Varyant) {
      setHata("Önce test linki harfini (a–z) seçin.");
      return;
    }
    const link = sms50KisaUrl(sms50Varyant);
    setMesaj((m) => {
      if (m.includes(link)) return m;
      const base = m.trim();
      return base ? `${base}\n${link}` : link;
    });
    setHata("");
  }

  async function listeDetayAc(id: string) {
    if (acikListeId === id) {
      setAcikListeId(null);
      setListeAlicilar([]);
      return;
    }
    setAcikListeId(id);
    setListeAliciYukleniyor(true);
    try {
      const res = await fetch(
        `/api/panel/sms/toplu/gecmis?tip=liste-alicilar&listeId=${encodeURIComponent(id)}`,
        { credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Alıcılar yüklenemedi.");
      setListeAlicilar(data.alicilar ?? []);
    } catch {
      setListeAlicilar([]);
    } finally {
      setListeAliciYukleniyor(false);
    }
  }

  async function excelYukle(file: File | null) {
    setExcelUyari("");
    setExcelOzet(null);
    setSonuc(null);
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const { alicilar: yeni, ozet: dosyaOzet, uyari } =
        exceldenTopluSmsAliciOku(buf);
      if (uyari) {
        setExcelUyari(uyari);
        return;
      }
      const { alicilar: birlesik, ozet } = excelAlicilariListeyeEkle(
        alicilar,
        yeni,
        dosyaOzet
      );
      setAlicilar(birlesik);
      setExcelOzet(ozet);
    } catch {
      setExcelUyari("Excel okunamadı. .xlsx veya .csv deneyin.");
      setExcelOzet(null);
    }
  }

  function elleEkle() {
    setElleHata("");
    const r = elleTelefonEkle(elleTel, alicilar);
    if (r.hata) {
      setElleHata(r.hata);
      return;
    }
    if (r.alici) {
      setAlicilar((a) => [...a, r.alici!]);
      setElleTel("");
    }
  }

  function aliciSil(telefon: string) {
    setAlicilar((a) => a.filter((x) => x.telefon !== telefon));
  }

  function listeyiTemizle() {
    setAlicilar([]);
    setSonuc(null);
    setHata("");
    setExcelOzet(null);
    setExcelUyari("");
    setOncekiSet(new Set());
  }

  function pollDurdur() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function aktifIslereEkleVeyaGuncelle(is: KuyrukIs) {
    setAktifIsler((onceki) => {
      const i = onceki.findIndex((x) => x.id === is.id);
      if (!kuyrukIsAktifMi(is)) {
        return onceki.filter((x) => x.id !== is.id);
      }
      if (i < 0) return [is, ...onceki];
      const kopya = [...onceki];
      kopya[i] = is;
      return kopya;
    });
  }

  function isBittiIsle(is: KuyrukIs) {
    setAktifIsler((onceki) => onceki.filter((x) => x.id !== is.id));
    if (is.durum === "bitti") {
      setSonuc({
        basarili: is.basarili,
        basarisiz: is.basarisiz,
        mesajParca: is.mesajParca ?? undefined,
        oncekiAtlandi: is.oncekiAtlandi || undefined,
        partiSayisi: is.partiToplam,
      });
      setHata("");
      void oncekileriKontrolEt(alicilar);
    } else if (is.durum === "iptal") {
      setSonuc({
        basarili: is.basarili,
        basarisiz: is.basarisiz,
        mesajParca: is.mesajParca ?? undefined,
        oncekiAtlandi: is.oncekiAtlandi || undefined,
        partiSayisi: is.partiToplam,
      });
      setHata(
        `Plan durduruldu. Şimdiye kadar ${is.basarili} başarılı / ${is.basarisiz} başarısız.`
      );
      void oncekileriKontrolEt(alicilar);
    } else if (is.durum === "hata") {
      setSonuc({
        basarili: is.basarili,
        basarisiz: is.basarisiz,
        mesajParca: is.mesajParca ?? undefined,
        oncekiAtlandi: is.oncekiAtlandi || undefined,
        partiSayisi: is.partiToplam,
      });
      setHata(is.hata ?? "Gönderim hatası.");
    }
  }

  async function aktifIsleriYenile() {
    try {
      const res = await fetch("/api/panel/sms/toplu/kuyruk", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !Array.isArray(data.aktif)) return;
      const liste = (data.aktif as KuyrukIs[]).filter(kuyrukIsAktifMi);
      setAktifIsler((onceki) => {
        const yeniIds = new Set(liste.map((x) => x.id));
        for (const eski of onceki) {
          if (!yeniIds.has(eski.id)) {
            void (async () => {
              try {
                const r = await fetch(
                  `/api/panel/sms/toplu/kuyruk?id=${encodeURIComponent(eski.id)}`,
                  { credentials: "include" }
                );
                const d = await r.json().catch(() => ({}));
                if (r.ok && d.is) isBittiIsle(d.is as KuyrukIs);
              } catch {
                /* ignore */
              }
            })();
          }
        }
        return liste;
      });
      if (liste.length === 0) pollDurdur();
      else kuyrukPollBaslat();
    } catch {
      /* yok say */
    }
  }

  function kuyrukPollBaslat() {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      void aktifIsleriYenile();
    }, 2000);
  }

  useEffect(() => {
    return () => pollDurdur();
  }, []);

  useEffect(() => {
    void aktifIsleriYenile();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca mount
  }, []);

  async function gonder() {
    setHata("");
    setSonuc(null);
    if (!mesajDurum.gecerli) {
      setHata(mesajDurum.hata ?? "Mesaj geçersiz.");
      return;
    }
    if (gecerliAlicilar.length === 0) {
      setHata("En az bir geçerli alıcı ekleyin.");
      return;
    }
    if (gonderilecekAdet === 0) {
      setHata(
        "Öncekiler atlandığında gönderilecek numara kalmıyor. «Yine de gönder» seçin veya listeyi güncelleyin."
      );
      return;
    }

    const tempoN = etkiliTempo;
    const takipMetin =
      kisiBazliTakip && sms50Varyant
        ? " · kişiye özel link (parti 1)"
        : "";
    const atlaMetin =
      oncekiAdet > 0 && oncekiMod === "atla"
        ? ` · ${oncekiAdet} önceki numara atlanacak`
        : oncekiAdet > 0 && oncekiMod === "yine"
          ? ` · ${oncekiAdet} önceki numara dahil`
          : "";

    let baslangicAt: string | null = null;
    let zamanMetin = " · şimdi başla";
    if (zamanlamaMod === "zamanli") {
      const t = new Date(baslangicYerel).getTime();
      if (!baslangicYerel || !Number.isFinite(t)) {
        setHata("Geçerli bir başlangıç tarihi ve saati seçin.");
        return;
      }
      if (t <= Date.now() + 30_000) {
        setHata("Zamanlanmış başlangıç en az ~1 dakika sonra olmalı.");
        return;
      }
      if (t - Date.now() > 30 * 24 * 60 * 60 * 1000) {
        setHata("Başlangıç en fazla 30 gün sonrası olabilir.");
        return;
      }
      baslangicAt = new Date(t).toISOString();
      zamanMetin = ` · başlangıç ${tarihKisa(baslangicAt)}`;
    }

    const onay = window.confirm(
      `${gonderilecekAdet} numara · ~${partiTahmini} parti × ${tempoN.partiBoyutu} kişi · aralık ~${tempoN.beklemeSn} sn (tahmini ${topluSmsSureMetni(tahminiSureSn)})${takipMetin}${atlaMetin}${zamanMetin}.\n\nDiğer planlardan bağımsız çalışır; ekranı kapatabilirsiniz. Devam?`
    );
    if (!onay) return;

    setGonderiyor(true);

    try {
      const oturumRes = await fetch("/api/panel/oturum", {
        credentials: "include",
      });
      const oturum = await oturumRes.json().catch(() => ({ yetkili: false }));
      if (!oturum?.yetkili) {
        setHata("Oturum sona ermiş. Tekrar giriş yapıp yeniden deneyin.");
        setGonderiyor(false);
        return;
      }

      let kuyruk = gecerliAlicilar.map((a) => a.telefon);
      if (oncekiAdet > 0 && oncekiMod === "atla") {
        kuyruk = kuyruk.filter((t) => !oncekiSet.has(t));
      }

      const adlar: Record<string, string> = {};
      for (const a of gecerliAlicilar) {
        if (a.ad) adlar[a.telefon] = a.ad;
      }

      if (kuyruk.length === 0) {
        setHata("Gönderilecek numara kalmadı.");
        setGonderiyor(false);
        return;
      }

      const res = await fetch("/api/panel/sms/toplu/kuyruk", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesaj,
          telefonlar: kuyruk,
          adlar,
          oncekileriAtla: false,
          tempo: tempoN,
          kisiBazliTakip: Boolean(kisiBazliTakip && sms50Varyant),
          baslangicAt,
          ...(sms50Varyant
            ? { varyant: sms50Varyant, kampanyaKodu: SMS50_KAMPANYA_KODU }
            : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error(
          "Oturum sona ermiş. Tekrar giriş yapıp yeniden deneyin."
        );
      }
      if (!res.ok || !data.is) {
        throw new Error(data.error ?? "Kuyruk başlatılamadı.");
      }
      if (data.gecmisUyari) setGecmisUyari(String(data.gecmisUyari));

      const is = data.is as KuyrukIs;
      aktifIslereEkleVeyaGuncelle(is);
      kuyrukPollBaslat();
      void aktifIsleriYenile();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderim başarısız.");
    } finally {
      setGonderiyor(false);
    }
  }

  async function kuyrukIptal(isId: string) {
    try {
      const res = await fetch(
        `/api/panel/sms/toplu/kuyruk/${encodeURIComponent(isId)}/iptal`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.is) {
        isBittiIsle(data.is as KuyrukIs);
      }
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Toplu SMS</h2>
          <p className="text-sm text-slate-500">
            Excel / elle · SMS50 test linkleri (a–z) · geçmiş
          </p>
        </div>
        <Link
          href="/panel/sms"
          className="text-sm text-amber-600 font-medium self-end"
        >
          ← SMS sağlık
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["gonder", "Gönder"],
            ["testler", "Test linkleri"],
            ["listeler", "Listeler"],
            ["genel", "Genel liste"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSekme(id)}
            className={`rounded-xl px-3 py-2 text-sm font-medium ${
              sekme === id
                ? "bg-amber-500 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sekme === "gonder" && (
        <>
          <Card className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 items-start">
              <div>
                <h3 className="font-semibold text-slate-800">Excel yükle</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Şablonu indirip doldurun. Sütunlar:{" "}
                  <code className="bg-slate-100 px-1 rounded">telefon</code>{" "}
                  (zorunlu),{" "}
                  <code className="bg-slate-100 px-1 rounded">ad</code>{" "}
                  (isteğe bağlı).
                </p>
              </div>
              <button
                type="button"
                onClick={() => topluSmsExcelSablonIndir()}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50"
              >
                Şablonu indir
              </button>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
              onChange={(e) => {
                void excelYukle(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            {excelUyari && (
              <p className="text-sm text-amber-700">{excelUyari}</p>
            )}
            {excelOzet && (
              <div className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm text-slate-700 space-y-0.5">
                <p className="font-medium text-slate-900">
                  Yükleme özeti: {excelOzet.listeyeEklenen} numara listeye
                  eklendi
                </p>
                <p className="text-xs text-slate-500">
                  Sabit hatlar ve tekrarlayan numaralar otomatik elendi
                  {excelOzet.sabitHatAtlandi > 0 ||
                  excelOzet.tekrarAtlandi > 0 ||
                  excelOzet.zatenListede > 0
                    ? ` (${[
                        excelOzet.sabitHatAtlandi > 0
                          ? `${excelOzet.sabitHatAtlandi} sabit hat`
                          : null,
                        excelOzet.tekrarAtlandi > 0
                          ? `${excelOzet.tekrarAtlandi} dosya içi tekrar`
                          : null,
                        excelOzet.zatenListede > 0
                          ? `${excelOzet.zatenListede} zaten listede`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")})`
                    : ""}
                  .
                </p>
                <p className="text-xs text-slate-500">
                  Dosyada {excelOzet.satirOkunan} satır ·{" "}
                  {excelOzet.gecerli} geçerli cep
                  {excelOzet.gecersiz > 0
                    ? ` · ${excelOzet.gecersiz} geçersiz`
                    : ""}
                </p>
              </div>
            )}
          </Card>

          <Card className="space-y-3">
            <h3 className="font-semibold text-slate-800">Elle numara ekle</h3>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="flex-1 min-w-[12rem]">
                <Field
                  label="Telefon"
                  value={elleTel}
                  onChange={(e) => setElleTel(e.target.value)}
                  placeholder="0532 123 45 67"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      elleEkle();
                    }
                  }}
                />
              </div>
              <Btn type="button" variant="secondary" onClick={elleEkle}>
                Ekle
              </Btn>
            </div>
            {elleHata && <p className="text-sm text-red-600">{elleHata}</p>}
          </Card>

          <Card className="space-y-3">
            <div className="flex flex-wrap justify-between gap-2 items-baseline">
              <h3 className="font-semibold text-slate-800">
                Alıcılar{" "}
                <span className="text-sm font-normal text-slate-500">
                  ({gecerliAlicilar.length} geçerli
                  {hataliAlicilar.length > 0
                    ? ` · ${hataliAlicilar.length} hatalı`
                    : ""}
                  {oncekiAdet > 0 ? ` · ${oncekiAdet} daha önce gönderilmiş` : ""}
                  )
                </span>
              </h3>
              {alicilar.length > 0 && (
                <button
                  type="button"
                  onClick={listeyiTemizle}
                  className="text-xs text-red-600 font-medium"
                >
                  Listeyi temizle
                </button>
              )}
            </div>
            {alicilar.length === 0 ? (
              <p className="text-sm text-slate-500">Henüz alıcı yok.</p>
            ) : (
              <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-sm">
                {alicilar.map((a) => {
                  const onceki = !a.hata && oncekiSet.has(a.telefon);
                  return (
                    <li
                      key={`${a.telefon}-${a.kaynak}-${a.hata ?? ""}`}
                      className="flex items-center justify-between gap-2 py-2"
                    >
                      <div>
                        <p
                          className={
                            a.hata
                              ? "text-red-700 font-medium"
                              : "text-slate-900 font-medium"
                          }
                        >
                          {a.hata ? a.telefon : telefonMaskele(a.telefon)}
                          {a.ad ? (
                            <span className="text-slate-500 font-normal">
                              {" "}
                              · {a.ad}
                            </span>
                          ) : null}
                          {onceki ? (
                            <span className="ml-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              Önceki
                            </span>
                          ) : null}
                        </p>
                        <p className="text-xs text-slate-400">
                          {a.kaynak === "excel" ? "Excel" : "Elle"}
                          {a.hata ? ` · ${a.hata}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => aliciSil(a.telefon)}
                        className="text-xs text-slate-500 hover:text-red-600"
                      >
                        Sil
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {oncekiAdet > 0 && (
            <Card className="space-y-3 border-amber-200 bg-amber-50">
              <p className="text-sm text-amber-950 font-medium">
                Listede daha önce gönderilmiş{" "}
                <strong>{oncekiAdet}</strong> numara var
                {oncekiKontrol ? " (kontrol…)" : ""}.
              </p>
              <p className="text-xs text-amber-800">
                Yeni: {yeniAdet} · Önceki: {oncekiAdet} · Toplam:{" "}
                {gecerliAlicilar.length}
              </p>
              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2 text-sm text-amber-950 cursor-pointer">
                  <input
                    type="radio"
                    name="onceki-mod"
                    checked={oncekiMod === "atla"}
                    onChange={() => setOncekiMod("atla")}
                    className="mt-1"
                  />
                  <span>
                    Daha önce gönderilmişlere gönderme —{" "}
                    <strong>{yeniAdet} kişiye</strong> SMS gider
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-amber-950 cursor-pointer">
                  <input
                    type="radio"
                    name="onceki-mod"
                    checked={oncekiMod === "yine"}
                    onChange={() => setOncekiMod("yine")}
                    className="mt-1"
                  />
                  <span>
                    Yine de gönder —{" "}
                    <strong>{gecerliAlicilar.length} kişiye</strong> SMS gider
                    (öncekiler dahil)
                  </span>
                </label>
              </div>
            </Card>
          )}

          {gecmisUyari && (
            <Card className="border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-600">{gecmisUyari}</p>
            </Card>
          )}

          <Card className="space-y-3">
            <h3 className="font-semibold text-slate-800">SMS50 test linki</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bir gönderim = bir harf. Link:{" "}
              <code className="bg-slate-100 px-1 rounded">
                /sms50{sms50Varyant || "a"}
              </code>{" "}
              → kayıt + UTM. Elle smoke test için{" "}
              <code className="bg-slate-100 px-1 rounded">
                /sms50{SMS50_TEST_VARYANT}
              </code>{" "}
              kullanın (gün×saat grafiğine yazılmaz). Ölçüm: «Test linkleri».
            </p>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Harf (a–z)
              </span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                value={sms50Varyant}
                onChange={(e) => {
                  const v = (e.target.value || "") as Sms50Varyant | "";
                  setSms50Varyant(v);
                  if (!v) setKisiBazliTakip(false);
                  if (seciliSablonId) {
                    const s = sms50Sablonlar.find((x) => x.id === seciliSablonId);
                    if (s) sablonUygula(s.govde, v);
                  }
                }}
              >
                <option value="">Yok (serbest metin, ölçümsüz)</option>
                {SMS50_VARYANTLAR.map((v) => (
                  <option key={v} value={v}>
                    {v.toUpperCase()}
                    {v === SMS50_TEST_VARYANT ? " (test)" : ""} —{" "}
                    {sms50KisaUrl(v)}
                  </option>
                ))}
              </select>
            </label>
            {sms50Varyant && (
              <div className="flex flex-wrap gap-2 items-center">
                <code className="text-xs bg-slate-100 px-2 py-1 rounded break-all">
                  {sms50KisaUrl(sms50Varyant)}
                </code>
                <button
                  type="button"
                  className="text-xs font-medium text-amber-700"
                  onClick={() => {
                    void navigator.clipboard.writeText(
                      sms50KisaUrl(sms50Varyant)
                    );
                  }}
                >
                  Kopyala
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-amber-700"
                  onClick={linkiMesajaEkle}
                >
                  Mesaja ekle
                </button>
              </div>
            )}
            {sms50Varyant && (
              <label className="flex items-start gap-2 text-sm text-slate-700 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={kisiBazliTakip}
                  disabled={gonderiyor}
                  onChange={(e) => setKisiBazliTakip(e.target.checked)}
                />
                <span>
                  <span className="font-medium">
                    Kişiye özel link (tıklama + kayıt takibi)
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Her alıcıya rastgele 8 karakterlik kod eklenir (ör.{" "}
                    <code className="bg-white px-1 rounded">
                      /sms50{sms50Varyant}/Aa0Bb1Cc
                    </code>
                    ). Metinde{" "}
                    <code className="bg-white px-1 rounded">
                      {SMS50_KISISEL_LINK_PH}
                    </code>
                    ,{" "}
                    <code className="bg-white px-1 rounded">{"{{LINK}}"}</code>{" "}
                    veya sabit{" "}
                    <code className="bg-white px-1 rounded">
                      /sms50{sms50Varyant}
                    </code>{" "}
                    olmalı. Birim hesabı bu uzun linke göre yapılır. Genel
                    listede kim açtı / kayıt oldu görünür; parti boyutu 1 olur.
                  </span>
                </span>
              </label>
            )}
            <div className="space-y-1.5">
              <div className="flex flex-wrap justify-between gap-2 items-end">
                <span className="text-sm font-medium text-slate-700">
                  Mesaj şablonu
                </span>
                <Link
                  href="/panel/sms/sablonlar"
                  className="text-xs font-medium text-amber-700"
                >
                  Şablonları yönet
                </Link>
              </div>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                value={seciliSablonId}
                onChange={(e) => sablonSec(e.target.value)}
                disabled={sms50Sablonlar.length === 0}
              >
                <option value="">
                  {sms50Sablonlar.length === 0
                    ? "Şablon yok — yönet sayfasından ekleyin"
                    : "Şablon seç…"}
                </option>
                {sms50Sablonlar.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.etiket}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                Seçince şablon metni aynen gelir. Takip için{" "}
                <code className="bg-slate-100 px-1 rounded">
                  {SMS50_KISISEL_LINK_PH}
                </code>{" "}
                veya{" "}
                <code className="bg-slate-100 px-1 rounded">{"{{LINK}}"}</code>{" "}
                kullanın; sabit{" "}
                <code className="bg-slate-100 px-1 rounded">/sms50…</code> de
                gönderimde kişiye özel koda çevrilir.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input
                type="checkbox"
                checked={sms50FooterEkle}
                onChange={(e) => setSms50FooterEkle(e.target.checked)}
              />
              Şablona MERSİS / ret satırı ekle
              {sms50Footer.length === 0
                ? " (SMS_MERSIS_NO / SMS_IPTAL_METNI tanımlı değil)"
                : ""}
            </label>
          </Card>

          <Card className="space-y-3">
            <TextArea
              label="SMS metni"
              value={mesaj}
              onChange={(e) => setMesaj(e.target.value)}
              rows={5}
              placeholder="Gönderilecek mesaj…"
              maxLength={NETGSM_TOPLU_SMS_MAX_BIRIM}
            />
            <div className="flex flex-wrap justify-between gap-2 text-xs">
              <p className="text-slate-500">
                Netgsm Türkçe: 1 SMS = {NETGSM_TOPLU_SMS_BIRIM} birim · ç/ğ/ı/ş =
                2 birim · üst sınır {NETGSM_TOPLU_SMS_MAX_BIRIM} birim (
                {NETGSM_TOPLU_SMS_MAX_BIRIM / NETGSM_TOPLU_SMS_BIRIM} SMS)
              </p>
              <p
                className={
                  mesajDurum.birim > NETGSM_TOPLU_SMS_MAX_BIRIM
                    ? "text-red-600 font-semibold"
                    : mesajDurum.parca > 1
                      ? "text-amber-700 font-medium"
                      : "text-slate-600"
                }
              >
                {mesajDurum.birim} / {NETGSM_TOPLU_SMS_MAX_BIRIM} birim ·{" "}
                {mesajDurum.parca || 0} SMS
                {mesajDurum.parca > 1 ? " (uzun SMS)" : ""}
                {kisiBazliTakip && sms50Varyant
                  ? " · takip: +/8 karakter kod"
                  : ""}
              </p>
            </div>
            {mesajDurum.hata && mesaj.trim() && (
              <p className="text-sm text-red-600">{mesajDurum.hata}</p>
            )}
          </Card>

          {hata && (
            <Card className="border-red-200 bg-red-50">
              <p className="text-sm text-red-700">{hata}</p>
            </Card>
          )}

          {sonuc && (
            <Card className="border-emerald-200 bg-emerald-50">
              <p className="text-sm text-emerald-900 font-medium">
                Gönderim tamamlandı: {sonuc.basarili} başarılı
                {sonuc.basarisiz > 0 ? `, ${sonuc.basarisiz} başarısız` : ""}
                {sonuc.oncekiAtlandi
                  ? ` · ${sonuc.oncekiAtlandi} önceki atlandı`
                  : ""}
                {sonuc.partiSayisi
                  ? ` · ${sonuc.partiSayisi} parti`
                  : ""}
                {sonuc.mesajParca
                  ? ` · mesaj ${sonuc.mesajParca} SMS parçası`
                  : ""}
              </p>
              <button
                type="button"
                className="text-xs text-amber-700 font-medium mt-1"
                onClick={() => setSekme("listeler")}
              >
                Geçmiş listelere bak →
              </button>
            </Card>
          )}

          <Card className="space-y-3">
            <h3 className="font-semibold text-slate-800">Gönderim temposu</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Liste küçük partilere bölünür; partiler arasında sunucu bekler.
              Birden fazla plan ekleyebilirsiniz — her biri kendi başlangıç
              saatinde bağımsız (paralel) çalışır. Ekranı kapatabilirsiniz;
              sayfaya dönünce planlar listelenir.
            </p>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">
                Hazır ayar
              </span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                value={tempoPreset}
                disabled={gonderiyor}
                onChange={(e) => {
                  const v = e.target.value as TopluSmsTempoPresetId | "ozel";
                  setTempoPreset(v);
                  const p = TOPLU_SMS_TEMPO_PRESETLER.find((x) => x.id === v);
                  if (p) setTempo({ ...p.tempo });
                }}
              >
                {TOPLU_SMS_TEMPO_PRESETLER.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.etiket}
                  </option>
                ))}
                <option value="ozel">Özel</option>
              </select>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field
                label="Parti boyutu"
                type="number"
                min={1}
                max={50}
                disabled={gonderiyor || Boolean(kisiBazliTakip && sms50Varyant)}
                value={String(etkiliTempo.partiBoyutu)}
                onChange={(e) => {
                  setTempoPreset("ozel");
                  setTempo((t) =>
                    topluSmsTempoNormalize({
                      ...t,
                      partiBoyutu: Number(e.target.value),
                    })
                  );
                }}
              />
              <Field
                label="Bekleme (sn)"
                type="number"
                min={0}
                max={600}
                disabled={gonderiyor}
                value={String(tempo.beklemeSn)}
                onChange={(e) => {
                  setTempoPreset("ozel");
                  setTempo((t) =>
                    topluSmsTempoNormalize({
                      ...t,
                      beklemeSn: Number(e.target.value),
                    })
                  );
                }}
              />
              <Field
                label="Jitter (%)"
                type="number"
                min={0}
                max={50}
                disabled={gonderiyor}
                value={String(Math.round(tempo.jitterOran * 100))}
                onChange={(e) => {
                  setTempoPreset("ozel");
                  setTempo((t) =>
                    topluSmsTempoNormalize({
                      ...t,
                      jitterOran: Number(e.target.value) / 100,
                    })
                  );
                }}
              />
            </div>
            <p className="text-xs text-slate-500">
              Bu liste için: ~{partiTahmini} parti · tahmini süre{" "}
              {topluSmsSureMetni(tahminiSureSn)}
              {etkiliTempo.jitterOran > 0
                ? ` · aralık ±%${Math.round(etkiliTempo.jitterOran * 100)} sapmalı`
                : ""}
              {kisiBazliTakip && sms50Varyant
                ? " · kişiye özel link (parti 1)"
                : ""}
              .
            </p>
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-sm font-medium text-slate-700">Zamanlama</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="zamanlama"
                    className="mt-1"
                    checked={zamanlamaMod === "simdi"}
                    disabled={gonderiyor}
                    onChange={() => setZamanlamaMod("simdi")}
                  />
                  <span>
                    <span className="font-medium">Şimdi başla</span>
                    <span className="block text-xs text-slate-500">
                      Kuyruğa eklenir eklenmez ilk parti gider.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="zamanlama"
                    className="mt-1"
                    checked={zamanlamaMod === "zamanli"}
                    disabled={gonderiyor}
                    onChange={() => {
                      setZamanlamaMod("zamanli");
                      setBaslangicYerel((v) =>
                        v && new Date(v).getTime() > Date.now() + 60_000
                          ? v
                          : varsayilanZamanlamaDegeri()
                      );
                    }}
                  />
                  <span>
                    <span className="font-medium">Tarih ve saat belirle</span>
                    <span className="block text-xs text-slate-500">
                      Seçilen anda gönderim başlar; tempo aralıkları aynı kalır.
                    </span>
                  </span>
                </label>
              </div>
              {zamanlamaMod === "zamanli" && (
                <Field
                  label="Başlangıç"
                  type="datetime-local"
                  disabled={gonderiyor}
                  value={baslangicYerel}
                  min={yerelDatetimeDegeri(new Date(Date.now() + 60_000))}
                  onChange={(e) => setBaslangicYerel(e.target.value)}
                />
              )}
            </div>
          </Card>

          {aktifIsler.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">
                Aktif / zamanlanmış planlar ({aktifIsler.length}) — her biri kendi
                saatinde, birbirinden bağımsız çalışır. Yeni plan ekleyebilirsiniz.
              </p>
              {aktifIsler.map((is) => (
                <Card
                  key={is.id}
                  className="border-amber-200 bg-amber-50 space-y-2"
                >
                  <p className="text-sm font-medium text-amber-950">
                    {kuyrukIsBaslik(is)}
                  </p>
                  {(is.mesaj || is.aliciSayisi != null) && (
                    <p className="text-xs text-amber-900/80 line-clamp-2">
                      {is.aliciSayisi != null ? `${is.aliciSayisi} alıcı` : ""}
                      {is.aliciSayisi != null && is.mesaj ? " · " : ""}
                      {is.mesaj
                        ? is.mesaj.length > 80
                          ? `${is.mesaj.slice(0, 80)}…`
                          : is.mesaj
                        : ""}
                    </p>
                  )}
                  <p className="text-xs text-amber-900">
                    Şimdiye kadar {is.basarili} başarılı
                    {is.basarisiz > 0 ? ` · ${is.basarisiz} başarısız` : ""}
                    {" · "}
                    ekranı kapatabilirsiniz
                  </p>
                  <div className="h-2 rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{
                        width: `${
                          (is.partiIndex / Math.max(1, is.partiToplam)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-xs font-medium text-red-700"
                    onClick={() => void kuyrukIptal(is.id)}
                  >
                    Bu planı durdur
                  </button>
                </Card>
              ))}
            </div>
          )}

          <Btn
            type="button"
            disabled={
              gonderiyor ||
              gonderilecekAdet === 0 ||
              !mesajDurum.gecerli
            }
            onClick={() => void gonder()}
          >
            {gonderiyor
              ? "Plan ekleniyor…"
              : zamanlamaMod === "zamanli"
                ? `${gonderilecekAdet} kişilik plan zamanla`
                : `${gonderilecekAdet} kişiye arka planda gönder`}
          </Btn>
        </>
      )}

      {sekme === "listeler" && (
        <Card className="space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              Gönderim listeleri
            </h3>
            <button
              type="button"
              className="text-xs text-amber-700 font-medium"
              onClick={() => void gecmisYukle("listeler")}
            >
              Yenile
            </button>
          </div>
          {gecmisYukleniyor && (
            <p className="text-sm text-slate-500">Yükleniyor…</p>
          )}
          {gecmisHata && (
            <p className="text-sm text-red-600">{gecmisHata}</p>
          )}
          {!gecmisYukleniyor && !gecmisHata && listeler.length === 0 && (
            <p className="text-sm text-slate-500">Henüz kayıtlı liste yok.</p>
          )}
          <ul className="divide-y divide-slate-100">
            {listeler.map((l) => (
              <li key={l.id} className="py-3 space-y-2">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => void listeDetayAc(l.id)}
                >
                  <p className="text-sm font-medium text-slate-900">
                    {tarihKisa(l.olusturulma)} · {l.aliciSayisi} alıcı
                    {l.varyant ? (
                      <span className="text-amber-700">
                        {" "}
                        · sms50{l.varyant}
                      </span>
                    ) : null}
                    <span className="text-emerald-700">
                      {" "}
                      · {l.basarili} ok
                    </span>
                    {l.basarisiz > 0 ? (
                      <span className="text-red-600">
                        {" "}
                        · {l.basarisiz} hata
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                    {l.mesaj}
                  </p>
                  {l.gonderenEposta && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {l.gonderenEposta}
                    </p>
                  )}
                </button>
                {acikListeId === l.id && (
                  <div className="rounded-lg bg-slate-50 p-2 max-h-48 overflow-y-auto">
                    {listeAliciYukleniyor ? (
                      <p className="text-xs text-slate-500">Alıcılar…</p>
                    ) : listeAlicilar.length === 0 ? (
                      <p className="text-xs text-slate-500">Alıcı yok.</p>
                    ) : (
                      <ul className="text-xs space-y-1">
                        {listeAlicilar.map((a) => (
                          <li
                            key={a.telefon}
                            className="flex justify-between gap-2"
                          >
                            <span>
                              {telefonMaskele(a.telefon)}
                              {a.ad ? ` · ${a.ad}` : ""}
                            </span>
                            <span
                              className={
                                a.basarili ? "text-emerald-700" : "text-red-600"
                              }
                            >
                              {a.basarili ? "OK" : a.hata ?? "Hata"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {sekme === "testler" && (
        <div className="space-y-4">
          {!testLinkYukleniyor && !testLinkHata && tiklamaSaatIzgarasi && (
            <Card className="space-y-2">
              <Sms50TiklamaSaatTablosu data={tiklamaSaatIzgarasi} />
            </Card>
          )}
          <Card className="space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              SMS50 test linkleri (a–z)
            </h3>
            <button
              type="button"
              className="text-xs text-amber-700 font-medium"
              onClick={() => void testLinkleriYukle()}
            >
              Yenile
            </button>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Her harf ayrı yuva. CTR = tıklama ÷ gönderim. Kayıt/gönderim =
            kayıt ÷ gönderim; Kayıt/tık = kayıt ÷ tıklama.{" "}
            <code className="bg-slate-100 px-1 rounded">
              /sms50{SMS50_TEST_VARYANT}
            </code>{" "}
            elle test linki; üstteki gün×saat grafiğine dahil edilmez. Kayıt
            hedefi: {SMS50_KAMPANYA_KODU}.
          </p>
          {testLinkYukleniyor && (
            <p className="text-sm text-slate-500">Yükleniyor…</p>
          )}
          {testLinkHata && (
            <p className="text-sm text-red-600">{testLinkHata}</p>
          )}
          {!testLinkYukleniyor && !testLinkHata && (
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Harf</th>
                    <th className="px-3 py-2 font-semibold">Link</th>
                    <th className="px-3 py-2 font-semibold tabular-nums">
                      Gönderilen
                    </th>
                    <th className="px-3 py-2 font-semibold tabular-nums">
                      Tıklama
                    </th>
                    <th className="px-3 py-2 font-semibold tabular-nums">
                      CTR
                    </th>
                    <th
                      className="px-3 py-2 font-semibold tabular-nums"
                      title="Kayıt ÷ gönderim"
                    >
                      Kayıt/gönderim
                    </th>
                    <th
                      className="px-3 py-2 font-semibold tabular-nums"
                      title="Kayıt ÷ tıklama"
                    >
                      Kayıt/tık
                    </th>
                    <th className="px-3 py-2 font-semibold">Son tık</th>
                    <th className="px-3 py-2 font-semibold" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testLinkler.map((row) => (
                    <tr key={row.varyant} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 font-semibold text-slate-900">
                        {row.varyant.toUpperCase()}
                        {row.varyant === SMS50_TEST_VARYANT ? (
                          <span className="ml-1 text-[10px] font-medium text-slate-500">
                            test
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-600 max-w-[10rem] truncate">
                        {row.kisaUrl}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-800">
                        {row.gonderilen}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-800">
                        {row.tiklama}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-800">
                        {yuzdeOran(row.ctr)}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-800">
                        {yuzdeOran(row.kayitOranGonderim)}
                        {row.kayit > 0 ? (
                          <span className="block text-[10px] text-slate-400">
                            {row.kayit} kayıt
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 tabular-nums text-slate-800">
                        {yuzdeOran(row.kayitOranTiklama)}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                        {row.sonTiklama ? tarihKisa(row.sonTiklama) : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="text-xs font-medium text-amber-700"
                          onClick={() => {
                            void navigator.clipboard.writeText(row.kisaUrl);
                          }}
                        >
                          Kopyala
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        </div>
      )}

      {sekme === "genel" && (
        <Card className="space-y-3">
          <div className="flex justify-between items-center gap-2">
            <h3 className="font-semibold text-slate-800">
              Genel telefon defteri{" "}
              <span className="text-sm font-normal text-slate-500">
                ({genelTelefonlar.length})
              </span>
            </h3>
            <button
              type="button"
              className="text-xs text-amber-700 font-medium"
              onClick={() => void gecmisYukle("genel")}
            >
              Yenile
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Toplu SMS giden numaralar. Kişiye özel link kullanıldıysa tıklama ve
            kayıt durumu görünür.
          </p>
          {gecmisYukleniyor && (
            <p className="text-sm text-slate-500">Yükleniyor…</p>
          )}
          {gecmisHata && (
            <p className="text-sm text-red-600">{gecmisHata}</p>
          )}
          {!gecmisYukleniyor &&
            !gecmisHata &&
            genelTelefonlar.length === 0 && (
              <p className="text-sm text-slate-500">Henüz kayıt yok.</p>
            )}
          {!gecmisYukleniyor &&
            !gecmisHata &&
            genelTelefonlar.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-100 max-h-[28rem]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide sticky top-0">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Telefon</th>
                      <th className="px-3 py-2 font-semibold">Ad</th>
                      <th className="px-3 py-2 font-semibold tabular-nums">
                        Gönderim
                      </th>
                      <th className="px-3 py-2 font-semibold">Link açtı</th>
                      <th className="px-3 py-2 font-semibold">İlk tık</th>
                      <th className="px-3 py-2 font-semibold">Kayıt</th>
                      <th className="px-3 py-2 font-semibold">Son SMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {genelTelefonlar.map((t) => (
                      <tr key={t.telefon} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2 font-medium text-slate-900 whitespace-nowrap">
                          {telefonMaskele(t.telefon)}
                        </td>
                        <td className="px-3 py-2 text-slate-600 max-w-[8rem] truncate">
                          {t.ad || "—"}
                        </td>
                        <td className="px-3 py-2 tabular-nums text-slate-800 whitespace-nowrap">
                          {t.gonderimSayisi}
                          {t.basariliSayisi > 0
                            ? ` · ${t.basariliSayisi} ok`
                            : ""}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {t.linkActi == null
                            ? "—"
                            : t.linkActi
                              ? "Evet"
                              : "Hayır"}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                          {t.ilkTiklama ? tarihKisa(t.ilkTiklama) : "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {t.kayitli ? (
                            <span className="text-emerald-700">
                              Evet
                              {t.kayitAt ? (
                                <span className="block text-xs text-slate-400 font-normal">
                                  {tarihKisa(t.kayitAt)}
                                </span>
                              ) : null}
                            </span>
                          ) : (
                            "Hayır"
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                          {tarihKisa(t.sonGonderim)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </Card>
      )}
    </div>
  );
}
