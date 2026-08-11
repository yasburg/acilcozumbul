"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Btn, Card } from "@/components/ui";
import { PROFIL_FOTO_RED_SABLONLARI } from "@/lib/cekici-profil-foto";
import type { ProfilFotoPanelVerisi } from "@/lib/profil-foto-panel";

function CekiciLink({ id, ad }: { id: string; ad: string }) {
  return (
    <Link
      href={`/panel/cekiciler/${id}`}
      className="text-amber-600 hover:underline font-medium"
    >
      {ad}
    </Link>
  );
}

function tarihFormat(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR");
}

function OdemeRozetleri({
  abone,
  krediAldi,
  className = "",
}: {
  abone: boolean;
  krediAldi: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      <span
        className={
          abone
            ? "text-[11px] font-semibold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full"
            : "text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
        }
      >
        {abone ? "Abone" : "Abone değil"}
      </span>
      <span
        className={
          krediAldi
            ? "text-[11px] font-semibold bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full"
            : "text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
        }
      >
        {krediAldi ? "Kredi almış" : "Kredi almamış"}
      </span>
    </div>
  );
}

export default function PanelProfilFotograflariPage() {
  const [veri, setVeri] = useState<ProfilFotoPanelVerisi | null>(null);
  const [loading, setLoading] = useState(true);
  const [islemId, setIslemId] = useState<string | null>(null);
  const [redModal, setRedModal] = useState<{ id: string; ad: string } | null>(
    null
  );
  const [redNedeni, setRedNedeni] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    const res = await fetch("/api/panel/profil-fotograflari", {
      credentials: "include",
    });
    if (!res.ok) {
      setVeri(null);
      return;
    }
    setVeri(await res.json());
  }, []);

  useEffect(() => {
    void yukle().finally(() => setLoading(false));
  }, [yukle]);

  async function karar(
    id: string,
    profilFotoDurum: "onaylandi" | "reddedildi",
    profilFotoRedNedeni?: string
  ) {
    setIslemId(id);
    setHata("");
    setMesaj("");
    try {
      const res = await fetch(`/api/panel/cekiciler/${id}/profil-foto`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilFotoDurum, profilFotoRedNedeni }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "İşlem başarısız."
        );
      }
      setMesaj(typeof data.mesaj === "string" ? data.mesaj : "Kaydedildi.");
      setRedModal(null);
      setRedNedeni("");
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setIslemId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Profil fotoğrafları</h2>
        <p className="text-sm text-slate-500 mt-1">
          Hizmet veren profil fotoğrafı başvuruları. Onay sonrası müşteri
          ekranında görünür.
        </p>
      </div>

      {veri && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-amber-600">
              {veri.ozet.bekleyen}
            </p>
            <p className="text-xs text-slate-500 mt-1">Bekleyen onay</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-emerald-600">
              {veri.ozet.onayli}
            </p>
            <p className="text-xs text-slate-500 mt-1">Onaylı</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-red-600">
              {veri.ozet.reddedilen}
            </p>
            <p className="text-xs text-slate-500 mt-1">Reddedilen (güncel)</p>
          </Card>
        </div>
      )}

      {(mesaj || hata) && (
        <Card
          className={
            hata
              ? "border-red-200 bg-red-50"
              : "border-emerald-200 bg-emerald-50"
          }
        >
          <p className={`text-sm ${hata ? "text-red-700" : "text-emerald-800"}`}>
            {hata || mesaj}
          </p>
        </Card>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && veri && (
        <>
          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Bekleyen onaylar
            </h3>
            {veri.bekleyen.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">
                  İnceleme bekleyen fotoğraf yok.
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {veri.bekleyen.map((s) => (
                  <Card key={s.id} className="!p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {s.profilFotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={s.profilFotoUrl}
                          alt={`${s.ad} profil`}
                          className="size-28 rounded-2xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                        />
                      ) : (
                        <div className="size-28 rounded-2xl bg-slate-100 border border-slate-200 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div>
                          <CekiciLink id={s.id} ad={s.ad} />
                          <p className="text-sm text-slate-600 mt-0.5">
                            {s.telefon} · {s.sehir}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Gönderim: {tarihFormat(s.profilFotoGonderim)}
                          </p>
                          <OdemeRozetleri
                            abone={Boolean(s.abone)}
                            krediAldi={Boolean(s.krediAldi)}
                            className="mt-1.5"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Btn
                            variant="success"
                            className="!w-auto !min-h-0 !py-2 !px-3 !text-xs"
                            disabled={islemId === s.id}
                            onClick={() => void karar(s.id, "onaylandi")}
                          >
                            Onayla
                          </Btn>
                          <Btn
                            variant="danger"
                            className="!w-auto !min-h-0 !py-2 !px-3 !text-xs"
                            disabled={islemId === s.id}
                            onClick={() => {
                              setRedNedeni("");
                              setRedModal({ id: s.id, ad: s.ad });
                            }}
                          >
                            Reddet
                          </Btn>
                          {s.profilFotoUrl && (
                            <a
                              href={s.profilFotoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-xs font-medium text-amber-700 underline px-2"
                            >
                              Tam boyutta aç
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Onaylı fotoğraflar
            </h3>
            {veri.onayli.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">
                  Henüz onaylı profil fotoğrafı yok.
                </p>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">Foto</th>
                      <th className="px-4 py-3 font-medium">Hizmet veren</th>
                      <th className="px-4 py-3 font-medium">Telefon</th>
                      <th className="px-4 py-3 font-medium">Şehir</th>
                      <th className="px-4 py-3 font-medium">Ödeme</th>
                      <th className="px-4 py-3 font-medium">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veri.onayli.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          {s.profilFotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={s.profilFotoUrl}
                              alt=""
                              className="size-10 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <CekiciLink id={s.id} ad={s.ad} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.telefon}</td>
                        <td className="px-4 py-3 text-slate-600">{s.sehir}</td>
                        <td className="px-4 py-3">
                          <OdemeRozetleri
                            abone={Boolean(s.abone)}
                            krediAldi={Boolean(s.krediAldi)}
                          />
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {tarihFormat(s.profilFotoGonderim)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {redModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="profil-foto-red-baslik"
        >
          <Card className="w-full max-w-md shadow-xl space-y-4">
            <h3
              id="profil-foto-red-baslik"
              className="text-lg font-bold text-slate-900"
            >
              Fotoğrafı reddet
            </h3>
            <p className="text-sm text-slate-600">
              <strong>{redModal.ad}</strong> — şablon seçin veya özel neden
              yazın.
            </p>
            <div className="flex flex-col gap-2">
              {PROFIL_FOTO_RED_SABLONLARI.map((sablon) => (
                <button
                  key={sablon}
                  type="button"
                  onClick={() => setRedNedeni(sablon)}
                  className={`text-left rounded-xl border px-3 py-2.5 text-sm transition ${
                    redNedeni === sablon
                      ? "border-amber-500 bg-amber-50 text-amber-950 ring-1 ring-amber-200"
                      : "border-slate-200 bg-white text-slate-700 hover:border-amber-300"
                  }`}
                >
                  {sablon}
                </button>
              ))}
            </div>
            <textarea
              value={redNedeni}
              onChange={(e) => setRedNedeni(e.target.value)}
              rows={3}
              placeholder="Red nedeni (şablon veya özel metin)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Btn
                variant="secondary"
                onClick={() => {
                  setRedModal(null);
                  setRedNedeni("");
                }}
                disabled={islemId === redModal.id}
              >
                Vazgeç
              </Btn>
              <Btn
                variant="danger"
                disabled={!redNedeni.trim() || islemId === redModal.id}
                onClick={() =>
                  void karar(redModal.id, "reddedildi", redNedeni.trim())
                }
              >
                {islemId === redModal.id ? "Kaydediliyor…" : "Reddet"}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
