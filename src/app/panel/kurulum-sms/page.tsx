"use client";

import { useCallback, useEffect, useState } from "react";
import { Btn, Card } from "@/components/ui";

type Ozet = {
  gonderilen: number;
  tiklayanCekici: number;
  kurulumTamamlayan: number;
  durdurulan: number;
};

type Satir = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  gonderimSayisi: number;
  tamamlanmamisBasarili: number;
  sonSms: string | null;
  tiklayan: boolean;
  kurulumTamamlandi: boolean;
  durum: "aktif" | "durduruldu";
};

type Aday = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  kayitTarihi: string;
  gonderimSayisi: number;
  sonrakiMesaj: number;
  durum: "aktif" | "durduruldu";
};

export default function PanelKurulumSmsPage() {
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [satirlar, setSatirlar] = useState<Satir[]>([]);
  const [adaylar, setAdaylar] = useState<Aday[]>([]);
  const [secili, setSecili] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setLoading(true);
    setHata(null);
    try {
      const r = await fetch("/api/panel/kurulum-sms");
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        throw new Error(j.error ?? "Yüklenemedi.");
      }
      const data = await r.json();
      setOzet(data.ozet);
      setSatirlar(data.satirlar ?? []);
      setAdaylar(data.adaylar ?? []);
      setSecili(new Set());
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  function toggle(id: string) {
    setSecili((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function hepsiniSec() {
    setSecili(new Set(adaylar.map((a) => a.cekiciId)));
  }

  async function manuelGonder() {
    if (secili.size === 0) {
      setHata("En az bir aday seçin.");
      return;
    }
    setGonderiyor(true);
    setHata(null);
    setMesaj(null);
    try {
      const r = await fetch("/api/panel/kurulum-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cekiciIds: [...secili] }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Gönderim başarısız.");
      const hatalar: string[] = j.hatalar ?? [];
      setMesaj(
        `${j.gonderilen ?? 0} SMS gönderildi` +
          (hatalar.length ? ` · ${hatalar.length} hata` : "")
      );
      if (hatalar.length) setHata(hatalar.slice(0, 5).join("; "));
      await yukle();
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderim başarısız.");
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Kurulum SMS</h2>
          <p className="text-sm text-slate-500">
            Kayıt olup hesap kurulumunu bitirmeyenlere haftalık hatırlatma (max
            4, 7 gün aralık)
          </p>
        </div>
        <Btn type="button" variant="secondary" onClick={() => void yukle()}>
          Adayları yenile
        </Btn>
      </div>

      {ozet && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Gönderilen SMS</p>
            <p className="text-2xl font-bold">{ozet.gonderilen}</p>
          </Card>
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Tıklayan (benzersiz)</p>
            <p className="text-2xl font-bold">{ozet.tiklayanCekici}</p>
          </Card>
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Kurulum tamamlayan</p>
            <p className="text-2xl font-bold">{ozet.kurulumTamamlayan}</p>
          </Card>
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Durdurulan (4+)</p>
            <p className="text-2xl font-bold">{ozet.durdurulan}</p>
          </Card>
        </div>
      )}

      {mesaj && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          {mesaj}
        </p>
      )}
      {hata && (
        <p className="text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2">
          {hata}
        </p>
      )}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h3 className="font-semibold">
            Bu hafta gönderilebilir ({adaylar.length})
          </h3>
          <div className="flex gap-2">
            <Btn
              type="button"
              variant="secondary"
              disabled={adaylar.length === 0}
              onClick={hepsiniSec}
            >
              Tümünü seç
            </Btn>
            <Btn
              type="button"
              disabled={gonderiyor || secili.size === 0}
              onClick={() => void manuelGonder()}
            >
              {gonderiyor
                ? "Gönderiliyor…"
                : `Seçilenlere gönder (${secili.size})`}
            </Btn>
          </div>
        </div>
        {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
        {!loading && adaylar.length === 0 && (
          <p className="text-sm text-slate-600">
            Şu an aday yok (kurulum tamam, 24s yaş, 7 gün cooldown veya 4-kural).
          </p>
        )}
        {!loading && adaylar.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-2 w-8" />
                  <th className="py-2 pr-2">Ad</th>
                  <th className="py-2 pr-2">Telefon</th>
                  <th className="py-2 pr-2">Funnel</th>
                  <th className="py-2 pr-2">Kayıt</th>
                  <th className="py-2 pr-2">Önceki SMS</th>
                  <th className="py-2 pr-2">Sıradaki</th>
                </tr>
              </thead>
              <tbody>
                {adaylar.map((a) => (
                  <tr key={a.cekiciId} className="border-b border-slate-100">
                    <td className="py-2 pr-2">
                      <input
                        type="checkbox"
                        checked={secili.has(a.cekiciId)}
                        onChange={() => toggle(a.cekiciId)}
                      />
                    </td>
                    <td className="py-2 pr-2 font-medium">{a.ad}</td>
                    <td className="py-2 pr-2">{a.telefon}</td>
                    <td className="py-2 pr-2">
                      {a.kayitFunnel ? a.kayitFunnel.toUpperCase() : "—"}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {new Date(a.kayitTarihi).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="py-2 pr-2">{a.gonderimSayisi}</td>
                    <td className="py-2 pr-2">#{a.sonrakiMesaj}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="font-semibold mb-3">Gönderim geçmişi</h3>
        {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
        {!loading && satirlar.length === 0 && (
          <p className="text-sm text-slate-600">Henüz hatırlatma gönderilmedi.</p>
        )}
        {!loading && satirlar.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="py-2 pr-2">Ad</th>
                  <th className="py-2 pr-2">Telefon</th>
                  <th className="py-2 pr-2">Funnel</th>
                  <th className="py-2 pr-2">SMS</th>
                  <th className="py-2 pr-2">Son SMS</th>
                  <th className="py-2 pr-2">Tık?</th>
                  <th className="py-2 pr-2">Kurulum?</th>
                  <th className="py-2 pr-2">Durum</th>
                </tr>
              </thead>
              <tbody>
                {satirlar.map((s) => (
                  <tr key={s.cekiciId} className="border-b border-slate-100">
                    <td className="py-2 pr-2 font-medium">{s.ad}</td>
                    <td className="py-2 pr-2">{s.telefon}</td>
                    <td className="py-2 pr-2">
                      {s.kayitFunnel ? s.kayitFunnel.toUpperCase() : "—"}
                    </td>
                    <td className="py-2 pr-2">
                      {s.gonderimSayisi}
                      {s.tamamlanmamisBasarili > 0
                        ? ` (${s.tamamlanmamisBasarili} açık)`
                        : ""}
                    </td>
                    <td className="py-2 pr-2 whitespace-nowrap">
                      {s.sonSms
                        ? new Date(s.sonSms).toLocaleString("tr-TR")
                        : "—"}
                    </td>
                    <td className="py-2 pr-2">{s.tiklayan ? "Evet" : "Hayır"}</td>
                    <td className="py-2 pr-2">
                      {s.kurulumTamamlandi ? "Evet" : "Hayır"}
                    </td>
                    <td className="py-2 pr-2">
                      <span
                        className={
                          s.durum === "durduruldu"
                            ? "text-red-700"
                            : "text-emerald-700"
                        }
                      >
                        {s.durum === "durduruldu" ? "Durduruldu" : "Aktif"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
