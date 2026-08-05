"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MobileShell } from "@/components/MobileShell";
import { Btn, Card } from "@/components/ui";
import {
  ABONELIK_PAKETLERI,
  KREDI_SATIN_AL_PAKETLERI,
  type KrediPaketKaynak,
  type KrediPaketTl,
  krediPaketListesi,
  krediPaketOdenecekTL,
} from "@/lib/kredi-fiyat";
import { formatKredi } from "@/lib/talep-utils";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { posthogOlayYakala } from "@/lib/posthog-client";
import { gtagAdsKrediSepeteEklemeDonusumu } from "@/lib/gtag";

type AbonelikOzet = {
  id: string;
  paketTl: number;
  status: string;
  renewsAt?: string;
  retryCount: number;
};

export default function KrediPage() {
  const router = useRouter();
  const [kredi, setKredi] = useState(0);
  const [kaynak, setKaynak] = useState<KrediPaketKaynak>("abonelik");
  const [seciliPaket, setSeciliPaket] = useState<KrediPaketTl>(999);
  const [loading, setLoading] = useState(false);
  const [iptalYukleniyor, setIptalYukleniyor] = useState(false);
  const [error, setError] = useState("");
  const [abonelik, setAbonelik] = useState<AbonelikOzet | null>(null);
  const [eposta, setEposta] = useState("");

  const paketler = krediPaketListesi(kaynak);
  const paket = paketler.find((p) => p.tutarTL === seciliPaket) ?? paketler[1]!;
  const odenecek = krediPaketOdenecekTL(paket);
  const aktifAbonelikVar =
    abonelik?.status === "active" || abonelik?.status === "past_due";

  const abonelikYukle = useCallback(async () => {
    const res = await cekiciFetch("/api/cekici/abonelik");
    if (!res.ok) return;
    const d = await res.json();
    setAbonelik(d.abonelik ?? null);
  }, []);

  useEffect(() => {
    cekiciFetch("/api/cekici/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setKredi(d.kredi);
        if (d.faturaEposta) setEposta(d.faturaEposta);
      })
      .catch(() => router.push("/cekici/giris"));
    void abonelikYukle();
  }, [router, abonelikYukle]);

  async function odemeyeGit() {
    if (kaynak === "abonelik" && aktifAbonelikVar) {
      setError("Zaten aktif bir aboneliğiniz var.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paketTl: paket.tutarTL,
          ...(eposta.trim() ? { eposta } : {}),
          kaynak,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      posthogOlayYakala("cekici_odeme_baslat", {
        rol: "cekici",
        odeme_tipi: kaynak,
        paket_tl: paket.tutarTL,
        odeme_id: data.odemeId,
      });
      gtagAdsKrediSepeteEklemeDonusumu({
        value: Number(data.tutar) || odenecek,
        user: eposta.trim() ? { email: eposta } : undefined,
      });
      sessionStorage.setItem(
        `odeme-${data.odemeId}`,
        JSON.stringify({
          miktar: data.miktar,
          tutar: data.tutar,
          listeFiyati: data.listeFiyati ?? paket.tutarTL,
          garantiAktif: data.garantiAktif,
          odemeTipi: data.odemeTipi,
          eposta: eposta.trim() || undefined,
        })
      );
      router.push(`/cekici/odeme/${data.odemeId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function abonelikIptal() {
    if (
      !confirm(
        "Aboneliği iptal etmek istediğinize emin misiniz? Otomatik yenileme durur. Abonelik krediniz dönem sonuna kadar kullanılabilir; sonrasında sıfırlanır. Satın alınan krediler kalır."
      )
    ) {
      return;
    }
    setIptalYukleniyor(true);
    setError("");
    try {
      const res = await cekiciFetch("/api/cekici/abonelik/iptal", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAbonelik(null);
      const me = await cekiciFetch("/api/cekici/me");
      if (me.ok) {
        const d = await me.json();
        setKredi(d.kredi);
      }
      posthogOlayYakala("cekici_abonelik_iptal", { rol: "cekici" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "İptal başarısız.");
    } finally {
      setIptalYukleniyor(false);
    }
  }

  function kaynakDegistir(k: KrediPaketKaynak) {
    setKaynak(k);
    const liste = k === "abonelik" ? ABONELIK_PAKETLERI : KREDI_SATIN_AL_PAKETLERI;
    if (!liste.some((p) => p.tutarTL === seciliPaket)) {
      setSeciliPaket(999);
    }
  }

  return (
    <MobileShell
      backHref="/cekici/panel?tab=hesabim"
      subtitle="Kredi / Abonelik"
      headerEnd={
        <p className="text-right leading-tight">
          <span className="block text-[10px] text-slate-400">Kredi</span>
          <span className="text-sm font-semibold tabular-nums text-amber-700">
            {formatKredi(kredi)}
          </span>
        </p>
      }
    >
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {abonelik && aktifAbonelikVar && (
        <Card className="border-emerald-200 bg-emerald-50/80 mb-4 space-y-2">
          <p className="text-sm font-semibold text-emerald-900">
            Abonelik {abonelik.status === "past_due" ? "(ödeme gecikti)" : "aktif"}
          </p>
          <p className="text-sm text-emerald-800">
            Paket: {abonelik.paketTl} TL
            {abonelik.renewsAt
              ? ` · Sonraki yenileme: ${new Date(abonelik.renewsAt).toLocaleDateString("tr-TR")}`
              : ""}
          </p>
          {abonelik.status === "past_due" && (
            <p className="text-xs text-amber-800">
              Ödeme alınamadı. Kartınızı kontrol edin veya yeniden abone olun.
            </p>
          )}
          <Btn
            type="button"
            variant="secondary"
            onClick={() => void abonelikIptal()}
            disabled={iptalYukleniyor}
          >
            {iptalYukleniyor ? "İptal ediliyor…" : "Aboneliği iptal et"}
          </Btn>
        </Card>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100">
          {(
            [
              ["abonelik", "Abonelik"],
              ["kredi", "Kredi satın al"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => kaynakDegistir(k)}
              className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                kaynak === k
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <p className="text-sm font-medium text-slate-700">Paket seçin</p>
        <p className="text-xs text-slate-500 -mt-2">
          {kaynak === "abonelik"
            ? "Minimum 499 TL · Her ay otomatik yenilenir (Garanti)"
            : "Minimum 499 TL · Tek seferlik yükleme · Teklif vermek ücretsiz"}
        </p>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 space-y-1">
          <p className="text-sm text-slate-700 leading-snug">
            1 kredi = yardım isteyen müşteriden 1 haber SMS’i
          </p>
          <p className="text-sm text-slate-600 leading-snug">
            Krediniz yoksa işin detaylarını göremezsiniz. Teklif vermek
            ücretsizdir.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {paketler.map((p) => {
            const secili = p.tutarTL === paket.tutarTL;
            const fiyat = krediPaketOdenecekTL(p);
            const onerilen = p.tutarTL === 999;
            const enAvantajli = p.tutarTL === 1999;
            return (
              <button
                key={`${kaynak}-${p.tutarTL}`}
                type="button"
                onClick={() => setSeciliPaket(p.tutarTL)}
                className={`rounded-xl border-2 p-4 text-left transition-colors relative ${
                  secili
                    ? "border-amber-500 bg-amber-50"
                    : "border-slate-200 bg-white hover:border-amber-300"
                }`}
              >
                {(onerilen || enAvantajli) && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wide text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    {onerilen ? "Önerilen" : "En avantajlı"}
                  </span>
                )}
                <p className="text-lg font-bold text-slate-900">
                  {formatKredi(p.kredi)} kredi
                </p>
                <p className="text-sm text-slate-600 mt-1">{p.tutarTL} TL paket</p>
                {p.bonusKredi > 0 && (
                  <p className="text-sm font-semibold text-emerald-700 mt-2">
                    +{p.bonusKredi} bonus kredi
                  </p>
                )}
                <p className="text-sm font-semibold text-amber-700 mt-2">
                  {fiyat} ₺
                  {kaynak === "abonelik" ? " / ay" : ""}
                </p>
              </button>
            );
          })}
        </div>

        {kaynak === "abonelik" && (
          <>
            <p className="text-sm font-medium text-slate-700 text-center -mt-1">
              Aboneliği istediğiniz zaman iptal edebilirsiniz.
            </p>
            <p className="text-[11px] text-slate-400 leading-snug">
              Kullanılmayan abonelik kredisi (bonus dahil) ay yenilenince veya
              iptal sonrası dönem bitince sıfırlanır. «Kredi satın al» ile
              aldığınız ekstra krediler kalır.
            </p>
          </>
        )}

        <Card className="bg-slate-50">
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-700 font-medium">Ödenecek</span>
            <span className="font-bold text-amber-600 text-lg">{odenecek} ₺</span>
          </div>
        </Card>

        <Btn
          onClick={odemeyeGit}
          disabled={loading || (kaynak === "abonelik" && aktifAbonelikVar)}
        >
          {loading
            ? "Yönlendiriliyor…"
            : kaynak === "abonelik"
              ? `💳 ${odenecek} ₺ — Abone ol`
              : `💳 ${odenecek} ₺ — Ödemeye Git`}
        </Btn>
        <button
          type="button"
          onClick={() => router.push("/cekici/panel?tab=hesabim")}
          className="w-full text-center text-sm font-medium text-slate-400 hover:text-slate-500 touch-manipulation py-2"
        >
          Ücretsiz devam et
        </button>
      </div>
    </MobileShell>
  );
}
