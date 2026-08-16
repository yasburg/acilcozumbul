import { NextRequest, NextResponse } from "next/server";
import { getFile } from "@/lib/file-storage";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path;
  if (!pathParts || pathParts.length < 2) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const bucket = pathParts[0];
  const filePath = pathParts.slice(1).join("/");

  let buffer = await getFile(bucket, filePath);
  
  if (!buffer) {
    // Fallback: try downloading from Supabase Storage if present
    const supabaseStorageUrl = `https://nhmozloekphnjhjembus.supabase.co/storage/v1/object/public/${bucket}/${filePath}`;
    try {
      const resp = await fetch(supabaseStorageUrl);
      if (resp.ok) {
        const fileArr = await resp.arrayBuffer();
        buffer = Buffer.from(fileArr);
      }
    } catch {
      // Fallback failed
    }
  }

  if (!buffer) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  let contentType = "application/octet-stream";
  if (filePath.endsWith(".pdf")) contentType = "application/pdf";
  else if (filePath.endsWith(".png")) contentType = "image/png";
  else if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) contentType = "image/jpeg";
  else if (filePath.endsWith(".webp")) contentType = "image/webp";

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

