/** Apple-style motion helpers (WWDC Designing Fluid Interfaces). */

/** Exponential-decay projection — not textbook v²/(2a). */
export function projectMomentum(
  initialVelocityPxPerSec: number,
  decelerationRate = 0.998
): number {
  return (
    (initialVelocityPxPerSec / 1000) *
    (decelerationRate / (1 - decelerationRate))
  );
}

/** Progressive resistance past a bound — soft edge, not a hard stop. */
export function rubberband(
  overshoot: number,
  dimension: number,
  constant = 0.55
): number {
  if (dimension <= 0) return 0;
  return (
    (overshoot * dimension * constant) /
    (dimension + constant * Math.abs(overshoot))
  );
}

/** Critically damped UI spring (Apple damping 1.0 / response ~0.35). */
export const ACB_SPRING = {
  type: "spring" as const,
  bounce: 0,
  duration: 0.35,
};

/** Slight bounce — only after momentum gestures (flick / throw). */
export const ACB_SPRING_MOMENTUM = {
  type: "spring" as const,
  bounce: 0.18,
  duration: 0.38,
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
