import { NextRequest, NextResponse } from "next/server";
import { POST as talepOlustur } from "@/app/api/talep/route";
import { smsYalnizTesterCekicilerMi } from "@/lib/sms";

/** Yerel / tester-only: gerçek çekicilere gitmez, SMS yalnız testerHesap. */
export async function POST(request: NextRequest) {
  if (!smsYalnizTesterCekicilerMi()) {
    return NextResponse.json(
      {
        error:
          "Çağrı merkezi talebi yalnızca yerel geliştirme veya SMS_TESTER_ONLY=1 iken oluşur.",
      },
      { status: 403 }
    );
  }
  return talepOlustur(request);
}
