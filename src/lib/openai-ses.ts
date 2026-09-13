import {
  SESLI_YARDIM_ARACLARI,
  SESLI_YARDIM_ILK_MESAJ,
  SESLI_YARDIM_SISTEM_PROMPT,
} from "./fish-audio-prompt";
import {
  openaiApiKey,
  openaiLiveBackendModel,
  openaiRealtimeModel,
  openaiRealtimeVoice,
} from "./sesli-saglayici";

const OPENAI_API = "https://api.openai.com/v1";

export class OpenAiHata extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "OpenAiHata";
    this.status = status;
  }
}

async function openaiHata(res: Response): Promise<never> {
  const text = await res.text();
  let ozet = text.slice(0, 240);
  try {
    const j = JSON.parse(text) as { error?: { message?: string } };
    if (j.error?.message) ozet = j.error.message;
  } catch {
    /* düz metin */
  }
  throw new OpenAiHata(res.status, `ChatGPT ${res.status}: ${ozet}`);
}

function realtimeAraclar(): Record<string, unknown>[] {
  return SESLI_YARDIM_ARACLARI.map((a) => {
    const properties: Record<string, { type: string; description: string }> = {};
    for (const arg of a.arguments) {
      properties[arg.name] = {
        type: arg.name === "hedef_bilinmiyor" ? "boolean" : "string",
        description: arg.description,
      };
    }
    return {
      type: "function",
      name: a.name,
      description: a.description,
      parameters: {
        type: "object",
        properties,
        additionalProperties: false,
      },
    };
  });
}

function liveTalimat(): string {
  return `${SESLI_YARDIM_SISTEM_PROMPT}

Konuşma yalnızca Türkçe, doğal ve kısa. İlk sözün: ${SESLI_YARDIM_ILK_MESAJ}
Konum, sorun ve talep güncellemelerini arka plana delege et.`;
}

function liveOturumGovde(delegation: Record<string, unknown>): Record<string, unknown> {
  return {
    model: openaiRealtimeModel(),
    instructions: liveTalimat(),
    audio: {
      output: { voice: openaiRealtimeVoice() },
    },
    delegation,
  };
}

function sdpCevapOku(data: Record<string, unknown>): {
  sdp: string;
  sessionId: string;
} {
  const transport = data.transport as { sdp?: string } | undefined;
  const session = data.session as { id?: string } | undefined;
  const sdp = typeof transport?.sdp === "string" ? transport.sdp : "";
  const sessionId = typeof session?.id === "string" ? session.id : "";
  if (!sdp.trim()) throw new OpenAiHata(502, "ChatGPT Live SDP yanıtı alınamadı.");
  return { sdp, sessionId };
}

export function sdpTeklifHazirla(sdp: string): string {
  const govde = sdp.replace(/^\uFEFF/, "").trim();
  if (!govde) throw new OpenAiHata(400, "WebRTC SDP teklifi gerekli.");
  if (!govde.includes("v=0")) {
    throw new OpenAiHata(400, "WebRTC SDP teklifi geçersiz.");
  }
  const crlf = govde.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\r\n");
  return crlf.endsWith("\r\n") ? crlf : `${crlf}\r\n`;
}

export async function openaiLiveOturumAc(sdp: string): Promise<{
  sdp: string;
  sessionId: string;
  model: string;
}> {
  const key = openaiApiKey();
  if (!key) throw new OpenAiHata(503, "OPENAI_API_KEY tanımlı değil.");
  const teklif = sdpTeklifHazirla(sdp);

  const denemeler: Record<string, unknown>[] = [
    liveOturumGovde({
      type: "responses",
      responses: {
        model: openaiLiveBackendModel(),
        instructions: SESLI_YARDIM_SISTEM_PROMPT,
        tools: realtimeAraclar(),
        tool_choice: "auto",
      },
    }),
    liveOturumGovde({ type: "client" }),
  ];

  let sonHata: OpenAiHata | null = null;
  for (const session of denemeler) {
    const res = await fetch(`${OPENAI_API}/live/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session,
        transport: { type: "webrtc", sdp: teklif },
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      return { ...sdpCevapOku(data), model: openaiRealtimeModel() };
    }
    try {
      await openaiHata(res);
    } catch (e) {
      sonHata = e instanceof OpenAiHata ? e : sonHata;
      if (e instanceof OpenAiHata && e.status !== 400 && e.status !== 422) {
        throw e;
      }
    }
  }
  throw sonHata ?? new OpenAiHata(502, "ChatGPT Live oturumu açılamadı.");
}
