import { NextRequest, NextResponse } from "next/server";
import { getCurrentCekici } from "@/lib/auth";
import { updateCekici } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import type { CekiciMusaitlikDurumu } from "@/lib/types";

const GECERLI = new Set<CekiciMusaitlikDurumu>(["auto", "online", "busy", "offline"]);

export async function GET() {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  return NextResponse.json({ availabilityStatus: cekici.availabilityStatus ?? "auto" });
}

export async function PUT(request: NextRequest) {
  await ensureSeedData();
  const cekici = await getCurrentCekici();
  if (!cekici) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const status = body.availabilityStatus as CekiciMusaitlikDurumu;
  if (!GECERLI.has(status)) return NextResponse.json({ error: "Geçersiz müsaitlik durumu." }, { status: 400 });
  await updateCekici({ ...cekici, availabilityStatus: status });
  return NextResponse.json({ availabilityStatus: status });
}
