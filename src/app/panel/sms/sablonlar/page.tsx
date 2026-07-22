"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field, TextArea } from "@/components/ui";

type Sablon = {
  id: string;
  etiket: string;
  govde: string;
  aktif: boolean;
  sira: number;
  olusturulma: string;
  guncelleme: string;
};

const BOS_FORM = { etiket: "", govde: "", sira: "0" };

export default function PanelSmsSablonlarPage() {
  const [liste, setListe] = useState<Sablon[]>([]);
  const [form, setForm] = useState(BOS_FORM);
  const [duzenleId, setDuzenleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const yukle = useCallback(() => {
    setLoading(true);
    return fetch("/api/panel/sms/sablonlar", { credentials: "include" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error ?? "Yüklenemedi.");
        return d;
      })
      .then((d) => {
        setListe(d.liste ?? []);
        setHata("");
      })
      .catch((e) => {
        setHata(e instanceof Error ? e.message : "Yüklenemedi.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  function duzenlemeyeAl(s: Sablon) {
    setDuzenleId(s.id);
    setForm({
      etiket: s.etiket,
      govde: s.govde,
      sira: String(s.sira),
    });
    setMesaj("");
    setHata("");
  }

  function formuTemizle() {
    setDuzenleId(null);
    setForm(BOS_FORM);
  }

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setKaydediyor(true);
    setHata("");
    setMesaj("");
    try {
      const body = {
        etiket: form.etiket,
        govde: form.govde,
        sira: Number.parseInt(form.sira || "0", 10) || 0,
      };
      const res = await fetch(
        duzenleId
          ? `/api/panel/sms/sablonlar/${encodeURIComponent(duzenleId)}`
          : "/api/panel/sms/sablonlar",
        {
          method: duzenleId ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Kaydedilemedi.");
      setMesaj(duzenleId ? "Şablon güncellendi." : "Şablon eklendi.");
      formuTemizle();
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setKaydediyor(false);
    }
  }

  async function aktifToggle(s: Sablon) {
    setHata("");
    try {
      const res = await fetch(
        `/api/panel/sms/sablonlar/${encodeURIComponent(s.id)}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ aktif: !s.aktif }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Güncellenemedi.");
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Güncellenemedi.");
    }
  }

  async function sil(s: Sablon) {
    if (!window.confirm(`«${s.etiket}» silinsin mi?`)) return;
    setHata("");
    try {
      const res = await fetch(
        `/api/panel/sms/sablonlar/${encodeURIComponent(s.id)}`,
        { method: "DELETE", credentials: "include" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Silinemedi.");
      if (duzenleId === s.id) formuTemizle();
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Silinemedi.");
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">SMS şablonları</h2>
          <p className="text-sm text-slate-500">
            Toplu SMS gövde metinleri. Kısa link için{" "}
            <code className="bg-slate-100 px-1 rounded">{"{{LINK}}"}</code>{" "}
            kullanın.
          </p>
        </div>
        <Link
          href="/panel/sms/toplu"
          className="text-sm text-amber-600 font-medium self-end"
        >
          ← Toplu SMS
        </Link>
      </div>

      {hata && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{hata}</p>
        </Card>
      )}
      {mesaj && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">{mesaj}</p>
        </Card>
      )}

      <Card>
        <form onSubmit={(e) => void kaydet(e)} className="space-y-3">
          <h3 className="font-semibold text-slate-800">
            {duzenleId ? "Şablonu düzenle" : "Yeni şablon"}
          </h3>
          <Field
            label="Etiket"
            value={form.etiket}
            onChange={(e) => setForm((f) => ({ ...f, etiket: e.target.value }))}
            placeholder="Örn. Gövde 3 — acil kayıt"
            required
            maxLength={120}
          />
          <TextArea
            label="Gövde metni"
            value={form.govde}
            onChange={(e) => setForm((f) => ({ ...f, govde: e.target.value }))}
            rows={5}
            placeholder="TANITIM | … {{LINK}}"
            required
            maxLength={2000}
          />
          <Field
            label="Sıra"
            type="number"
            min={0}
            max={9999}
            value={form.sira}
            onChange={(e) => setForm((f) => ({ ...f, sira: e.target.value }))}
          />
          <p className="text-xs text-slate-500">
            Toplu SMS dropdown’ında aktif şablonlar sıraya göre listelenir.
          </p>
          <div className="flex flex-wrap gap-2">
            <Btn type="submit" disabled={kaydediyor}>
              {kaydediyor
                ? "Kaydediliyor…"
                : duzenleId
                  ? "Güncelle"
                  : "Ekle"}
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
            ({liste.length})
          </span>
        </h3>
        {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
        {!loading && liste.length === 0 && (
          <p className="text-sm text-slate-500">Henüz şablon yok.</p>
        )}
        <ul className="divide-y divide-slate-100">
          {liste.map((s) => (
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
                  <p className="text-xs text-slate-500">Sıra {s.sira}</p>
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
    </div>
  );
}
