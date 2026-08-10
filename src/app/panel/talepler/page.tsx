"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, SelectField } from "@/components/ui";
import { PanelCekiciHarita } from "@/components/panel/PanelCekiciHarita";
import { PanelTalepHaritaNoktalar } from "@/components/panel/PanelTalepHaritaNoktalar";
import {
  panelTalepDurumEtiketi,
  panelTalepIptalSureEtiketi,
  SEHIR_YOK,
  type PanelTalepOzet,
  type PanelTalepHaritaNokta,
} from "@/lib/panel-talep";
import type { Talep, TeklifDurumu } from "@/lib/types";

const PAGE_SIZE = 50;

type Gorunum = "liste" | "ozet" | "harita" | "sehir-harita";
type Siralama = "adet" | "alfa";
type PanelTalepSatir = Talep & { simulasyon?: boolean };

function panelTeklifDurumEtiketi(durum: TeklifDurumu | string): string {
  switch (durum) {
    case "aktif":
      return "Aktif";
    case "kazandi":
      return "Kazandı";
    case "kaybetti":
      return "Kaybetti";
    default:
      return durum;
  }
}

export default function PanelTaleplerPage() {
  const [liste, setListe] = useState<PanelTalepSatir[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [ozet, setOzet] = useState<PanelTalepOzet | null>(null);
  const [noktalar, setNoktalar] = useState<PanelTalepHaritaNokta[]>([]);
  const [gorunum, setGorunum] = useState<Gorunum>("liste");
  const [sehirFiltre, setSehirFiltre] = useState("");
  const [simulasyonFiltre, setSimulasyonFiltre] = useState<
    "" | "sadece" | "haric"
  >("");
  const [siralama, setSiralama] = useState<Siralama>("adet");
  const [sayiGizli, setSayiGizli] = useState(false);
  const [acikTeklifler, setAcikTeklifler] = useState<Record<string, boolean>>(
    {}
  );

  const yukleListe = useCallback(async (nextOffset: number, append: boolean) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    try {
      const r = await fetch(
        `/api/panel/talepler?limit=${PAGE_SIZE}&offset=${nextOffset}`
      );
      const data = await r.json();
      const items: PanelTalepSatir[] = data.talepler ?? [];
      setTotal(typeof data.total === "number" ? data.total : items.length);
      setListe((prev) => (append ? [...prev, ...items] : items));
      setOffset(nextOffset + items.length);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const yukleOzet = useCallback(async () => {
    const r = await fetch("/api/panel/talepler?ozet=1");
    if (!r.ok) return;
    const data = await r.json();
    setOzet(data.ozet ?? null);
    setNoktalar(data.noktalar ?? []);
  }, []);

  useEffect(() => {
    void yukleListe(0, false);
    void yukleOzet();
  }, [yukleListe, yukleOzet]);

  const sehirAdetleri = useMemo(() => {
    const list = ozet?.sehirAdetleri ?? [];
    const sorted = [...list].sort((a, b) => {
      if (siralama === "alfa") return a.sehir.localeCompare(b.sehir, "tr");
      if (b.adet !== a.adet) return b.adet - a.adet;
      return a.sehir.localeCompare(b.sehir, "tr");
    });
    if (!sehirFiltre) return sorted;
    return sorted.filter((s) => s.sehir === sehirFiltre);
  }, [ozet, sehirFiltre, siralama]);

  const filtreliListe = useMemo(() => {
    return liste.filter((t) => {
      if (sehirFiltre) {
        const sehir = (t.konumIl ?? "").trim() || SEHIR_YOK;
        if (sehir !== sehirFiltre) return false;
      }
      if (simulasyonFiltre === "sadece" && !t.simulasyon) return false;
      if (simulasyonFiltre === "haric" && t.simulasyon) return false;
      return true;
    });
  }, [liste, sehirFiltre, simulasyonFiltre]);

  const dahaVar = liste.length < total;
  const haritaSayiGizle =
    (gorunum === "harita" || gorunum === "sehir-harita") && sayiGizli;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Talepler</h2>
          <p className="text-sm text-slate-500">
            Müşteri talepleri ve durumları
            {!loading && !haritaSayiGizle && total > 0
              ? ` · ${total} kayıt`
              : ""}
            <span className="text-slate-400">
              {" "}
              · 28.07.2026 sonrası
            </span>
          </p>
        </div>
        {(gorunum === "harita" || gorunum === "sehir-harita") && (
          <button
            type="button"
            onClick={() => setSayiGizli((v) => !v)}
            aria-pressed={sayiGizli}
            className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
              sayiGizli
                ? "border-slate-800 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {sayiGizli ? "Sayılar gizli" : "Verileri gizle"}
          </button>
        )}
      </div>

      {ozet && !haritaSayiGizle && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="!p-3">
            <p className="text-xs text-slate-500">Toplam</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums">
              {ozet.total}
            </p>
          </Card>
          <Card className="!p-3">
            <p className="text-xs text-slate-500">İhalede</p>
            <p className="text-xl font-bold text-amber-600 tabular-nums">
              {ozet.ihalede}
            </p>
          </Card>
          <Card className="!p-3">
            <p className="text-xs text-slate-500">Anlaşıldı</p>
            <p className="text-xl font-bold text-emerald-600 tabular-nums">
              {ozet.anlasildi}
            </p>
          </Card>
          <Card className="!p-3">
            <p className="text-xs text-slate-500">Teklifsiz</p>
            <p className="text-xl font-bold text-slate-700 tabular-nums">
              {ozet.teklifsiz}
            </p>
          </Card>
        </div>
      )}

      {!loading && (ozet?.total ?? total) > 0 && (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[10rem] max-w-xs flex-1">
            <SelectField
              label="Şehir"
              value={sehirFiltre}
              onChange={(e) => setSehirFiltre(e.target.value)}
            >
              <option value="">
                {haritaSayiGizle
                  ? "Tüm şehirler"
                  : `Tüm şehirler (${ozet?.total ?? total})`}
              </option>
              {(ozet?.sehirAdetleri ?? []).map(({ sehir, adet }) => (
                <option key={sehir} value={sehir}>
                  {haritaSayiGizle ? sehir : `${sehir} (${adet})`}
                </option>
              ))}
            </SelectField>
          </div>
          {gorunum === "liste" && (
            <div className="min-w-[10rem] max-w-xs flex-1">
              <SelectField
                label="Kaynak"
                value={simulasyonFiltre}
                onChange={(e) =>
                  setSimulasyonFiltre(
                    e.target.value as "" | "sadece" | "haric"
                  )
                }
              >
                <option value="">Tümü</option>
                <option value="sadece">Yalnızca simülasyon</option>
                <option value="haric">Simülasyon hariç</option>
              </SelectField>
            </div>
          )}
          {(gorunum === "ozet" || gorunum === "sehir-harita") && (
            <div className="min-w-[10rem] max-w-xs flex-1">
              <SelectField
                label="Sıralama"
                value={siralama}
                onChange={(e) => setSiralama(e.target.value as Siralama)}
              >
                <option value="adet">Çoktan aza</option>
                <option value="alfa">Alfabetik</option>
              </SelectField>
            </div>
          )}
          <div
            className="flex flex-wrap rounded-xl border border-slate-200 bg-white p-1"
            role="group"
            aria-label="Görünüm"
          >
            {(
              [
                ["liste", "Liste"],
                ["ozet", "Özet"],
                ["harita", "Harita"],
                ["sehir-harita", "Şehir haritası"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setGorunum(id)}
                aria-pressed={gorunum === id}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  gorunum === id
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && total === 0 && (
        <Card>
          <p className="text-slate-600 text-sm">
            28.07.2026 sonrası henüz talep yok.
          </p>
          <Link
            href="/"
            className="text-amber-600 text-sm font-medium mt-2 inline-block"
          >
            Ana sayfadan talep oluştur →
          </Link>
        </Card>
      )}

      {!loading && gorunum === "ozet" && ozet && (
        <div className="space-y-4">
          {ozet.durumAdetleri.length > 0 && !haritaSayiGizle && (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium text-right">Adet</th>
                  </tr>
                </thead>
                <tbody>
                  {ozet.durumAdetleri.map(({ durum, adet }) => (
                    <tr
                      key={durum}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-4 py-3 text-slate-900">
                        {panelTalepDurumEtiketi(durum)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                        {adet}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Şehir</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Talep sayısı
                  </th>
                </tr>
              </thead>
              <tbody>
                {sehirAdetleri.map(({ sehir, adet }) => (
                  <tr
                    key={sehir}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-900">{sehir}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-700">
                      {haritaSayiGizle ? "—" : adet}
                    </td>
                  </tr>
                ))}
              </tbody>
              {!haritaSayiGizle && (
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                    <td className="px-4 py-3">
                      Toplam · {ozet.sehirSayisi} şehir
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {sehirAdetleri.reduce((n, s) => n + s.adet, 0)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {!loading && gorunum === "harita" && (
        <PanelTalepHaritaNoktalar
          noktalar={noktalar}
          seciliSehir={sehirFiltre || undefined}
          sayilariGizle={sayiGizli}
        />
      )}

      {!loading && gorunum === "sehir-harita" && (
        <PanelCekiciHarita
          sehirAdetleri={sehirAdetleri}
          seciliSehir={sehirFiltre || undefined}
          sayilariGizle={sayiGizli}
          adetEtiket="talep"
          baslik="Şehir bazında talep haritası"
          onSehirSec={(sehir) =>
            setSehirFiltre((onceki) => (onceki === sehir ? "" : sehir))
          }
        />
      )}

      {!loading && gorunum === "liste" && (
        <>
          <div className="space-y-3">
            {filtreliListe.map((t) => {
              const kazananTeklif =
                t.teklifler?.find(
                  (tk) =>
                    tk.id === t.kazananTeklifId ||
                    tk.cekiciId === t.kazananCekiciId
                ) ?? null;
              const teklifSecildi = Boolean(t.kazananCekiciId);
              const arandi = Boolean(t.musteriArandiAt);
              const iptalSure = panelTalepIptalSureEtiketi(
                t.olusturulma,
                t.iptalAt
              );
              const teklifListe = [...(t.teklifler ?? [])].sort(
                (a, b) =>
                  new Date(a.tarih).getTime() - new Date(b.tarih).getTime()
              );
              const teklifSayisi = teklifListe.length;
              const tekliflerAcik =
                acikTeklifler[t.id] ?? t.durum === "iptal";
              return (
              <Card key={t.id}>
                <div className="flex flex-wrap justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {t.ad} {t.soyad}
                      {t.simulasyon ? (
                        <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-md align-middle">
                          Simülasyon
                        </span>
                      ) : null}
                    </p>
                    <p className="text-sm text-slate-600">{t.telefon}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium uppercase tracking-wide text-amber-700 bg-amber-50 px-2 py-1 rounded-lg h-fit inline-block">
                      {panelTalepDurumEtiketi(t.durum)}
                    </span>
                    {t.durum === "iptal" && iptalSure ? (
                      <p className="mt-1 text-xs text-slate-500 max-w-[14rem]">
                        {iptalSure}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                  {t.sorun}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {t.konum.adres}
                  {t.konumIlce ? ` · ${t.konumIlce}` : ""}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(t.olusturulma).toLocaleString("tr-TR")} ·{" "}
                  {teklifSayisi} teklif
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {teklifSecildi ? (
                    <span className="rounded-lg bg-emerald-50 px-2 py-1 font-medium text-emerald-800">
                      Teklif seçildi
                      {kazananTeklif
                        ? `: ${kazananTeklif.cekiciAd} · ${kazananTeklif.fiyat} TL`
                        : ""}
                    </span>
                  ) : (
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-medium text-slate-600">
                      Teklif henüz seçilmedi
                    </span>
                  )}
                  {teklifSecildi ? (
                    arandi ? (
                      <span className="rounded-lg bg-sky-50 px-2 py-1 font-medium text-sky-800">
                        Çekici aradı
                        {t.musteriArandiAt
                          ? ` · ${new Date(t.musteriArandiAt).toLocaleString("tr-TR")}`
                          : ""}
                      </span>
                    ) : (
                      <span className="rounded-lg bg-orange-50 px-2 py-1 font-medium text-orange-800">
                        Çekici henüz aramadı
                      </span>
                    )
                  ) : null}
                </div>
                {teklifSayisi > 0 ? (
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100/80"
                      aria-expanded={tekliflerAcik}
                      onClick={() =>
                        setAcikTeklifler((prev) => ({
                          ...prev,
                          [t.id]: !(prev[t.id] ?? t.durum === "iptal"),
                        }))
                      }
                    >
                      <span>
                        {tekliflerAcik
                          ? "Teklifleri gizle"
                          : `${teklifSayisi} teklifi göster`}
                      </span>
                      <span className="text-slate-400" aria-hidden>
                        {tekliflerAcik ? "▴" : "▾"}
                      </span>
                    </button>
                    {tekliflerAcik ? (
                      <ul className="space-y-2 border-t border-slate-100 px-3 py-2">
                        {teklifListe.map((tk) => {
                          const kazanan =
                            tk.id === t.kazananTeklifId ||
                            tk.cekiciId === t.kazananCekiciId ||
                            tk.durum === "kazandi";
                          return (
                            <li
                              key={tk.id}
                              className={`rounded-lg bg-white px-3 py-2 text-sm shadow-sm ring-1 ${
                                kazanan
                                  ? "ring-emerald-200"
                                  : "ring-slate-100"
                              }`}
                            >
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <p className="font-medium text-slate-900">
                                  {tk.cekiciAd}
                                  {kazanan ? (
                                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                      Kazanan
                                    </span>
                                  ) : null}
                                </p>
                                <p className="tabular-nums font-semibold text-slate-900">
                                  {tk.fiyat} TL
                                </p>
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {panelTeklifDurumEtiketi(tk.durum)}
                                {" · "}
                                {new Date(tk.tarih).toLocaleString("tr-TR")}
                                {tk.tahminiSureDk
                                  ? ` · ~${tk.tahminiSureDk} dk`
                                  : ""}
                              </p>
                              {tk.mesaj ? (
                                <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                                  {tk.mesaj}
                                </p>
                              ) : null}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3 mt-3 text-sm">
                  <Link
                    href={`/bekle/${t.id}`}
                    className="text-amber-600 font-medium"
                    target="_blank"
                  >
                    Bekleme sayfası →
                  </Link>
                </div>
              </Card>
              );
            })}
          </div>

          {sehirFiltre && filtreliListe.length === 0 && liste.length > 0 && (
            <Card>
              <p className="text-slate-600 text-sm">
                Bu şehir için yüklü listede talep yok. Daha fazla yükleyin veya
                filtreyi temizleyin.
              </p>
            </Card>
          )}

          {dahaVar && (
            <Btn
              type="button"
              variant="secondary"
              className="w-auto"
              disabled={loadingMore}
              onClick={() => void yukleListe(offset, true)}
            >
              {loadingMore ? "Yükleniyor…" : "Daha fazla yükle"}
            </Btn>
          )}
        </>
      )}
    </div>
  );
}
