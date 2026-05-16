import { NextResponse } from "next/server";
import { getSmsLog } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export async function GET() {
  await ensureSeedData();
  const log = await getSmsLog();
  return NextResponse.json(log.slice(0, 50));
}
