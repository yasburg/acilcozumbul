/** Footer — ödeme kart logoları + Yerli Üretim */

function MastercardSvg() {
  return (
    <svg
      viewBox="0 0 40 24"
      className="h-5 w-auto"
      role="img"
      aria-label="Mastercard"
    >
      <circle cx="14" cy="12" r="9" fill="#EB001B" />
      <circle cx="26" cy="12" r="9" fill="#F79E1B" />
      <path
        d="M20 5.2a9 9 0 0 1 0 13.6 9 9 0 0 1 0-13.6Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function VisaSvg() {
  return (
    <svg
      viewBox="0 0 48 24"
      className="h-5 w-auto"
      role="img"
      aria-label="Visa"
    >
      <text
        x="24"
        y="17"
        textAnchor="middle"
        fill="#1A1F71"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="14"
        fontStyle="italic"
        fontWeight="800"
        letterSpacing="0.5"
      >
        VISA
      </text>
    </svg>
  );
}

function AmexSvg() {
  return (
    <svg
      viewBox="0 0 44 24"
      className="h-5 w-auto"
      role="img"
      aria-label="American Express"
    >
      <rect width="44" height="24" rx="2.5" fill="#6EB3E8" />
      <text
        x="22"
        y="11"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5"
        fontWeight="700"
        letterSpacing="0.5"
      >
        AMERICAN
      </text>
      <text
        x="22"
        y="18.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="5"
        fontWeight="700"
        letterSpacing="0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}

function TroyLogo() {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local PNG asset
    <img
      src="/troy-logo.png"
      alt="Troy"
      width={64}
      height={40}
      className="h-5 w-auto object-contain"
    />
  );
}

export function YerliUretimLogo({
  className = "h-5 w-auto",
}: {
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- SVG public asset
    <img
      src="/yerli-uretim-logosu.svg"
      alt="Yerli Üretim"
      width={72}
      height={31}
      className={className}
    />
  );
}

export function OdemeKartLogolari({
  className = "",
}: {
  className?: string;
}) {
  return (
    <ul
      className={`flex flex-wrap items-center gap-2 ${className}`}
      aria-label="Ödeme yöntemleri"
    >
      <li>
        <MastercardSvg />
      </li>
      <li>
        <VisaSvg />
      </li>
      <li>
        <AmexSvg />
      </li>
      <li>
        <TroyLogo />
      </li>
    </ul>
  );
}
