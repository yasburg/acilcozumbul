import Image from "next/image";
import Link from "next/link";

const LOGO_YAZILI = "/acilcozumbul-logo-yazili.png";
const LOGO_ICON = "/acilcozumbul-logo-transparan.png";

/** Yazılı marka logosu (header vb.) */
export function BrandLogoYazili({
  className = "h-9 w-auto max-w-[220px] object-contain object-left",
  priority,
  href = "/",
}: {
  className?: string;
  priority?: boolean;
  href?: string | null;
}) {
  const img = (
    <Image
      src={LOGO_YAZILI}
      alt="Acil Çözüm Bul — acilcozumbul.com"
      width={1254}
      height={1254}
      className={className}
      priority={priority}
    />
  );

  if (href == null) return img;

  return (
    <Link href={href} className="inline-block shrink-0" aria-label="Ana sayfa">
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
      width={1024}
      height={1024}
      className={className}
      style={{ width: size, height: size }}
      aria-hidden
    />
  );
}
