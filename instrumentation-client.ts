import posthog from "posthog-js";

const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== "undefined" && key && host) {
  posthog.init(key, {
    api_host: "/ingest",
    ui_host: host,
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    capture_pageview: true,
    opt_out_capturing_by_default: true,
    persistence: "localStorage+cookie",
  });
}
