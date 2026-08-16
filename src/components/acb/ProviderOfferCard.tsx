"use client";

import { Btn, Card } from "@/components/ui";
import { VerifiedBadge } from "@/components/acb/TrustBadge";
import { AcbIcons, ACB_ICON_STROKE } from "@/lib/acb-icons";
import { ACB_CTA } from "@/lib/design-tokens";

export type ProviderOfferCardProps = {
  ad: string;
  fiyat: number;
  gelisDk: number;
  cekmeDk?: number | null;
  hedefBilinmiyor?: boolean;
  onayli?: boolean;
  profilFotoUrl?: string | null;
  hizmetPuani?: number | null;
  degerlendirmeAdet?: number;
  geldiOnce?: string | null;
  mesaj?: string;
  fiyatDegisti?: boolean;
  ilkFiyat?: number;
  secilebilir?: boolean;
  disabled?: boolean;
  mesafeKm?: number | null;
  onAccept: () => void;
};

function formatTl(fiyat: number) {
  return `₺${fiyat.toLocaleString("tr-TR")}`;
}

export function ProviderOfferCard({
  ad,
  fiyat,
  gelisDk,
  cekmeDk = null,
  hedefBilinmiyor = false,
  onayli = false,
  profilFotoUrl,
  hizmetPuani,
  degerlendirmeAdet,
  geldiOnce,
  mesaj,
  fiyatDegisti = false,
  ilkFiyat,
  secilebilir = true,
  disabled = false,
  mesafeKm = null,
  onAccept,
}: ProviderOfferCardProps) {
  const Truck = AcbIcons.towing;
  const Star = AcbIcons.rating;
  const Clock = AcbIcons.clock;
  const Navigation = AcbIcons.navigation;

  return (
    <Card
      className={`!p-0 overflow-hidden !rounded-[var(--acb-radius-lg)] border-[var(--acb-border)] bg-white/95 shadow-[var(--acb-shadow-lg)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-px hover:shadow-[var(--acb-shadow-xl)] active:duration-100 active:scale-[0.995] active:shadow-[var(--acb-shadow)] ${
        fiyatDegisti ? "border-[var(--acb-warn-border)] bg-[var(--acb-warn-soft)]" : ""
      }`}
    >
      <div className="flex gap-3 p-4">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-start gap-2.5">
            {profilFotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilFotoUrl}
                alt=""
                className="size-11 shrink-0 rounded-full border border-[var(--acb-border)] bg-slate-100 object-cover shadow-[var(--acb-shadow)]"
              />
            ) : (
              <div
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--acb-soft)] text-[var(--acb-dark)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),var(--acb-shadow)]"
                aria-hidden
              >
                <Truck className="size-5" strokeWidth={ACB_ICON_STROKE} />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold leading-snug text-[var(--acb-dark)]">
                {ad}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {onayli ? <VerifiedBadge compact /> : null}
                {hizmetPuani != null ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--acb-dark)]">
                    <Star
                      className="size-3.5 text-[var(--acb-dark)]"
                      strokeWidth={ACB_ICON_STROKE}
                      aria-hidden
                    />
                    {hizmetPuani.toFixed(1)}
                    {degerlendirmeAdet ? (
                      <span className="font-medium text-[var(--acb-muted)]">
                        {degerlendirmeAdet} değerlendirme
                      </span>
                    ) : null}
                  </span>
                ) : (
                  <span className="text-xs font-medium text-[var(--acb-muted)]">
                    Yeni hizmet veren
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-base font-bold tabular-nums text-[var(--acb-dark)]">
              <Clock
                className="size-4 text-[var(--acb-muted)]"
                strokeWidth={ACB_ICON_STROKE}
                aria-hidden
              />
              {gelisDk} dk
              {geldiOnce ? (
                <span className="text-sm font-normal text-[var(--acb-muted)]">
                  · {geldiOnce}
                </span>
              ) : null}
            </span>
            {mesafeKm != null && mesafeKm > 0 ? (
              <span className="inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-[var(--acb-muted)]">
                <Navigation
                  className="size-3.5"
                  strokeWidth={ACB_ICON_STROKE}
                  aria-hidden
                />
                {mesafeKm.toFixed(1)} km
              </span>
            ) : null}
            {cekmeDk != null ? (
              <span className="text-sm tabular-nums text-[var(--acb-muted)]">
                Hedefe ~{cekmeDk} dk
                {hedefBilinmiyor ? " · hedef belirsiz" : ""}
              </span>
            ) : null}
          </div>

          {mesaj?.trim() ? (
            <p className="text-sm leading-relaxed text-slate-600 line-clamp-2">
              {mesaj}
            </p>
          ) : null}

          {fiyatDegisti && ilkFiyat != null && ilkFiyat !== fiyat ? (
            <p className="text-xs font-medium text-[var(--acb-warn-hover)]">
              İlk teklif {formatTl(ilkFiyat)} idi — fiyat değiştirildi
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end justify-start pl-1">
          <p className="text-2xl font-bold tabular-nums leading-none tracking-tight text-[var(--acb-dark)]">
            {formatTl(fiyat)}
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--acb-border)] px-4 py-3">
        {fiyatDegisti ? (
          <div className="flex items-start gap-2 rounded-[var(--acb-radius-sm)] border border-[var(--acb-warn-border)] bg-[var(--acb-warn-soft)] px-3 py-2 text-xs leading-relaxed text-[var(--acb-dark)]">
            <AcbIcons.warning
              className="mt-0.5 size-3.5 shrink-0 text-[var(--acb-warn-hover)]"
              strokeWidth={ACB_ICON_STROKE}
              aria-hidden
            />
            <span>
              Bu çekici teklif fiyatını sonradan değiştirdi. Güvenlik nedeniyle bu
              teklifle anlaşamazsınız.
            </span>
          </div>
        ) : (
          <Btn
            variant="primary"
            onClick={onAccept}
            disabled={disabled || !secilebilir}
            className="!py-3.5 !font-bold !tracking-wide"
          >
            {ACB_CTA.teklifiKabul}
          </Btn>
        )}
      </div>
    </Card>
  );
}
