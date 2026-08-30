"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import {
  ACB_SPRING,
  ACB_SPRING_MOMENTUM,
  prefersReducedMotion,
  projectMomentum,
  rubberband,
} from "@/lib/apple-motion";

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 900;
const HYSTERESIS_PX = 10;

/**
 * Gesture-driven bottom sheet — springs, velocity handoff, rubber-band,
 * interruptible (apple-design).
 */
export function BottomSheet({
  open,
  onClose,
  title,
  children,
  className = "",
}: {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const scrimOpacity = useTransform(y, [0, 320], [1, 0.15]);
  const [mounted, setMounted] = useState(open);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const historyRef = useRef<Array<{ y: number; t: number }>>([]);
  const committedRef = useRef(false);
  const closingRef = useRef(false);

  const reduceMotion = prefersReducedMotion();

  const animateOut = useCallback(
    (velocity = 0, withBounce = false, notifyClose = false) => {
      if (closingRef.current) return;
      closingRef.current = true;
      const height = sheetRef.current?.offsetHeight ?? 400;
      void animate(y, height + 24, {
        ...(reduceMotion
          ? { type: "tween" as const, duration: 0.16, ease: "easeIn" as const }
          : withBounce
            ? { ...ACB_SPRING_MOMENTUM, velocity }
            : { ...ACB_SPRING, velocity }),
      }).then(() => {
        setMounted(false);
        y.set(0);
        closingRef.current = false;
        if (notifyClose) onClose?.();
      });
    },
    [onClose, reduceMotion, y]
  );

  const closeWithMotion = useCallback(() => {
    if (!onClose) return;
    animateOut(0, false, true);
  }, [animateOut, onClose]);

  useEffect(() => {
    if (open) {
      closingRef.current = false;
      setMounted(true);
      const enter = () => {
        y.set(reduceMotion ? 0 : 48);
        void animate(
          y,
          0,
          reduceMotion
            ? { type: "tween", duration: 0.18, ease: "easeOut" }
            : ACB_SPRING
        );
      };
      const id = requestAnimationFrame(enter);
      return () => cancelAnimationFrame(id);
    }
    if (mounted && !closingRef.current) {
      animateOut(0, false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to `open`
  }, [open]);

  useEffect(() => {
    if (!mounted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) closeWithMotion();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose, closeWithMotion]);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!onClose || closingRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest("button, a, input, textarea, select, [data-no-drag]")) {
      return;
    }
    draggingRef.current = true;
    committedRef.current = false;
    startYRef.current = e.clientY;
    historyRef.current = [{ y: e.clientY, t: performance.now() }];
    e.currentTarget.setPointerCapture(e.pointerId);
    y.stop();
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || !onClose) return;
    const dy = e.clientY - startYRef.current;
    if (!committedRef.current) {
      if (Math.abs(dy) < HYSTERESIS_PX) return;
      committedRef.current = true;
    }
    const height = sheetRef.current?.offsetHeight ?? 400;
    let next = dy;
    if (next < 0) {
      next = -rubberband(-next, height, 0.45);
    }
    y.set(next);
    const hist = historyRef.current;
    hist.push({ y: e.clientY, t: performance.now() });
    if (hist.length > 6) hist.shift();
  };

  const releaseVelocity = () => {
    const hist = historyRef.current;
    if (hist.length < 2) return 0;
    const last = hist[hist.length - 1]!;
    const prev = hist[0]!;
    const dt = Math.max(1, last.t - prev.t);
    return ((last.y - prev.y) / dt) * 1000;
  };

  const onPointerUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (!onClose) {
      void animate(y, 0, ACB_SPRING);
      return;
    }
    const current = y.get();
    const velocity = releaseVelocity();
    const projected = current + projectMomentum(velocity);
    const shouldDismiss =
      velocity > DISMISS_VELOCITY ||
      projected > DISMISS_DISTANCE ||
      current > DISMISS_DISTANCE;

    if (shouldDismiss) {
      animateOut(velocity, true, true);
      return;
    }

    void animate(y, 0, {
      ...ACB_SPRING,
      velocity,
    });
  };

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : "Alt panel"}
    >
      {onClose ? (
        <motion.button
          type="button"
          className="absolute inset-0 bg-slate-950/50 pointer-events-auto backdrop-blur-xs"
          aria-label="Kapat"
          style={{ opacity: scrimOpacity }}
          onClick={closeWithMotion}
        />
      ) : (
        <div className="absolute inset-0 pointer-events-none" aria-hidden />
      )}
      <motion.div
        ref={sheetRef}
        className={`pointer-events-auto relative z-10 flex flex-col w-full max-w-lg max-h-[min(88dvh,720px)] rounded-t-[var(--acb-radius-xl)] border border-b-0 border-white/55 bg-white shadow-[0_-16px_48px_rgba(0,0,0,0.25)] pb-[max(0.75rem,env(safe-area-inset-bottom))] ${className}`}
        style={{ y, touchAction: onClose ? "none" : "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="shrink-0 flex flex-col items-center bg-white px-4 pt-2.5 pb-2 border-b border-slate-100">
          <div
            className="mb-2.5 h-1 w-10 rounded-full bg-[color-mix(in_srgb,var(--acb-dark)_18%,white)]"
            aria-hidden
          />
          {title ? (
            <h2
              id={titleId}
              className="w-full text-center text-[16px] font-bold tracking-tight text-slate-900"
            >
              {title}
            </h2>
          ) : null}
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 no-scrollbar" data-no-drag>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
