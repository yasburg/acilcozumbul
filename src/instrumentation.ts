export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { ensureSeedData } = await import("@/lib/seed");
    void ensureSeedData().catch((e) =>
      console.error("[seed] boot hash/migration", e)
    );
  } catch (e) {
    console.error("[seed] instrumentation", e);
  }
  try {
    const { ensureTopluSmsScheduler, tetikleTopluSmsKuyruk } = await import(
      "@/lib/toplu-sms-is-db"
    );
    ensureTopluSmsScheduler();
    void tetikleTopluSmsKuyruk().catch((e) =>
      console.error("[toplu-sms-is] boot tetik", e)
    );
  } catch (e) {
    console.error("[toplu-sms-is] instrumentation", e);
  }
}
