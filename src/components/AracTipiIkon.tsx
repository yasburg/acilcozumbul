import type { AracTipiId } from "@/lib/arac-tipi";

/**
 * Araç tipi ikonları — Flaticon (ücretsiz lisans, atıf gerekli).
 * Kaynak: public/icons/arac-tipi/ATTRIBUTION.txt
 */
export function AracTipiIkon({
  tip,
  className,
}: {
  tip: AracTipiId;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={
        className
          ? `block shrink-0 bg-current ${className}`
          : "block size-8 shrink-0 bg-current"
      }
      style={{
        maskImage: `url(/icons/arac-tipi/${tip}.png)`,
        WebkitMaskImage: `url(/icons/arac-tipi/${tip}.png)`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
