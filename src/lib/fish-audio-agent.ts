import {
  FISH_AUDIO_AGENT_ADI,
  fishAudioAgentIdEnv,
  fishAudioIstek,
  fishAudioVoiceId,
  FishAudioHata,
} from "./fish-audio";
import {
  SESLI_YARDIM_ARACLARI,
  SESLI_YARDIM_ILK_MESAJ,
  SESLI_YARDIM_SISTEM_PROMPT,
} from "./fish-audio-prompt";

type FishTool = { tool_id: string; name: string };
type FishAgent = {
  agent_id: string;
  name: string;
  publication_state?: "live" | "draft";
};

let hazirAgentId: string | null = null;
let hazirlaniyor: Promise<string> | null = null;

async function aracListesi(): Promise<FishTool[]> {
  const data = await fishAudioIstek<{ tools?: FishTool[] }>(
    "/v1/agent/tools?page_size=100"
  );
  return data.tools ?? [];
}

async function ajanListesi(): Promise<FishAgent[]> {
  const q = encodeURIComponent(FISH_AUDIO_AGENT_ADI);
  const data = await fishAudioIstek<{ agents?: FishAgent[] }>(
    `/v1/agent/agents?search=${q}&page_size=30`
  );
  return data.agents ?? [];
}

async function aracOlusturVeyaBul(
  tanim: (typeof SESLI_YARDIM_ARACLARI)[number],
  mevcut: FishTool[]
): Promise<string> {
  const varOlan = mevcut.find((t) => t.name === tanim.name);
  if (varOlan) return varOlan.tool_id;

  const govde: Record<string, unknown> = {
    tool_type: "client",
    name: tanim.name,
    description: tanim.description,
    arguments: tanim.arguments,
    expects_response: tanim.expects_response,
  };
  if ("timeout_seconds" in tanim) {
    govde.timeout_seconds = tanim.timeout_seconds;
  }
  if ("execution_mode" in tanim) {
    govde.execution_mode = tanim.execution_mode;
  }

  try {
    const olusan = await fishAudioIstek<FishTool>("/v1/agent/tools", {
      method: "POST",
      body: JSON.stringify(govde),
    });
    return olusan.tool_id;
  } catch (e) {
    if (
      e instanceof FishAudioHata &&
      e.status === 422 &&
      "execution_mode" in tanim
    ) {
      delete govde.execution_mode;
      const olusan = await fishAudioIstek<FishTool>("/v1/agent/tools", {
        method: "POST",
        body: JSON.stringify(govde),
      });
      return olusan.tool_id;
    }
    throw e;
  }
}

async function ajanYayinla(agentId: string): Promise<void> {
  await fishAudioIstek(`/v1/agent/agents/${agentId}/publish`, {
    method: "POST",
  });
}

async function ajanHazirlaIc(): Promise<string> {
  const envId = fishAudioAgentIdEnv();
  const tools = await aracListesi();
  const toolIds: string[] = [];
  for (const tanim of SESLI_YARDIM_ARACLARI) {
    toolIds.push(await aracOlusturVeyaBul(tanim, tools));
  }

  const voiceId = fishAudioVoiceId();
  const config = {
    prompt: {
      system_prompt: SESLI_YARDIM_SISTEM_PROMPT,
      first_message_mode: "fixed",
      first_message: SESLI_YARDIM_ILK_MESAJ,
    },
    voice: {
      ...(voiceId ? { voice_id: voiceId } : {}),
      expressive: true,
    },
    conversation: {
      max_duration_seconds: 600,
      eagerness: "balanced",
      interruptible: true,
      timezone: "Europe/Istanbul",
      record_audio: false,
    },
    tools: {
      enabled: true,
      tool_ids: toolIds,
      system_tools: { hang_up_call: true },
    },
  };

  let agentId = envId;
  if (!agentId) {
    const ajanlar = await ajanListesi();
    const mevcut = ajanlar.find((a) => a.name === FISH_AUDIO_AGENT_ADI);
    if (mevcut) agentId = mevcut.agent_id;
  }

  if (!agentId) {
    const olusan = await fishAudioIstek<FishAgent>("/v1/agent/agents", {
      method: "POST",
      body: JSON.stringify({
        name: FISH_AUDIO_AGENT_ADI,
        description:
          "Yolda kalan müşteriden sorun alır, talebi arka planda oluşturur.",
        config,
      }),
    });
    agentId = olusan.agent_id;
    await ajanYayinla(agentId);
    return agentId;
  }

  await fishAudioIstek(`/v1/agent/agents/${agentId}/config`, {
    method: "PATCH",
    body: JSON.stringify(config),
  });
  try {
    await ajanYayinla(agentId);
  } catch (e) {
    if (!(e instanceof FishAudioHata && e.status === 409)) throw e;
  }
  return agentId;
}

export function fishAudioAgentIdHazirla(): Promise<string> {
  if (hazirAgentId) return Promise.resolve(hazirAgentId);
  if (!hazirlaniyor) {
    hazirlaniyor = ajanHazirlaIc()
      .then((id) => {
        hazirAgentId = id;
        return id;
      })
      .catch((e) => {
        hazirlaniyor = null;
        throw e;
      });
  }
  return hazirlaniyor;
}

export type FishSessionToken = {
  session_id: string;
  expires_at: string;
  max_duration_seconds: number;
  transport: string;
  livekit_url: string;
  token: string;
};

export async function fishAudioOturumOlustur(): Promise<FishSessionToken> {
  const agentId = await fishAudioAgentIdHazirla();
  const govde = {
    agent_id: agentId,
    name: "ACB çağrı merkezi",
    timezone: "Europe/Istanbul",
    tool_events: true,
    overrides: {
      system_prompt: SESLI_YARDIM_SISTEM_PROMPT,
      first_message: SESLI_YARDIM_ILK_MESAJ,
    },
  };

  try {
    return await fishAudioIstek<FishSessionToken>("/v1/agent/sessions", {
      method: "POST",
      body: JSON.stringify(govde),
    });
  } catch (e) {
    if (e instanceof FishAudioHata && e.status === 409) {
      await ajanYayinla(agentId);
      return fishAudioIstek<FishSessionToken>("/v1/agent/sessions", {
        method: "POST",
        body: JSON.stringify(govde),
      });
    }
    if (e instanceof FishAudioHata && (e.status === 422 || e.status === 400)) {
      return fishAudioIstek<FishSessionToken>("/v1/agent/sessions", {
        method: "POST",
        body: JSON.stringify({
          agent_id: govde.agent_id,
          name: govde.name,
          timezone: govde.timezone,
          tool_events: govde.tool_events,
        }),
      });
    }
    throw e;
  }
}
