"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar } from "lucide-react";
import { Btn } from "@/components/ui";
import {
  IHALE_OZEL_MAX_GUN,
  IHALE_OZEL_MIN_DK,
  ihaleDatetimeLocal,
  type IhaleSureTipi,
} from "@/lib/ihale";
import { ACB_ICON_STROKE } from "@/lib/acb-icons";

const SECENEKLER: {
  id: IhaleSureTipi;
  label: string;
  aciklama: string;
  badge?: string;
}[] = [
  {
    id: "acil",
    label: "Acil",
    aciklama: "1 saat · Yakındaki çekicilere anında bildirim",
    badge: "⚡ En Hızlı",
  },
  { id: "1_gun", label: "1 Gün", aciklama: "24 saat" },
  { id: "1_hafta", label: "1 Hafta", aciklama: "7 gün" },
  { id: "ozel", label: "Özel", aciklama: "Tarih seç" },
];

const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

const GUN_KISA = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"] as const;

function sinirlar(simdi = new Date()) {
  const min = new Date(simdi.getTime() + IHALE_OZEL_MIN_DK * 60 * 1000);
  const max = new Date(
    simdi.getTime() + IHALE_OZEL_MAX_GUN * 24 * 60 * 60 * 1000
  );
  return { min, max, minStr: ihaleDatetimeLocal(min), maxStr: ihaleDatetimeLocal(max) };
}

function parseLocal(raw: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const dt = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    0,
    0
  );
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function formatGosterim(raw: string): string {
  const d = parseLocal(raw);
  if (!d) return "Tarih ve saat seçin";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}, ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function ayniGun(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function gunBaslangic(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function clampTarih(d: Date, min: Date, max: Date) {
  if (d < min) return new Date(min);
  if (d > max) return new Date(max);
  return d;
}

function ayTakvimHucreleri(yil: number, ay: number) {
  const ilk = new Date(yil, ay, 1);
  // Pazartesi başlangıç: JS getDay() Pazar=0
  const baslangicOffset = (ilk.getDay() + 6) % 7;
  const gunSayisi = new Date(yil, ay + 1, 0).getDate();
  const hucreler: Array<{ date: Date; buAy: boolean } | null> = [];
  for (let i = 0; i < baslangicOffset; i++) hucreler.push(null);
  for (let g = 1; g <= gunSayisi; g++) {
    hucreler.push({ date: new Date(yil, ay, g), buAy: true });
  }
  while (hucreler.length % 7 !== 0) hucreler.push(null);
  return hucreler;
}

function IhaleTarihPopup({
  open,
  value,
  min,
  max,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: string;
  min: Date;
  max: Date;
  onClose: () => void;
  onConfirm: (local: string) => void;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const baslangic = useMemo(() => {
    const parsed = parseLocal(value);
    return clampTarih(parsed ?? min, min, max);
  }, [value, min, max]);
  const [secili, setSecili] = useState(baslangic);
  const [gorunenAy, setGorunenAy] = useState(
    () => new Date(baslangic.getFullYear(), baslangic.getMonth(), 1)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const d = clampTarih(parseLocal(value) ?? min, min, max);
    setSecili(d);
    setGorunenAy(new Date(d.getFullYear(), d.getMonth(), 1));
  }, [open, value, min, max]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const hucreler = ayTakvimHucreleri(
    gorunenAy.getFullYear(),
    gorunenAy.getMonth()
  );
  const minAy = new Date(min.getFullYear(), min.getMonth(), 1);
  const maxAy = new Date(max.getFullYear(), max.getMonth(), 1);
  const oncekiAyVar = gorunenAy > minAy;
  const sonrakiAyVar = gorunenAy < maxAy;

  const saatler = Array.from({ length: 24 }, (_, i) => i);
  const dakikalar = Array.from({ length: 12 }, (_, i) => i * 5);

  function gunSecilebilir(gun: Date) {
    const g = gunBaslangic(gun);
    return g >= gunBaslangic(min) && g <= gunBaslangic(max);
  }

  function saatDakikaUygula(saat: number, dakika: number) {
    const sonraki = new Date(secili);
    sonraki.setHours(saat, dakika, 0, 0);
    setSecili(clampTarih(sonraki, min, max));
  }

  const ui = (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Kapat"
        className="absolute inset-0 bg-[rgb(27_45_42/0.45)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-[22rem] overflow-hidden rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white shadow-[0_20px_48px_rgb(27_45_42/0.22)]"
      >
        <div className="border-b border-[var(--acb-border)] px-4 py-3">
          <p
            id={titleId}
            className="text-base font-bold text-[var(--acb-dark)]"
          >
            Bitiş tarihi ve saati
          </p>
          <p className="mt-0.5 text-xs text-[var(--acb-muted)]">
            {formatGosterim(ihaleDatetimeLocal(secili))}
          </p>
        </div>

        <div className="space-y-3 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={!oncekiAyVar}
              onClick={() =>
                setGorunenAy(
                  new Date(gorunenAy.getFullYear(), gorunenAy.getMonth() - 1, 1)
                )
              }
              className="inline-flex size-9 items-center justify-center rounded-lg text-[var(--acb-dark)] transition enabled:hover:bg-[var(--acb-soft)] disabled:opacity-30"
              aria-label="Önceki ay"
            >
              ‹
            </button>
            <p className="text-sm font-semibold text-[var(--acb-dark)]">
              {AYLAR[gorunenAy.getMonth()]} {gorunenAy.getFullYear()}
            </p>
            <button
              type="button"
              disabled={!sonrakiAyVar}
              onClick={() =>
                setGorunenAy(
                  new Date(gorunenAy.getFullYear(), gorunenAy.getMonth() + 1, 1)
                )
              }
              className="inline-flex size-9 items-center justify-center rounded-lg text-[var(--acb-dark)] transition enabled:hover:bg-[var(--acb-soft)] disabled:opacity-30"
              aria-label="Sonraki ay"
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {GUN_KISA.map((g) => (
              <span
                key={g}
                className="py-1 text-[11px] font-semibold text-[var(--acb-muted)]"
              >
                {g}
              </span>
            ))}
            {hucreler.map((h, i) => {
              if (!h) {
                return <span key={`e-${i}`} className="aspect-square" />;
              }
              const aktif = gunSecilebilir(h.date);
              const seciliGun = ayniGun(h.date, secili);
              const bugun = ayniGun(h.date, new Date());
              return (
                <button
                  key={h.date.toISOString()}
                  type="button"
                  disabled={!aktif}
                  onClick={() => {
                    const sonraki = new Date(h.date);
                    sonraki.setHours(secili.getHours(), secili.getMinutes(), 0, 0);
                    setSecili(clampTarih(sonraki, min, max));
                  }}
                  className={`aspect-square rounded-lg text-sm font-medium transition touch-manipulation disabled:opacity-25 ${
                    seciliGun
                      ? "bg-[var(--acb-green)] text-white shadow-[var(--acb-shadow-cta)]"
                      : bugun
                        ? "bg-[var(--acb-soft)] text-[var(--acb-green)]"
                        : "text-[var(--acb-dark)] hover:bg-[var(--acb-soft)]"
                  }`}
                >
                  {h.date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-[var(--acb-border)] pt-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[var(--acb-muted)]">
                Saat
              </p>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-[var(--acb-border)] bg-[var(--acb-soft)]/40 p-1 [-webkit-overflow-scrolling:touch]">
                {saatler.map((s) => {
                  const seciliSaat = secili.getHours() === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => saatDakikaUygula(s, secili.getMinutes())}
                      className={`mb-0.5 flex w-full items-center justify-center rounded-lg py-1.5 text-sm font-semibold transition last:mb-0 ${
                        seciliSaat
                          ? "bg-[var(--acb-green)] text-white"
                          : "text-[var(--acb-dark)] hover:bg-white"
                      }`}
                    >
                      {String(s).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-[var(--acb-muted)]">
                Dakika
              </p>
              <div className="max-h-36 overflow-y-auto rounded-xl border border-[var(--acb-border)] bg-[var(--acb-soft)]/40 p-1 [-webkit-overflow-scrolling:touch]">
                {dakikalar.map((d) => {
                  const seciliDk =
                    Math.min(55, Math.round(secili.getMinutes() / 5) * 5) === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => saatDakikaUygula(secili.getHours(), d)}
                      className={`mb-0.5 flex w-full items-center justify-center rounded-lg py-1.5 text-sm font-semibold transition last:mb-0 ${
                        seciliDk
                          ? "bg-[var(--acb-green)] text-white"
                          : "text-[var(--acb-dark)] hover:bg-white"
                      }`}
                    >
                      {String(d).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 border-t border-[var(--acb-border)] px-4 py-3">
          <Btn
            type="button"
            variant="geri"
            className="!min-h-11 !py-2.5 flex-1"
            onClick={onClose}
          >
            İptal
          </Btn>
          <Btn
            type="button"
            className="!min-h-11 !py-2.5 flex-[1.4]"
            onClick={() => onConfirm(ihaleDatetimeLocal(secili))}
          >
            Tamam
          </Btn>
        </div>
      </div>
    </div>
  );

  return createPortal(ui, document.body);
}

export function IhaleSureSecimi({
  value,
  ozelBitis,
  onChange,
  invalid = false,
}: {
  value: IhaleSureTipi;
  ozelBitis: string;
  onChange: (tip: IhaleSureTipi, ozelBitis: string) => void;
  invalid?: boolean;
}) {
  const [pickerAcik, setPickerAcik] = useState(false);
  const { min, max, minStr } = sinirlar();
  const gosterimDegeri = ozelBitis || minStr;

  return (
    <div className="space-y-3">
      <div
        className="grid grid-cols-1 gap-3"
        role="radiogroup"
        aria-label="İhale süresi"
      >
        {SECENEKLER.map((s) => {
          const secili = value === s.id;
          const isAcil = s.id === "acil";
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={secili}
              onClick={() => {
                if (s.id === "ozel") {
                  onChange("ozel", ozelBitis || minStr);
                  setPickerAcik(true);
                  return;
                }
                onChange(s.id, ozelBitis);
              }}
              className={`w-full text-left rounded-[var(--acb-radius-lg)] border px-4.5 py-4 flex items-center justify-between gap-3 transition touch-manipulation active:scale-[0.99] ${
                secili
                  ? "border-[var(--acb-green)] bg-[var(--acb-soft)] ring-2 ring-[color-mix(in_srgb,var(--acb-green)_35%,transparent)] shadow-sm"
                  : isAcil
                    ? "border-emerald-300 bg-emerald-50/40 hover:border-[var(--acb-green)]"
                    : invalid
                      ? "border-red-300 bg-white"
                      : "border-[var(--acb-border)] bg-white hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)]"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="block text-base font-bold text-[var(--acb-dark)]">
                    {s.label}
                  </span>
                  {s.badge ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-300/80 shadow-2xs">
                      {s.badge}
                    </span>
                  ) : null}
                </div>
                <span className="mt-0.5 block text-xs text-[var(--acb-muted)]">
                  {s.aciklama}
                </span>
              </div>
              {secili ? (
                <span className="shrink-0 text-[var(--acb-green)] text-lg font-bold">
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {value === "ozel" && (
        <div className="space-y-1.5 pt-1">
          <span className="block text-sm font-medium text-slate-700">
            Bitiş tarihi ve saati
          </span>
          <button
            type="button"
            onClick={() => setPickerAcik(true)}
            className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left transition touch-manipulation ${
              invalid
                ? "border-red-500 ring-2 ring-red-500/30"
                : "border-[var(--acb-border)] hover:border-[color-mix(in_srgb,var(--acb-green)_45%,white)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--acb-green)]/40"
            }`}
          >
            <span className="text-[0.9375rem] font-medium text-[var(--acb-dark)]">
              {formatGosterim(gosterimDegeri)}
            </span>
            <Calendar
              className="size-5 shrink-0 text-[var(--acb-green)]"
              strokeWidth={ACB_ICON_STROKE}
              aria-hidden
            />
          </button>
          <span className="text-xs text-slate-500">
            En fazla {IHALE_OZEL_MAX_GUN} gün sonrası
          </span>
        </div>
      )}

      <IhaleTarihPopup
        open={pickerAcik}
        value={gosterimDegeri}
        min={min}
        max={max}
        onClose={() => setPickerAcik(false)}
        onConfirm={(local) => {
          onChange("ozel", local);
          setPickerAcik(false);
        }}
      />
    </div>
  );
}
