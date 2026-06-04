"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Btn, Card } from "@/components/ui";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import { BelgeYuklemeAlani } from "@/components/cekici/BelgeYuklemeAlani";
import { cekiciFetch } from "@/lib/cekici-fetch";
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

export function OnayliCekiciHesap() {
  const router = useRouter();
  const [durum, setDurum] = useState<BelgeDurumResponse | null>(null);
  const [ruhsat, setRuhsat] = useState<string | null>(null);
  const [cekiciBelge, setCekiciBelge] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
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
      setRuhsat(null);
      setCekiciBelge(null);
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

  return (
    <section className="space-y-4">
      <Card className="border-amber-200 bg-amber-50/60">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 mb-1">
          Onaylı çekici ol
        </p>
        <h3 className="text-lg font-bold text-slate-900">Belge rozeti</h3>
        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{USTTE_GORUNUR_NOT}</p>
      </Card>

      {(hata || bilgi) && (
        <Card
          className={
            hata ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
          }
        >
          <p className={`text-sm ${hata ? "text-red-700" : "text-emerald-800"}`}>
            {hata || bilgi}
          </p>
        </Card>
      )}

      {durum.belgeDurum === "beklemede" && (
        <Card className="border-blue-200 bg-blue-50">
          <p className="text-sm text-blue-900 font-medium">
            Belgeleriniz inceleniyor. Admin onayından sonra rozet satın alma
            adımına geçebilirsiniz.
          </p>
        </Card>
      )}

      {durum.belgeDurum === "reddedildi" && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-800 font-medium">Belgeler reddedildi</p>
          {durum.belgeRedNedeni && (
            <p className="text-sm text-red-700 mt-1">{durum.belgeRedNedeni}</p>
          )}
          <p className="text-xs text-red-600 mt-2">Lütfen belgeleri yeniden yükleyin.</p>
        </Card>
      )}

      {durum.belgeDurum === "onaylandi" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-900 font-medium mb-2">
            ✓ Belgeleriniz onaylandı — doğrulanmış rozet satın alabilirsiniz.
          </p>
          <p className="text-sm text-slate-700 mb-3">{USTTE_GORUNUR_NOT}</p>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg text-slate-400 line-through">
              {ROZET_LISTE_FIYAT_TL.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              TL
            </span>
            <span className="text-2xl font-bold text-amber-600">
              {ROZET_INDIRIMLI_FIYAT_TL.toLocaleString("tr-TR", {
                minimumFractionDigits: 2,
              })}{" "}
              TL
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              %{rozetIndirimYuzde()} indirim
            </span>
          </div>
          <Btn onClick={() => void rozeteGit()} disabled={odemeBaslatiyor}>
            {odemeBaslatiyor ? "Yönlendiriliyor…" : "Rozeti satın al"}
          </Btn>
          <p className="text-xs text-slate-500 mt-2">
            Fatura e-postanız kredi ödemesinde doğrulanmış olmalıdır.{" "}
            <Link href="/cekici/kredi" className="text-amber-700 underline">
              Kredi / e-posta doğrulama
            </Link>
          </p>
        </Card>
      )}

      {(durum.belgeDurum === "yok" ||
        durum.belgeDurum === "reddedildi") && (
        <>
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
          <Btn onClick={() => void belgeleriGonder()} disabled={gonderiyor}>
            {gonderiyor ? "Gönderiliyor…" : "Belgeleri incelemeye gönder"}
          </Btn>
        </>
      )}
    </section>
  );
}
