"use client";

import {
  cihazPlatformu,
  konumAyarlariAdimlari,
  type KonumIzniDurumu,
} from "@/lib/konum-client";
import { Card } from "@/components/ui";

interface KonumIzniYardimProps {
  durum: KonumIzniDurumu;
  gpsGuvenli: boolean;
  bekleniyor?: boolean;
}

export function KonumIzniYardim({
  durum,
  gpsGuvenli,
  bekleniyor,
}: KonumIzniYardimProps) {
  if (!gpsGuvenli) return null;

  if (bekleniyor) {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <p className="text-sm font-semibold text-blue-900">
          Safari konum izni soruyor
        </p>
        <p className="text-sm text-blue-800 mt-2 leading-relaxed">
          Ekranın üstünde veya ortasında çıkan pencerede{" "}
          <strong>İzin Ver</strong> / <strong>Allow</strong> seçin.
          <br />
          <span className="text-xs opacity-90">
            «Bir Kez İzin Ver» veya «Uygulama Kullanırken» de uygundur.
          </span>
        </p>
      </Card>
    );
  }

  if (durum === "prompt" || durum === "unknown") {
    return (
      <Card className="bg-blue-50 border-blue-200">
        <p className="text-sm font-semibold text-blue-900">Konum izni</p>
        <p className="text-sm text-blue-800 mt-2 leading-relaxed">
          «Konumumu Paylaş»a bastığınızda {cihazPlatformu() === "ios" ? "Safari" : "tarayıcı"}{" "}
          sizden izin isteyecek. Ayarlarda «Sor» seçiliyse bu normaldir —{" "}
          <strong>İzin Ver</strong> demeniz yeterli.
        </p>
      </Card>
    );
  }

  if (durum === "granted") {
    return (
      <Card className="bg-emerald-50 border-emerald-200">
        <p className="text-sm text-emerald-800">
          ✓ Konum izni verildi. «Konumumu Paylaş» ile devam edebilirsiniz.
        </p>
      </Card>
    );
  }

  if (durum === "denied") {
    const adimlar = konumAyarlariAdimlari();
    return (
      <Card className="bg-red-50 border-red-200">
        <p className="text-sm font-semibold text-red-900">
          Konum alınamadı
        </p>
        {cihazPlatformu() === "ios" && (
          <p className="text-sm text-amber-900 mt-2 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Safari’de site ayarlarında «İzin Ver» seçili olsa bile bu uyarı
            çıkabilir. Önce <strong>«veya GPS konumumu paylaş»</strong> düğmesine
            tekrar basın; izin penceresi çıkarsa İzin Ver deyin.
          </p>
        )}
        <p className="text-sm text-red-800 mt-2 leading-relaxed">
          Hâlâ olmuyorsa aşağıdaki adımları izleyin, sayfayı yenileyin ve tekrar
          deneyin. Adresi elle yazarak da devam edebilirsiniz.
        </p>
        <ol className="mt-3 space-y-2 text-sm text-red-900 list-decimal list-inside">
          {adimlar.map((adim) => (
            <li key={adim} className="leading-relaxed pl-1">
              {adim}
            </li>
          ))}
        </ol>
        {cihazPlatformu() === "ios" && (
          <p className="text-xs text-red-700 mt-3 border-t border-red-200 pt-3">
            aA → Web Sitesi Ayarları → acilcozumbul.com → Konum: İzin Ver.
            Ayarlar → Gizlilik → Konum Servisleri → Safari: Açık.
          </p>
        )}
      </Card>
    );
  }

  return null;
}
