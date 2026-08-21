import {
  SESLI_YARDIM_ARACLARI,
  SESLI_YARDIM_ILK_MESAJ,
  SESLI_YARDIM_SISTEM_PROMPT,
} from "./fish-audio-prompt";
import {
  openaiApiKey,
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

function realtimeSessionGovde(extra: Record<string, unknown> = {}) {
  return {
    type: "realtime",
    model: openaiRealtimeModel(),
    instructions: `${SESLI_YARDIM_SISTEM_PROMPT}

Konuşma yalnızca Türkçe. İlk sözün: ${SESLI_YARDIM_ILK_MESAJ}`,
    audio: {
      input: {
        transcription: { model: "gpt-4o-transcribe" },
        turn_detection: { type: "semantic_vad" },
      },
      output: { voice: openaiRealtimeVoice() },
    },
    tools: realtimeAraclar(),
    tool_choice: "auto",
    reasoning: { effort: "low" },
    ...extra,
  };
}

function clientSecretOku(data: Record<string, unknown>): string {
  if (typeof data.value === "string" && data.value.startsWith("ek_")) {
    return data.value;
  }
  const secret = data.client_secret;
  if (secret && typeof secret === "object") {
    const v = (secret as { value?: string }).value;
    if (typeof v === "string") return v;
  }
  throw new OpenAiHata(502, "ChatGPT oturum anahtarı alınamadı.");
}

export async function openaiRealtimeClientSecret(): Promise<{
  clientSecret: string;
  model: string;
}> {
  const key = openaiApiKey();
  if (!key) throw new OpenAiHata(503, "OPENAI_API_KEY tanımlı değil.");

  const denemeler: Record<string, unknown>[] = [
    realtimeSessionGovde(),
    realtimeSessionGovde({
      audio: {
        input: {
          transcription: { model: "gpt-4o-mini-transcribe" },
          turn_detection: { type: "server_vad" },
        },
        output: { voice: openaiRealtimeVoice() },
      },
    }),
    {
      type: "realtime",
      model: openaiRealtimeModel(),
      instructions: `${SESLI_YARDIM_SISTEM_PROMPT}\nKonuşma Türkçe. İlk sözün: ${SESLI_YARDIM_ILK_MESAJ}`,
      audio: { output: { voice: openaiRealtimeVoice() } },
      tools: realtimeAraclar(),
      tool_choice: "auto",
    },
  ];

  let sonHata: OpenAiHata | null = null;
  for (const session of denemeler) {
    const res = await fetch(`${OPENAI_API}/realtime/client_secrets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ session }),
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, unknown>;
      return {
        clientSecret: clientSecretOku(data),
        model: openaiRealtimeModel(),
      };
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
  throw sonHata ?? new OpenAiHata(502, "ChatGPT canlı oturum açılamadı.");
}
