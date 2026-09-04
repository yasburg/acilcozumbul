"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Btn, Card } from "@/components/ui";
import type { SatinAlmaTip } from "@/lib/panel-satin-almalar";

function Satir({ label, value }: { label: string; value?: string | number | null }) {
  if (value == null || value === "") return null;
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-100 text-sm">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span className="text-slate-900 text-right font-medium break-all">{value}</span>
    </div>
  );
}

type Detay = {
  id: string;
  tip: SatinAlmaTip;
  tipEtiket: string;
  cekiciId: string;
  cekiciAd: string;
  ad: string;
  soyad: string;
  cekiciTelefon: string;
  cekiciSehir?: string;
  miktar: number;
  tutar: number;
  paketTl: number;
  faturaEposta?: string;
  faturaAdres?: string;
  faturaTcKimlik?: string;
  kurumsal: boolean;
  sirketUnvan?: string;
  vergiNo?: string;
  odemeReferans?: string;
  garantiRespCode?: string;
  demoOdeme: boolean;
  olusturulma: string;
  fatura: { id: string; belgeNo: string; createdAt: string } | null;
  trendyolFatura: {
    durum: "iptal" | "aktif" | "yok";
    invoiceUuid?: string;
    invoiceId?: string;
  } | null;
};

type FaturaOnizleme = {
  belgeTipi: "e-fatura" | "e-arsiv";
  kalemAciklama: string;
  tutarTl: number;
  matrahTl: number;
  kdvTl: number;
  kdvOran: number;
  faturaTarihi: string;
  aliciUnvan: string;
  aliciVergiNo: string;
  aliciAdres?: string;
  aliciEposta?: string;
  kurumsal: boolean;
};

export default function PanelSatinAlmaDetayPage() {
  const params = useParams();
  const id = params.id as string;
  const [kayit, setKayit] = useState<Detay | null>(null);
  const [loading, setLoading] = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [trendyolOlusturuyor, setTrendyolOlusturuyor] = useState(false);
  const [trendyolOnizleniyor, setTrendyolOnizleniyor] = useState(false);
  const [faturaOnizleme, setFaturaOnizleme] = useState<FaturaOnizleme | null>(
    null
  );
  const [onizlemeYeniden, setOnizlemeYeniden] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const dosyaRef = useRef<HTMLInputElement>(null);

  async function yukle() {
    const r = await fetch(`/api/panel/kredi-odemeler/${id}`);
    setKayit(r.ok ? await r.json() : null);
  }

  useEffect(() => {
    void yukle().finally(() => setLoading(false));
  }, [id]);

  async function faturaYukle(e: React.ChangeEvent<HTMLInputElement>) {
    const dosya = e.target.files?.[0];
    e.target.value = "";
    if (!dosya) return;
    setHata("");
    setMesaj("");
    setYukleniyor(true);
    try {
      const form = new FormData();
      form.set("pdf", dosya);
      const res = await fetch(`/api/panel/kredi-odemeler/${id}/fatura`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Yükleme başarısız."
        );
      }
      const bildirim =
        data.bildirimKanal === "email"
          ? "E-posta gönderildi."
          : data.bildirimKanal === "sms"
            ? "SMS gönderildi."
            : "PDF kaydedildi; bildirim gönderilemedi.";
      setMesaj(`${data.fatura?.belgeNo ?? "Fatura"} yüklendi. ${bildirim}`);
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setYukleniyor(false);
    }
  }

  async function trendyolFaturaOnizle(yeniden = false) {
    setHata("");
    setMesaj("");
    setTrendyolOnizleniyor(true);
    try {
      const res = await fetch(
        `/api/panel/kredi-odemeler/${id}/fatura/onizle`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Fatura önizlemesi alınamadı."
        );
      }
      setOnizlemeYeniden(yeniden);
      setFaturaOnizleme(data.onizleme as FaturaOnizleme);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Önizleme başarısız.");
    } finally {
      setTrendyolOnizleniyor(false);
    }
  }

  async function trendyolFaturaOlustur(yeniden = false) {
    setHata("");
    setMesaj("");
    setTrendyolOlusturuyor(true);
    try {
      const res = await fetch(
        `/api/panel/kredi-odemeler/${id}/fatura/olustur`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ yeniden }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Trendyol fatura oluşturulamadı."
        );
      }
      setFaturaOnizleme(null);
      if (data.atlandi) {
        setMesaj(data.mesaj ?? "İşlem atlandı.");
      } else {
        setMesaj(
          yeniden
            ? `Trendyol ${data.belgeTipi === "e-fatura" ? "e-fatura" : "e-arşiv"} yeniden oluşturuldu.`
            : `Trendyol ${data.belgeTipi === "e-fatura" ? "e-fatura" : "e-arşiv"} oluşturuldu.`
        );
      }
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Oluşturma başarısız.");
    } finally {
      setTrendyolOlusturuyor(false);
    }
  }

  async function faturaIndir() {
    if (!kayit?.fatura) return;
    setHata("");
    setMesaj("");
    try {
      const res = await fetch(
        `/api/panel/faturalar/${kayit.fatura.id}/pdf`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          typeof data.error === "string" ? data.error : "PDF indirilemedi."
        );
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${kayit.fatura.belgeNo}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "PDF indirilemedi.");
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (!kayit) {
    return (
      <Card>
        <p className="text-slate-600">Kayıt bulunamadı.</p>
        <Link href="/panel/kredi-odemeler" className="text-amber-600 text-sm mt-2 inline-block">
          ← Listeye dön
        </Link>
      </Card>
    );
  }

  const tipSinif =
    kayit.tip === "kredi"
      ? "bg-amber-50 text-amber-800"
      : kayit.tip === "rozet"
        ? "bg-violet-50 text-violet-800"
        : kayit.tip === "abonelik_yenileme"
          ? "bg-sky-50 text-sky-800"
          : "bg-emerald-50 text-emerald-800";

  return (
    <div className="space-y-4">
      <Link
        href="/panel/kredi-odemeler"
        className="text-sm text-amber-600 font-medium"
      >
        ← Satın almalar
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Ödeme detayı</h2>
          <p className="text-sm text-slate-500">
            {new Date(kayit.olusturulma).toLocaleString("tr-TR")}
          </p>
        </div>
        <span className={`text-sm font-medium px-3 py-1 rounded-full ${tipSinif}`}>
          {kayit.tipEtiket}
        </span>
      </div>

      <Card>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          Fatura bilgileri
        </h3>
        <Satir label="Ad" value={kayit.ad} />
        <Satir label="Soyad" value={kayit.soyad} />
        <Satir label="Telefon" value={kayit.cekiciTelefon} />
        <Satir label="Şehir" value={kayit.cekiciSehir} />
        <Satir label="E-posta" value={kayit.faturaEposta} />
        <Satir label="Adres" value={kayit.faturaAdres} />
        <Satir label="TC kimlik" value={kayit.faturaTcKimlik} />
        <Satir label="Kurumsal" value={kayit.kurumsal ? "Evet" : "Hayır"} />
        {kayit.kurumsal && (
          <>
            <Satir label="Şirket ünvanı" value={kayit.sirketUnvan} />
            <Satir label="Vergi no" value={kayit.vergiNo} />
          </>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          Fatura PDF
        </h3>
        {kayit.fatura ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-700">
              Yüklü: <strong>{kayit.fatura.belgeNo}</strong>
              <span className="text-slate-500">
                {" "}
                · {new Date(kayit.fatura.createdAt).toLocaleString("tr-TR")}
              </span>
            </p>
            {kayit.trendyolFatura?.durum === "iptal" ? (
              <>
                <p className="text-sm text-slate-700">
                  <span className="inline-block rounded-md bg-slate-200 px-2 py-0.5 font-medium text-slate-700">
                    Trendyol’da iptal edildi
                  </span>
                  {kayit.trendyolFatura.invoiceId ? (
                    <span className="ml-2 text-slate-500">
                      {kayit.trendyolFatura.invoiceId}
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-slate-600">
                  Bu PDF geçersiz. Yeni e-arşiv/e-fatura kesmek için tekrar
                  oluşturun.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Btn
                    type="button"
                    className="!w-auto min-h-0 py-2.5 px-4 text-sm !bg-amber-600 hover:!bg-amber-700"
                    disabled={trendyolOlusturuyor || trendyolOnizleniyor}
                    onClick={() => void trendyolFaturaOnizle(true)}
                  >
                    {trendyolOnizleniyor
                      ? "Önizleniyor…"
                      : "Faturayı önizle ve oluştur"}
                  </Btn>
                </div>
              </>
            ) : (
              <Btn
                type="button"
                className="!w-auto min-h-0 py-2.5 px-4 text-sm !bg-emerald-600 hover:!bg-emerald-700"
                onClick={() => void faturaIndir()}
              >
                İndir
              </Btn>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              PDF yükleyin veya Trendyol E-Faturam ile otomatik oluşturun.
              Kurumsal alımlarda e-fatura/e-arşiv; bireyselde e-arşiv kesilir
              (TC yoksa 11111111111 kullanılır).
              E-posta varsa e-posta, yoksa SMS ile fatura linki gider.
            </p>
            <div className="flex flex-wrap gap-2">
              <Btn
                type="button"
                className="!w-auto min-h-0 py-2.5 px-4 text-sm !bg-emerald-600 hover:!bg-emerald-700"
                disabled={yukleniyor || trendyolOlusturuyor || trendyolOnizleniyor}
                onClick={() => void trendyolFaturaOnizle()}
              >
                {trendyolOnizleniyor
                  ? "Önizleniyor…"
                  : "Faturayı önizle ve oluştur"}
              </Btn>
              <input
                ref={dosyaRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => void faturaYukle(e)}
              />
              <Btn
                type="button"
                className="!w-auto min-h-0 py-2.5 px-4 text-sm"
                disabled={yukleniyor || trendyolOlusturuyor || trendyolOnizleniyor}
                onClick={() => dosyaRef.current?.click()}
              >
                {yukleniyor ? "Yükleniyor…" : "Fatura yükle"}
              </Btn>
            </div>
          </div>
        )}
        {mesaj && <p className="text-sm text-emerald-700 mt-2">{mesaj}</p>}
        {hata && <p className="text-sm text-red-600 mt-2">{hata}</p>}
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-3">
          Ödeme
        </h3>
        <Satir label="Tür" value={kayit.tipEtiket} />
        <Satir
          label={kayit.tip === "rozet" ? "Paket" : "Kredi"}
          value={
            kayit.tip === "rozet"
              ? "Doğrulanmış hesap rozeti paketi"
              : `${kayit.miktar}`
          }
        />
        <Satir label="Paket (liste)" value={`${kayit.paketTl} ₺`} />
        <Satir label="Ödenen tutar" value={`${kayit.tutar} ₺`} />
        <Satir label="Banka referansı" value={kayit.odemeReferans} />
        <Satir label="Garanti kod" value={kayit.garantiRespCode} />
        <Satir label="Ortam" value={kayit.demoOdeme ? "Demo" : "Canlı"} />
        <Satir label="Çekici ID" value={kayit.cekiciId} />
      </Card>

      {faturaOnizleme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="fatura-onizle-baslik"
        >
          <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-3">
            <h3
              id="fatura-onizle-baslik"
              className="text-lg font-bold text-slate-900"
            >
              Fatura önizleme
            </h3>
            <p className="text-sm text-slate-600">
              Trendyol’a henüz gönderilmedi. Bilgileri kontrol edip onaylayın.
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1 text-sm">
              <p>
                <span className="text-slate-500">Belge tipi: </span>
                <strong>
                  {faturaOnizleme.belgeTipi === "e-fatura"
                    ? "e-Fatura"
                    : "e-Arşiv"}
                </strong>
              </p>
              <p>
                <span className="text-slate-500">Kalem: </span>
                <strong>{faturaOnizleme.kalemAciklama}</strong>
              </p>
              <p>
                <span className="text-slate-500">Alıcı: </span>
                <strong>{faturaOnizleme.aliciUnvan}</strong>
              </p>
              <p>
                <span className="text-slate-500">
                  {faturaOnizleme.kurumsal ? "VKN" : "TCKN"}:{" "}
                </span>
                <strong>{faturaOnizleme.aliciVergiNo}</strong>
              </p>
              {faturaOnizleme.aliciAdres ? (
                <p>
                  <span className="text-slate-500">Adres: </span>
                  {faturaOnizleme.aliciAdres}
                </p>
              ) : null}
              {faturaOnizleme.aliciEposta ? (
                <p>
                  <span className="text-slate-500">E-posta: </span>
                  {faturaOnizleme.aliciEposta}
                </p>
              ) : null}
              <p>
                <span className="text-slate-500">Fatura tarihi: </span>
                {faturaOnizleme.faturaTarihi}
              </p>
              <p>
                <span className="text-slate-500">Matrah: </span>
                {faturaOnizleme.matrahTl.toLocaleString("tr-TR")} ₺
              </p>
              <p>
                <span className="text-slate-500">
                  KDV (%{Math.round(faturaOnizleme.kdvOran * 100)}):{" "}
                </span>
                {faturaOnizleme.kdvTl.toLocaleString("tr-TR")} ₺
              </p>
              <p>
                <span className="text-slate-500">Toplam: </span>
                <strong>
                  {faturaOnizleme.tutarTl.toLocaleString("tr-TR")} ₺
                </strong>
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <Btn
                type="button"
                className="!w-auto min-h-0 py-2.5 px-4 text-sm !bg-emerald-600 hover:!bg-emerald-700"
                disabled={trendyolOlusturuyor}
                onClick={() => void trendyolFaturaOlustur(onizlemeYeniden)}
              >
                {trendyolOlusturuyor
                  ? "Oluşturuluyor…"
                  : "Onayla ve oluştur"}
              </Btn>
              <Btn
                type="button"
                className="!w-auto min-h-0 py-2.5 px-4 text-sm"
                disabled={trendyolOlusturuyor}
                onClick={() => setFaturaOnizleme(null)}
              >
                Vazgeç
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
