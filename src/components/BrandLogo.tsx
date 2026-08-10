import Image from "next/image";
import Link from "next/link";
import type { MouseEventHandler } from "react";
import { ACB_BRAND } from "@/lib/brand";

const yaziliSrc = ACB_BRAND.logoYazili;
const yaziliFullSrc = ACB_BRAND.logoSocial;
const iconSrc = ACB_BRAND.logoIcon;
const yaziliSize = ACB_BRAND.logoYaziliBoyut;

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
      src={yaziliSrc}
      alt="Acil Çözüm Bul — acilcozumbul.com"
      width={yaziliSize.width}
      height={yaziliSize.height}
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
      src={iconSrc}
      alt=""
      width={1276}
      height={1276}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}

export {
  yaziliFullSrc as LOGO_YAZILI_FULL,
  yaziliSrc as LOGO_YAZILI_HEADER,
  iconSrc as LOGO_ICON,
};
