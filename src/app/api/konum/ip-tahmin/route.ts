import { NextRequest, NextResponse } from "next/server";

function istemciIp(request: NextRequest): string | null {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const ip = xff.split(",")[0]?.trim();
    if (ip) return ip;
  }
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return null;
}

function ozelIp(ip: string): boolean {
  return (
    ip === "127.0.0.1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.") ||
    ip.startsWith("172.17.") ||
    ip.startsWith("172.18.") ||
    ip.startsWith("172.19.") ||
    ip.startsWith("172.2") ||
    ip.startsWith("172.30.") ||
    ip.startsWith("172.31.") ||
    ip.startsWith("::1")
  );
}

/** Yaklaşık konum (IP) — ev ağında genelde çalışmaz; canlıda veya mobil veride işe yarar */
export async function GET(request: NextRequest) {
  const ip = istemciIp(request);
  if (!ip || ozelIp(ip)) {
    return NextResponse.json(
      {
        error:
          "Yaklaşık konum bu ağda kullanılamıyor (yerel Wi‑Fi). Adresi elle yazın veya https:// ile test edin.",
      },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,lat,lon,city,regionName,district`,
      { next: { revalidate: 3600 } }
    );
    const data = await res.json();
    if (data.status !== "success") {
      return NextResponse.json(
        { error: data.message ?? "Konum tahmin edilemedi." },
        { status: 502 }
      );
    }

    const adres = [data.district, data.city, data.regionName]
      .filter(Boolean)
      .join(", ");

    return NextResponse.json({
      lat: data.lat,
      lng: data.lon,
      adres: adres || `${data.city}, ${data.regionName}`,
      yaklasik: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Konum servisi yanıt vermedi." },
      { status: 502 }
    );
  }
}
