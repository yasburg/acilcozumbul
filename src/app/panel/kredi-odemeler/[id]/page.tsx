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
};

export default function PanelSatinAlmaDetayPage() {
  const params = useParams();
  const id = params.id as string;
  const [kayit, setKayit] = useState<Detay | null>(null);
  const [loading, setLoading] = useState(true);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [trendyolOlusturuyor, setTrendyolOlusturuyor] = useState(false);
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

  async function trendyolFaturaOlustur() {
    setHata("");
    setMesaj("");
    setTrendyolOlusturuyor(true);
    try {
      const res = await fetch(
        `/api/panel/kredi-odemeler/${id}/fatura/olustur`,
        { method: "POST", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string"
            ? data.error
            : "Trendyol fatura oluşturulamadı."
        );
      }
      if (data.atlandi) {
        setMesaj(data.mesaj ?? "İşlem atlandı.");
      } else {
        setMesaj(
          `Trendyol ${data.belgeTipi === "e-fatura" ? "e-fatura" : "e-arşiv"} oluşturuldu.`
        );
      }
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Oluşturma başarısız.");
    } finally {
      setTrendyolOlusturuyor(false);
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
          <p className="text-sm text-slate-700">
            Yüklü: <strong>{kayit.fatura.belgeNo}</strong>
            <span className="text-slate-500">
              {" "}
              · {new Date(kayit.fatura.createdAt).toLocaleString("tr-TR")}
            </span>
          </p>
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
                disabled={yukleniyor || trendyolOlusturuyor}
                onClick={() => void trendyolFaturaOlustur()}
              >
                {trendyolOlusturuyor
                  ? "Oluşturuluyor…"
                  : "Trendyol'dan fatura oluştur"}
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
                disabled={yukleniyor || trendyolOlusturuyor}
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
        <Satir label="Kredi" value={`${kayit.miktar}`} />
        <Satir label="Paket (liste)" value={`${kayit.paketTl} ₺`} />
        <Satir label="Ödenen tutar" value={`${kayit.tutar} ₺`} />
        <Satir label="Banka referansı" value={kayit.odemeReferans} />
        <Satir label="Garanti kod" value={kayit.garantiRespCode} />
        <Satir label="Ortam" value={kayit.demoOdeme ? "Demo" : "Canlı"} />
        <Satir label="Çekici ID" value={kayit.cekiciId} />
      </Card>
    </div>
  );
}
