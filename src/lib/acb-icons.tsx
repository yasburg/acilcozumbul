/**
 * ACB icon language — Lucide only.
 * Stroke-based, monochromatic; primary green for active states.
 */
"use client";

import {
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  Car,
  CircleCheck,
  CircleDot,
  Clock,
  Fuel,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Star,
  Truck,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { SorunTipiId } from "@/lib/sorun-tipleri";

export const ACB_ICON_STROKE = 1.75;

export function AcbIcon({
  icon: Icon,
  className = "size-5",
  strokeWidth = ACB_ICON_STROKE,
  ...rest
}: LucideProps & { icon: LucideIcon }) {
  return (
    <Icon
      className={className}
      strokeWidth={strokeWidth}
      aria-hidden
      {...rest}
    />
  );
}

/** Canonical icons used across the product */
export const AcbIcons = {
  towing: Truck,
  battery: BatteryCharging,
  tire: CircleDot,
  locksmith: KeyRound,
  fuel: Fuel,
  transport: Truck,
  car: Car,
  wrench: Wrench,
  location: MapPin,
  navigation: Navigation,
  verified: ShieldCheck,
  check: CircleCheck,
  rating: Star,
  phone: Phone,
  search: Search,
  back: ArrowLeft,
  forward: ArrowRight,
  clock: Clock,
} as const;

export type AcbIconKey = keyof typeof AcbIcons;

/** Problem / service → Lucide icon */
export const SORUN_ICON_MAP: Record<SorunTipiId, LucideIcon> = {
  cekici: Truck,
  ariza: Wrench,
  lastik: CircleDot,
  aku: BatteryCharging,
  yakit: Fuel,
  kaza: Car,
  kilit: KeyRound,
  "arac-tasima": Truck,
  diger: Search,
};

export function sorunIkonu(id: string): LucideIcon {
  if (id in SORUN_ICON_MAP) {
    return SORUN_ICON_MAP[id as SorunTipiId];
  }
  return Search;
}

export function SorunIkon({
  id,
  className = "size-6",
  active = false,
}: {
  id: string;
  className?: string;
  active?: boolean;
}) {
  const Icon = sorunIkonu(id);
  return (
    <Icon
      className={`${className} ${
        active ? "text-[var(--acb-green)]" : "text-[var(--acb-dark)]"
      }`}
      strokeWidth={ACB_ICON_STROKE}
      aria-hidden
    />
  );
}
