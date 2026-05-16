import { NextResponse } from "next/server";
import { smsDurumu } from "@/lib/sms-provider";

export async function GET() {
  return NextResponse.json(smsDurumu());
}
