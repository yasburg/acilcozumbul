"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field } from "@/components/ui";
import type { KampanyaKodu } from "@/lib/kampanya-kodu";

type KampanyaSatir = KampanyaKodu & { kayitLink?: string };

type KullanimSatir = {
  id: string;
  kampanyaKodu: string;
  yeniCekiciId: string;
  yeniCekiciAd?: string;
  verilenKredi: number;
  olusturulma: string;
};

type Ozet = {
  toplamKampanya: number;
  aktifKampanya: number;
  toplamKullanim: number;
  toplamVerilenKredi: number;
};

const BOS_FORM = {
  kod: "",
  yeniUyeKredi: "100",
  kanal: "",
  aciklama: "",
  maxKullanim: "",
};

export default function PanelKampanyalarPage() {
  const [liste, setListe] = useState<KampanyaSatir[]>([]);
  const [kullanimlar, setKullanimlar] = useState<KullanimSatir[]>([]);
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [form, setForm] = useState(BOS_FORM);
  const [loading, setLoading] = useState(true);
  const [kaydediyor, setKaydediyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [kopyalandi, setKopyalandi] = useState<string | null>(null);

  const yukle = useCallback(() => {
    setLoading(true);
    return fetch("/api/panel/kampanyalar", { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          throw new Error(d.error ?? "Yüklenemedi.");
        }
        return r.json();
      })
      .then((d) => {
        setListe(d.liste ?? []);
        setKullanimlar(d.kullanimlar ?? []);
        setOzet(d.ozet ?? null);
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

  async function kampanyaOlustur(e: React.FormEvent) {
    e.preventDefault();
    setKaydediyor(true);
    setHata("");
    setMesaj("");
    try {
      const res = await fetch("/api/panel/kampanyalar", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kod: form.kod,
          yeniUyeKredi: Number(form.yeniUyeKredi),
          kanal: form.kanal || undefined,
          aciklama: form.aciklama || undefined,
          maxKullanim: form.maxKullanim ? Number(form.maxKullanim) : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Oluşturulamadı.");
      setMesaj(d.mesaj ?? "Kampanya oluşturuldu.");
      setForm(BOS_FORM);
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Oluşturulamadı.");
    } finally {
      setKaydediyor(false);
    }
  }

  async function aktiflikDegistir(kod: string, aktif: boolean) {
    setHata("");
    try {
      const res = await fetch("/api/panel/kampanyalar", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kod, aktif }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Güncellenemedi.");
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Güncellenemedi.");
    }
  }

  async function linkKopyala(link: string, kod: string) {
    try {
      await navigator.clipboard.writeText(link);
      setKopyalandi(kod);
      window.setTimeout(() => setKopyalandi(null), 2000);
    } catch {
      setHata("Link kopyalanamadı.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Kampanya kodları</h2>
        <p className="text-sm text-slate-500 mt-1">
          Sosyal medya ve reklam kampanyaları için promosyon kodları. Yeni üyeye
          tanımlanan kredi miktarını siz belirlersiniz (ör. 100 kredi).
        </p>
      </div>

      {ozet && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-amber-600">
              {ozet.toplamKampanya}
            </p>
            <p className="text-xs text-slate-500 mt-1">Toplam kod</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-emerald-600">
              {ozet.aktifKampanya}
            </p>
            <p className="text-xs text-slate-500 mt-1">Aktif</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-slate-800">
              {ozet.toplamKullanim}
            </p>
            <p className="text-xs text-slate-500 mt-1">Kayıt</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-violet-600">
              {ozet.toplamVerilenKredi}
            </p>
            <p className="text-xs text-slate-500 mt-1">Verilen kredi</p>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="font-semibold text-slate-900 mb-4">Yeni kampanya kodu</h3>
        <form onSubmit={kampanyaOlustur} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Kod"
              placeholder="TIKTOK100"
              value={form.kod}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  kod: e.target.value.toLocaleUpperCase("tr-TR"),
                }))
              }
              maxLength={20}
              required
            />
            <Field
              label="Yeni üye kredisi"
              type="number"
              min={1}
              value={form.yeniUyeKredi}
              onChange={(e) =>
                setForm((f) => ({ ...f, yeniUyeKredi: e.target.value }))
              }
              required
            />
            <Field
              label="Kanal (isteğe bağlı)"
              placeholder="tiktok, instagram…"
              value={form.kanal}
              onChange={(e) => setForm((f) => ({ ...f, kanal: e.target.value }))}
            />
            <Field
              label="Max kullanım (isteğe bağlı)"
              type="number"
              min={1}
              placeholder="Sınırsız"
              value={form.maxKullanim}
              onChange={(e) =>
                setForm((f) => ({ ...f, maxKullanim: e.target.value }))
              }
            />
          </div>
          <Field
            label="Açıklama (isteğe bağlı)"
            placeholder="TikTok Haziran kampanyası"
            value={form.aciklama}
            onChange={(e) => setForm((f) => ({ ...f, aciklama: e.target.value }))}
          />
          <Btn type="submit" disabled={kaydediyor}>
            {kaydediyor ? "Oluşturuluyor…" : "Kampanya kodu oluştur"}
          </Btn>
        </form>
      </Card>

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

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && liste.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">Henüz kampanya kodu yok.</p>
        </Card>
      )}

      <div className="space-y-3">
        {liste.map((k) => (
          <Card key={k.kod}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <p className="font-mono text-lg font-bold text-amber-700">
                  {k.kod}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Yeni üye: <strong>{k.yeniUyeKredi} kredi</strong>
                  {k.kanal && (
                    <span className="text-slate-500"> · {k.kanal}</span>
                  )}
                </p>
                {k.aciklama && (
                  <p className="text-xs text-slate-500 mt-1">{k.aciklama}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Kullanım: {k.kullanimSayisi}
                  {k.maxKullanim ? ` / ${k.maxKullanim}` : " (sınırsız)"}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    k.aktif
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {k.aktif ? "Aktif" : "Pasif"}
                </span>
                <button
                  type="button"
                  onClick={() => void aktiflikDegistir(k.kod, !k.aktif)}
                  className="text-xs text-amber-700 font-medium hover:underline"
                >
                  {k.aktif ? "Pasifleştir" : "Aktifleştir"}
                </button>
              </div>
            </div>
            {k.kayitLink && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <p className="text-xs text-slate-500 break-all">{k.kayitLink}</p>
                <button
                  type="button"
                  onClick={() => void linkKopyala(k.kayitLink!, k.kod)}
                  className="text-sm text-amber-600 font-medium hover:underline"
                >
                  {kopyalandi === k.kod ? "Kopyalandı ✓" : "Kayıt linkini kopyala"}
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {kullanimlar.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Kullanım geçmişi</h3>
          <div className="space-y-2">
            {kullanimlar.map((u) => (
              <Card key={u.id} className="py-3">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <div>
                    <span className="font-mono font-semibold text-amber-700">
                      {u.kampanyaKodu}
                    </span>
                    <span className="text-slate-600">
                      {" "}
                      →{" "}
                      <Link
                        href={`/panel/cekiciler/${u.yeniCekiciId}`}
                        className="text-amber-600 hover:underline"
                      >
                        {u.yeniCekiciAd ?? u.yeniCekiciId}
                      </Link>
                    </span>
                    <span className="text-emerald-700 ml-2">
                      +{u.verilenKredi} kredi
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(u.olusturulma).toLocaleString("tr-TR")}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
