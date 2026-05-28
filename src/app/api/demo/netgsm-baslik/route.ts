import { NextResponse } from "next/server";
import { netgsmGondericiAdlariSorgula } from "@/lib/sms-provider";

export async function GET() {
  const sonuc = await netgsmGondericiAdlariSorgula();
  return NextResponse.json(sonuc);
}
