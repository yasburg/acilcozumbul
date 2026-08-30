/**
 * ACB icon language — Lucide for chrome UI, Hugeicons for service/problem marks.
 * Stroke-based, monochromatic; primary green for active states.
 */
"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AccidentIcon,
  AutomotiveBattery01Icon,
  Camera01Icon,
  ContainerTruck01Icon,
  FuelStationIcon,
  Key01Icon,
  Search01Icon,
  TireIcon,
  TowTruckIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Car,
  CircleCheck,
  CircleHelp,
  ClipboardList,
  Clock,
  CreditCard,
  FileText,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  RefreshCw,
  Send,
  Settings,
  Smartphone,
  Search,
  Shield,
  ShieldCheck,
  Star,
  TriangleAlert,
  User,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import type { CSSProperties } from "react";
import type { SorunTipiId } from "@/lib/sorun-tipleri";

export const ACB_ICON_STROKE = 1.75;

type HugeIconProps = {
  className?: string;
  strokeWidth?: number;
  size?: number;
  style?: CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
};

function makeHugeIcon(icon: IconSvgElement) {
  function HugeAcbIcon({
    className,
    strokeWidth = ACB_ICON_STROKE,
    size = 24,
    style,
    ...rest
  }: HugeIconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={size}
        color="currentColor"
        strokeWidth={strokeWidth}
        className={className}
        style={style}
        aria-hidden
        {...rest}
      />
    );
  }
  return HugeAcbIcon;
}

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
  towing: makeHugeIcon(TowTruckIcon),
  battery: makeHugeIcon(AutomotiveBattery01Icon),
  tire: makeHugeIcon(TireIcon),
  locksmith: makeHugeIcon(Key01Icon),
  fuel: makeHugeIcon(FuelStationIcon),
  transport: makeHugeIcon(ContainerTruck01Icon),
  camera: makeHugeIcon(Camera01Icon),
  car: Car,
  wrench: Wrench,
  location: MapPin,
  mapPin: MapPin,
  navigation: Navigation,
  verified: ShieldCheck,
  shield: Shield || ShieldCheck,
  check: CircleCheck,
  rating: Star,
  phone: Phone,
  search: Search,
  back: ArrowLeft,
  forward: ArrowRight,
  clock: Clock,
  warning: TriangleAlert,
  user: User,
  users: Users,
  settings: Settings,
  clipboard: ClipboardList,
  bell: Bell,
  mail: Mail,
  message: MessageCircle,
  messageCircle: MessageCircle,
  help: CircleHelp,
  helpCircle: CircleHelp,
  send: Send,
  lock: Lock,
  wallet: Wallet,
  card: CreditCard,
  file: FileText,
  refresh: RefreshCw,
  smartphone: Smartphone,
} as const;

export type AcbIconKey = keyof typeof AcbIcons;

/** Problem / service → Hugeicons */
export const SORUN_ICON_MAP: Record<SorunTipiId, IconSvgElement> = {
  cekici: TowTruckIcon,
  ariza: Wrench01Icon,
  lastik: TireIcon,
  aku: AutomotiveBattery01Icon,
  yakit: FuelStationIcon,
  kaza: AccidentIcon,
  kilit: Key01Icon,
  "arac-tasima": ContainerTruck01Icon,
  diger: Search01Icon,
};

export function sorunIkonu(id: string): IconSvgElement {
  if (id in SORUN_ICON_MAP) {
    return SORUN_ICON_MAP[id as SorunTipiId];
  }
  return Search01Icon;
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
  const hasCustomTextColor = /\btext-/.test(className);
  const colorClass = hasCustomTextColor
    ? ""
    : active
      ? "text-[var(--acb-green)]"
      : "text-[var(--acb-dark)]";

  return (
    <HugeiconsIcon
      icon={sorunIkonu(id)}
      size={24}
      color="currentColor"
      strokeWidth={ACB_ICON_STROKE}
      className={`${className} ${colorClass}`.trim()}
      aria-hidden
    />
  );
}
