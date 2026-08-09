/** Scannable status strip for live bidding / waiting. */
export function LiveRequestStatus({
  operatorSayisi,
  teklifSayisi,
  ihaleBitis,
  searching = false,
  baslik,
}: {
  operatorSayisi: number;
  teklifSayisi: number;
  ihaleBitis?: string | null;
  searching?: boolean;
  /** Optional large status line above the strip */
  baslik?: string;
}) {
  return (
    <div className="space-y-3">
      {baslik ? (
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-[var(--acb-dark)] sm:text-[1.75rem]">
          {baslik}
        </h2>
      ) : null}
      <div className="rounded-[var(--acb-radius-lg)] border border-[var(--acb-border)] bg-white px-4 py-3.5 shadow-[var(--acb-shadow)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {searching ? (
            <span className="inline-flex items-center gap-2 text-sm font-bold text-[var(--acb-dark)]">
              <span
                className="relative flex size-2.5"
                aria-hidden
              >
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--acb-orange)] opacity-60" />
                <span className="relative inline-flex size-2.5 rounded-full bg-[var(--acb-orange)]" />
              </span>
              Aranıyor
            </span>
          ) : null}
          <span className="text-sm font-semibold tabular-nums text-[var(--acb-dark)]">
            {operatorSayisi > 0
              ? `${operatorSayisi} hizmet verene bildirildi`
              : "Yakın yardımcılar aranıyor"}
          </span>
          <span className="text-[var(--acb-border)]" aria-hidden>
            ·
          </span>
          <span className="text-sm font-semibold tabular-nums text-[var(--acb-green)]">
            {teklifSayisi > 0
              ? `${teklifSayisi} teklif`
              : "Teklif bekleniyor"}
          </span>
        </div>
        <p className="mt-1.5 text-sm text-[var(--acb-muted)]">
          Teklifler geldikçe burada göreceksin.
        </p>
        {ihaleBitis ? (
          <p className="mt-1 text-xs text-[var(--acb-muted)]">
            Bitiş:{" "}
            {new Date(ihaleBitis).toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </div>
    </div>
  );
}
