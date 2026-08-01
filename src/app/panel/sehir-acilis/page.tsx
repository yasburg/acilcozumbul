"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Btn, Card } from "@/components/ui";

type Satir = { il: string; acik: boolean };

export default function PanelSehirAcilisPage() {
  const [iller, setIller] = useState<Satir[]>([]);
  const [loading, setLoading] = useState(true);
  const [hata, setHata] = useState<string | null>(null);
  const [arama, setArama] = useState("");
  const [kaydedilen, setKaydedilen] = useState<string | null>(null);
  const [bekleyen, setBekleyen] = useState<Set<string>>(new Set());
  const [topluBekliyor, setTopluBekliyor] = useState(false);

  const yukle = useCallback(async () => {
    setLoading(true);
    setHata(null);
    try {
      const r = await fetch("/api/panel/sehir-acilis", {
        credentials: "include",
      });
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "Yüklenemedi.");
      }
      const data = await r.json();
      setIller(data.iller ?? []);
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase("tr-TR");
    if (!q) return iller;
    return iller.filter((i) =>
      i.il.toLocaleLowerCase("tr-TR").includes(q)
    );
  }, [iller, arama]);

  const acikSayisi = iller.filter((i) => i.acik).length;
  const busy = topluBekliyor || bekleyen.size > 0;

  async function toggle(il: string, acik: boolean) {
    setHata(null);
    setKaydedilen(null);
    setBekleyen((prev) => new Set(prev).add(il));
    setIller((prev) =>
      prev.map((s) => (s.il === il ? { ...s, acik } : s))
    );
    try {
      const r = await fetch("/api/panel/sehir-acilis", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ il, acik }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Güncellenemedi.");
      setKaydedilen(`${il} ${acik ? "açıldı" : "kapatıldı"}.`);
    } catch (e) {
      setIller((prev) =>
        prev.map((s) => (s.il === il ? { ...s, acik: !acik } : s))
      );
      setHata(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setBekleyen((prev) => {
        const n = new Set(prev);
        n.delete(il);
        return n;
      });
    }
  }

  async function tumunuAyarla(acik: boolean) {
    const eylem = acik ? "açmak" : "kapatmak";
    if (
      !window.confirm(
        `Tüm şehirleri ${eylem} istediğinize emin misiniz? (${iller.length || 81} il)`
      )
    ) {
      return;
    }

    setHata(null);
    setKaydedilen(null);
    setTopluBekliyor(true);
    const onceki = iller;
    setIller((prev) => prev.map((s) => ({ ...s, acik })));
    try {
      const r = await fetch("/api/panel/sehir-acilis", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tumu: true, acik }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Güncellenemedi.");
      const sayi = typeof j.sayi === "number" ? j.sayi : iller.length;
      setKaydedilen(
        acik
          ? `Tüm şehirler açıldı (${sayi} il).`
          : `Tüm şehirler kapatıldı (${sayi} il).`
      );
      await yukle();
    } catch (e) {
      setIller(onceki);
      setHata(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setTopluBekliyor(false);
    }
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Şehir açılış</h1>
        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
          Kapalı illerde talep SMS’i ve kredi hatırlatması gitmez; o şehirdeki
          çekiciler panele / teklife giremez.
        </p>
      </div>

      <Card className="flex flex-wrap items-center gap-3 justify-between">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-emerald-700">{acikSayisi}</span>
          {" / "}
          {iller.length || "—"} il açık
        </p>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            placeholder="İl ara…"
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm w-40 sm:w-52"
          />
          <Btn
            type="button"
            variant="success"
            className="!w-auto !min-h-0 !py-2 !px-3 !text-xs"
            onClick={() => void tumunuAyarla(true)}
            disabled={loading || busy || (iller.length > 0 && acikSayisi === iller.length)}
          >
            {topluBekliyor ? "Kaydediliyor…" : "Tüm şehirleri aç"}
          </Btn>
          <Btn
            type="button"
            variant="danger"
            className="!w-auto !min-h-0 !py-2 !px-3 !text-xs"
            onClick={() => void tumunuAyarla(false)}
            disabled={loading || busy || acikSayisi === 0}
          >
            {topluBekliyor ? "Kaydediliyor…" : "Tüm şehirleri kapat"}
          </Btn>
          <Btn
            type="button"
            variant="secondary"
            onClick={() => void yukle()}
            disabled={loading || busy}
          >
            Yenile
          </Btn>
        </div>
      </Card>

      {hata && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {hata}
        </p>
      )}
      {kaydedilen && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
          {kaydedilen}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-slate-500 py-8 text-center">Yükleniyor…</p>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filtreli.map(({ il, acik }) => {
              const satirBusy = bekleyen.has(il) || topluBekliyor;
              return (
                <li
                  key={il}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{il}</p>
                    <p
                      className={`text-xs ${
                        acik ? "text-emerald-600" : "text-slate-500"
                      }`}
                    >
                      {acik ? "Açık — SMS gider" : "Kapalı — SMS gitmez"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={acik}
                    aria-label={`${il} ${acik ? "kapat" : "aç"}`}
                    disabled={satirBusy}
                    onClick={() => void toggle(il, !acik)}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                      acik ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                        acik ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </li>
              );
            })}
            {filtreli.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                Eşleşen il yok.
              </li>
            )}
          </ul>
        </Card>
      )}
    </div>
  );
}
