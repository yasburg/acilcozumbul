"use client";

import { useRef, useState } from "react";
import { Btn, Card } from "@/components/ui";

type Props = {
  label: string;
  aciklama: string;
  mevcutUrl?: string;
  onSecildi: (dataUrl: string | null) => void;
  invalid?: boolean;
};

export function BelgeYuklemeAlani({
  label,
  aciklama,
  mevcutUrl,
  onSecildi,
  invalid = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [onizleme, setOnizleme] = useState<string | null>(null);
  const [dosyaAdi, setDosyaAdi] = useState("");

  function dosyaSec(file: File | undefined) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Dosya en fazla 8 MB olabilir.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const sonuc = typeof reader.result === "string" ? reader.result : null;
      setOnizleme(sonuc);
      setDosyaAdi(file.name);
      onSecildi(sonuc);
    };
    reader.readAsDataURL(file);
  }

  const gosterilen = onizleme ?? mevcutUrl;

  return (
    <div
      className={`rounded-xl border p-4 space-y-2 ${
        invalid ? "border-red-500 bg-red-50/40" : "border-slate-200 bg-white"
      }`}
    >
      <p className={`text-sm font-medium ${invalid ? "text-red-700" : "text-slate-800"}`}>
        {label}
      </p>
      <p className="text-xs text-slate-500">{aciklama}</p>
      {gosterilen && (
        <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
          {gosterilen.includes(".pdf") || dosyaAdi.endsWith(".pdf") ? (
            <a
              href={gosterilen}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-amber-700 underline"
            >
              {dosyaAdi || "Yüklü belge (PDF)"} — görüntüle
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gosterilen}
              alt={label}
              className="max-h-32 w-full object-contain rounded"
            />
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="hidden"
        onChange={(e) => dosyaSec(e.target.files?.[0])}
      />
      <Btn
        type="button"
        variant="secondary"
        className="!min-h-[44px] !py-3 text-sm"
        onClick={() => inputRef.current?.click()}
      >
        {gosterilen ? "Belgeyi değiştir" : "Belge yükle"}
      </Btn>
    </div>
  );
}
