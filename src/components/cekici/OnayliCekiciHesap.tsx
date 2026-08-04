"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Btn, Card } from "@/components/ui";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import { BelgeYuklemeAlani } from "@/components/cekici/BelgeYuklemeAlani";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { posthogOlayYakala } from "@/lib/posthog-client";
import {
  ROZET_INDIRIMLI_FIYAT_TL,
  ROZET_LISTE_FIYAT_TL,
  rozetIndirimYuzde,
} from "@/lib/rozet";
import type { BelgeDurum } from "@/lib/types";

const USTTE_GORUNUR_NOT =
  "Onaylı çekici rozetine sahip hizmet verenlerin teklifleri müşteri ekranında üst sıralarda gösterilir.";

type BelgeDurumResponse = {
  belgeDurum: BelgeDurum;
  belgeRedNedeni?: string | null;
  belgeRuhsatUrl?: string | null;
  belgeCekiciUrl?: string | null;
  rozetAktif: boolean;
};

function durumEtiket(d: BelgeDurum): string | null {
  switch (d) {
    case "beklemede":
      return "İnceleniyor";
    case "onaylandi":
      return "Belgeler onaylandı";
    case "reddedildi":
      return "Reddedildi";
    default:
      return null;
  }
}

export function OnayliCekiciHesap() {
  const router = useRouter();
  const [durum, setDurum] = useState<BelgeDurumResponse | null>(null);
  const [ruhsat, setRuhsat] = useState<string | null>(null);
  const [cekiciBelge, setCekiciBelge] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [basvuruAcik, setBasvuruAcik] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [odemeBaslatiyor, setOdemeBaslatiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");

  const yukle = useCallback(async (sessiz = false) => {
    if (!sessiz) setYukleniyor(true);
    try {
      const res = await cekiciFetch("/api/cekici/belge");
      if (!res.ok) throw new Error("Durum alınamadı.");
      setDurum(await res.json());
    } catch {
      if (!sessiz) setDurum(null);
    } finally {
      if (!sessiz) setYukleniyor(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (durum?.belgeDurum !== "beklemede") return;
    const timer = setInterval(() => {
      void yukle(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [durum?.belgeDurum, yukle]);

  function basvuruAc() {
    setHata("");
    setBilgi("");
    setRuhsat(null);
    setCekiciBelge(null);
    setBasvuruAcik(true);
  }

  function basvuruKapat() {
    setBasvuruAcik(false);
    setHata("");
    setRuhsat(null);
    setCekiciBelge(null);
  }

  async function belgeleriGonder() {
    setHata("");
    setBilgi("");
    if (!ruhsat || !cekiciBelge) {
      setHata("Ruhsat ve çekici belgesi yükleyin.");
      return;
    }
    setGonderiyor(true);
    try {
      const res = await cekiciFetch("/api/cekici/belge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ruhsat, cekiciBelgesi: cekiciBelge }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBilgi(data.mesaj);
      basvuruKapat();
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setGonderiyor(false);
    }
  }

  async function rozeteGit() {
    setHata("");
    setOdemeBaslatiyor(true);
    try {
      const me = await cekiciFetch("/api/cekici/me");
      const meData = me.ok ? await me.json() : {};
      const res = await cekiciFetch("/api/cekici/rozet/odeme/baslat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eposta: meData.faturaEposta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      posthogOlayYakala("cekici_odeme_baslat", {
        rol: "cekici",
        odeme_tipi: "rozet",
        odeme_id: data.odemeId,
      });
      sessionStorage.setItem(
        `odeme-${data.odemeId}`,
        JSON.stringify({
          miktar: 0,
          tutar: data.tutar,
          listeFiyati: data.listeFiyati,
          odemeTipi: "rozet",
          garantiAktif: data.garantiAktif,
        })
      );
      router.push(`/cekici/odeme/${data.odemeId}`);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Ödeme başlatılamadı.");
    } finally {
      setOdemeBaslatiyor(false);
    }
  }

  if (yukleniyor) {
    return (
      <Card className="animate-pulse">
        <div className="h-20 bg-slate-100 rounded-lg" />
      </Card>
    );
  }

  if (!durum) return null;

  if (durum.rozetAktif) {
    return (
      <Card className="border-emerald-300 bg-emerald-50/80">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <OnayliCekiciRozeti />
          <span className="text-sm font-semibold text-emerald-900">
            Onaylı çekici rozetiniz aktif
          </span>
        </div>
        <p className="text-sm text-emerald-800 leading-relaxed">{USTTE_GORUNUR_NOT}</p>
      </Card>
    );
  }

  const etiket = durumEtiket(durum.belgeDurum);
  const basvuruYapilabilir =
    durum.belgeDurum === "yok" || durum.belgeDurum === "reddedildi";

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/60 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
              Onaylı çekici
            </p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Belge rozeti</h3>
          </div>
          {etiket && (
            <span
              className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                durum.belgeDurum === "beklemede"
                  ? "bg-blue-100 text-blue-800"
                  : durum.belgeDurum === "onaylandi"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              {etiket}
            </span>
          )}
        </div>

        <p className="text-sm text-slate-700 leading-relaxed">{USTTE_GORUNUR_NOT}</p>

        {durum.belgeDurum === "beklemede" && (
          <p className="text-sm text-blue-900">
            Belgeleriniz inceleniyor. Onay sonrası rozet satın alabilirsiniz.
          </p>
        )}

        {durum.belgeDurum === "reddedildi" && durum.belgeRedNedeni && (
          <p className="text-sm text-red-700">{durum.belgeRedNedeni}</p>
        )}

        {durum.belgeDurum === "onaylandi" && (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-base text-slate-400 line-through">
              {ROZET_LISTE_FIYAT_TL.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              TL
            </span>
            <span className="text-xl font-bold text-amber-600">
              {ROZET_INDIRIMLI_FIYAT_TL.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              TL
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              %{rozetIndirimYuzde()} indirim
            </span>
          </div>
        )}

        {(hata || bilgi) && !basvuruAcik && (
          <p
            className={`text-sm ${hata ? "text-red-700" : "text-emerald-800"}`}
            role="alert"
          >
            {hata || bilgi}
          </p>
        )}

        {basvuruYapilabilir && (
          <Btn
            type="button"
            variant="secondary"
            className="!min-h-[44px] !py-3"
            onClick={basvuruAc}
          >
            {durum.belgeDurum === "reddedildi" ? "Yeniden başvur" : "Başvur"}
          </Btn>
        )}

        {durum.belgeDurum === "onaylandi" && (
          <>
            <Btn onClick={() => void rozeteGit()} disabled={odemeBaslatiyor}>
              {odemeBaslatiyor ? "Yönlendiriliyor…" : "Rozeti satın al"}
            </Btn>
            <p className="text-xs text-slate-500">
              Ödeme adımında fatura bilgilerinizi girebilirsiniz.
            </p>
          </>
        )}
      </Card>

      {basvuruAcik && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onayli-basvuru-baslik"
        >
          <Card className="w-full max-w-md shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3
              id="onayli-basvuru-baslik"
              className="text-lg font-bold text-slate-900"
            >
              Onaylı çekici başvurusu
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ruhsat ve çekici belgenizi yükleyin. İnceleme sonrası rozet
              satın alma adımına geçebilirsiniz.
            </p>

            {hata && (
              <p className="text-sm text-red-700" role="alert">
                {hata}
              </p>
            )}

            <BelgeYuklemeAlani
              label="Ruhsat"
              aciklama="Araç ruhsatı — fotoğraf veya PDF"
              mevcutUrl={durum.belgeRuhsatUrl ?? undefined}
              onSecildi={setRuhsat}
              invalid={!!hata && !ruhsat}
            />
            <BelgeYuklemeAlani
              label="Çekici belgesi"
              aciklama="Çekici / işletme belgesi — fotoğraf veya PDF"
              mevcutUrl={durum.belgeCekiciUrl ?? undefined}
              onSecildi={setCekiciBelge}
              invalid={!!hata && !cekiciBelge}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
              <Btn
                type="button"
                variant="secondary"
                onClick={basvuruKapat}
                disabled={gonderiyor}
              >
                Vazgeç
              </Btn>
              <Btn
                type="button"
                onClick={() => void belgeleriGonder()}
                disabled={gonderiyor}
              >
                {gonderiyor ? "Gönderiliyor…" : "Belgeleri gönder"}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
