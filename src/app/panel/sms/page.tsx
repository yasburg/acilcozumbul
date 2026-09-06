"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import type { SmsKaydi } from "@/lib/types";
import type { SesliMesajKaydi, SesliSaglikOzet } from "@/lib/sesli-mesaj-log";

function sesliStateEtiket(state: number | null | undefined): string {
  if (state === 1) return "acilan";
  if (state === 2) return "cevaplanmayan";
  if (state === 3) return "ulasilamayan";
  if (state === 7) return "mesgul";
  if (state == null) return "bilinmiyor";
  return `state_${state}`;
}

type Saglik = {
  pencereSaat: number;
  toplam: number;
  basarili: number;
  basarisiz: number;
  hataOraniYuzde: number;
  alarm: boolean;
  alarmEsikYuzde: number;
  netgsmHataKodlari: Record<string, number>;
  sonBasarisiz: Array<{
    gonderim: string;
    telefon: string;
    hata?: string;
    aliciTipi?: string;
  }>;
};

type TabId = "sms" | "whatsapp" | "sesli";

const STATE_LABEL: Record<string, string> = {
  acilan: "Açılan",
  cevaplanmayan: "Cevaplanmayan",
  ulasilamayan: "Ulaşılamayan",
  mesgul: "Meşgul",
  bilinmiyor: "Bilinmiyor",
};

export default function PanelSmsPage() {
  const [tab, setTab] = useState<TabId>("sms");
  const [kayitlar, setKayitlar] = useState<SmsKaydi[]>([]);
  const [durum, setDurum] = useState<{
    gercekGonderim: boolean;
    saglayici: string;
  } | null>(null);
  const [saglik, setSaglik] = useState<{
    son24Saat: Saglik;
    son7Gun: Saglik;
  } | null>(null);
  const [sesli, setSesli] = useState<{
    son24Saat: SesliSaglikOzet;
    son7Gun: SesliSaglikOzet;
    sonKayitlar: SesliMesajKaydi[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // WhatsApp Durumu ve Test Formu State
  const [waDurum, setWaDurum] = useState<{
    yapilandirildi: boolean;
    aktif: boolean;
    phoneNumberId: string | null;
    businessAccountId: string | null;
    fallbackToSms: boolean;
    apiVersion: string;
  } | null>(null);
  const [waTestTel, setWaTestTel] = useState("");
  const [waTestMesaj, setWaTestMesaj] = useState("");
  const [waTestSablon, setWaTestSablon] = useState<string>("text");
  const [waTestLoading, setWaTestLoading] = useState(false);
  const [waTestSonuc, setWaTestSonuc] = useState<{
    basarili?: boolean;
    hata?: string;
    mesajId?: string;
    saglayici?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/panel/sms", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setKayitlar(d.kayitlar ?? []);
        setDurum(d.durum ?? null);
        setSaglik(d.saglik ?? null);
        setSesli(d.sesli ?? null);
      })
      .finally(() => setLoading(false));

    fetch("/api/panel/whatsapp/test", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setWaDurum(d))
      .catch(() => null);
  }, []);

  const s24 = saglik?.son24Saat;
  const v24 = sesli?.son24Saat;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">SMS sağlık panosu</h2>
          <p className="text-sm text-slate-500">
            Netgsm SMS ve sesli mesaj gönderim / durum özeti
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <Link
            href="/panel/sms/toplu"
            className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
          >
            Toplu SMS gönder
          </Link>
          <Link
            href="/panel/sms/sablonlar"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            SMS şablonları
          </Link>
          <Link
            href="/panel/sesli-mesaj"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Sesli demo
          </Link>
          <Link
            href="/demo/sms"
            className="text-sm text-amber-600 font-medium self-end"
          >
            Netgsm test →
          </Link>
        </div>
      </div>

      <div
        className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 w-fit"
        role="tablist"
        aria-label="Sağlık panosu sekmeleri"
      >
        {(
          [
            { id: "sms" as const, label: "SMS" },
            { id: "whatsapp" as const, label: "WhatsApp" },
            { id: "sesli" as const, label: "Sesli mesaj" },
          ] as const
        ).map((t) => {
          const aktif = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={aktif}
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                aktif
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "sms" && (
        <>
          {durum && (
            <Card
              className={
                durum.gercekGonderim
                  ? s24?.alarm
                    ? "bg-red-50 border-red-200"
                    : "bg-emerald-50 border-emerald-200"
                  : "bg-amber-50 border-amber-200"
              }
            >
              <p className="text-sm font-medium">
                {durum.gercekGonderim
                  ? `Gerçek gönderim: ${durum.saglayici}`
                  : "Demo — Netgsm yapılandırılmamış"}
              </p>
              {s24 && s24.toplam > 0 && (
                <p
                  className={`text-sm mt-2 ${
                    s24.alarm ? "text-red-800 font-semibold" : "text-slate-700"
                  }`}
                >
                  Son 24 saat: {s24.basarili} başarılı, {s24.basarisiz} başarısız
                  — hata oranı %{s24.hataOraniYuzde}
                  {s24.alarm &&
                    ` (alarm: ≥%${s24.alarmEsikYuzde}, min ${10} SMS)`}
                </p>
              )}
            </Card>
          )}

          {saglik && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SaglikKart baslik="Son 24 saat" veri={saglik.son24Saat} />
              <SaglikKart baslik="Son 7 gün" veri={saglik.son7Gun} />
            </div>
          )}

          {s24 && Object.keys(s24.netgsmHataKodlari).length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-2">
                Netgsm hata kodları (24 saat)
              </h3>
              <ul className="text-sm space-y-1">
                {Object.entries(s24.netgsmHataKodlari).map(([kod, adet]) => (
                  <li key={kod} className="flex justify-between">
                    <span className="font-mono text-slate-600">{kod}</span>
                    <span className="font-semibold">{adet}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {s24 && s24.sonBasarisiz.length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-2">
                Son başarısız SMS
              </h3>
              <ul className="space-y-2 text-sm">
                {s24.sonBasarisiz.map((b, i) => (
                  <li
                    key={i}
                    className="border-b border-slate-100 pb-2 last:border-0"
                  >
                    <span className="text-slate-500">
                      {new Date(b.gonderim).toLocaleString("tr-TR")} ·{" "}
                      {b.aliciTipi ?? "?"} · {b.telefon}
                    </span>
                    {b.hata && (
                      <p className="text-red-700 text-xs mt-0.5">{b.hata}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

          {!loading && kayitlar.length === 0 && (
            <Card>
              <p className="text-slate-600 text-sm">Henüz SMS kaydı yok.</p>
            </Card>
          )}

          <h3 className="font-semibold text-slate-800 pt-2">Son kayıtlar</h3>
          <div className="space-y-3">
            {kayitlar.map((k) => (
              <Card key={k.id} className="text-sm">
                <div className="flex flex-wrap justify-between gap-2 mb-2">
                  <span className="font-medium text-slate-800">
                    {k.aliciTipi === "musteri" ? "Müşteri" : "Çekici"} ·{" "}
                    {k.cekiciTelefon}
                  </span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      k.gonderildi
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {k.gonderildi ? "Gönderildi" : "Gönderilmedi"}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{k.mesaj}</p>
                {!k.gonderildi && k.hata && (
                  <p className="text-xs text-red-600 mt-1">{k.hata}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  {new Date(k.gonderim).toLocaleString("tr-TR")}
                  {k.saglayici ? ` · ${k.saglayici}` : ""}
                </p>
                {k.link && (
                  <a
                    href={k.link}
                    className="text-xs text-amber-600 break-all mt-1 inline-block"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {k.link}
                  </a>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {tab === "whatsapp" && (
        <div className="space-y-4">
          <Card
            className={
              waDurum?.aktif
                ? "bg-emerald-50 border-emerald-200"
                : waDurum?.yapilandirildi
                ? "bg-amber-50 border-amber-200"
                : "bg-slate-50 border-slate-200"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">
                  WhatsApp Business Cloud API Durumu
                </h3>
                <p className="text-sm text-slate-600 mt-0.5">
                  {waDurum?.aktif
                    ? "WhatsApp Cloud API aktif — tüm bildirimler öncelikle WhatsApp ile iletilir."
                    : waDurum?.yapilandirildi
                    ? "Kimlik bilgileri tanımlı ancak WHATSAPP_ENABLED kapalı (veya NOTIFICATION_CHANNEL=sms)."
                    : "WhatsApp henüz yapılandırılmamış (.env içinde WHATSAPP_TOKEN ve WHATSAPP_PHONE_NUMBER_ID gereklidir)."}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  waDurum?.aktif
                    ? "bg-emerald-200 text-emerald-900"
                    : waDurum?.yapilandirildi
                    ? "bg-amber-200 text-amber-900"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {waDurum?.aktif
                  ? "Aktif (Gönderime Hazır)"
                  : waDurum?.yapilandirildi
                  ? "Yapılandırıldı (Devre Dışı)"
                  : "Yapılandırılmamış"}
              </span>
            </div>

            {waDurum && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-200/60 pt-3">
                <div>
                  <span className="text-slate-500 block">Phone Number ID:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {waDurum.phoneNumberId || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">WABA ID:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {waDurum.businessAccountId || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">API Versiyonu:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {waDurum.apiVersion}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">SMS Fallback (Yedek):</span>
                  <span
                    className={`font-medium ${
                      waDurum.fallbackToSms
                        ? "text-emerald-700 font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    {waDurum.fallbackToSms ? "Açık (Netgsm)" : "Kapalı"}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Test Gönderim Kutusu */}
            <Card>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                WhatsApp Test Mesajı Gönder
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Sandbox / Developer modundaysanız numaranızın Meta panelinde Test
                Alıcısı olarak ekli olduğundan emin olun.
              </p>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!waTestTel.trim()) return;
                  setWaTestLoading(true);
                  setWaTestSonuc(null);
                  try {
                    const res = await fetch("/api/panel/whatsapp/test", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        telefon: waTestTel,
                        mesaj: waTestSablon === "text" ? waTestMesaj : undefined,
                        sablon:
                          waTestSablon !== "text" ? waTestSablon : undefined,
                      }),
                    });
                    const data = await res.json();
                    setWaTestSonuc(data);
                  } catch (err) {
                    setWaTestSonuc({ basarili: false, hata: String(err) });
                  } finally {
                    setWaTestLoading(false);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    placeholder="05XXXXXXXXX"
                    value={waTestTel}
                    onChange={(e) => setWaTestTel(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mesaj / Şablon Tipi
                  </label>
                  <select
                    value={waTestSablon}
                    onChange={(e) => setWaTestSablon(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="text">
                      Serbest Metin (24 saat sohbet penceresi veya sandbox)
                    </option>
                    <option value="otp">Şablon: Doğrulama Kodu (OTP)</option>
                    <option value="yeni_talep">Şablon: Yeni Talep (Çekici)</option>
                    <option value="talep_alindi">
                      Şablon: Talep Alındı (Müşteri)
                    </option>
                    <option value="yeni_teklif">
                      Şablon: Yeni Teklif (Müşteri)
                    </option>
                    <option value="musteri_secildi">
                      Şablon: Müşteri Seçti (Çekici)
                    </option>
                  </select>
                </div>

                {waTestSablon === "text" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Metin İçeriği (İsteğe bağlı)
                    </label>
                    <textarea
                      placeholder="acilcozumbul.com: Test WhatsApp mesajı"
                      value={waTestMesaj}
                      onChange={(e) => setWaTestMesaj(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={waTestLoading || !waTestTel.trim()}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {waTestLoading ? "Gönderiliyor…" : "WhatsApp Test Gönder"}
                </button>
              </form>

              {waTestSonuc && (
                <div
                  className={`mt-4 rounded-lg p-3 text-xs ${
                    waTestSonuc.basarili
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "bg-red-50 text-red-900 border border-red-200"
                  }`}
                >
                  <p className="font-semibold">
                    {waTestSonuc.basarili
                      ? "✓ Test Mesajı Başarıyla İletildi!"
                      : "✕ Gönderim Başarısız"}
                  </p>
                  {waTestSonuc.mesajId && (
                    <p className="mt-1 font-mono">
                      Mesaj ID: {waTestSonuc.mesajId}
                    </p>
                  )}
                  {waTestSonuc.hata && (
                    <p className="mt-1 leading-relaxed">{waTestSonuc.hata}</p>
                  )}
                </div>
              )}
            </Card>

            {/* Meta Şablonları Bilgilendirme */}
            <Card>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                Meta Onaylı Mesaj Şablonları (HSM)
              </h3>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                WhatsApp Business politikasında 24 saattir mesaj atmamış
                alıcılara outbound mesaj göndermek için Meta onaylı şablon
                zorunludur.
              </p>

              <div className="space-y-2 text-xs">
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <span className="font-semibold text-slate-800 block">
                    dogrulama_kodu (AUTHENTICATION)
                  </span>
                  <span className="text-slate-600 font-mono">
                    acilcozumbul.com dogrulama kodunuz: &#123;&#123;1&#125;&#125;
                  </span>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <span className="font-semibold text-slate-800 block">
                    yeni_talep_cekici (UTILITY)
                  </span>
                  <span className="text-slate-600 font-mono">
                    Yeni yol yardim talebi: &#123;&#123;1&#125;&#125;. Link: &#123;&#123;2&#125;&#125;
                  </span>
                </div>
                <div className="rounded border border-slate-200 bg-slate-50 p-2">
                  <span className="font-semibold text-slate-800 block">
                    yeni_teklif_musteri (UTILITY)
                  </span>
                  <span className="text-slate-600 font-mono">
                    acilcozumbul.com: Teklif geldi. Goruntulemek icin: &#123;&#123;1&#125;&#125;
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Webhook URL: <code className="font-mono">/api/webhooks/whatsapp</code>
                </span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "sesli" && (
        <>
          <Card className="bg-slate-50 border-slate-200">
            <p className="text-sm text-slate-700 leading-relaxed">
              Gönderim adedi uygulama logundan; açılma / tuş Netgsm webhook
              raporlarından gelir. Migration{" "}
              <code className="text-xs bg-white px-1 rounded border">
                062_sesli_mesaj_log
              </code>{" "}
              uygulanmış olmalı.
            </p>
            {v24 && (
              <p className="text-sm text-slate-800 mt-2 font-medium">
                Son 24 saat: {v24.gonderimBasarili} gönderim · {v24.acilan} açılan
                · {v24.tusTiklama} tuş
              </p>
            )}
          </Card>

          {sesli && (
            <div className="grid gap-4 sm:grid-cols-2">
              <SesliSaglikKart baslik="Son 24 saat" veri={sesli.son24Saat} />
              <SesliSaglikKart baslik="Son 7 gün" veri={sesli.son7Gun} />
            </div>
          )}

          {v24 && Object.keys(v24.tusDagilim).length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-2">
                Tuş dağılımı (24 saat)
              </h3>
              <ul className="text-sm space-y-1">
                {Object.entries(v24.tusDagilim)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([tus, adet]) => (
                    <li key={tus} className="flex justify-between">
                      <span className="text-slate-600">Tuş {tus}</span>
                      <span className="font-semibold">{adet}</span>
                    </li>
                  ))}
              </ul>
            </Card>
          )}

          {v24 && Object.keys(v24.stateDagilim).length > 0 && (
            <Card>
              <h3 className="font-semibold text-slate-800 mb-2">
                Durum dağılımı (24 saat)
              </h3>
              <ul className="text-sm space-y-1">
                {Object.entries(v24.stateDagilim).map(([k, adet]) => (
                  <li key={k} className="flex justify-between">
                    <span className="text-slate-600">
                      {STATE_LABEL[k] ?? k}
                    </span>
                    <span className="font-semibold">{adet}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {loading && <p className="text-sm text-slate-500">Yükleniyor…</p>}

          {!loading && (!sesli || sesli.sonKayitlar.length === 0) && (
            <Card>
              <p className="text-slate-600 text-sm">
                Henüz sesli mesaj kaydı yok. Yeni aramalardan sonra burada
                görünecek.
              </p>
            </Card>
          )}

          {sesli && sesli.sonKayitlar.length > 0 && (
            <>
              <h3 className="font-semibold text-slate-800 pt-2">
                Son sesli kayıtlar
              </h3>
              <div className="space-y-3">
                {sesli.sonKayitlar.map((k) => (
                  <Card key={k.id} className="text-sm">
                    <div className="flex flex-wrap justify-between gap-2 mb-1">
                      <span className="font-medium text-slate-800">
                        {k.olayTipi === "gonderim" ? "Gönderim" : "Rapor"}
                        {k.sablonId ? ` · ${k.sablonId}` : ""}
                        {k.telefon ? ` · ${k.telefon}` : ""}
                      </span>
                      {k.olayTipi === "gonderim" ? (
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            k.basarili
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {k.basarili ? "OK" : "Hata"}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {STATE_LABEL[sesliStateEtiket(k.state)] ??
                            sesliStateEtiket(k.state)}
                          {k.pushButton != null &&
                          k.pushButton !== "" &&
                          k.pushButton !== "-1"
                            ? ` · tuş ${k.pushButton}`
                            : ""}
                        </span>
                      )}
                    </div>
                    {k.hata && (
                      <p className="text-xs text-red-600 mt-0.5">{k.hata}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(k.olusturulma).toLocaleString("tr-TR")}
                      {k.bulkid ? ` · bulk ${k.bulkid}` : ""}
                    </p>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function SaglikKart({ baslik, veri }: { baslik: string; veri: Saglik }) {
  return (
    <Card>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{baslik}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{veri.toplam}</p>
      <p className="text-sm text-slate-600 mt-1">
        {veri.basarili} OK · {veri.basarisiz} hata
      </p>
      <p
        className={`text-sm font-medium mt-2 ${
          veri.alarm ? "text-red-700" : "text-emerald-700"
        }`}
      >
        Hata oranı %{veri.hataOraniYuzde}
      </p>
    </Card>
  );
}

function SesliSaglikKart({
  baslik,
  veri,
}: {
  baslik: string;
  veri: SesliSaglikOzet;
}) {
  return (
    <Card>
      <p className="text-xs text-slate-500 uppercase tracking-wide">{baslik}</p>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Gönderim</dt>
          <dd className="text-xl font-bold text-slate-900">{veri.gonderim}</dd>
          <dd className="text-xs text-slate-500">
            {veri.gonderimBasarili} OK · {veri.gonderimBasarisiz} hata
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Telefon açılma</dt>
          <dd className="text-xl font-bold text-emerald-700">{veri.acilan}</dd>
          <dd className="text-xs text-slate-500">
            {veri.cevaplanmayan} cevap yok · {veri.mesgul} meşgul
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Tuş tıklama</dt>
          <dd className="text-xl font-bold text-amber-700">{veri.tusTiklama}</dd>
          <dd className="text-xs text-slate-500">0–9 geçerli tuş</dd>
        </div>
        <div>
          <dt className="text-slate-500">Rapor</dt>
          <dd className="text-xl font-bold text-slate-900">
            {veri.raporToplam}
          </dd>
          <dd className="text-xs text-slate-500">
            {veri.ulasilamayan} ulaşılamayan
          </dd>
        </div>
      </dl>
    </Card>
  );
}
