import { NextRequest, NextResponse } from "next/server";
import { getPanelSession } from "@/lib/panel-auth";

export async function GET(request: NextRequest) {
  const session = await getPanelSession(request);

  if (!session) {
    return NextResponse.json({ eposta: null, rol: null });
  }

  return NextResponse.json({
    eposta: session.email,
    rol: session.role,
  });
}
