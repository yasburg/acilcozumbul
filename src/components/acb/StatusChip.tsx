/** Provider / request lifecycle chips — text + color (not color-only). */
export type StatusChipId =
  | "yeni"
  | "teklif_verildi"
  | "kabul_edildi"
  | "tamamlandi"
  | "iptal"
  | "kilitli"
  | "kaybedildi";

const CHIP: Record<
  StatusChipId,
  { label: string; className: string }
> = {
  yeni: {
    label: "Yeni",
    className:
      "bg-[color-mix(in_srgb,var(--acb-orange)_16%,white)] text-[var(--acb-dark)] border-[color-mix(in_srgb,var(--acb-orange)_45%,white)]",
  },
  teklif_verildi: {
    label: "Teklif Verildi",
    className: "bg-sky-50 text-sky-800 border-sky-200",
  },
  kabul_edildi: {
    label: "Kabul Edildi",
    className:
      "bg-[color-mix(in_srgb,var(--acb-green)_12%,white)] text-[var(--acb-dark)] border-[color-mix(in_srgb,var(--acb-green)_35%,white)]",
  },
  tamamlandi: {
    label: "Tamamlandı",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
  iptal: {
    label: "İptal",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  kilitli: {
    label: "Kilitli",
    className: "bg-slate-100 text-slate-500 border-slate-200",
  },
  kaybedildi: {
    label: "Seçilmedi",
    className: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

/** Map panel listeDurumu → chip */
export function panelDurumChip(listeDurumu?: string): StatusChipId {
  switch (listeDurumu) {
    case "acik":
      return "yeni";
    case "gizli":
      return "kilitli";
    case "teklif_verdim":
      return "teklif_verildi";
    case "kazandim":
      return "kabul_edildi";
    case "anlasildi":
      return "tamamlandi";
    case "kaybettim":
    case "tercih_edilmedi":
      return "kaybedildi";
    default:
      return "yeni";
  }
}

export function StatusChip({
  id,
  className = "",
}: {
  id: StatusChipId;
  className?: string;
}) {
  const chip = CHIP[id];
  return (
    <span
      className={`inline-flex items-center rounded-[0.625rem] border px-2 py-1 text-xs font-bold leading-none shadow-[0_1px_1px_rgba(27,45,42,0.03)] ${chip.className} ${className}`}
    >
      {chip.label}
    </span>
  );
}
