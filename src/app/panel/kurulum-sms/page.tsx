"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Btn, Card } from "@/components/ui";

type Ozet = {
  eksikKurulum: number;
  smsAlanCekici: number;
  gonderilen: number;
  basarisizSms: number;
  tiklayanCekici: number;
  tiklamaOrani: number | null;
  kurulumTamamlayan: number;
  smsSonrasiTamam: number;
  donusumOrani: number | null;
  durdurulan: number;
  adaySayisi: number;
  hicSmsAlmayan: number;
};

type MesajKirilim = {
  hatirlatma: number;
  gonderilen: number;
  tiklanan: number;
  tiklamaOrani: number | null;
  tamamlanan: number;
  donusumOrani: number | null;
};

type FunnelKirilim = {
  funnel: string;
  eksik: number;
  smsAlan: number;
  tiklayan: number;
  tamamlayan: number;
};

type Satir = {
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  kayitTarihi: string | null;
  kurulumYuzde: number;
  gonderimSayisi: number;
  hatirlatmaNo: number;
  sonrakiMesaj: number | null;
  tamamlanmamisBasarili: number;
  ilkSms: string | null;
  sonSms: string | null;
  tiklayan: boolean;
  toplamTiklama: number;
  sonTiklama: string | null;
  kurulumTamamlandi: boolean;
  kurulumTamamAt: string | null;
  tamamlandigiHatirlatma: number | null;
  gunKayittan: number | null;
  gunSonSms: number | null;
  durum:
    | "aday"
    | "bekliyor"
    | "tikladi"
    | "tamamlandi"
    | "durduruldu"
    | "sms_yok";
};

type Gonderim = {
  id: string;
  token: string;
  cekiciId: string;
  ad: string;
  telefon: string;
  kayitFunnel: string | null;
  hatirlatmaNo: number;
  olusturulma: string;
  smsBasarili: boolean;
  tiklandi: boolean;
  tiklamaSayisi: number;
  ilkTiklama: string | null;
  kurulumTamamAt: string | null;
  kisaPath: string;
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

type DurumFiltre = "hepsi" | Satir["durum"];
type Sekme = "takip" | "gonderimler" | "gonder";

function yuzde(oran: number | null): string {
  if (oran == null) return "—";
  return `${(oran * 100).toFixed(1)}%`;
}

function tarihKisa(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function durumEtiket(d: Satir["durum"]): string {
  switch (d) {
    case "aday":
      return "Gönderilebilir";
    case "bekliyor":
      return "SMS gitti · tıklamadı";
    case "tikladi":
      return "Tıkladı · kurulum yok";
    case "tamamlandi":
      return "Kurulum tamam";
    case "durduruldu":
      return "Durduruldu (4+)";
    case "sms_yok":
      return "SMS yok";
  }
}

function durumSinif(d: Satir["durum"]): string {
  switch (d) {
    case "tamamlandi":
      return "text-emerald-700";
    case "tikladi":
      return "text-amber-800";
    case "durduruldu":
      return "text-red-700";
    case "aday":
      return "text-sky-700";
    case "bekliyor":
      return "text-slate-700";
    case "sms_yok":
      return "text-slate-500";
  }
}

export default function PanelKurulumSmsPage() {
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [mesajKirilim, setMesajKirilim] = useState<MesajKirilim[]>([]);
  const [funnelKirilim, setFunnelKirilim] = useState<FunnelKirilim[]>([]);
  const [satirlar, setSatirlar] = useState<Satir[]>([]);
  const [gonderimler, setGonderimler] = useState<Gonderim[]>([]);
  const [adaylar, setAdaylar] = useState<Aday[]>([]);
  const [secili, setSecili] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [mesaj, setMesaj] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [sekme, setSekme] = useState<Sekme>("takip");
  const [durumFiltre, setDurumFiltre] = useState<DurumFiltre>("hepsi");
  const [funnelFiltre, setFunnelFiltre] = useState<string>("hepsi");
  const [hatirlatmaFiltre, setHatirlatmaFiltre] = useState<string>("hepsi");
  const [arama, setArama] = useState("");

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
      setMesajKirilim(data.mesajKirilim ?? []);
      setFunnelKirilim(data.funnelKirilim ?? []);
      setSatirlar(data.satirlar ?? []);
      setGonderimler(data.gonderimler ?? []);
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

  const funnelSecenekleri = useMemo(() => {
    const s = new Set<string>();
    for (const r of satirlar) {
      s.add(r.kayitFunnel?.toLowerCase() || "—");
    }
    return [...s].sort();
  }, [satirlar]);

  const filtreliSatirlar = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return satirlar.filter((s) => {
      if (durumFiltre !== "hepsi" && s.durum !== durumFiltre) return false;
      if (funnelFiltre !== "hepsi") {
        const f = s.kayitFunnel?.toLowerCase() || "—";
        if (f !== funnelFiltre) return false;
      }
      if (hatirlatmaFiltre !== "hepsi") {
        const n = Number(hatirlatmaFiltre);
        if (s.hatirlatmaNo !== n) return false;
      }
      if (q) {
        const haystack = `${s.ad} ${s.telefon} ${s.cekiciId}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [satirlar, durumFiltre, funnelFiltre, hatirlatmaFiltre, arama]);

  const filtreliGonderimler = useMemo(() => {
    const q = arama.trim().toLowerCase();
    return gonderimler.filter((g) => {
      if (funnelFiltre !== "hepsi") {
        const f = g.kayitFunnel?.toLowerCase() || "—";
        if (f !== funnelFiltre) return false;
      }
      if (hatirlatmaFiltre !== "hepsi") {
        if (g.hatirlatmaNo !== Number(hatirlatmaFiltre)) return false;
      }
      if (durumFiltre === "tikladi" && !g.tiklandi) return false;
      if (durumFiltre === "bekliyor" && (g.tiklandi || g.kurulumTamamAt))
        return false;
      if (durumFiltre === "tamamlandi" && !g.kurulumTamamAt) return false;
      if (q) {
        const haystack = `${g.ad} ${g.telefon} ${g.token}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [gonderimler, funnelFiltre, hatirlatmaFiltre, durumFiltre, arama]);

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
          <h2 className="text-2xl font-bold">Kurulum takip</h2>
          <p className="text-sm text-slate-500">
            Kayıt sonrası kurulum SMS’leri — tıklama, hatırlatma sırası ve
            dönüşüm analizi
          </p>
        </div>
        <Btn type="button" variant="secondary" onClick={() => void yukle()}>
          Yenile
        </Btn>
      </div>

      {ozet && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Kurulum eksik</p>
            <p className="text-2xl font-bold">{ozet.eksikKurulum}</p>
            <p className="text-xs text-slate-500 mt-1">
              SMS yok: {ozet.hicSmsAlmayan} · Aday: {ozet.adaySayisi}
            </p>
          </Card>
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">SMS giden kişi</p>
            <p className="text-2xl font-bold">{ozet.smsAlanCekici}</p>
            <p className="text-xs text-slate-500 mt-1">
              {ozet.gonderilen} SMS
              {ozet.basarisizSms > 0 ? ` · ${ozet.basarisizSms} başarısız` : ""}
            </p>
          </Card>
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Link tıklayan</p>
            <p className="text-2xl font-bold">{ozet.tiklayanCekici}</p>
            <p className="text-xs text-slate-500 mt-1">
              CTR {yuzde(ozet.tiklamaOrani)}
            </p>
          </Card>
          <Card className="bg-slate-50">
            <p className="text-xs text-slate-500">Kurulum tamam (SMS sonrası)</p>
            <p className="text-2xl font-bold">{ozet.smsSonrasiTamam}</p>
            <p className="text-xs text-slate-500 mt-1">
              Dönüşüm {yuzde(ozet.donusumOrani)} · Durdurulan {ozet.durdurulan}
            </p>
          </Card>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold mb-3">Hatırlatma #1–4 kırılımı</h3>
          {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">Gönderim</th>
                    <th className="py-2 pr-2">Tık</th>
                    <th className="py-2 pr-2">CTR</th>
                    <th className="py-2 pr-2">Kurulum</th>
                    <th className="py-2 pr-2">Dönüşüm</th>
                  </tr>
                </thead>
                <tbody>
                  {mesajKirilim.map((m) => (
                    <tr key={m.hatirlatma} className="border-b border-slate-100">
                      <td className="py-2 pr-2 font-semibold">
                        #{m.hatirlatma}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">{m.gonderilen}</td>
                      <td className="py-2 pr-2 tabular-nums">{m.tiklanan}</td>
                      <td className="py-2 pr-2 tabular-nums">
                        {yuzde(m.tiklamaOrani)}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">{m.tamamlanan}</td>
                      <td className="py-2 pr-2 tabular-nums">
                        {yuzde(m.donusumOrani)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Funnel kırılımı</h3>
          {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
          {!loading && funnelKirilim.length === 0 && (
            <p className="text-sm text-slate-600">Veri yok.</p>
          )}
          {!loading && funnelKirilim.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">Funnel</th>
                    <th className="py-2 pr-2">Eksik</th>
                    <th className="py-2 pr-2">SMS</th>
                    <th className="py-2 pr-2">Tık</th>
                    <th className="py-2 pr-2">Tamam</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelKirilim.map((f) => (
                    <tr key={f.funnel} className="border-b border-slate-100">
                      <td className="py-2 pr-2 font-semibold">
                        {f.funnel === "—" ? "—" : f.funnel.toUpperCase()}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">{f.eksik}</td>
                      <td className="py-2 pr-2 tabular-nums">{f.smsAlan}</td>
                      <td className="py-2 pr-2 tabular-nums">{f.tiklayan}</td>
                      <td className="py-2 pr-2 tabular-nums">{f.tamamlayan}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

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

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {(
          [
            ["takip", "Kişi takip"],
            ["gonderimler", "SMS log"],
            ["gonder", "Gönder"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setSekme(id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              sekme === id
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {sekme !== "gonder" && (
        <Card className="!py-3">
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs text-slate-500">
              Durum
              <select
                className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={durumFiltre}
                onChange={(e) =>
                  setDurumFiltre(e.target.value as DurumFiltre)
                }
              >
                <option value="hepsi">Hepsi</option>
                <option value="sms_yok">SMS yok</option>
                <option value="aday">Gönderilebilir</option>
                <option value="bekliyor">Tıklamadı</option>
                <option value="tikladi">Tıkladı</option>
                <option value="tamamlandi">Tamamlandı</option>
                <option value="durduruldu">Durduruldu</option>
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Funnel
              <select
                className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={funnelFiltre}
                onChange={(e) => setFunnelFiltre(e.target.value)}
              >
                <option value="hepsi">Hepsi</option>
                {funnelSecenekleri.map((f) => (
                  <option key={f} value={f}>
                    {f === "—" ? "—" : f.toUpperCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Hatırlatma #
              <select
                className="mt-1 block rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={hatirlatmaFiltre}
                onChange={(e) => setHatirlatmaFiltre(e.target.value)}
              >
                <option value="hepsi">Hepsi</option>
                <option value="0">0 (SMS yok)</option>
                <option value="1">#1</option>
                <option value="2">#2</option>
                <option value="3">#3</option>
                <option value="4">#4</option>
              </select>
            </label>
            <label className="text-xs text-slate-500 flex-1 min-w-[12rem]">
              Ara
              <input
                className="mt-1 block w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                placeholder="Ad / telefon"
              />
            </label>
          </div>
        </Card>
      )}

      {sekme === "takip" && (
        <Card>
          <h3 className="font-semibold mb-3">
            Kişi takip ({filtreliSatirlar.length})
          </h3>
          {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
          {!loading && filtreliSatirlar.length === 0 && (
            <p className="text-sm text-slate-600">Eşleşen kayıt yok.</p>
          )}
          {!loading && filtreliSatirlar.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">Ad</th>
                    <th className="py-2 pr-2">Tel</th>
                    <th className="py-2 pr-2">Funnel</th>
                    <th className="py-2 pr-2">Kurulum %</th>
                    <th className="py-2 pr-2">Hatırlatma</th>
                    <th className="py-2 pr-2">Link</th>
                    <th className="py-2 pr-2">Son SMS</th>
                    <th className="py-2 pr-2">Gün</th>
                    <th className="py-2 pr-2">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {filtreliSatirlar.map((s) => (
                    <tr key={s.cekiciId} className="border-b border-slate-100">
                      <td className="py-2 pr-2 font-medium">{s.ad}</td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {s.telefon}
                      </td>
                      <td className="py-2 pr-2">
                        {s.kayitFunnel
                          ? s.kayitFunnel.toUpperCase()
                          : "—"}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">
                        %{s.kurulumYuzde}
                      </td>
                      <td className="py-2 pr-2 tabular-nums">
                        {s.kurulumTamamlandi
                          ? s.tamamlandigiHatirlatma
                            ? `#${s.tamamlandigiHatirlatma}’de bitti`
                            : "Tamam"
                          : s.gonderimSayisi === 0
                            ? "—"
                            : `#${s.hatirlatmaNo}${
                                s.sonrakiMesaj
                                  ? ` → #${s.sonrakiMesaj}`
                                  : ""
                              }`}
                      </td>
                      <td className="py-2 pr-2">
                        {s.tiklayan ? (
                          <span className="text-emerald-700">
                            Tıkladı ({s.toplamTiklama})
                          </span>
                        ) : s.gonderimSayisi > 0 ? (
                          <span className="text-red-700">Yok</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {tarihKisa(s.sonSms)}
                      </td>
                      <td className="py-2 pr-2 tabular-nums text-slate-600">
                        {s.gunKayittan != null ? `${s.gunKayittan}g kayıt` : "—"}
                        {s.gunSonSms != null ? (
                          <span className="block text-xs">
                            {s.gunSonSms}g SMS
                          </span>
                        ) : null}
                      </td>
                      <td className={`py-2 pr-2 ${durumSinif(s.durum)}`}>
                        {durumEtiket(s.durum)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {sekme === "gonderimler" && (
        <Card>
          <h3 className="font-semibold mb-3">
            SMS log ({filtreliGonderimler.length})
          </h3>
          {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}
          {!loading && filtreliGonderimler.length === 0 && (
            <p className="text-sm text-slate-600">Henüz gönderim yok.</p>
          )}
          {!loading && filtreliGonderimler.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500 border-b">
                    <th className="py-2 pr-2">Tarih</th>
                    <th className="py-2 pr-2">Ad</th>
                    <th className="py-2 pr-2">Tel</th>
                    <th className="py-2 pr-2">#</th>
                    <th className="py-2 pr-2">SMS</th>
                    <th className="py-2 pr-2">Link tık</th>
                    <th className="py-2 pr-2">Kurulum</th>
                    <th className="py-2 pr-2">Kısa yol</th>
                  </tr>
                </thead>
                <tbody>
                  {filtreliGonderimler.map((g) => (
                    <tr key={g.id} className="border-b border-slate-100">
                      <td className="py-2 pr-2 whitespace-nowrap">
                        {tarihKisa(g.olusturulma)}
                      </td>
                      <td className="py-2 pr-2 font-medium">{g.ad}</td>
                      <td className="py-2 pr-2">{g.telefon}</td>
                      <td className="py-2 pr-2 tabular-nums">
                        #{g.hatirlatmaNo}
                      </td>
                      <td className="py-2 pr-2">
                        {g.smsBasarili ? (
                          <span className="text-emerald-700">OK</span>
                        ) : (
                          <span className="text-red-700">Fail</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {g.tiklandi ? (
                          <span className="text-emerald-700">
                            Evet ({g.tiklamaSayisi})
                            {g.ilkTiklama ? (
                              <span className="block text-xs text-slate-500">
                                {tarihKisa(g.ilkTiklama)}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-red-700">Hayır</span>
                        )}
                      </td>
                      <td className="py-2 pr-2">
                        {g.kurulumTamamAt ? (
                          <span className="text-emerald-700">
                            {tarihKisa(g.kurulumTamamAt)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 pr-2 font-mono text-xs text-slate-600">
                        {g.kisaPath}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {sekme === "gonder" && (
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
              Şu an aday yok (kurulum tamam, 24s yaş, 7 gün cooldown veya
              4-kural).
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
                        {a.kayitFunnel
                          ? a.kayitFunnel.toUpperCase()
                          : "—"}
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
      )}
    </div>
  );
}
