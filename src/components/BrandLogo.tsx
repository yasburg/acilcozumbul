import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";

/** Header LCP yolu — ~11 KB WebP (640×416) */
const LOGO_YAZILI_HEADER = "/acilcozumbul-logo-yazili-header.webp";
/** OG / büyük yüzeyler için orijinal PNG */
const LOGO_YAZILI_FULL = "/acilcozumbul-logo-yazili-dikdortgen.png";
const LOGO_ICON = "/acilcozumbul-logo-icon-192.png";

/** Yazılı marka logosu (header vb.) */
export function BrandLogoYazili({
  className = "h-9 w-auto max-w-[220px] object-contain object-left",
  priority,
  href = "/",
  onClick,
}: {
  className?: string;
  priority?: boolean;
  href?: string | null;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  const img = (
    <Image
      src={LOGO_YAZILI_HEADER}
      alt="Acil Çözüm Bul — acilcozumbul.com"
      width={640}
      height={416}
      sizes="(max-width: 512px) 200px, 312px"
      className={className}
      priority={priority}
    />
  );

  if (href == null) return img;

  return (
    <Link
      href={href}
      onClick={onClick}
      className="inline-block shrink-0 touch-manipulation"
      aria-label="Ana sayfa"
    >
      {img}
    </Link>
  );
}

/** Sadece ikon (küçük alanlar) */
export function BrandLogoIcon({
  size = 40,
  className = "object-contain",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_ICON}
      alt=""
      width={192}
      height={192}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export { LOGO_YAZILI_FULL, LOGO_YAZILI_HEADER, LOGO_ICON };
