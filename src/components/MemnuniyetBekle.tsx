"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";

function formatKalan(ms: number): string {
  const dk = Math.ceil(ms / 60000);
  if (dk >= 60) {
    const sa = Math.floor(dk / 60);
    const k = dk % 60;
    return k > 0 ? `${sa} sa ${k} dk` : `${sa} saat`;
  }
  return `${dk} dakika`;
}

export function MemnuniyetBekle({
  kalanMs,
  onSureDoldu,
}: {
  kalanMs: number;
  onSureDoldu?: () => void;
}) {
  const [kalan, setKalan] = useState(kalanMs);

  useEffect(() => {
    setKalan(kalanMs);
  }, [kalanMs]);

  useEffect(() => {
    if (kalan <= 0) {
      onSureDoldu?.();
      return;
    }
    const t = setInterval(() => {
      setKalan((prev) => {
        const next = Math.max(0, prev - 1000);
        if (next === 0) onSureDoldu?.();
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [kalan, onSureDoldu]);

  return (
    <Card className="bg-slate-50 border-slate-200 text-center py-6">
      <p className="text-3xl mb-2">⏳</p>
      <p className="font-medium text-slate-800">Değerlendirme henüz açılmadı</p>
      <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto leading-relaxed">
        Hizmetinizi değerlendirmek için yaklaşık{" "}
        <strong className="text-amber-600">{formatKalan(kalan)}</strong> sonra bu
        sayfaya tekrar gelebilirsiniz. Aynı bağlantıyı kaydedin.
      </p>
    </Card>
  );
}
