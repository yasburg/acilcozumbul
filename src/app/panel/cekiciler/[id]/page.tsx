"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, Btn } from "@/components/ui";
import { OnayliCekiciRozeti } from "@/components/OnayliCekiciRozeti";
import { musaitlikOzeti } from "@/lib/cekici-musaitlik";
import {
  BILDIRIM_SEVIYE_ETIKET,
  cekiciBildirimSeviye,
} from "@/lib/ihale";
import { ilceListesi } from "@/lib/il-ilce";
import { formatKredi } from "@/lib/talep-utils";
import { cekiciToplamKredi } from "@/lib/kredi-bakiye";
import type { CekiciPanelOzet } from "@/lib/panel";
import { SORUN_TIPLERI, gecerliSorunTipi } from "@/lib/sorun-tipleri";
import type { BelgeDurum, HizmetBolgeleri } from "@/lib/types";

type CekiciDetay = CekiciPanelOzet & { token: string };

/** Şehirdeki seçilmeyen (hizmet vermediği) ilçeler */
function hizmetDisiIlceOzeti(bolgeler: HizmetBolgeleri | undefined): string {
  if (!bolgeler || Object.keys(bolgeler).length === 0) return "";
  const satirlar: string[] = [];
  for (const [il, secilen] of Object.entries(bolgeler)) {
    const secili = new Set(
      (secilen ?? []).map((i) => i.trim()).filter(Boolean)
    );
    if (secili.size === 0) continue;
    const disi = ilceListesi(il).filter((i) => !secili.has(i));
    if (disi.length === 0) continue;
    satirlar.push(`${il}: ${disi.join(", ")}`);
  }
  return satirlar.join(" · ");
}

function hizmetSorunEtiketleri(ids: string[]): string {
  const etiketMap = new Map(SORUN_TIPLERI.map((t) => [t.id, t.label]));
  return ids
    .filter(gecerliSorunTipi)
    .map((id) => etiketMap.get(id) ?? id)
    .join(", ");
}

function hizmetSorunAyir(hizmetSorunTipleri: string[] | undefined): {
  verdikleri: string;
  vermedikleri: string;
} {
  const secili = new Set(
    (hizmetSorunTipleri ?? []).filter((id): id is (typeof SORUN_TIPLERI)[number]["id"] =>
      gecerliSorunTipi(id)
    )
  );
  const verdikleriIds = SORUN_TIPLERI.filter((t) => secili.has(t.id)).map(
    (t) => t.id
  );
  const vermedikleriIds = SORUN_TIPLERI.filter((t) => !secili.has(t.id)).map(
    (t) => t.id
  );
  return {
    verdikleri:
      verdikleriIds.length > 0
        ? hizmetSorunEtiketleri(verdikleriIds)
        : "Hiçbiri seçilmemiş",
    vermedikleri:
      vermedikleriIds.length > 0
        ? hizmetSorunEtiketleri(vermedikleriIds)
        : "Yok (tüm hizmetler açık)",
  };
}

export default function PanelCekiciDetayPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cekici, setCekici] = useState<CekiciDetay | null>(null);
  const [loading, setLoading] = useState(true);
  const [oturumYukleniyor, setOturumYukleniyor] = useState(false);
  const [belgeIslem, setBelgeIslem] = useState(false);
  const [redNedeni, setRedNedeni] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [silOnayAcik, setSilOnayAcik] = useState(false);
  const [siliyor, setSiliyor] = useState(false);

  useEffect(() => {
    fetch(`/api/panel/cekiciler/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setCekici(d);
      })
      .catch(() => setCekici(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function belgeKarar(belgeDurum: "onaylandi" | "reddedildi") {
    setBelgeIslem(true);
    setMesaj("");
    setHata("");
    try {
      const res = await fetch(`/api/panel/cekiciler/${id}/belge`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          belgeDurum,
          belgeRedNedeni: belgeDurum === "reddedildi" ? redNedeni : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "İşlem başarısız."
        );
      }

      setMesaj(typeof data.mesaj === "string" ? data.mesaj : "Kaydedildi.");
      setCekici((prev) =>
        prev
          ? {
              ...prev,
              belgeDurum: data.belgeDurum ?? belgeDurum,
              belgeRedNedeni:
                belgeDurum === "reddedildi" ? redNedeni.trim() : undefined,
            }
          : prev
      );

      const yenile = await fetch(`/api/panel/cekiciler/${id}`, {
        credentials: "include",
      });
      if (yenile.ok) {
        setCekici(await yenile.json());
      }
    } catch (e) {
      setHata(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setBelgeIslem(false);
    }
  }

  async function paneleGec() {
    setOturumYukleniyor(true);
    try {
      const res = await fetch(`/api/panel/cekici/${id}/oturum`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(data.redirect);
    } catch {
      alert("Oturum açılamadı.");
    } finally {
      setOturumYukleniyor(false);
    }
  }

  async function cekiciSil() {
    setSiliyor(true);
    setHata("");
    try {
      const res = await fetch(`/api/panel/cekiciler/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Silinemedi."
        );
      }
      router.push("/panel/cekiciler");
      router.refresh();
    } catch (e) {
      setSilOnayAcik(false);
      setHata(e instanceof Error ? e.message : "Silinemedi.");
    } finally {
      setSiliyor(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Yükleniyor…</p>;
  }

  if (!cekici) {
    return (
      <Card>
        <p className="text-red-600 text-sm">Çekici bulunamadı.</p>
        <Link href="/panel/cekiciler" className="text-amber-600 text-sm mt-2 inline-block">
          ← Listeye dön
        </Link>
      </Card>
    );
  }

  const belgeDurum = (cekici.belgeDurum ?? "yok") as BelgeDurum;
  const bildirimSeviye = cekiciBildirimSeviye(cekici);
  const hizmetDisi = hizmetDisiIlceOzeti(cekici.hizmetBolgeleri);
  const sorunHizmet = hizmetSorunAyir(cekici.hizmetSorunTipleri);

  return (
    <div className="space-y-4 max-w-xl">
      <Link href="/panel/cekiciler" className="text-sm text-amber-600 font-medium">
        ← Çekiciler
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-2xl font-bold">{cekici.ad}</h2>
        {cekici.testerHesap && (
          <span className="rounded-md bg-violet-200 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-violet-900">
            Tester
          </span>
        )}
        {cekici.rozetAktif && <OnayliCekiciRozeti />}
      </div>

      {hata && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{hata}</p>
        </Card>
      )}

      {mesaj && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-800">{mesaj}</p>
        </Card>
      )}

      <Card className="space-y-3 text-sm">
        <Row label="Telefon" value={cekici.telefon} />
        <Row
          label="Doğum tarihi"
          value={
            cekici.dogumTarihi
              ? new Date(cekici.dogumTarihi + "T12:00:00").toLocaleDateString(
                  "tr-TR"
                )
              : "—"
          }
        />
        <Row label="Şehir" value={cekici.sehir} />
        <Row label="Kredi" value={formatKredi(cekiciToplamKredi(cekici))} />
        <Row
          label="Teklif"
          value={String(Number(cekici.teklifSayisi) || 0)}
        />
        <Row label="Durum" value={cekici.aktif ? "Aktif" : "Pasif"} />
        <Row
          label="Çalışma saatleri"
          value={musaitlikOzeti(cekici)}
        />
        <Row
          label="Bildirim paketi"
          value={`${bildirimSeviye} — ${BILDIRIM_SEVIYE_ETIKET[bildirimSeviye].baslik}`}
        />
        <Row label="Verdiği hizmetler" value={sorunHizmet.verdikleri} />
        <Row label="Vermediği hizmetler" value={sorunHizmet.vermedikleri} />
        <Row label="Belge durumu" value={belgeDurumEtiket(belgeDurum)} />
        <Row
          label="Rozet"
          value={cekici.rozetAktif ? "Aktif (onaylı çekici)" : "Yok"}
        />
        <Row
          label="Kayıt"
          value={new Date(cekici.kayitTarihi).toLocaleString("tr-TR")}
        />
        <Row
          label="Hizmet bölgesi"
          value={
            cekici.hizmetModu === "konum"
              ? `Konum menzili: ${cekici.menzilKm ?? 0} km`
              : cekici.hizmetBolgeleri &&
                  Object.keys(cekici.hizmetBolgeleri).length > 0
                ? Object.entries(cekici.hizmetBolgeleri)
                    .map(([il, ilceler]) => `${il}: ${ilceler.join(", ")}`)
                    .join(" · ")
                : "Seçilmemiş"
          }
        />
        {cekici.hizmetModu !== "konum" && (
          <Row
            label="Hizmet dışı ilçeler"
            value={
              hizmetDisi
                ? hizmetDisi
                : cekici.hizmetBolgeleri &&
                    Object.keys(cekici.hizmetBolgeleri).length > 0
                  ? "Yok (seçili şehirlerde tüm ilçeler)"
                  : "—"
            }
          />
        )}
        <Row label="Token" value={cekici.tokenOnizleme} mono />
      </Card>

      {(cekici.belgeRuhsatUrl || cekici.belgeCekiciUrl) && (
        <Card className="space-y-3">
          <p className="font-semibold text-slate-900">Yüklenen belgeler</p>
          {cekici.belgeRuhsatUrl && (
            <BelgeLink label="Ruhsat" url={cekici.belgeRuhsatUrl} />
          )}
          {cekici.belgeCekiciUrl && (
            <BelgeLink label="Çekici belgesi" url={cekici.belgeCekiciUrl} />
          )}
          {cekici.belgeGonderim && (
            <p className="text-xs text-slate-500">
              Gönderim: {new Date(cekici.belgeGonderim).toLocaleString("tr-TR")}
            </p>
          )}
          {belgeDurum === "beklemede" && (
            <div className="flex flex-col gap-2 pt-2">
              <Btn
                onClick={() => void belgeKarar("onaylandi")}
                disabled={belgeIslem}
              >
                Belgeleri onayla
              </Btn>
              <textarea
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                placeholder="Red nedeni (reddetmek için)"
                value={redNedeni}
                onChange={(e) => setRedNedeni(e.target.value)}
                rows={2}
              />
              <Btn
                variant="danger"
                onClick={() => void belgeKarar("reddedildi")}
                disabled={belgeIslem || !redNedeni.trim()}
              >
                Belgeleri reddet
              </Btn>
            </div>
          )}
          {belgeDurum === "reddedildi" && cekici.belgeRedNedeni && (
            <p className="text-sm text-red-700">Red: {cekici.belgeRedNedeni}</p>
          )}
        </Card>
      )}

      <div className="space-y-2">
        <Btn onClick={paneleGec} disabled={oturumYukleniyor}>
          {oturumYukleniyor ? "Açılıyor…" : "Çekici paneline git"}
        </Btn>
        <Link
          href="/cekici/panel?tab=ayarlar"
          className="block text-center text-sm text-amber-600 font-medium py-2"
        >
          Ayarlar sayfası →
        </Link>
      </div>

      <Card className="border-red-200 bg-red-50/50 space-y-3">
        <p className="text-sm font-semibold text-red-800">Tehlikeli bölge</p>
        <p className="text-sm text-red-700 leading-relaxed">
          Bu işlem geri alınamaz. Hizmet veren hesabı, ödeme geçmişi, davet
          kayıtları, SMS logları ve yüklenen belgeler silinir.
        </p>
        <Btn variant="danger" onClick={() => setSilOnayAcik(true)}>
          Hizmet vereni sil
        </Btn>
      </Card>

      {silOnayAcik && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="sil-onay-baslik"
        >
          <Card className="w-full max-w-md shadow-xl space-y-4">
            <h3 id="sil-onay-baslik" className="text-lg font-bold text-slate-900">
              Emin misiniz?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>{cekici.ad}</strong> ({cekici.telefon}) kalıcı olarak
              silinecek. Ödeme, davet ve SMS kayıtları da kaldırılır.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Btn
                variant="secondary"
                onClick={() => setSilOnayAcik(false)}
                disabled={siliyor}
              >
                Vazgeç
              </Btn>
              <Btn
                variant="danger"
                onClick={() => void cekiciSil()}
                disabled={siliyor}
              >
                {siliyor ? "Siliniyor…" : "Evet, sil"}
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function belgeDurumEtiket(d: BelgeDurum): string {
  switch (d) {
    case "beklemede":
      return "İncelemede";
    case "onaylandi":
      return "Onaylandı";
    case "reddedildi":
      return "Reddedildi";
    default:
      return "Yüklenmedi";
  }
}

function BelgeLink({ label, url }: { label: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-amber-700 underline text-sm"
    >
      {label} — görüntüle
    </a>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-slate-100 pb-2 last:border-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span
        className={`text-slate-900 sm:text-right break-words min-w-0 ${mono ? "font-mono text-xs" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
