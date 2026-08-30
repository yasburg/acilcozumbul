import { NextRequest, NextResponse } from "next/server";
import { suresiDolanTalepOlaylariniKaydet, vadesiGelenTalepDispatchleriniCalistir } from "@/lib/talep-dispatch";
import { smsBaseUrl } from "@/lib/sms-base-url";

/**
 * Progressive dispatch recovery. Railway cron: her 30–60 saniye POST edin.
 * İlk talep dalgası request API'sinde çalışır; bu endpoint yalnızca kalıcı
 * ikinci/üçüncü dalgayı tekrar çalıştırılabilir biçimde işler.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET tanımlı değil." }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }
  const baseUrl = smsBaseUrl(`${request.nextUrl.protocol}//${request.nextUrl.host}`);
  const ozet = await vadesiGelenTalepDispatchleriniCalistir(baseUrl);
  const expiredObserved = await suresiDolanTalepOlaylariniKaydet();
  return NextResponse.json({ ok: true, ...ozet, expiredObserved });
}
