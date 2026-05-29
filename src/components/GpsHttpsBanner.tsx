"use client";

import { useMemo } from "react";
import { lanHttpsUrl } from "@/lib/konum-client";
import { Btn, Card } from "@/components/ui";

interface GpsHttpsBannerProps {
  /** Dar alan (konum adımı); üstte zaten varsa false */
  compact?: boolean;
}

export function GpsHttpsBanner({ compact = false }: GpsHttpsBannerProps) {
  const httpsUrl = useMemo(() => lanHttpsUrl(), []);

  if (!httpsUrl) return null;

  return (
    <Card className={`border-amber-300 bg-amber-50 ${compact ? "" : "mb-4"}`}>
      <p className="text-sm font-semibold text-amber-950">
        GPS için HTTPS gerekli
      </p>
      <p className="text-sm text-amber-900 mt-2 leading-relaxed">
        Adres çubuğunda <strong>Not Secure</strong> görüyorsanız konum çalışmaz.
        Aşağıdaki butonla <strong>https://</strong> sürümünü açın veya adresi
        elle yazıp devam edin.
      </p>
          <Btn
            type="button"
            className="mt-4 !py-3"
            onClick={() => {
              window.location.replace(httpsUrl);
            }}
          >
            GPS için HTTPS ile aç
          </Btn>
          <p className="text-xs text-amber-900 mt-2 font-mono break-all">{httpsUrl}</p>
      {!compact && (
        <p className="text-xs text-amber-800 mt-3 leading-relaxed">
          Bilgisayarda:{" "}
          <code className="bg-amber-100 px-1 rounded">npm run dev:lan:https</code>
          <br />
          Safari: Ayarlar → Safari → Konum → İzin Ver
        </p>
      )}
    </Card>
  );
}
