"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field, TextArea } from "@/components/ui";
import {
  DUYURU_AYARLAR_URL_PH,
  DUYURU_SMS_PARCA_BEKLEME_MS,
  duyuruBolumlerSablonlastir,
  duyuruGovdeSablonlastir,
  duyuruSmsParcalariniGonderimSirasi,
  type HizmetVerenDuyuruSablon,
  type HizmetVerenDuyuruSablonKayit,
} from "@/lib/hizmet-veren-duyuru";
import { TOPLU_SMS_ADMIN_TEST_TELEFON } from "@/lib/toplu-sms-admin-test";
import {
  NETGSM_TOPLU_SMS_BIRIM,
  NETGSM_TOPLU_SMS_MAX_BIRIM,
  netgsmSmsBirimHesapla,
  netgsmSmsBolumlerGecerliMi,
  netgsmSmsMesajGecerliMi,
  netgsmSmsOtomatikBol,
  netgsmSmsSinirAyarla,
} from "@/lib/sms-karakter";

type Alici = { id: string; ad: string; telefon: string };

const BOS_FORM = {
  etiket: "",
  aciklama: "",
  govde: `acilcozumbul.com: \n\nDegistirmek icin: ${DUYURU_AYARLAR_URL_PH}`,
  sira: "0",
};

export default function PanelHizmetVerenDuyurulariPage() {
  const [sablonlar, setSablonlar] = useState<HizmetVerenDuyuruSablon[]>([]);
  const [tumSablonlar, setTumSablonlar] = useState<
    HizmetVerenDuyuruSablonKayit[]
  >([]);
  const [tabloVar, setTabloVar] = useState(false);
  const [ayarlarUrl, setAyarlarUrl] = useState("");
  const [alicilar, setAlicilar] = useState<Alici[]>([]);
  const [seciliId, setSeciliId] = useState("");
  const seciliIdRef = useRef("");
  const [mesaj, setMesaj] = useState("");
  const [bolumler, setBolumler] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [testGonderiyor, setTestGonderiyor] = useState(false);
  const [onizlemeAcik, setOnizlemeAcik] = useState(false);
  const [hata, setHata] = useState("");
  const [sonuc, setSonuc] = useState("");

  const [form, setForm] = useState(BOS_FORM);
  const [duzenleId, setDuzenleId] = useState<string | null>(null);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [sablonMesaj, setSablonMesaj] = useState("");
  const [sablonHata, setSablonHata] = useState("");
  const [yonetimAcik, setYonetimAcik] = useState(false);
  const [kesimKaydediyor, setKesimKaydediyor] = useState(false);

  const formGovdeOrnek = useMemo(() => {
    const link =
      ayarlarUrl ||
      "https://www.acilcozumbul.com/cekici/panel?tab=ayarlar";
    return form.govde.split(DUYURU_AYARLAR_URL_PH).join(link);
  }, [form.govde, ayarlarUrl]);

  const formGovdeDurum = useMemo(
    () => netgsmSmsMesajGecerliMi(formGovdeOrnek),
    [formGovdeOrnek]
  );

  const yukle = useCallback(async (opts?: { mesajSifirla?: boolean }) => {
    const mesajSifirla = opts?.mesajSifirla === true;
    setLoading(true);
    setHata("");
    try {
      const res = await fetch("/api/panel/hizmet-veren-duyurulari", {
        credentials: "include",
      });
      const data = (await res.json()) as {
        error?: string;
        sablonlar?: HizmetVerenDuyuruSablon[];
        tumSablonlar?: HizmetVerenDuyuruSablonKayit[];
        tabloVar?: boolean;
        ayarlarUrl?: string;
        alicilar?: Alici[];
      };
      if (!res.ok) throw new Error(data.error ?? "Yüklenemedi.");
      const liste = data.sablonlar ?? [];
      setSablonlar(liste);
      setTumSablonlar(data.tumSablonlar ?? []);
      setTabloVar(Boolean(data.tabloVar));
      setAyarlarUrl(data.ayarlarUrl ?? "");
      setAlicilar(data.alicilar ?? []);
      const oncekiId = seciliIdRef.current;
      const sec = liste.find((s) => s.id === oncekiId) ?? liste[0];
      if (sec) {
        const degisti = sec.id !== oncekiId;
        seciliIdRef.current = sec.id;
        setSeciliId(sec.id);
        if (mesajSifirla || degisti || !oncekiId) {
          setMesaj(sec.mesaj);
          setBolumler(sec.bolumler);
          setOnizlemeAcik(false);
        }
      } else {
        seciliIdRef.current = "";
        setSeciliId("");
      }
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle({ mesajSifirla: true });
  }, [yukle]);

  function sablonSec(id: string) {
    seciliIdRef.current = id;
    setSeciliId(id);
    const s = sablonlar.find((x) => x.id === id);
    if (s) {
      setMesaj(s.mesaj);
      setBolumler(s.bolumler);
    }
    setOnizlemeAcik(false);
    setSonuc("");
    setHata("");
  }

  function seciliSablonDuzenlenebilirMi() {
    return (
      tabloVar &&
      Boolean(seciliId) &&
      !seciliId.startsWith("yerlesik-")
    );
  }

  function icerikDegisti() {
    setOnizlemeAcik(false);
    setSonuc("");
  }

  const tekKontrol = netgsmSmsMesajGecerliMi(mesaj);
  const bolumKontrol = useMemo(
    () => (bolumler ? netgsmSmsBolumlerGecerliMi(bolumler) : null),
    [bolumler]
  );

  const gonderilebilir = bolumler
    ? Boolean(bolumKontrol?.gecerli)
    : tekKontrol.gecerli;

  async function kesimiSablonaKaydet() {
    if (!seciliSablonDuzenlenebilirMi()) {
      setHata("Bu şablon düzenlenemez.");
      return;
    }
    if (!bolumler || bolumler.length < 2) {
      setHata("Önce bölümleyip kesim yerini ayarlayın.");
      return;
    }
    if (!bolumKontrol?.gecerli) {
      setHata(bolumKontrol?.hata ?? "Bölümler geçersiz.");
      return;
    }
    const link = ayarlarUrl;
    const hamBolumler = duyuruBolumlerSablonlastir(bolumler, link);
    const govde = duyuruGovdeSablonlastir(bolumler.join(""), link);
    setKesimKaydediyor(true);
    setHata("");
    setSonuc("");
    try {
      const res = await fetch(
        `/api/panel/hizmet-veren-duyurulari/${encodeURIComponent(seciliId)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ govde, bolumler: hamBolumler }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Kesim kaydedilemedi.");
      setSonuc("Kesim şablona kaydedildi.");
      await yukle({ mesajSifirla: true });
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Kesim kaydedilemedi.");
    } finally {
      setKesimKaydediyor(false);
    }
  }

  function bolumle() {
    const kaynak = bolumler?.join("") || mesaj;
    const parts = netgsmSmsOtomatikBol(kaynak);
    setBolumler(parts);
    setMesaj(kaynak);
    setOnizlemeAcik(false);
    setHata("");
    setSonuc("");
  }

  function birlestir() {
    if (!bolumler) return;
    setMesaj(bolumler.join(""));
    setBolumler(null);
    setOnizlemeAcik(false);
  }

  function bolumGuncelle(index: number, deger: string) {
    if (!bolumler) return;
    setBolumler(bolumler.map((b, i) => (i === index ? deger : b)));
    icerikDegisti();
  }

  function sinirKaydir(solIndex: number, yeniSolCp: number) {
    if (!bolumler || solIndex >= bolumler.length - 1) return;
    const [sol, sag] = netgsmSmsSinirAyarla(
      bolumler[solIndex]!,
      bolumler[solIndex + 1]!,
      yeniSolCp
    );
    const next = [...bolumler];
    next[solIndex] = sol;
    next[solIndex + 1] = sag;
    setBolumler(next);
    icerikDegisti();
  }

  function onizle() {
    if (!gonderilebilir) {
      setHata(
        bolumler
          ? bolumKontrol?.hata ?? "Bölümler geçersiz."
          : tekKontrol.hata ?? "Mesaj geçersiz."
      );
      return;
    }
    setHata("");
    setSonuc("");
    setOnizlemeAcik(true);
  }

  const onizlemeParcalar = bolumler
    ? bolumler.map((b) => b.trim()).filter(Boolean)
    : mesaj.trim()
      ? [mesaj.trim()]
      : [];

  async function testGonder() {
    const parcacikler = onizlemeParcalar;
    if (parcacikler.length === 0 || !gonderilebilir) {
      setHata("Önce geçerli bir önizleme oluşturun.");
      return;
    }
    setTestGonderiyor(true);
    setHata("");
    setSonuc("");
    try {
      const res = await fetch("/api/panel/hizmet-veren-duyurulari/test", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mesajlar: parcacikler }),
      });
      const data = (await res.json()) as {
        error?: string;
        telefon?: string;
        smsAdet?: number;
        basarili?: number;
      };
      if (!res.ok) throw new Error(data.error ?? "Test SMS gönderilemedi.");
      setSonuc(
        data.smsAdet && data.smsAdet > 1
          ? `Test: ${data.basarili ?? data.smsAdet} SMS ${data.telefon ?? TOPLU_SMS_ADMIN_TEST_TELEFON} numarasına gönderildi.`
          : `Test SMS ${data.telefon ?? TOPLU_SMS_ADMIN_TEST_TELEFON} numarasına gönderildi.`
      );
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Test SMS gönderilemedi.");
    } finally {
      setTestGonderiyor(false);
    }
  }

  async function kuyrugaAl(metin: string) {
    const adlar: Record<string, string> = {};
    for (const a of alicilar) adlar[a.telefon] = a.ad;
    const res = await fetch("/api/panel/sms/toplu/kuyruk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mesaj: metin.trim(),
        telefonlar: alicilar.map((a) => a.telefon),
        adlar,
        oncekileriAtla: false,
      }),
    });
    const data = (await res.json()) as { error?: string; aliciSayisi?: number };
    if (!res.ok) throw new Error(data.error ?? "Kuyruk oluşturulamadı.");
    return data;
  }

  async function gonder() {
    if (alicilar.length === 0) {
      setHata("Gönderilecek aktif hizmet veren yok.");
      return;
    }

    const parcacikler = bolumler
      ? bolumler.map((b) => b.trim()).filter(Boolean)
      : [mesaj.trim()];

    if (bolumler) {
      if (!bolumKontrol?.gecerli) {
        setHata(bolumKontrol?.hata ?? "Bölümler geçersiz.");
        return;
      }
    } else if (!tekKontrol.gecerli) {
      setHata(tekKontrol.hata ?? "Mesaj geçersiz.");
      return;
    }

    const smsAdet = parcacikler.length;
    if (
      !window.confirm(
        smsAdet > 1
          ? `${alicilar.length} kişiye ${smsAdet} ayrı SMS kuyruğa alınacak (kişi başı ${smsAdet} SMS). Devam?`
          : `${alicilar.length} hizmet verene SMS kuyruğa alınacak. Devam?`
      )
    ) {
      return;
    }

    setGonderiyor(true);
    setHata("");
    setSonuc("");
    try {
      /* SMS 1 → 2 → 3; kuyruklar arası bekleme sırayı korur */
      const gonderim = duyuruSmsParcalariniGonderimSirasi(parcacikler);
      for (let i = 0; i < gonderim.length; i++) {
        await kuyrugaAl(gonderim[i]!.metin);
        if (i < gonderim.length - 1) {
          await new Promise((r) =>
            setTimeout(r, DUYURU_SMS_PARCA_BEKLEME_MS)
          );
        }
      }
      setSonuc(
        smsAdet > 1
          ? `${smsAdet} kuyruk oluşturuldu (${alicilar.length} alıcı × ${smsAdet} SMS). Toplu SMS sayfasından izleyin.`
          : `Kuyruk oluşturuldu (${alicilar.length} alıcı). Toplu SMS sayfasından izleyin.`
      );
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setGonderiyor(false);
    }
  }

  function duzenlemeyeAl(s: HizmetVerenDuyuruSablonKayit) {
    setDuzenleId(s.id);
    setForm({
      etiket: s.etiket,
      aciklama: s.aciklama,
      govde: s.govde,
      sira: String(s.sira),
    });
    setSablonMesaj("");
    setSablonHata("");
    setYonetimAcik(true);
  }

  function formuTemizle() {
    setDuzenleId(null);
    setForm(BOS_FORM);
  }

  function yerTutucuEkle() {
    setForm((f) => {
      if (f.govde.includes(DUYURU_AYARLAR_URL_PH)) return f;
      const base = f.govde.trimEnd();
      return {
        ...f,
        govde: base
          ? `${base}\nDegistirmek icin: ${DUYURU_AYARLAR_URL_PH}`
          : DUYURU_AYARLAR_URL_PH,
      };
    });
  }

  async function sablonKaydet(e: React.FormEvent) {
    e.preventDefault();
    setKaydediyor(true);
    setSablonHata("");
    setSablonMesaj("");
    try {
      const seciliDuzenleniyor = duzenleId === seciliIdRef.current;
      const seciliKesim =
        seciliDuzenleniyor &&
        bolumler &&
        bolumler.length >= 2 &&
        bolumKontrol?.gecerli
          ? duyuruBolumlerSablonlastir(bolumler, ayarlarUrl)
          : null;
      /* Kesim varsa gövdeyi kesimden türet — form ile çelişmesin */
      const govdeKayit = seciliKesim
        ? duyuruGovdeSablonlastir(bolumler!.join(""), ayarlarUrl)
        : form.govde;
      const body: {
        etiket: string;
        aciklama: string;
        govde: string;
        sira: number;
        bolumler?: string[] | null;
      } = {
        etiket: form.etiket,
        aciklama: form.aciklama,
        govde: govdeKayit,
        sira: Number.parseInt(form.sira || "0", 10) || 0,
      };
      if (!duzenleId || seciliDuzenleniyor) {
        body.bolumler = seciliKesim;
      }
      const res = await fetch(
        duzenleId
          ? `/api/panel/hizmet-veren-duyurulari/${encodeURIComponent(duzenleId)}`
          : "/api/panel/hizmet-veren-duyurulari",
        {
          method: duzenleId ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      const seciliGuncellendi =
        Boolean(duzenleId) && duzenleId === seciliIdRef.current;
      setSablonMesaj(
        duzenleId
          ? seciliKesim
            ? "Şablon ve kesim güncellendi."
            : "Şablon güncellendi."
          : "Şablon eklendi."
      );
      formuTemizle();
      await yukle({ mesajSifirla: seciliGuncellendi });
    } catch (err) {
      setSablonHata(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setKaydediyor(false);
    }
  }

  async function aktifToggle(s: HizmetVerenDuyuruSablonKayit) {
    setSablonHata("");
    try {
      const res = await fetch(
        `/api/panel/hizmet-veren-duyurulari/${encodeURIComponent(s.id)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aktif: !s.aktif }),
        }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Güncellenemedi.");
      await yukle();
    } catch (err) {
      setSablonHata(err instanceof Error ? err.message : "Güncellenemedi.");
    }
  }

  async function sil(s: HizmetVerenDuyuruSablonKayit) {
    if (!window.confirm(`«${s.etiket}» silinsin mi?`)) return;
    setSablonHata("");
    try {
      const res = await fetch(
        `/api/panel/hizmet-veren-duyurulari/${encodeURIComponent(s.id)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Silinemedi.");
      if (duzenleId === s.id) formuTemizle();
      await yukle({
        mesajSifirla: s.id === seciliIdRef.current,
      });
    } catch (err) {
      setSablonHata(err instanceof Error ? err.message : "Silinemedi.");
    }
  }

  const birimOzet = bolumler
    ? bolumKontrol?.toplamBirim ?? 0
    : tekKontrol.birim;
  const parcaOzet = bolumler
    ? bolumler.filter((b) => b.trim()).length
    : tekKontrol.parca;

  return (
    <div className="space-y-4 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Hizmet veren duyuruları</h2>
        <p className="text-sm text-slate-500 mt-1">
          Aktif hizmet verenlere (tester hariç) toplu duyuru SMS’i. Şablon
          ekleyip düzenleyebilir; 150 birimi aşınca bölümleme ile kesim yerini
          ayarlayabilirsiniz.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Yükleniyor…</p>
      ) : (
        <>
          <Card className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">
              Alıcı: {alicilar.length} aktif hizmet veren
            </p>
            <p className="text-xs text-slate-500">
              Tester hesaplar hariç. Gönderim Toplu SMS kuyruğu ile yapılır.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-slate-700">Hazır şablon</p>
              {tabloVar && (
                <button
                  type="button"
                  onClick={() => setYonetimAcik((v) => !v)}
                  className="text-xs font-medium text-amber-800 underline"
                >
                  {yonetimAcik ? "Yönetimi kapat" : "Şablon ekle / düzenle"}
                </button>
              )}
            </div>
            {!tabloVar && (
              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Veritabanı şablon tablosu yok; yerleşik şablon kullanılıyor.
              </p>
            )}
            <div className="space-y-2">
              {sablonlar.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => sablonSec(s.id)}
                  className={`w-full text-left rounded-xl border px-3 py-2.5 ${
                    seciliId === s.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-200"
                  }`}
                >
                  <p className="text-sm font-semibold">{s.etiket}</p>
                  {s.aciklama ? (
                    <p className="text-xs text-slate-600 mt-0.5">
                      {s.aciklama}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </Card>

          {tabloVar && yonetimAcik && (
            <>
              {sablonHata && (
                <Card className="border-red-200 bg-red-50">
                  <p className="text-sm text-red-700">{sablonHata}</p>
                </Card>
              )}
              {sablonMesaj && (
                <Card className="border-emerald-200 bg-emerald-50">
                  <p className="text-sm text-emerald-800">{sablonMesaj}</p>
                </Card>
              )}

              <Card>
                <form
                  onSubmit={(e) => void sablonKaydet(e)}
                  className="space-y-3"
                >
                  <h3 className="font-semibold text-slate-800">
                    {duzenleId ? "Şablonu düzenle" : "Yeni şablon"}
                  </h3>
                  <Field
                    label="Etiket"
                    value={form.etiket}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, etiket: e.target.value }))
                    }
                    placeholder="Örn. Bildirim paketi duyurusu"
                    required
                    maxLength={120}
                  />
                  <Field
                    label="Açıklama (panelde görünür)"
                    value={form.aciklama}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, aciklama: e.target.value }))
                    }
                    placeholder="Kısa açıklama"
                    maxLength={300}
                  />
                  <div className="space-y-1">
                    <TextArea
                      label="SMS gövdesi"
                      value={form.govde}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, govde: e.target.value }))
                      }
                      rows={7}
                      required
                      maxLength={2000}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={yerTutucuEkle}
                        className="text-xs font-medium text-amber-800 underline"
                      >
                        {DUYURU_AYARLAR_URL_PH} ekle
                      </button>
                      <p
                        className={`text-xs tabular-nums ${
                          formGovdeDurum.birim > NETGSM_TOPLU_SMS_MAX_BIRIM
                            ? "text-red-600 font-medium"
                            : formGovdeDurum.parca > 1
                              ? "text-amber-700"
                              : "text-slate-500"
                        }`}
                      >
                        Önizleme: {formGovdeDurum.birim} /{" "}
                        {NETGSM_TOPLU_SMS_MAX_BIRIM} birim ·{" "}
                        {formGovdeDurum.parca || 0} SMS
                      </p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Ayarlar linki için{" "}
                      <code className="bg-slate-100 px-1 rounded">
                        {DUYURU_AYARLAR_URL_PH}
                      </code>{" "}
                      kullanın.
                    </p>
                  </div>
                  <Field
                    label="Sıra"
                    type="number"
                    min={0}
                    max={9999}
                    value={form.sira}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sira: e.target.value }))
                    }
                  />
                  <div className="flex flex-wrap gap-2">
                    <Btn type="submit" disabled={kaydediyor}>
                      {kaydediyor
                        ? "Kaydediliyor…"
                        : duzenleId
                          ? "Güncelle"
                          : "Kaydet"}
                    </Btn>
                    {duzenleId && (
                      <button
                        type="button"
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                        onClick={formuTemizle}
                      >
                        Vazgeç
                      </button>
                    )}
                  </div>
                </form>
              </Card>

              <Card className="space-y-3">
                <h3 className="font-semibold text-slate-800">
                  Kayıtlı şablonlar{" "}
                  <span className="text-sm font-normal text-slate-500">
                    ({tumSablonlar.length})
                  </span>
                </h3>
                {tumSablonlar.length === 0 && (
                  <p className="text-sm text-slate-500">Henüz şablon yok.</p>
                )}
                <ul className="divide-y divide-slate-100">
                  {tumSablonlar.map((s) => (
                    <li key={s.id} className="py-3 space-y-2">
                      <div className="flex flex-wrap justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {s.etiket}
                            {!s.aktif && (
                              <span className="ml-2 text-xs text-slate-400">
                                (pasif)
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            Sıra {s.sira}
                            {s.aciklama ? ` · ${s.aciklama}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="text-xs font-medium text-amber-700"
                            onClick={() => duzenlemeyeAl(s)}
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium text-slate-600"
                            onClick={() => void aktifToggle(s)}
                          >
                            {s.aktif ? "Pasifleştir" : "Aktifleştir"}
                          </button>
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600"
                            onClick={() => void sil(s)}
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 rounded-lg px-3 py-2">
                        {s.govde}
                      </p>
                    </li>
                  ))}
                </ul>
              </Card>
            </>
          )}

          <Card className="space-y-3">
            {bolumler == null ? (
              <>
                <TextArea
                  label="SMS metni"
                  value={mesaj}
                  onChange={(e) => {
                    setMesaj(e.target.value);
                    icerikDegisti();
                  }}
                  rows={8}
                />
                {(tekKontrol.parca > 1 ||
                  tekKontrol.birim > NETGSM_TOPLU_SMS_BIRIM) && (
                  <Btn
                    type="button"
                    variant="secondary"
                    onClick={bolumle}
                    className="!min-h-0 !py-2.5"
                  >
                    150 birime göre bölümle (kesim yerini ayarla)
                  </Btn>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-700">
                    SMS bölümleri ({bolumler.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {seciliSablonDuzenlenebilirMi() && (
                      <button
                        type="button"
                        onClick={() => void kesimiSablonaKaydet()}
                        disabled={kesimKaydediyor || !bolumKontrol?.gecerli}
                        className="text-xs font-medium text-amber-800 underline disabled:opacity-50"
                      >
                        {kesimKaydediyor
                          ? "Kesim kaydediliyor…"
                          : "Kesimi şablona kaydet"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={bolumle}
                      className="text-xs font-medium text-amber-800 underline"
                    >
                      Otomatik yeniden böl
                    </button>
                    <button
                      type="button"
                      onClick={birlestir}
                      className="text-xs font-medium text-slate-500 underline"
                    >
                      Tek metne dön
                    </button>
                  </div>
                </div>

                {bolumler.map((bolum, index) => {
                  const birim = netgsmSmsBirimHesapla(bolum);
                  const fazla = birim > NETGSM_TOPLU_SMS_BIRIM;
                  const sonraki = bolumler[index + 1];
                  const birlesik =
                    sonraki != null ? Array.from(bolum + sonraki) : null;
                  const solCp = Array.from(bolum).length;

                  return (
                    <div key={index} className="space-y-2">
                      <TextArea
                        label={`SMS ${index + 1}`}
                        value={bolum}
                        onChange={(e) => bolumGuncelle(index, e.target.value)}
                        rows={4}
                      />
                      <p
                        className={`text-xs ${
                          fazla ? "text-red-600 font-medium" : "text-slate-500"
                        }`}
                      >
                        {birim} / {NETGSM_TOPLU_SMS_BIRIM} birim
                        {fazla ? " — limit aşıldı, sınırı kaydırın" : ""}
                      </p>

                      {birlesik && birlesik.length > 1 && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2">
                          <p className="text-xs font-medium text-slate-700">
                            SMS {index + 1} → {index + 2} kesim yeri
                          </p>
                          <input
                            type="range"
                            min={1}
                            max={birlesik.length - 1}
                            value={Math.min(
                              Math.max(1, solCp),
                              birlesik.length - 1
                            )}
                            onChange={(e) =>
                              sinirKaydir(index, Number(e.target.value))
                            }
                            className="w-full accent-amber-500"
                          />
                          <p className="text-[11px] text-slate-500">
                            Kaydırarak bir sonraki SMS’e geçen metni ayarlayın.
                            Her parça en fazla {NETGSM_TOPLU_SMS_BIRIM} birim
                            olmalı.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p
              className={`text-xs ${
                birimOzet > NETGSM_TOPLU_SMS_MAX_BIRIM
                  ? "text-red-600"
                  : parcaOzet > 1
                    ? "text-amber-700"
                    : "text-slate-500"
              }`}
            >
              Netgsm: 1 SMS = {NETGSM_TOPLU_SMS_BIRIM} birim (ç/ğ/ı/ş = 2) ·{" "}
              {birimOzet} / {NETGSM_TOPLU_SMS_MAX_BIRIM} birim · {parcaOzet || 0}{" "}
              SMS
              {bolumler
                ? " · ayrı SMS olarak gönderilir"
                : parcaOzet > 1
                  ? " (uzun SMS — bölümleyerek kesim ayarlayın)"
                  : ""}
              {bolumler && bolumKontrol && !bolumKontrol.gecerli && bolumKontrol.hata
                ? ` · ${bolumKontrol.hata}`
                : !bolumler && !tekKontrol.gecerli && tekKontrol.hata
                  ? ` · ${tekKontrol.hata}`
                  : ""}
            </p>

            {hata && (
              <p className="text-sm text-red-600" role="alert">
                {hata}
              </p>
            )}
            {sonuc && (
              <p className="text-sm text-emerald-800" role="status">
                {sonuc}{" "}
                <Link
                  href="/panel/sms/toplu"
                  className="underline font-medium text-amber-800"
                >
                  Toplu SMS →
                </Link>
              </p>
            )}

            {!onizlemeAcik ? (
              <Btn
                type="button"
                disabled={!gonderilebilir}
                onClick={onizle}
              >
                Önizle
              </Btn>
            ) : (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                <p className="text-sm font-semibold text-slate-900">Önizleme</p>
                <p className="text-xs text-slate-600">
                  {alicilar.length} alıcı · kişi başı {onizlemeParcalar.length}{" "}
                  SMS · toplam ~{alicilar.length * onizlemeParcalar.length} SMS
                </p>
                <div className="space-y-2">
                  {onizlemeParcalar.map((p, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">
                        SMS {i + 1} · {netgsmSmsBirimHesapla(p)} birim
                      </p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                        {p}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                  <Btn
                    type="button"
                    variant="secondary"
                    className="!min-h-0 !py-3"
                    onClick={() => setOnizlemeAcik(false)}
                    disabled={gonderiyor || testGonderiyor}
                  >
                    Düzenle
                  </Btn>
                  <Btn
                    type="button"
                    variant="secondary"
                    className="!min-h-0 !py-3"
                    disabled={
                      gonderiyor || testGonderiyor || !gonderilebilir
                    }
                    onClick={() => void testGonder()}
                  >
                    {testGonderiyor
                      ? "Test gönderiliyor…"
                      : onizlemeParcalar.length > 1
                        ? `Test et (${onizlemeParcalar.length} SMS → ${TOPLU_SMS_ADMIN_TEST_TELEFON})`
                        : `Test et (${TOPLU_SMS_ADMIN_TEST_TELEFON})`}
                  </Btn>
                  <Btn
                    type="button"
                    disabled={
                      gonderiyor ||
                      testGonderiyor ||
                      !gonderilebilir ||
                      alicilar.length === 0
                    }
                    onClick={() => void gonder()}
                  >
                    {gonderiyor
                      ? "Kuyruğa alınıyor…"
                      : onizlemeParcalar.length > 1
                        ? `${alicilar.length} kişiye ${onizlemeParcalar.length} SMS gönder`
                        : `${alicilar.length} kişiye gönder`}
                  </Btn>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
