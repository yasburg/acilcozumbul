"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, SelectField } from "@/components/ui";
import type { SimulasyonPlan, SimulasyonFormulAyar } from "@/lib/simulasyon-ihale";
import { SIMULASYON_FORMUL_AYAR_VARSAYILAN } from "@/lib/simulasyon-ihale";

type SehirOzet = {
  il: string;
  cekiciSayisi: number;
  planli: number;
  acildi: number;
  kapandi: number;
  iptal: number;
  hata: number;
  aktifToplam: number;
  toplam: number;
};

type ApiCevap = {
  bugun: string;
  yarin: string;
  formul: {
    "1-5": string;
    "6-20": string;
    "20+": string;
    sure: string;
    kapanis: string;
    sorunTipleri: { id: string; label: string }[];
  };
  formulAyar?: SimulasyonFormulAyar;
  planlar: SimulasyonPlan[];
  sehirOzet?: SehirOzet[];
};

type Gorunum = "ozet" | "liste";

function durumEtiket(d: string): string {
  switch (d) {
    case "planli":
      return "Planlı";
    case "iptal":
      return "İptal";
    case "acildi":
      return "Açıldı";
    case "kapandi":
      return "Kapandı";
    case "hata":
      return "Hata";
    default:
      return d;
  }
}

function tarihTr(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function PanelSimulasyonPage() {
  const [bugun, setBugun] = useState("");
  const [yarin, setYarin] = useState("");
  const [gun, setGun] = useState<"bugun" | "yarin">("yarin");
  const [gorunum, setGorunum] = useState<Gorunum>("ozet");
  const [formul, setFormul] = useState<ApiCevap["formul"] | null>(null);
  const [formulAyar, setFormulAyar] = useState<SimulasyonFormulAyar>(
    SIMULASYON_FORMUL_AYAR_VARSAYILAN
  );
  const [planlar, setPlanlar] = useState<SimulasyonPlan[]>([]);
  const [sehirOzet, setSehirOzet] = useState<SehirOzet[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [planModalAcik, setPlanModalAcik] = useState(false);
  const [seciliIller, setSeciliIller] = useState<string[]>([]);
  const [sehirArama, setSehirArama] = useState("");

  const hedefGun = gun === "bugun" ? bugun : yarin;

  const planlanabilirSehirler = useMemo(
    () => sehirOzet.filter((s) => s.aktifToplam === 0),
    [sehirOzet]
  );
  const planlanmisSehirler = useMemo(
    () => sehirOzet.filter((s) => s.aktifToplam > 0),
    [sehirOzet]
  );
  const filtrelenmisSehirler = useMemo(() => {
    const q = sehirArama.trim().toLocaleLowerCase("tr");
    const liste = [...sehirOzet].sort((a, b) => a.il.localeCompare(b.il, "tr"));
    if (!q) return liste;
    return liste.filter((s) => s.il.toLocaleLowerCase("tr").includes(q));
  }, [sehirOzet, sehirArama]);

  const yukle = useCallback(async (hedef?: string) => {
    setLoading(true);
    setHata(null);
    try {
      const q = hedef ? `?gun=${encodeURIComponent(hedef)}` : "";
      const r = await fetch(`/api/panel/simulasyon${q}`, {
        credentials: "include",
      });
      const j = (await r.json().catch(() => ({}))) as ApiCevap & {
        error?: string;
        bugunPlanlar?: SimulasyonPlan[];
        yarinPlanlar?: SimulasyonPlan[];
      };
      if (!r.ok) throw new Error(j.error ?? "Yüklenemedi.");
      setBugun(j.bugun);
      setYarin(j.yarin);
      setFormul(j.formul);
      if (j.formulAyar) setFormulAyar(j.formulAyar);
      const liste =
        j.planlar ??
        (hedef === j.bugun ? j.bugunPlanlar : j.yarinPlanlar) ??
        [];
      setPlanlar(liste);
      setSehirOzet(j.sehirOzet ?? []);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  useEffect(() => {
    if (!bugun || !yarin || !hedefGun) return;
    void yukle(hedefGun);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca gün seçimi
  }, [gun]);

  const ozetToplam = useMemo(() => {
    return sehirOzet.reduce(
      (acc, s) => ({
        cekici: acc.cekici + s.cekiciSayisi,
        planli: acc.planli + s.planli,
        aktif: acc.aktif + s.aktifToplam,
        sehir: acc.sehir + (s.cekiciSayisi > 0 || s.toplam > 0 ? 1 : 0),
      }),
      { cekici: 0, planli: 0, aktif: 0, sehir: 0 }
    );
  }, [sehirOzet]);

  async function eylem(body: Record<string, unknown>) {
    setBusy(true);
    setHata(null);
    setMesaj(null);
    try {
      const r = await fetch("/api/panel/simulasyon", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const ham = await r.text();
      let j: Record<string, unknown> = {};
      try {
        j = ham ? (JSON.parse(ham) as Record<string, unknown>) : {};
      } catch {
        /* HTML / boş */
      }
      if (!r.ok) {
        const apiHata =
          typeof j.error === "string" && j.error.trim() ? j.error.trim() : null;
        throw new Error(
          apiHata ??
            `İşlem başarısız (${r.status}).${
              ham && !ham.trimStart().startsWith("{")
                ? " Sunucu zaman aşımı veya HTML yanıtı — birkaç kez daha deneyin."
                : ""
            }`
        );
      }
      const hatalar = Array.isArray(j.hatalar)
        ? (j.hatalar as unknown[]).filter((x): x is string => typeof x === "string")
        : [];
      setMesaj(
        body.eylem === "calistir"
          ? `Açılan: ${j.acilan ?? 0}, kapanan: ${j.kapanan ?? 0}${
              Number(j.acilan) > 0
                ? " · Kalan planlılar için tekrar «Şimdi aç»."
                : ""
            }${
              hatalar.length
                ? ` · Hata: ${hatalar.slice(0, 2).join(" · ")}`
                : ""
            }`
          : body.eylem === "toplu_iptal"
            ? `İptal edilen plan: ${j.iptal ?? 0}`
            : body.eylem === "ayar_kaydet"
              ? "Formül aralıkları kaydedildi."
              : j.atlandi
                ? "Zaten plan var (atlandı)."
                : `Eklenen plan: ${j.eklenen ?? 0}`
      );
      if (body.eylem === "ayar_kaydet" && j.formulAyar) {
        setFormulAyar(j.formulAyar as SimulasyonFormulAyar);
      }
      await yukle(hedefGun || undefined);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setBusy(false);
    }
  }

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setHata(null);
    setMesaj(null);
    try {
      const r = await fetch("/api/panel/simulasyon", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Güncellenemedi.");
      setMesaj("Güncellendi.");
      await yukle(hedefGun || undefined);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Simülasyon ihaleler
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ertesi gün için otomatik planlanan talepler. Çekici tarafında normal
          ihale gibi görünür; işaret yalnızca panelde.
        </p>
      </div>

      {formul && (
        <Card className="!p-4 space-y-3">
          <div className="text-sm text-slate-600 space-y-1">
            <p>
              <span className="font-medium text-slate-800">Süre:</span>{" "}
              {formul.sure} · Kapanış: {formul.kapanis}
            </p>
            <p>
              <span className="font-medium text-slate-800">Sorun:</span>{" "}
              {formul.sorunTipleri.map((s) => s.label).join(" · ")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-800 mb-2">
              Günlük talep aralığı (çekici grubuna göre)
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  ["dusuk", "1–5 çekici"],
                  ["orta", "6–20 çekici"],
                  ["yuksek", "20+ çekici"],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2"
                >
                  <span className="text-xs font-medium text-slate-600">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={20}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm tabular-nums"
                      value={formulAyar[key].min}
                      disabled={busy}
                      onChange={(e) => {
                        const min = Number(e.target.value);
                        setFormulAyar((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], min },
                        }));
                      }}
                      aria-label={`${label} min`}
                    />
                    <span className="text-slate-400 text-sm">–</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm tabular-nums"
                      value={formulAyar[key].max}
                      disabled={busy}
                      onChange={(e) => {
                        const max = Number(e.target.value);
                        setFormulAyar((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], max },
                        }));
                      }}
                      aria-label={`${label} max`}
                    />
                  </div>
                </label>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn
                type="button"
                className="!w-auto !min-h-0 !py-2 !px-3 !text-sm"
                disabled={busy}
                onClick={() =>
                  void eylem({
                    eylem: "ayar_kaydet",
                    formulAyar,
                  })
                }
              >
                Aralıkları kaydet
              </Btn>
              <button
                type="button"
                className="text-xs text-slate-500 hover:underline disabled:opacity-50"
                disabled={busy}
                onClick={() =>
                  setFormulAyar(SIMULASYON_FORMUL_AYAR_VARSAYILAN)
                }
              >
                Varsayılana dön
              </button>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[12rem]">
          <SelectField
            label="Gün"
            value={gun}
            onChange={(e) => setGun(e.target.value as "bugun" | "yarin")}
          >
            <option value="yarin">Yarın ({yarin || "…"})</option>
            <option value="bugun">Bugün ({bugun || "…"})</option>
          </SelectField>
        </div>
        <div
          className="flex rounded-xl border border-slate-200 bg-white p-1"
          role="group"
          aria-label="Görünüm"
        >
          {(
            [
              ["ozet", "Özet"],
              ["liste", "Liste"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setGorunum(id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                gorunum === id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Btn
          type="button"
          className="!w-auto !min-h-0 !py-2.5 !px-4 !text-sm"
          disabled={busy || !hedefGun || loading}
          onClick={() => {
            const uygun = sehirOzet
              .filter((s) => s.aktifToplam === 0)
              .map((s) => s.il);
            setSeciliIller(uygun);
            setSehirArama("");
            setPlanModalAcik(true);
          }}
        >
          Planla
        </Btn>
        <Btn
          type="button"
          variant="secondary"
          className="!w-auto !min-h-0 !py-2.5 !px-4 !text-sm"
          disabled={busy || !hedefGun}
          onClick={() => {
            if (
              !window.confirm(
                "Planlı satırlar iptal edilip yeniden üretilecek. Devam?"
              )
            ) {
              return;
            }
            void eylem({ eylem: "planla", hedefGun, force: true });
          }}
        >
          Yeniden üret
        </Btn>
        <Btn
          type="button"
          variant="danger"
          className="!w-auto !min-h-0 !py-2.5 !px-4 !text-sm"
          disabled={busy || !hedefGun || ozetToplam.planli === 0}
          onClick={() => {
            if (
              !window.confirm(
                `Bu günün ${ozetToplam.planli} planlı talebi iptal edilecek. Devam?`
              )
            ) {
              return;
            }
            void eylem({ eylem: "toplu_iptal", hedefGun });
          }}
        >
          Toplu iptal
        </Btn>
        <Btn
          type="button"
          variant="secondary"
          className="!w-auto !min-h-0 !py-2.5 !px-4 !text-sm"
          disabled={busy}
          onClick={() => void eylem({ eylem: "calistir" })}
          title="Zamanı gelen planları açar / kapanacakları kapatır (tur başına ~15)"
        >
          Şimdi aç / kapat
        </Btn>
      </div>

      {hata && (
        <p className="text-sm text-red-600" role="alert">
          {hata}
        </p>
      )}
      {mesaj && <p className="text-sm text-emerald-700">{mesaj}</p>}

      {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

      {!loading && gorunum === "ozet" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="!p-3">
              <p className="text-xs text-slate-500">Açık şehir</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {sehirOzet.length}
              </p>
            </Card>
            <Card className="!p-3">
              <p className="text-xs text-slate-500">Aktif çekici</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {ozetToplam.cekici}
              </p>
            </Card>
            <Card className="!p-3">
              <p className="text-xs text-slate-500">Planlı talep</p>
              <p className="text-xl font-bold text-amber-600 tabular-nums">
                {ozetToplam.planli}
              </p>
            </Card>
            <Card className="!p-3">
              <p className="text-xs text-slate-500">Gün toplam (iptal hariç)</p>
              <p className="text-xl font-bold text-slate-900 tabular-nums">
                {ozetToplam.aktif}
              </p>
            </Card>
          </div>

          {sehirOzet.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-600">
                Açık şehir yok veya veri yüklenemedi.
              </p>
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-slate-500">
                    <th className="px-3 py-2 font-medium">Şehir</th>
                    <th className="px-3 py-2 font-medium text-right">Çekici</th>
                    <th className="px-3 py-2 font-medium text-right">Planlı</th>
                    <th className="px-3 py-2 font-medium text-right">Açıldı</th>
                    <th className="px-3 py-2 font-medium text-right">Kapandı</th>
                    <th className="px-3 py-2 font-medium text-right">İptal</th>
                    <th className="px-3 py-2 font-medium text-right">
                      Toplam*
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sehirOzet.map((s) => (
                    <tr
                      key={s.il}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-3 py-2 text-slate-900">{s.il}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-800">
                        {s.cekiciSayisi}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-amber-700">
                        {s.planli}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                        {s.acildi}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-emerald-700">
                        {s.kapandi}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-slate-400">
                        {s.iptal}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums font-medium text-slate-900">
                        {s.aktifToplam}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100">
                * Toplam = planlı + açıldı + kapandı + hata (iptal hariç). Çekici
                = o şehirde hizmet bölgesi olan aktif çekici (anlık).
              </p>
            </div>
          )}
        </div>
      )}

      {!loading && gorunum === "liste" && planlar.length === 0 && (
        <Card>
          <p className="text-sm text-slate-600">
            Bu gün için plan yok. &quot;Planla&quot; ile oluşturabilirsiniz.
          </p>
        </Card>
      )}

      {!loading && gorunum === "liste" && planlar.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-3 py-2 font-medium">Şehir</th>
                <th className="px-3 py-2 font-medium">Güzergâh</th>
                <th className="px-3 py-2 font-medium">Sorun</th>
                <th className="px-3 py-2 font-medium">Açılış</th>
                <th className="px-3 py-2 font-medium">Durum</th>
                <th className="px-3 py-2 font-medium">Çekici</th>
                <th className="px-3 py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {planlar.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-slate-50 last:border-0"
                >
                  <td className="px-3 py-2 text-slate-900">{p.il}</td>
                  <td className="px-3 py-2 text-slate-700">
                    {p.kaynakIlce}
                    {p.hedefIlce ? ` → ${p.hedefIlce}` : ""}
                  </td>
                  <td className="px-3 py-2 text-slate-700">
                    {formul?.sorunTipleri.find((s) => s.id === p.sorunTipi)
                      ?.label ?? p.sorunTipi}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-slate-700">
                    {tarihTr(p.planlananAcilisAt)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-slate-800">
                      {durumEtiket(p.durum)}
                    </span>
                    {p.talepId && (
                      <Link
                        href={`/bekle/${p.talepId}`}
                        className="ml-2 text-amber-600 text-xs"
                      >
                        talep
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-2 tabular-nums text-slate-600">
                    {p.cekiciSayisiSnapshot}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2 whitespace-nowrap">
                    {p.durum === "planli" && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs text-slate-600 hover:underline"
                          onClick={() => {
                            const v = window.prompt(
                              "Açılış (ISO veya yerel datetime)",
                              p.planlananAcilisAt
                            );
                            if (!v) return;
                            const d = new Date(v);
                            if (Number.isNaN(d.getTime())) {
                              setHata("Geçersiz tarih.");
                              return;
                            }
                            void patch({
                              id: p.id,
                              planlananAcilisAt: d.toISOString(),
                            });
                          }}
                        >
                          Saat
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => void patch({ id: p.id, iptal: true })}
                        >
                          İptal
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          className="text-xs text-amber-700 hover:underline"
                          onClick={() =>
                            void eylem({
                              eylem: "planla",
                              hedefGun: p.hedefGun,
                              il: p.il,
                            })
                          }
                        >
                          İl yenile
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {planModalAcik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="simulasyon-planla-baslik"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) {
              setPlanModalAcik(false);
              setSehirArama("");
            }
          }}
        >
          <Card className="w-full max-w-lg shadow-xl space-y-4 max-h-[min(90vh,36rem)] flex flex-col">
            <div>
              <h3
                id="simulasyon-planla-baslik"
                className="text-lg font-bold text-slate-900"
              >
                Şehir seç
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                {hedefGun} için planlanacak şehirleri seçin. Daha önce planı
                olan şehirler seçilemez.
              </p>
            </div>

            <input
              type="search"
              placeholder="Şehir ara…"
              value={sehirArama}
              onChange={(e) => setSehirArama(e.target.value)}
              disabled={busy}
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              aria-label="Şehir ara"
            />

            <div className="flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                disabled={busy || planlanabilirSehirler.length === 0}
                onClick={() =>
                  setSeciliIller(planlanabilirSehirler.map((s) => s.il))
                }
              >
                Tümünü seç ({planlanabilirSehirler.length})
              </button>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                disabled={busy || seciliIller.length === 0}
                onClick={() => setSeciliIller([])}
              >
                Temizle
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 rounded-xl border border-slate-200 divide-y divide-slate-100">
              {sehirOzet.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  Açık şehir yok.
                </p>
              ) : filtrelenmisSehirler.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  &quot;{sehirArama.trim()}&quot; ile eşleşen şehir yok.
                </p>
              ) : (
                filtrelenmisSehirler.map((s) => {
                    const planli = s.aktifToplam > 0;
                    const secili = seciliIller.includes(s.il);
                    return (
                      <label
                        key={s.il}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm ${
                          planli
                            ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                            : "cursor-pointer hover:bg-slate-50 text-slate-800"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300"
                          checked={secili && !planli}
                          disabled={busy || planli}
                          onChange={(e) => {
                            if (planli) return;
                            setSeciliIller((prev) =>
                              e.target.checked
                                ? [...prev, s.il]
                                : prev.filter((il) => il !== s.il)
                            );
                          }}
                        />
                        <span className="flex-1 font-medium">{s.il}</span>
                        <span className="text-xs tabular-nums">
                          {planli
                            ? `${s.aktifToplam} plan`
                            : `${s.cekiciSayisi} çekici`}
                        </span>
                      </label>
                    );
                  })
              )}
            </div>

            {planlanmisSehirler.length > 0 && (
              <p className="text-xs text-slate-500">
                {planlanmisSehirler.length} şehir zaten planlı (pasif).
              </p>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Btn
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setPlanModalAcik(false);
                  setSehirArama("");
                }}
              >
                Vazgeç
              </Btn>
              <Btn
                disabled={busy || seciliIller.length === 0 || !hedefGun}
                onClick={() => {
                  const iller = [...seciliIller];
                  setPlanModalAcik(false);
                  setSehirArama("");
                  void eylem({ eylem: "planla", hedefGun, iller });
                }}
              >
                {seciliIller.length > 0
                  ? `${seciliIller.length} şehir planla`
                  : "Planla"}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
