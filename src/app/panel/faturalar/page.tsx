"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card } from "@/components/ui";

type CekiciOzet = {
  id: string;
  ad: string;
  telefon: string;
};

type FaturaOzet = {
  id: string;
  belgeNo: string;
  createdAt: string;
  cekiciId: string;
  cekiciAd: string;
  cekiciTelefon: string;
  krediOdemeId?: string | null;
  odemeReferans?: string | null;
  odemeTarihi?: string | null;
  trendyolDurum?: "iptal" | "aktif" | null;
};

export default function PanelFaturalarPage() {
  const [cekiciler, setCekiciler] = useState<CekiciOzet[]>([]);
  const [faturalar, setFaturalar] = useState<FaturaOzet[]>([]);
  const [ara, setAra] = useState("");
  const [seciliId, setSeciliId] = useState("");
  const [dosya, setDosya] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    const [cRes, fRes] = await Promise.all([
      fetch("/api/panel/cekiciler", { credentials: "include" }),
      fetch("/api/panel/faturalar", { credentials: "include" }),
    ]);
    if (cRes.ok) {
      const liste = (await cRes.json()) as CekiciOzet[];
      setCekiciler(
        Array.isArray(liste)
          ? liste.map((c) => ({
              id: c.id,
              ad: c.ad,
              telefon: c.telefon,
            }))
          : []
      );
    }
    if (fRes.ok) {
      const d = await fRes.json();
      setFaturalar(Array.isArray(d.faturalar) ? d.faturalar : []);
    }
  }, []);

  useEffect(() => {
    void yukle().finally(() => setLoading(false));
  }, [yukle]);

  const filtreli = useMemo(() => {
    const q = ara.trim().toLowerCase();
    if (!q) return [];
    return cekiciler
      .filter(
        (c) =>
          c.ad.toLowerCase().includes(q) ||
          c.telefon.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
      )
      .slice(0, 40);
  }, [ara, cekiciler]);

  const secili = cekiciler.find((c) => c.id === seciliId) ?? null;

  function secimiTemizle() {
    setSeciliId("");
    setAra("");
    setHata("");
  }

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setMesaj("");
    if (!seciliId) {
      setHata("Çekici seçin.");
      return;
    }
    if (!dosya) {
      setHata("PDF dosyası seçin.");
      return;
    }
    setGonderiyor(true);
    try {
      const form = new FormData();
      form.set("cekiciId", seciliId);
      form.set("pdf", dosya);
      const res = await fetch("/api/panel/faturalar", {
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
      setMesaj(
        `${data.fatura?.belgeNo ?? "Fatura"} yüklendi. ${bildirim}`
      );
      setDosya(null);
      await yukle();
    } catch (err) {
      setHata(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Faturalar</h2>
        <p className="text-sm text-slate-500 mt-1">
          Çekici seçip PDF yükleyin. E-posta varsa e-posta, yoksa SMS ile
          fatura bağlantısı gider.
        </p>
      </div>

      <Card>
        <form onSubmit={(e) => void gonder(e)} className="space-y-4">
          {secili ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-800/70">
                  Seçili çekici
                </p>
                <p className="font-semibold text-slate-900 truncate">
                  <Link
                    href={`/panel/cekiciler/${secili.id}`}
                    className="text-amber-800 underline underline-offset-2"
                  >
                    {secili.ad}
                  </Link>
                  <span className="text-slate-600 font-normal">
                    {" "}
                    · {secili.telefon}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={secimiTemizle}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 underline underline-offset-2 shrink-0"
              >
                Değiştir
              </button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Çekici ara
                </label>
                <input
                  type="search"
                  value={ara}
                  onChange={(e) => setAra(e.target.value)}
                  placeholder="Ad veya telefon"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  autoComplete="off"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Tek bir hesap seçilir; fatura yalnızca o çekiciye gider.
                </p>
              </div>

              {(loading || ara.trim()) && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {loading && (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      Yükleniyor…
                    </p>
                  )}
                  {!loading && filtreli.length === 0 && (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      Sonuç yok.
                    </p>
                  )}
                  {filtreli.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSeciliId(c.id);
                        setAra("");
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm transition hover:bg-slate-50 text-slate-800"
                    >
                      <span className="font-medium">{c.ad}</span>
                      <span className="text-slate-500 ml-2">{c.telefon}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Fatura PDF
            </label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => setDosya(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-amber-800"
            />
            {dosya && (
              <p className="text-xs text-slate-500 mt-1">
                {dosya.name} · {(dosya.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>

          {hata && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {hata}
            </p>
          )}
          {mesaj && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              {mesaj}
            </p>
          )}

          <Btn type="submit" disabled={gonderiyor} className="w-auto px-6">
            {gonderiyor ? "Yükleniyor…" : "Yükle ve SMS gönder"}
          </Btn>
        </form>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-3">Son yüklenenler</h3>
        {faturalar.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">Henüz fatura yok.</p>
          </Card>
        ) : (
          <ul className="space-y-2">
            {faturalar.map((f) => (
              <li key={f.id}>
                <Card className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
                    <a
                      href={`/api/panel/faturalar/${f.id}/pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-w-0 flex-1 rounded-lg outline-none ring-amber-400 focus-visible:ring-2"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-amber-700 hover:underline">
                          {f.cekiciAd}
                        </span>
                        {f.trendyolDurum === "iptal" ? (
                          <span className="rounded-md bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                            İptal
                          </span>
                        ) : null}
                      </div>
                      <p className="text-slate-500">{f.cekiciTelefon}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {f.belgeNo}
                      </p>
                      {(f.odemeReferans || f.odemeTarihi) && (
                        <p className="text-xs text-slate-500 mt-1">
                          {f.odemeReferans
                            ? `Ref: ${f.odemeReferans}`
                            : null}
                          {f.odemeReferans && f.odemeTarihi ? " · " : null}
                          {f.odemeTarihi
                            ? new Date(f.odemeTarihi).toLocaleDateString("tr-TR")
                            : null}
                        </p>
                      )}
                      <p className="text-xs text-amber-700/80 mt-1">
                        PDF aç →
                      </p>
                    </a>
                    <div className="text-right shrink-0 space-y-1">
                      <p className="text-slate-500">
                        {new Date(f.createdAt).toLocaleString("tr-TR")}
                      </p>
                      {f.krediOdemeId ? (
                        <Link
                          href={`/panel/kredi-odemeler/${f.krediOdemeId}`}
                          className="text-xs text-slate-500 hover:text-amber-700 underline underline-offset-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ödeme detayı
                        </Link>
                      ) : null}
                      <Link
                        href={`/panel/cekiciler/${f.cekiciId}`}
                        className="block text-xs text-slate-500 hover:text-amber-700 underline underline-offset-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Çekici
                      </Link>
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
