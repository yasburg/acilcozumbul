"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Field, SelectField, Card } from "@/components/ui";
import { SorunTipiSecimi } from "@/components/SorunTipiSecimi";
import { IlceSecimi } from "@/components/IlceSecimi";
import { DESTEKLENEN_ILLER, ilceListesi } from "@/lib/il-ilce";
import { SORUN_TIPLERI, type SorunTipi } from "@/lib/sorun-tipleri";
import {
  ISTANBUL_ASYA_ILCELER,
  ISTANBUL_AVRUPA_ILCELER,
  ISTANBUL_IL,
} from "@/lib/istanbul-ilceler";
import {
  kayitFunnelGetir,
  kayitFunnelMi,
  kayitHizmetSorunOnerisi,
} from "@/lib/kayit-funnel";
import { kayitFunnelSessionId } from "@/lib/kayit-funnel-client";
import { cekiciFetch } from "@/lib/cekici-fetch";
import {
  tiktokPixelClickButton,
  tiktokPixelHesapOlustur,
  tiktokPixelViewContent,
} from "@/lib/tiktok-pixel";

export default function KayitKurulumPage() {
  const router = useRouter();
  const [adim, setAdim] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [isim, setIsim] = useState("");
  const [soyad, setSoyad] = useState("");
  const [sehir, setSehir] = useState(ISTANBUL_IL);
  const [ilceler, setIlceler] = useState<string[]>([]);
  const [sorunTipleri, setSorunTipleri] = useState<string[]>([]);
  const [tumSorunTipleri] = useState<SorunTipi[]>(SORUN_TIPLERI);

  const sehirIlceler = useMemo(() => ilceListesi(sehir), [sehir]);
  const istanbulMu = sehir === ISTANBUL_IL;

  useEffect(() => {
    tiktokPixelViewContent({
      content_id: "kayit_kurulum",
      content_name: "hesap_kurulumu",
    });
    void (async () => {
      const res = await cekiciFetch("/api/cekici/kurulum");
      if (res.status === 401) {
        router.replace("/cekici/giris");
        return;
      }
      const d = await res.json().catch(() => ({}));
      if (d.profilHazir) {
        router.replace("/cekici/panel");
        return;
      }
      if (typeof d.isim === "string" && d.isim.trim()) setIsim(d.isim);
      else if (typeof d.ad === "string" && d.ad.trim()) {
        const p = d.ad.trim().split(/\s+/);
        setIsim(p[0] ?? "");
        setSoyad(p.slice(1).join(" "));
      }
      if (typeof d.soyad === "string" && d.soyad.trim()) setSoyad(d.soyad);
      if (typeof d.sehir === "string" && d.sehir) setSehir(d.sehir);

      if (Array.isArray(d.hizmetSorunTipleri) && d.hizmetSorunTipleri.length) {
        setSorunTipleri(d.hizmetSorunTipleri);
      } else if (
        typeof d.kayitFunnel === "string" &&
        kayitFunnelMi(d.kayitFunnel)
      ) {
        const f = kayitFunnelGetir(d.kayitFunnel);
        if (f?.hizmetOnsecim) {
          setSorunTipleri(kayitHizmetSorunOnerisi(f.hizmetOnsecim));
        }
      }

      const bolgeler = d.hizmetBolgeleri as Record<string, string[]> | undefined;
      const adVar =
        (typeof d.isim === "string" && d.isim.trim()) ||
        (typeof d.ad === "string" && d.ad.trim());
      if (bolgeler && typeof bolgeler === "object") {
        const sehirKey =
          typeof d.sehir === "string" && d.sehir
            ? d.sehir
            : Object.keys(bolgeler)[0];
        const flat = sehirKey
          ? bolgeler[sehirKey] ?? Object.values(bolgeler).flat()
          : Object.values(bolgeler).flat();
        if (flat.length) {
          setIlceler(flat);
        } else if (adVar) {
          setAdim(2);
        }
      } else if (adVar) {
        setAdim(2);
      }
      setLoading(false);
    })();
  }, [router]);

  async function kaydet(body: Record<string, unknown>) {
    setSaving(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/kurulum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...body,
          sessionId: kayitFunnelSessionId(),
        }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof d.error === "string" ? d.error : "Kayıt başarısız.");
      }
      if (d.yonlendir) {
        /* Funnel B+: kurulum bitti → hesap oluştur dönüşümü */
        await tiktokPixelHesapOlustur({
          content_name: "cekici_hesap_kurulum",
          externalId:
            typeof d.cekiciId === "string"
              ? d.cekiciId
              : typeof d.id === "string"
                ? d.id
                : null,
        });
        router.push(String(d.yonlendir));
        return;
      }
      if (d.sonraki) setAdim(Number(d.sonraki));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setSaving(false);
    }
  }

  function ilceToggle(ilce: string) {
    setIlceler((prev) =>
      prev.includes(ilce) ? prev.filter((x) => x !== ilce) : [...prev, ilce]
    );
  }

  function istanbulKisayol(tip: "avrupa" | "asya") {
    const liste =
      tip === "avrupa"
        ? [...ISTANBUL_AVRUPA_ILCELER]
        : [...ISTANBUL_ASYA_ILCELER];
    setIlceler(liste);
  }

  function sorunToggle(id: string) {
    setSorunTipleri((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  if (loading) {
    return (
      <MobileShell subtitle="Hesap kurulumu">
        <p className="text-center text-slate-500 py-12">Yükleniyor…</p>
      </MobileShell>
    );
  }

  const yuzde = adim === 1 ? 40 : 75;

  return (
    <MobileShell subtitle="Hesap kurulumu" backHref="/cekici/panel">
      <div className="space-y-5 pb-8">
        <div>
          <p className="text-sm text-slate-500">İlerleme %{yuzde}</p>
          <div className="mt-1.5 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all"
              style={{ width: `${yuzde}%` }}
            />
          </div>
        </div>

        {adim === 1 && (
          <Card className="space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Sizi tanıyalım</h1>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="İsim"
                value={isim}
                onChange={(e) => setIsim(e.target.value)}
                autoComplete="given-name"
                className="text-lg min-h-[52px]"
              />
              <Field
                label="Soyisim"
                value={soyad}
                onChange={(e) => setSoyad(e.target.value)}
                autoComplete="family-name"
                className="text-lg min-h-[52px]"
              />
            </div>

            <SelectField
              label="Şehir"
              value={sehir}
              onChange={(e) => {
                setSehir(e.target.value);
                setIlceler([]);
              }}
              className="min-h-[52px] text-base"
            >
              {DESTEKLENEN_ILLER.map((il) => (
                <option key={il} value={il}>
                  {il}
                </option>
              ))}
            </SelectField>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">
                Hizmet verdiğim sorunlar
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yalnızca işaretlediğiniz sorun tipleri için talep bildirimi
                alırsınız.
              </p>
              <SorunTipiSecimi
                tumTipler={tumSorunTipleri}
                seciliTipler={sorunTipleri}
                onToggle={sorunToggle}
                onTumunuSec={() =>
                  setSorunTipleri(tumSorunTipleri.map((t) => t.id))
                }
                onTemizle={() => setSorunTipleri([])}
              />
            </div>

            <Btn
              className="w-full min-h-[52px]"
              disabled={
                saving ||
                isim.trim().length < 2 ||
                soyad.trim().length < 2 ||
                sorunTipleri.length === 0
              }
              onClick={() =>
                void kaydet({
                  adim: 1,
                  isim: isim.trim(),
                  soyad: soyad.trim(),
                  sehir,
                  sorunTipleri,
                })
              }
            >
              {saving ? "Kaydediliyor…" : "Devam et"}
            </Btn>
          </Card>
        )}

        {adim === 2 && (
          <div className="space-y-4">
            <Card className="space-y-2">
              <h1 className="text-xl font-bold text-slate-900">
                Nerelerde çalışıyorsunuz?
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yalnızca seçili bölgelerdeki talepler için SMS ve açık ihale
                görünür. Menzil ayarını sonra panel → Ayarlar’dan
                yapabilirsiniz.
              </p>
              {ilceler.length > 0 && (
                <p className="text-xs text-amber-800 font-medium">
                  {sehir} — {ilceler.length} ilçe seçili
                </p>
              )}
            </Card>

            {istanbulMu && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIlceler([...sehirIlceler])}
                  className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium"
                >
                  Tümü
                </button>
                <button
                  type="button"
                  onClick={() => istanbulKisayol("avrupa")}
                  className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium"
                >
                  Avrupa
                </button>
                <button
                  type="button"
                  onClick={() => istanbulKisayol("asya")}
                  className="flex-1 text-sm py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium"
                >
                  Asya
                </button>
              </div>
            )}

            <IlceSecimi
              il={sehir}
              tumIlceler={sehirIlceler}
              seciliIlceler={ilceler}
              onToggle={ilceToggle}
              onTumunuSec={() => setIlceler([...sehirIlceler])}
              onTemizle={() => setIlceler([])}
            />

            <Btn
              className="w-full min-h-[52px] bg-amber-600 hover:bg-amber-700"
              disabled={saving || ilceler.length === 0}
              onClick={() => {
                tiktokPixelClickButton({
                  content_id: "kayit_kurulum_bitir",
                  content_name: "isleri_gormeye_basla",
                });
                void kaydet({
                  adim: 2,
                  bolgeler: { [sehir]: ilceler },
                });
              }}
            >
              {saving ? "Kaydediliyor…" : "İşleri görmeye başla"}
            </Btn>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </MobileShell>
  );
}
