"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Btn, Card, Field, TextArea } from "@/components/ui";
import {
  NETGSM_TOPLU_SMS_BIRIM,
  NETGSM_TOPLU_SMS_MAX_BIRIM,
  netgsmSmsMesajGecerliMi,
} from "@/lib/sms-karakter";
import {
  elleTelefonEkle,
  exceldenTopluSmsAliciOku,
  type TopluSmsAlici,
} from "@/lib/toplu-sms-excel";
import { telefonMaskele } from "@/lib/telefon";

export default function PanelTopluSmsPage() {
  const [alicilar, setAlicilar] = useState<TopluSmsAlici[]>([]);
  const [elleTel, setElleTel] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [excelUyari, setExcelUyari] = useState("");
  const [elleHata, setElleHata] = useState("");
  const [gonderiyor, setGonderiyor] = useState(false);
  const [sonuc, setSonuc] = useState<{
    basarili: number;
    basarisiz: number;
    mesajParca?: number;
  } | null>(null);
  const [hata, setHata] = useState("");

  const mesajDurum = useMemo(() => netgsmSmsMesajGecerliMi(mesaj), [mesaj]);

  const gecerliAlicilar = useMemo(
    () => alicilar.filter((a) => !a.hata),
    [alicilar]
  );
  const hataliAlicilar = useMemo(
    () => alicilar.filter((a) => a.hata),
    [alicilar]
  );

  async function excelYukle(file: File | null) {
    setExcelUyari("");
    setSonuc(null);
    if (!file) return;
    try {
      const buf = await file.arrayBuffer();
      const { alicilar: yeni, uyari } = exceldenTopluSmsAliciOku(buf);
      if (uyari) setExcelUyari(uyari);
      setAlicilar((onceki) => {
        const map = new Map<string, TopluSmsAlici>();
        for (const a of onceki) {
          if (!a.hata) map.set(a.telefon, a);
        }
        for (const a of yeni) {
          if (a.hata) continue;
          if (!map.has(a.telefon)) map.set(a.telefon, a);
        }
        const hatalilar = [
          ...onceki.filter((a) => a.hata),
          ...yeni.filter((a) => a.hata),
        ];
        return [...map.values(), ...hatalilar];
      });
    } catch {
      setExcelUyari("Excel okunamadı. .xlsx veya .csv deneyin.");
    }
  }

  function elleEkle() {
    setElleHata("");
    const r = elleTelefonEkle(elleTel, alicilar);
    if (r.hata) {
      setElleHata(r.hata);
      return;
    }
    if (r.alici) {
      setAlicilar((a) => [...a, r.alici!]);
      setElleTel("");
    }
  }

  function aliciSil(telefon: string) {
    setAlicilar((a) => a.filter((x) => x.telefon !== telefon));
  }

  function listeyiTemizle() {
    setAlicilar([]);
    setSonuc(null);
    setHata("");
  }

  async function gonder() {
    setHata("");
    setSonuc(null);
    if (!mesajDurum.gecerli) {
      setHata(mesajDurum.hata ?? "Mesaj geçersiz.");
      return;
    }
    if (gecerliAlicilar.length === 0) {
      setHata("En az bir geçerli alıcı ekleyin.");
      return;
    }
    const onay = window.confirm(
      `${gecerliAlicilar.length} numaraya SMS gönderilecek (${mesajDurum.parca} SMS parçası / numara). Devam?`
    );
    if (!onay) return;

    setGonderiyor(true);
    try {
      const oturumRes = await fetch("/api/panel/oturum", {
        credentials: "include",
      });
      const oturum = await oturumRes.json().catch(() => ({ yetkili: false }));
      if (!oturum?.yetkili) {
        setHata("Oturum sona ermiş. Tekrar giriş yapıp yeniden deneyin.");
        return;
      }

      const res = await fetch("/api/panel/sms/toplu", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mesaj,
          telefonlar: gecerliAlicilar.map((a) => a.telefon),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        throw new Error(
          "Oturum sona ermiş. Tekrar giriş yapıp yeniden deneyin."
        );
      }
      if (!res.ok) throw new Error(data.error ?? "Gönderim başarısız.");
      setSonuc({
        basarili: data.basarili ?? 0,
        basarisiz: data.basarisiz ?? 0,
        mesajParca: data.mesajParca,
      });
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Gönderim başarısız.");
    } finally {
      setGonderiyor(false);
    }
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Toplu SMS</h2>
          <p className="text-sm text-slate-500">
            Excel yükleyin veya elle numara ekleyin · Netgsm XML toplu gönderim
          </p>
        </div>
        <Link
          href="/panel/sms"
          className="text-sm text-amber-600 font-medium self-end"
        >
          ← SMS sağlık
        </Link>
      </div>

      <Card className="space-y-3">
        <h3 className="font-semibold text-slate-800">Excel yükle</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          İlk satır başlık olmalı. Zorunlu sütun:{" "}
          <code className="bg-slate-100 px-1 rounded">telefon</code> (veya tel /
          phone / gsm / cep). İsteğe bağlı:{" "}
          <code className="bg-slate-100 px-1 rounded">ad</code>. Örnek:{" "}
          <code className="bg-slate-100 px-1 rounded">telefon,ad</code> →{" "}
          <code className="bg-slate-100 px-1 rounded">05321234567,Ali</code>
        </p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          onChange={(e) => void excelYukle(e.target.files?.[0] ?? null)}
        />
        {excelUyari && (
          <p className="text-sm text-amber-700">{excelUyari}</p>
        )}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-semibold text-slate-800">Elle numara ekle</h3>
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[12rem]">
            <Field
              label="Telefon"
              value={elleTel}
              onChange={(e) => setElleTel(e.target.value)}
              placeholder="0532 123 45 67"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  elleEkle();
                }
              }}
            />
          </div>
          <Btn type="button" variant="secondary" onClick={elleEkle}>
            Ekle
          </Btn>
        </div>
        {elleHata && <p className="text-sm text-red-600">{elleHata}</p>}
      </Card>

      <Card className="space-y-3">
        <div className="flex flex-wrap justify-between gap-2 items-baseline">
          <h3 className="font-semibold text-slate-800">
            Alıcılar{" "}
            <span className="text-sm font-normal text-slate-500">
              ({gecerliAlicilar.length} geçerli
              {hataliAlicilar.length > 0
                ? ` · ${hataliAlicilar.length} hatalı`
                : ""}
              )
            </span>
          </h3>
          {alicilar.length > 0 && (
            <button
              type="button"
              onClick={listeyiTemizle}
              className="text-xs text-red-600 font-medium"
            >
              Listeyi temizle
            </button>
          )}
        </div>
        {alicilar.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz alıcı yok.</p>
        ) : (
          <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-sm">
            {alicilar.map((a) => (
              <li
                key={`${a.telefon}-${a.kaynak}-${a.hata ?? ""}`}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div>
                  <p
                    className={
                      a.hata
                        ? "text-red-700 font-medium"
                        : "text-slate-900 font-medium"
                    }
                  >
                    {a.hata ? a.telefon : telefonMaskele(a.telefon)}
                    {a.ad ? (
                      <span className="text-slate-500 font-normal">
                        {" "}
                        · {a.ad}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-400">
                    {a.kaynak === "excel" ? "Excel" : "Elle"}
                    {a.hata ? ` · ${a.hata}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => aliciSil(a.telefon)}
                  className="text-xs text-slate-500 hover:text-red-600"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="space-y-3">
        <TextArea
          label="SMS metni"
          value={mesaj}
          onChange={(e) => setMesaj(e.target.value)}
          rows={5}
          placeholder="Gönderilecek mesaj…"
          maxLength={NETGSM_TOPLU_SMS_MAX_BIRIM}
        />
        <div className="flex flex-wrap justify-between gap-2 text-xs">
          <p className="text-slate-500">
            Netgsm Türkçe: 1 SMS = {NETGSM_TOPLU_SMS_BIRIM} birim · ç/ğ/ı/ş = 2
            birim · üst sınır {NETGSM_TOPLU_SMS_MAX_BIRIM} birim (
            {NETGSM_TOPLU_SMS_MAX_BIRIM / NETGSM_TOPLU_SMS_BIRIM} SMS)
          </p>
          <p
            className={
              mesajDurum.birim > NETGSM_TOPLU_SMS_MAX_BIRIM
                ? "text-red-600 font-semibold"
                : mesajDurum.parca > 1
                  ? "text-amber-700 font-medium"
                  : "text-slate-600"
            }
          >
            {mesajDurum.birim} / {NETGSM_TOPLU_SMS_MAX_BIRIM} birim ·{" "}
            {mesajDurum.parca || 0} SMS
            {mesajDurum.parca > 1 ? " (uzun SMS)" : ""}
          </p>
        </div>
        {mesajDurum.hata && mesaj.trim() && (
          <p className="text-sm text-red-600">{mesajDurum.hata}</p>
        )}
      </Card>

      {hata && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{hata}</p>
        </Card>
      )}

      {sonuc && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-900 font-medium">
            Gönderim tamamlandı: {sonuc.basarili} başarılı
            {sonuc.basarisiz > 0 ? `, ${sonuc.basarisiz} başarısız` : ""}
            {sonuc.mesajParca
              ? ` · mesaj ${sonuc.mesajParca} SMS parçası`
              : ""}
          </p>
          <Link
            href="/panel/sms"
            className="text-xs text-amber-700 font-medium mt-1 inline-block"
          >
            SMS kayıtlarına bak →
          </Link>
        </Card>
      )}

      <Btn
        type="button"
        disabled={
          gonderiyor ||
          gecerliAlicilar.length === 0 ||
          !mesajDurum.gecerli
        }
        onClick={() => void gonder()}
      >
        {gonderiyor
          ? "Gönderiliyor…"
          : `${gecerliAlicilar.length} kişiye SMS gönder`}
      </Btn>
    </div>
  );
}
