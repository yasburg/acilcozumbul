"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui";
import { PanelGirisForm } from "@/components/panel/PanelGirisForm";
import { supabaseYapilandirmaHataMesaji } from "@/lib/supabase/env";

interface Ozet {
  cekiciSayisi: number;
  talepSayisi: number;
  smsSayisi: number;
  smsGonderilen: number;
  smsDurum: { gercekGonderim: boolean; saglayici: string };
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
        if (!iptal) setYetkili(!!d.yetkili);
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

  const kartlar = [
    {
      label: "Kayıtlı çekici",
      value: ozet.cekiciSayisi,
      href: "/panel/cekiciler",
      color: "text-amber-600",
    },
    {
      label: "Müşteri talebi",
      value: ozet.talepSayisi,
      href: "/panel/talepler",
      color: "text-blue-600",
    },
    {
      label: "SMS kaydı",
      value: ozet.smsSayisi,
      href: "/panel/sms",
      color: "text-emerald-600",
      sub: `${ozet.smsGonderilen} gönderildi`,
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

      <Card
        className={
          ozet.smsDurum.gercekGonderim
            ? "bg-emerald-50 border-emerald-200"
            : "bg-amber-50 border-amber-200"
        }
      >
        <p className="text-sm font-medium text-slate-800">
          SMS:{" "}
          {ozet.smsDurum.gercekGonderim
            ? `Aktif (${ozet.smsDurum.saglayici})`
            : "Yapılandırılmamış — gönderim yapılmaz"}
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {kartlar.map((k) => (
          <Link key={k.href} href={k.href}>
            <Card className="hover:border-amber-300 transition h-full">
              <p className="text-sm text-slate-500">{k.label}</p>
              <p className={`text-3xl font-bold mt-1 ${k.color}`}>{k.value}</p>
              {k.sub && (
                <p className="text-xs text-slate-500 mt-1">{k.sub}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

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
            <Link href="/cekici/kayit" className="text-amber-600 font-medium">
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
