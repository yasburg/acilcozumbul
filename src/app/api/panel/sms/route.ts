import { NextResponse } from "next/server";
import { getSmsLog } from "@/lib/db";
import { smsDurumu } from "@/lib/sms-provider";

export async function GET() {
  const log = await getSmsLog();
  return NextResponse.json({
    durum: smsDurumu(),
    kayitlar: log.slice(0, 100),
  });
}
