"use client";

import { useEffect, useRef, useState } from "react";

const SVG_SRC = "/brand/acb/Single-Animation.svg";
/** Fallback if Web Animations API unavailable (matches current SVG) */
const ANIM_FALLBACK_MS = 1807;
const HOLD_MS = 80;
const EXIT_MS = 480;
const SESSION_KEY = "acb_intro_splash_seen";

/**
 * Bake SVG CSS animations into inline styles and remove <style> so the
 * last frame cannot restart.
 */
function freezeSvgFinalFrame(root: HTMLElement) {
  const anims =
    typeof root.getAnimations === "function"
      ? root.getAnimations({ subtree: true })
      : [];

  for (const anim of anims) {
    try {
      anim.finish();
    } catch {
      /* already finished */
    }
    try {
      anim.commitStyles();
      anim.cancel();
    } catch {
      /* commitStyles unsupported */
    }
  }

  root.querySelectorAll<SVGElement>("svg [id]").forEach((el) => {
    const style = getComputedStyle(el);
    el.style.opacity = style.opacity;
    el.style.transform = style.transform === "none" ? "" : style.transform;
    el.style.transformOrigin = style.transformOrigin;
    el.style.animation = "none";
  });

  root.querySelectorAll("style").forEach((el) => el.remove());
}

function waitForSvgAnimations(root: HTMLElement): Promise<void> {
  const anims =
    typeof root.getAnimations === "function"
      ? root.getAnimations({ subtree: true })
      : [];

  if (anims.length === 0) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, ANIM_FALLBACK_MS);
    });
  }

  return Promise.all(
    anims.map((a) =>
      a.finished.catch(() => {
        /* cancelled / finished */
      })
    )
  ).then(() => undefined);
}

/**
 * Full-viewport white intro — SVG injected once, plays once, freezes,
 * then the veil fades out without a React re-render (so the SVG cannot replay).
 */
export function IntroSplash() {
  const [phase, setPhase] = useState<"boot" | "play" | "done">("boot");
  const shellRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") {
        document.documentElement.classList.remove("acb-intro-pending");
        setPhase("done");
        return;
      }
    } catch {
      /* private mode — still show once */
    }
    setPhase("play");
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    if (startedRef.current) return;
    if (!markRef.current || !shellRef.current) return;

    startedRef.current = true;
    let cancelled = false;

    void (async () => {
      let html: string;
      try {
        const res = await fetch(SVG_SRC);
        if (!res.ok) throw new Error("svg");
        html = await res.text();
      } catch {
        if (!cancelled) {
          document.documentElement.classList.remove("acb-intro-pending");
          setPhase("done");
        }
        return;
      }
      if (cancelled || !markRef.current || !shellRef.current) return;

      markRef.current.innerHTML = html;

      document.body.style.overflow = "hidden";
      document.documentElement.classList.remove("acb-intro-pending");

      await new Promise<void>((r) => {
        requestAnimationFrame(() => requestAnimationFrame(() => r()));
      });
      if (cancelled || !markRef.current) return;

      await waitForSvgAnimations(markRef.current);
      if (cancelled || !markRef.current || !shellRef.current) return;

      freezeSvgFinalFrame(markRef.current);

      await new Promise<void>((r) => {
        window.setTimeout(r, HOLD_MS);
      });
      if (cancelled || !shellRef.current) return;

      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        /* ignore */
      }

      /* Fade via DOM class — no React state change, SVG stays frozen */
      shellRef.current.classList.add("acb-intro-splash--exit");

      await new Promise<void>((r) => {
        window.setTimeout(r, EXIT_MS);
      });
      if (cancelled) return;

      document.body.style.overflow = "";
      setPhase("done");
    })();

    return () => {
      cancelled = true;
      document.body.style.overflow = "";
    };
  }, [phase]);

  if (phase === "boot" || phase === "done") return null;

  return (
    <div
      ref={shellRef}
      className="acb-intro-splash fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-white"
      role="presentation"
      aria-hidden
    >
      <div
        ref={markRef}
        className="acb-intro-splash__mark w-[min(72vw,22rem)] sm:w-[min(56vw,26rem)]"
      />
    </div>
  );
}
