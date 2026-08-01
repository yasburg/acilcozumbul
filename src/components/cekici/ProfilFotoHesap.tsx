"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Btn, Card, Spinner } from "@/components/ui";
import { cekiciFetch } from "@/lib/cekici-fetch";
import { profilFotoDurumEtiket } from "@/lib/cekici-profil-foto";
import type { ProfilFotoDurum } from "@/lib/types";

type DurumResponse = {
  profilFotoUrl: string | null;
  profilFotoDurum: ProfilFotoDurum;
  profilFotoRedNedeni?: string | null;
  profilFotoGonderim?: string | null;
};

export function ProfilFotoHesap() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [durum, setDurum] = useState<DurumResponse | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [riza, setRiza] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState("");
  const [bilgi, setBilgi] = useState("");

  const yukle = useCallback(async (sessiz = false) => {
    if (!sessiz) setYukleniyor(true);
    try {
      const res = await cekiciFetch("/api/cekici/profil-foto");
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
    if (durum?.profilFotoDurum !== "beklemede") return;
    const timer = setInterval(() => {
      void yukle(true);
    }, 8000);
    return () => clearInterval(timer);
  }, [durum?.profilFotoDurum, yukle]);

  function dosyaSec(file: File | undefined) {
    setHata("");
    setBilgi("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setHata("Dosya en fazla 5 MB olabilir.");
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setHata("Yalnızca JPEG, PNG veya WebP yükleyin.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const sonuc = typeof reader.result === "string" ? reader.result : null;
      setOnizleme(sonuc);
    };
    reader.readAsDataURL(file);
  }

  async function gonder() {
    setHata("");
    setBilgi("");
    if (!onizleme) {
      setHata("Önce bir fotoğraf seçin.");
      return;
    }
    if (!riza) {
      setHata("Gizlilik politikası onayını işaretleyin.");
      return;
    }
    setGonderiyor(true);
    try {
      const res = await cekiciFetch("/api/cekici/profil-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fotograf: onizleme, riza: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Gönderilemedi."
        );
      }
      setOnizleme(null);
      setRiza(false);
      if (inputRef.current) inputRef.current.value = "";
      setBilgi(
        typeof data.mesaj === "string"
          ? data.mesaj
          : "Fotoğraf onaya gönderildi."
      );
      await yukle(true);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderilemedi.");
    } finally {
      setGonderiyor(false);
    }
  }

  if (yukleniyor && !durum) {
    return (
      <Card>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner className="size-4" />
          Profil fotoğrafı yükleniyor…
        </div>
      </Card>
    );
  }

  if (!durum) {
    return (
      <Card className="border-red-200 bg-red-50">
        <p className="text-sm text-red-700">Profil fotoğrafı durumu alınamadı.</p>
      </Card>
    );
  }

  const etiket = profilFotoDurumEtiket(durum.profilFotoDurum);
  const gosterilen = onizleme ?? durum.profilFotoUrl;
  const onayliSade =
    durum.profilFotoDurum === "onaylandi" && !onizleme;

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">
            {onayliSade ? "Onaylanmış fotoğraf" : "Profil fotoğrafı"}
          </p>
          {!onayliSade && (
            <p className="text-sm text-slate-600 mt-1 leading-relaxed">
              Yalnızca yüzünüz görünsün; arka plan sade olsun. Onay sonrası
              müşterilere gösterilir.
            </p>
          )}
        </div>
        {!onayliSade && etiket && (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              durum.profilFotoDurum === "beklemede"
                ? "bg-amber-100 text-amber-900"
                : durum.profilFotoDurum === "reddedildi"
                  ? "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-700"
            }`}
          >
            {etiket}
          </span>
        )}
      </div>

      {gosterilen && (
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gosterilen}
            alt="Profil fotoğrafı"
            className="size-28 rounded-full object-cover border-2 border-slate-200 bg-slate-100"
          />
        </div>
      )}

      {durum.profilFotoDurum === "beklemede" && !onizleme && (
        <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
          Fotoğrafınız inceleniyor. Onaylanınca müşterilere görünür.
        </p>
      )}

      {durum.profilFotoDurum === "reddedildi" && (
        <div
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 space-y-1"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-800">
            Fotoğrafınız onaylanmadı.
          </p>
          {durum.profilFotoRedNedeni?.trim() && (
            <p className="text-sm text-red-700 leading-relaxed">
              {durum.profilFotoRedNedeni}
            </p>
          )}
        </div>
      )}

      <div className="space-y-3 pt-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => dosyaSec(e.target.files?.[0])}
          />
          <Btn
            type="button"
            variant="outline"
            className="w-full !py-2.5 text-sm"
            onClick={() => inputRef.current?.click()}
            disabled={gonderiyor}
          >
            {gosterilen ? "Başka fotoğraf seç" : "Fotoğraf seç"}
          </Btn>

          {onizleme && (
            <>
              <label className="flex items-start gap-2.5 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={riza}
                  onChange={(e) => setRiza(e.target.checked)}
                  className="mt-1 size-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="leading-snug">
                  Profil fotoğrafımın{" "}
                  <Link
                    href="/gizlilik-politikasi"
                    className="text-amber-700 underline font-medium"
                    target="_blank"
                  >
                    Gizlilik Politikası
                  </Link>{" "}
                  kapsamında işlenmesini ve onay sonrası müşterilere
                  gösterilmesini kabul ediyorum.
                </span>
              </label>
              <Btn
                type="button"
                className="w-full"
                onClick={() => void gonder()}
                disabled={gonderiyor || !riza}
              >
                {gonderiyor ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <Spinner className="size-4 border-white/40 border-t-white" />
                    Gönderiliyor…
                  </span>
                ) : (
                  "Onaya gönder"
                )}
              </Btn>
            </>
          )}
      </div>

      {hata && (
        <p className="text-sm text-red-700" role="alert">
          {hata}
        </p>
      )}
      {bilgi && (
        <p className="text-sm text-emerald-800" role="status">
          {bilgi}
        </p>
      )}
    </Card>
  );
}
