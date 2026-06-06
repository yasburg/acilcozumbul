"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Btn, Card } from "@/components/ui";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import type { RozetPanelSatir, RozetPanelVerisi } from "@/lib/rozet-panel";

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

function BelgeLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-amber-700 underline text-xs"
    >
      {label}
    </a>
  );
}

function tarihFormat(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR");
}

export default function PanelRozetlerPage() {
  const [veri, setVeri] = useState<RozetPanelVerisi | null>(null);
  const [loading, setLoading] = useState(true);
  const [islemId, setIslemId] = useState<string | null>(null);
  const [redModal, setRedModal] = useState<{ id: string; ad: string } | null>(
    null
  );
  const [redNedeni, setRedNedeni] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");

  const yukle = useCallback(async () => {
    const res = await fetch("/api/panel/rozetler", { credentials: "include" });
    if (!res.ok) {
      setVeri(null);
      return;
    }
    setVeri(await res.json());
  }, []);

  useEffect(() => {
    void yukle().finally(() => setLoading(false));
  }, [yukle]);

  async function belgeKarar(
    id: string,
    belgeDurum: "onaylandi" | "reddedildi",
    belgeRedNedeni?: string
  ) {
    setIslemId(id);
    setHata("");
    setMesaj("");
    try {
      const res = await fetch(`/api/panel/cekiciler/${id}/belge`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ belgeDurum, belgeRedNedeni }),
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
        <h2 className="text-2xl font-bold">Rozetler</h2>
        <p className="text-sm text-slate-500 mt-1">
          Onaylı çekici belge başvuruları ve aktif rozetler.
        </p>
      </div>

      {veri && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-amber-600">{veri.ozet.bekleyen}</p>
            <p className="text-xs text-slate-500 mt-1">Bekleyen onay</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-emerald-600">
              {veri.ozet.belgeOnayli}
            </p>
            <p className="text-xs text-slate-500 mt-1">Belge onaylı</p>
          </Card>
          <Card className="text-center py-4">
            <p className="text-3xl font-bold text-blue-600">
              {veri.ozet.rozetAktif}
            </p>
            <p className="text-xs text-slate-500 mt-1">Rozet aktif</p>
          </Card>
        </div>
      )}

      {(mesaj || hata) && (
        <Card
          className={
            hata ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
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
                  İnceleme bekleyen başvuru yok.
                </p>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">Hizmet veren</th>
                      <th className="px-4 py-3 font-medium">Telefon</th>
                      <th className="px-4 py-3 font-medium">Şehir</th>
                      <th className="px-4 py-3 font-medium">Gönderim</th>
                      <th className="px-4 py-3 font-medium">Belgeler</th>
                      <th className="px-4 py-3 font-medium text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veri.bekleyen.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50 last:border-0 align-top"
                      >
                        <td className="px-4 py-3">
                          <CekiciLink id={s.id} ad={s.ad} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.telefon}</td>
                        <td className="px-4 py-3 text-slate-600">{s.sehir}</td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {tarihFormat(s.belgeGonderim)}
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          {s.belgeRuhsatUrl && (
                            <BelgeLink href={s.belgeRuhsatUrl} label="Ruhsat" />
                          )}
                          {s.belgeCekiciUrl && (
                            <BelgeLink href={s.belgeCekiciUrl} label="Çekici" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Btn
                              variant="success"
                              className="!w-auto !min-h-0 !py-2 !px-3 !text-xs"
                              disabled={islemId === s.id}
                              onClick={() =>
                                void belgeKarar(s.id, "onaylandi")
                              }
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-900">
              Onaylanmış çekiciler
            </h3>
            {veri.onaylanmis.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-500 text-center py-4">
                  Henüz onaylanmış başvuru yok.
                </p>
              </Card>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-slate-500">
                      <th className="px-4 py-3 font-medium">Hizmet veren</th>
                      <th className="px-4 py-3 font-medium">Telefon</th>
                      <th className="px-4 py-3 font-medium">Şehir</th>
                      <th className="px-4 py-3 font-medium">Durum</th>
                      <th className="px-4 py-3 font-medium">Tarih</th>
                      <th className="px-4 py-3 font-medium">Belgeler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {veri.onaylanmis.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <CekiciLink id={s.id} ad={s.ad} />
                            {s.rozetAktif && <OnayliCekiciRozeti kucuk />}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.telefon}</td>
                        <td className="px-4 py-3 text-slate-600">{s.sehir}</td>
                        <td className="px-4 py-3">
                          {s.rozetAktif ? (
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                              Rozet aktif
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                              Belge onaylı
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                          {tarihFormat(s.rozetOdemeTarihi ?? s.belgeGonderim)}
                        </td>
                        <td className="px-4 py-3 space-x-2">
                          {s.belgeRuhsatUrl && (
                            <BelgeLink href={s.belgeRuhsatUrl} label="Ruhsat" />
                          )}
                          {s.belgeCekiciUrl && (
                            <BelgeLink href={s.belgeCekiciUrl} label="Çekici" />
                          )}
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
          aria-labelledby="rozet-red-baslik"
        >
          <Card className="w-full max-w-md shadow-xl space-y-4">
            <h3 id="rozet-red-baslik" className="text-lg font-bold text-slate-900">
              Başvuruyu reddet
            </h3>
            <p className="text-sm text-slate-600">
              <strong>{redModal.ad}</strong> — red nedenini yazın.
            </p>
            <textarea
              value={redNedeni}
              onChange={(e) => setRedNedeni(e.target.value)}
              rows={3}
              placeholder="Red nedeni"
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
                  void belgeKarar(redModal.id, "reddedildi", redNedeni.trim())
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
