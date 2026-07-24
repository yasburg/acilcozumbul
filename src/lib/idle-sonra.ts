/** LCP sonrası idle / kısa gecikme — third-party init için */
export function idleSonra(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const w = window as Window & {
    requestIdleCallback?: (
      cb: IdleRequestCallback,
      opts?: IdleRequestOptions
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (typeof w.requestIdleCallback === "function") {
    const id = w.requestIdleCallback(() => fn(), { timeout: 4000 });
    return () => w.cancelIdleCallback?.(id);
  }

  const t = setTimeout(fn, 2000);
  return () => clearTimeout(t);
}
