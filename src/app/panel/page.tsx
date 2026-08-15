"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PanelGirisForm } from "@/components/panel/PanelGirisForm";
import { HizmetVerenSayimPanel } from "@/components/panel/HizmetVerenSayimPanel";
import { KullaniciSayisiGrafik } from "@/components/panel/KullaniciSayisiGrafik";
import { supabaseYapilandirmaHataMesaji } from "@/lib/supabase/env";
import type { HizmetVerenSayimOzet } from "@/lib/hizmet-veren-sayim";
import type { CekiciKayitGunNokta } from "@/lib/cekici-kayit-serisi";
import type { PanelGelirOzet } from "@/lib/panel-gelir-ozet";

interface Ozet {
  cekiciSayisi: number;
  talepSayisi: number;
  smsSayisi: number;
  smsGonderilen: number;
  smsDurum: { gercekGonderim: boolean; saglayici: string };
  huni?: {
    gun: number;
    formBasla: number;
    otpGonder: number;
    otpDogrulandi: number;
    talepOlustur: number;
    teklifVar: number;
    kazanan: number;
  };
  smsSaglik?: {
    pencereSaat: number;
    hataOraniYuzde: number;
    alarm: boolean;
    basarisiz: number;
    toplam: number;
  };
  hizmetVerenler?: HizmetVerenSayimOzet;
  kullaniciSerisi?: CekiciKayitGunNokta[];
  gelir?: PanelGelirOzet;
}

function hataMesajiFromParam(hata: string | null): string {
  if (hata === "supabase-yok") {
    return (
      supabaseYapilandirmaHataMesaji() ||
      "Supabase anahtarları tanımlı değil."
    );
  }
  if (hata === "yetkisiz") return "Bu e-postanın panele erişim yetkisi yok.";
  return "";
}

function ayEtiketi(ay: string): string {
  const [y, m] = ay.split("-").map(Number);
  if (!y || !m) return ay;
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function paketDagilimMetni(
  dagilim: { paketTl: number; adet: number }[]
): string | undefined {
  if (!dagilim.length) return undefined;
  return dagilim
    .map((p) => `${p.adet}×${p.paketTl.toLocaleString("tr-TR")} ₺`)
    .join(" · ");
}

function tl(n: number): string {
  return `${Math.round(n).toLocaleString("tr-TR")} ₺`;
}

function PanelIcerik() {
  const searchParams = useSearchParams();
  const nextHref = searchParams.get("next") || "/panel";
  const hataParam = searchParams.get("hata");

  const [yetkili, setYetkili] = useState<boolean | null>(null);
  const [ozet, setOzet] = useState<Ozet | null>(null);
  const [ozetYukleniyor, setOzetYukleniyor] = useState(false);

  useEffect(() => {
    let iptal = false;
    void fetch("/api/panel/oturum", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { yetkili: false }))
      .then((d) => {
        if (!iptal) setYetkili(Boolean(d.yetkili || d.eposta));
      })
      .catch(() => {
        if (!iptal) setYetkili(false);
      });
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    if (yetkili !== true) return;
    let iptal = false;
    setOzetYukleniyor(true);
    void fetch("/api/panel/ozet", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!iptal) setOzet(d);
      })
      .finally(() => {
        if (!iptal) setOzetYukleniyor(false);
      });
    return () => {
      iptal = true;
    };
  }, [yetkili]);

  if (yetkili === null) {
    return (
      <p className="text-slate-500 text-sm py-12 text-center">Yükleniyor…</p>
    );
  }

  if (!yetkili) {
    return (
      <PanelGirisForm
        nextHref={nextHref}
        hataMesaji={hataMesajiFromParam(hataParam)}
      />
    );
  }

  if (ozetYukleniyor) {
    return <p className="text-slate-500 text-sm">Yükleniyor…</p>;
  }

  if (!ozet) {
    return <p className="text-red-600 text-sm">Özet yüklenemedi.</p>;
  }

  const gelir = ozet.gelir;
  const ayAdi = gelir ? ayEtiketi(gelir.ay) : "";

  const kartlar = [
    {
      label: "Kayıtlı çekici",
      value: String(ozet.cekiciSayisi),
      href: "/panel/cekiciler",
      color: "text-amber-600",
      sub: undefined as string | undefined,
      cardClass: undefined as string | undefined,
    },
    {
      label: "Müşteri talebi",
      value: String(ozet.talepSayisi),
      href: "/panel/talepler",
      color: "text-blue-600",
      sub: undefined as string | undefined,
      cardClass: undefined as string | undefined,
    },
    {
      label: "SMS kaydı",
      value: String(ozet.smsSayisi),
      href: "/panel/sms",
      color: "text-emerald-600",
      sub: `${ozet.smsGonderilen} gönderildi`,
      cardClass: undefined as string | undefined,
    },
    {
      label: "SMS durumu",
      value: ozet.smsDurum.gercekGonderim
        ? "Aktif"
        : "Kapalı",
      href: "/panel/sms",
      color: ozet.smsDurum.gercekGonderim
        ? ozet.smsSaglik?.alarm
          ? "text-red-600"
          : "text-emerald-600"
        : "text-amber-600",
      sub: ozet.smsDurum.gercekGonderim
        ? [
            ozet.smsDurum.saglayici,
            ozet.smsSaglik && ozet.smsSaglik.toplam > 0
              ? `Son 24s hata: %${ozet.smsSaglik.hataOraniYuzde} (${ozet.smsSaglik.basarisiz}/${ozet.smsSaglik.toplam})`
              : null,
            ozet.smsSaglik?.alarm ? "Alarm eşiği aşıldı" : null,
          ]
            .filter(Boolean)
            .join(" · ")
        : "Yapılandırılmamış — gönderim yapılmaz",
      cardClass: ozet.smsDurum.gercekGonderim
        ? ozet.smsSaglik?.alarm
          ? "bg-red-50 border-red-200"
          : "bg-emerald-50 border-emerald-200"
        : "bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Özet</h2>
        <p className="text-sm text-slate-500 mt-1">
          Kullanıcı ve talep verilerine buradan ulaşın.
        </p>
      </div>

      {gelir && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="bg-slate-50 border-slate-200">
            <p className="text-sm text-slate-600">
              Aylık alınan paketler
              {ayAdi ? ` · ${ayAdi}` : ""}
            </p>
            <p className="text-3xl font-bold mt-1 text-slate-900 tabular-nums">
              {gelir.aylikPaketler.adet}
              <span className="text-lg font-semibold text-slate-600 ml-2">
                paket
              </span>
            </p>
            <p className="text-sm font-medium text-slate-700 mt-1 tabular-nums">
              {tl(gelir.aylikPaketler.tutarTl)}
              {gelir.aylikPaketler.kredi > 0
                ? ` · ${gelir.aylikPaketler.kredi.toLocaleString("tr-TR")} kredi`
                : ""}
            </p>
            {paketDagilimMetni(gelir.aylikPaketler.paketDagilim) && (
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {paketDagilimMetni(gelir.aylikPaketler.paketDagilim)}
              </p>
            )}
          </Card>

          <Link href="/panel/kredi-odemeler">
            <Card className="bg-amber-50 border-amber-200 hover:border-amber-400 transition h-full">
              <p className="text-sm text-amber-800/80">
                Bu ay alınan krediler
                {ayAdi ? ` · ${ayAdi}` : ""}
              </p>
              <p className="text-3xl font-bold mt-1 text-amber-900 tabular-nums">
                {gelir.satinAlinanKrediler.kredi.toLocaleString("tr-TR")}
                <span className="text-lg font-semibold text-amber-700 ml-2">
                  kredi
                </span>
              </p>
              <p className="text-sm font-medium text-amber-800 mt-1 tabular-nums">
                {tl(gelir.satinAlinanKrediler.tutarTl)}
                {gelir.satinAlinanKrediler.adet > 0
                  ? ` · ${gelir.satinAlinanKrediler.adet} işlem`
                  : ""}
              </p>
              {paketDagilimMetni(gelir.satinAlinanKrediler.paketDagilim) && (
                <p className="text-xs text-amber-700/80 mt-2 leading-relaxed">
                  {paketDagilimMetni(gelir.satinAlinanKrediler.paketDagilim)}
                </p>
              )}
            </Card>
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kartlar.map((k) => (
          <Link key={k.label} href={k.href}>
            <Card
              className={`hover:border-amber-300 transition h-full ${k.cardClass ?? ""}`}
            >
              <p className="text-sm text-slate-500">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              {k.sub && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {k.sub}
                </p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      {ozet.kullaniciSerisi && ozet.kullaniciSerisi.length > 0 && (
        <KullaniciSayisiGrafik seri={ozet.kullaniciSerisi} />
      )}

      {ozet.huni && (
        <Card>
          <h3 className="font-semibold text-slate-800 mb-1">
            Talep hunisi (son {ozet.huni.gun} gün)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Form başlangıcı → talep → OTP (teklif seçimi) → en az 1 teklif →
            kazanan
          </p>
          <div className="space-y-2">
            {[
              { label: "Form başladı", v: ozet.huni.formBasla },
              { label: "Talep oluştu", v: ozet.huni.talepOlustur },
              { label: "OTP gönderildi", v: ozet.huni.otpGonder },
              { label: "OTP doğrulandı", v: ozet.huni.otpDogrulandi },
              { label: "≥1 teklif", v: ozet.huni.teklifVar },
              { label: "Kazanan belli", v: ozet.huni.kazanan },
            ].map((adim, i, arr) => {
              const ust = i > 0 ? arr[i - 1].v : null;
              const oran =
                ust && ust > 0 ? Math.round((adim.v / ust) * 100) : null;
              return (
                <div
                  key={adim.label}
                  className="flex items-center justify-between gap-3 text-sm border-b border-slate-100 pb-2 last:border-0"
                >
                  <span className="text-slate-600">{adim.label}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {adim.v}
                    {oran != null && (
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        ({oran}%)
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {ozet.hizmetVerenler && (
        <HizmetVerenSayimPanel ozet={ozet.hizmetVerenler} />
      )}

      <Card>
        <h3 className="font-semibold text-slate-800 mb-3">Hızlı erişim</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/panel/cekiciler" className="text-amber-600 font-medium">
              Çekiciler →
            </Link>{" "}
            Kayıtlı çekici listesi, panele geçiş
          </li>
          <li>
            <Link href="/panel/talepler" className="text-amber-600 font-medium">
              Talepler →
            </Link>{" "}
            Müşteri talepleri ve bekleme sayfaları
          </li>
          <li>
            <Link href="/panel/sms" className="text-amber-600 font-medium">
              SMS →
            </Link>{" "}
            Gönderim geçmişi
          </li>
          <li>
            <Link href="/kayit/a" className="text-amber-600 font-medium">
              Yeni çekici kaydı →
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}

export default function PanelPage() {
  return (
    <Suspense
      fallback={
        <p className="text-slate-500 text-sm py-12 text-center">Yükleniyor…</p>
      }
    >
      <PanelIcerik />
    </Suspense>
  );
}
