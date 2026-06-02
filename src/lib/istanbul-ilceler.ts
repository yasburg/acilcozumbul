import { IL_ILCELER } from "./il-ilce";

/** İstanbul — Anadolu (Asya) yakası ilçeleri */
export const ISTANBUL_ASYA_ILCELER: readonly string[] = [
  "Adalar",
  "Ataşehir",
  "Beykoz",
  "Çekmeköy",
  "Kadıköy",
  "Kartal",
  "Maltepe",
  "Pendik",
  "Sancaktepe",
  "Sultanbeyli",
  "Şile",
  "Tuzla",
  "Ümraniye",
  "Üsküdar",
];

const asyaSet = new Set(ISTANBUL_ASYA_ILCELER);

/** İstanbul — Avrupa yakası ilçeleri */
export const ISTANBUL_AVRUPA_ILCELER: readonly string[] = (
  IL_ILCELER["İstanbul"] ?? []
).filter((ilce) => !asyaSet.has(ilce));

export const ISTANBUL_IL = "İstanbul";
