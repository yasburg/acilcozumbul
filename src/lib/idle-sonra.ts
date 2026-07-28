/**
 * Third-party init: ilk etkileşimde veya kısa gecikmeyle.
 * requestIdleCallback(timeout:4s) Lighthouse’ta hâlâ erken tetikleniyordu;
 * etkileşim önceliği TBT / unused JS’i düşürür, gerçek kullanıcıda hemen yükler.
 */
export function idleSonra(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  let done = false;
  const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;

  const run = () => {
    if (done) return;
    done = true;
    for (const e of events) {
      window.removeEventListener(e, run);
    }
    clearTimeout(fallbackId);
    fn();
  };

  for (const e of events) {
    window.addEventListener(e, run, { once: true, passive: true });
  }

  const fallbackId = window.setTimeout(run, 5500);
  return () => {
    if (done) return;
    done = true;
    for (const e of events) {
      window.removeEventListener(e, run);
    }
    clearTimeout(fallbackId);
  };
}
