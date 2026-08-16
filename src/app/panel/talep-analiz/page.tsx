"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, SelectField } from "@/components/ui";
import {
  sureMsMetin,
  type TalepTeklifAnalizOzet,
  type TalepTeklifSureKova,
  type TalepTeklifSureSatir,
} from "@/lib/talep-teklif-analiz";

type SimulasyonFiltre = "" | "sadece" | "haric";

type ApiCevap = {
  filtre: {
    from: string;
    to: string;
    simulasyon?: SimulasyonFiltre;
    minOlusturulma: string;
  };
  ozet: TalepTeklifAnalizOzet;
  kovalar: TalepTeklifSureKova[];
  teklifsiz: number;
  satirlar: TalepTeklifSureSatir[];
  error?: string;
};

function bugun(): string {
  return new Date().toISOString().slice(0, 10);
}

function gunEksi(n: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

function yuzde(oran: number | null): string {
  if (oran == null) return "—";
  return `${(oran * 100).toFixed(1)}%`;
}

function tarihKisa(iso: string): string {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function OzetKart({
  baslik,
  deger,
  alt,
}: {
  baslik: string;
  deger: string;
  alt?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium text-slate-500">{baslik}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
        {deger}
      </p>
      {alt ? <p className="mt-1 text-xs text-slate-500">{alt}</p> : null}
    </Card>
  );
}

export default function PanelTalepAnalizPage() {
  const [from, setFrom] = useState(() => gunEksi(6));
  const [to, setTo] = useState(() => bugun());
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [ozet, setOzet] = useState<TalepTeklifAnalizOzet | null>(null);
  const [kovalar, setKovalar] = useState<TalepTeklifSureKova[]>([]);
  const [teklifsiz, setTeklifsiz] = useState(0);
  const [satirlar, setSatirlar] = useState<TalepTeklifSureSatir[]>([]);
  const [sadeceTeklifli, setSadeceTeklifli] = useState(false);
  const [simulasyonFiltre, setSimulasyonFiltre] =
    useState<SimulasyonFiltre>("haric");

  const yukle = useCallback(async () => {
    setYukleniyor(true);
    setHata(null);
    try {
      const qs = new URLSearchParams({ from, to });
      qs.set("simulasyon", simulasyonFiltre === "" ? "tumu" : simulasyonFiltre);
      const res = await fetch(`/api/panel/talep-analiz?${qs}`);
      const data = (await res.json()) as ApiCevap;
      if (!res.ok) {
        setHata(data.error || "Yüklenemedi.");
        setOzet(null);
        setKovalar([]);
        setSatirlar([]);
        return;
      }
      setOzet(data.ozet);
      setKovalar(data.kovalar);
      setTeklifsiz(data.teklifsiz);
      setSatirlar(data.satirlar);
    } catch {
      setHata("Bağlantı hatası.");
    } finally {
      setYukleniyor(false);
    }
  }, [from, to, simulasyonFiltre]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const maxKova = useMemo(
    () => Math.max(...kovalar.map((k) => k.adet), teklifsiz, 1),
    [kovalar, teklifsiz]
  );

  const tabloSatirlar = useMemo(() => {
    const list = sadeceTeklifli
      ? satirlar.filter((s) => s.ilkTeklifMs != null)
      : satirlar;
    return list;
  }, [satirlar, sadeceTeklifli]);

  const teklifli = ozet?.teklifli ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Talep analizi
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Talepler oluştuktan sonra tekliflerin ne kadar sürede geldiği.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-slate-500">
            Başlangıç
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </label>
          <label className="text-xs text-slate-500">
            Bitiş
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
            />
          </label>
          <div className="min-w-[10rem]">
            <SelectField
              label="Kaynak"
              value={simulasyonFiltre}
              onChange={(e) =>
                setSimulasyonFiltre(e.target.value as SimulasyonFiltre)
              }
            >
              <option value="haric">Gerçek ihaleler</option>
              <option value="">Tümü</option>
              <option value="sadece">Simülasyon</option>
            </SelectField>
          </div>
          <button
            type="button"
            onClick={() => {
              setFrom(gunEksi(6));
              setTo(bugun());
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            7 gün
          </button>
          <button
            type="button"
            onClick={() => {
              setFrom(gunEksi(29));
              setTo(bugun());
            }}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            30 gün
          </button>
          <button
            type="button"
            onClick={() => void yukle()}
            disabled={yukleniyor}
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {yukleniyor ? "Yükleniyor…" : "Yenile"}
          </button>
        </div>
      </div>

      {hata ? (
        <Card className="border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {hata}
        </Card>
      ) : null}

      {ozet ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <OzetKart
            baslik="Talep"
            deger={String(ozet.talepSayisi)}
            alt={`${ozet.teklifli} teklifli · ${ozet.teklifsiz} teklifsiz`}
          />
          <OzetKart
            baslik="Teklifli oran"
            deger={yuzde(ozet.teklifliOran)}
            alt={`Ort. ${ozet.ortalamaTeklifSayisi.toFixed(1)} teklif / talep`}
          />
          <OzetKart
            baslik="Medyan ilk teklif"
            deger={sureMsMetin(ozet.medyanIlkMs)}
            alt={`Ort. ${sureMsMetin(ozet.ortalamaIlkMs)} · P90 ${sureMsMetin(ozet.p90IlkMs)}`}
          />
          <OzetKart
            baslik="İlk 2 dk içinde"
            deger={
              teklifli > 0
                ? yuzde(ozet.ilk2Dk / teklifli)
                : "—"
            }
            alt={`1 dk: ${ozet.ilk1Dk} · 5 dk: ${ozet.ilk5Dk} · 10 dk: ${ozet.ilk10Dk}`}
          />
        </div>
      ) : null}

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-slate-900">
          İlk teklif süresi dağılımı
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Talebin oluşmasından ilk gerçek teklife kadar geçen süre (tester /
          simülasyon hesap teklifleri hariç).
        </p>
        <div className="mt-4 space-y-2">
          {kovalar.map((k) => (
            <div key={k.id} className="flex items-center gap-3 text-sm">
              <span className="w-28 shrink-0 text-slate-600">{k.label}</span>
              <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
                <div
                  className="h-full rounded bg-amber-400 transition-all"
                  style={{ width: `${(k.adet / maxKova) * 100}%` }}
                />
              </div>
              <span className="w-10 shrink-0 text-right tabular-nums text-slate-700">
                {k.adet}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-slate-600">Teklifsiz</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-slate-100">
              <div
                className="h-full rounded bg-slate-400 transition-all"
                style={{ width: `${(teklifsiz / maxKova) * 100}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right tabular-nums text-slate-700">
              {teklifsiz}
            </span>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Talepler</h2>
            <p className="text-xs text-slate-500">
              {tabloSatirlar.length} kayıt
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={sadeceTeklifli}
              onChange={(e) => setSadeceTeklifli(e.target.checked)}
              className="rounded border-slate-300"
            />
            Yalnızca teklif alanlar
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Talep</th>
                <th className="px-4 py-2 font-medium">Oluşturma</th>
                <th className="px-4 py-2 font-medium">Şehir</th>
                <th className="px-4 py-2 font-medium">Durum</th>
                <th className="px-4 py-2 font-medium text-right">Teklif</th>
                <th className="px-4 py-2 font-medium text-right">İlk teklif</th>
                <th className="px-4 py-2 font-medium text-right">Medyan</th>
                <th className="px-4 py-2 font-medium text-right">Son teklif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yukleniyor && !satirlar.length ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Yükleniyor…
                  </td>
                </tr>
              ) : null}
              {!yukleniyor && !tabloSatirlar.length ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    Bu aralıkta talep yok.
                  </td>
                </tr>
              ) : null}
              {tabloSatirlar.map((s) => (
                <tr key={s.talepId} className="hover:bg-slate-50/80">
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Link
                        href={`/bekle/${s.talepId}`}
                        className="font-mono text-xs text-amber-700 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {s.talepId.slice(0, 8)}…
                      </Link>
                      {s.simulasyon ? (
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-violet-700 bg-violet-50 px-1.5 py-0.5 rounded-md">
                          Sim
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 tabular-nums text-slate-700">
                    {tarihKisa(s.olusturulma)}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{s.sehir}</td>
                  <td className="px-4 py-2.5 text-slate-600">{s.durum}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {s.teklifSayisi}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums text-slate-900">
                    {sureMsMetin(s.ilkTeklifMs)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                    {sureMsMetin(s.medyanTeklifMs)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                    {sureMsMetin(s.sonTeklifMs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
