import { NextRequest, NextResponse } from "next/server";
import { getTaleplerSayfali } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export async function GET(request: NextRequest) {
  await ensureSeedData();
  const { searchParams } = request.nextUrl;
  const limit = Number(searchParams.get("limit") ?? "50");
  const offset = Number(searchParams.get("offset") ?? "0");
  const { talepler, total } = await getTaleplerSayfali({
    limit: Number.isFinite(limit) ? limit : 50,
    offset: Number.isFinite(offset) ? offset : 0,
  });

  return NextResponse.json({
    talepler,
    total,
    limit: Math.min(Math.max(Number.isFinite(limit) ? limit : 50, 1), 200),
    offset: Math.max(Number.isFinite(offset) ? offset : 0, 0),
  });
}
