/** Tarayıcıda OpenAI Realtime WebRTC — API anahtarı yok, yalnızca ephemeral token. */

export type OpenAiRealtimeBaglanti = {
  gonder: (ev: Record<string, unknown>) => void;
  setMicMuted: (muted: boolean) => void;
  kapat: () => void;
};

export async function openaiRealtimeBaglan(opts: {
  clientSecret: string;
  onEvent: (ev: Record<string, unknown>) => void;
}): Promise<OpenAiRealtimeBaglanti> {
  const pc = new RTCPeerConnection();
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0] ?? null;
  };

  const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
  for (const track of ms.getAudioTracks()) {
    pc.addTrack(track, ms);
  }

  const dc = pc.createDataChannel("oai-events");
  dc.addEventListener("message", (e) => {
    try {
      const ev = JSON.parse(String(e.data)) as Record<string, unknown>;
      opts.onEvent(ev);
    } catch {
      /* yoksay */
    }
  });

  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  const sdpResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    body: offer.sdp,
    headers: {
      Authorization: `Bearer ${opts.clientSecret}`,
      "Content-Type": "application/sdp",
    },
  });
  if (!sdpResponse.ok) {
    ms.getTracks().forEach((t) => t.stop());
    pc.close();
    const t = await sdpResponse.text();
    throw new Error(`ChatGPT bağlantısı ${sdpResponse.status}: ${t.slice(0, 200)}`);
  }
  const answer = await sdpResponse.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answer });

  await new Promise<void>((resolve, reject) => {
    if (dc.readyState === "open") {
      resolve();
      return;
    }
    const t = window.setTimeout(() => reject(new Error("ChatGPT veri kanalı zaman aşımı.")), 12000);
    dc.addEventListener(
      "open",
      () => {
        window.clearTimeout(t);
        resolve();
      },
      { once: true }
    );
    dc.addEventListener(
      "error",
      () => {
        window.clearTimeout(t);
        reject(new Error("ChatGPT veri kanalı açılamadı."));
      },
      { once: true }
    );
  });

  return {
    gonder: (ev) => {
      if (dc.readyState === "open") dc.send(JSON.stringify(ev));
    },
    setMicMuted: (muted) => {
      for (const track of ms.getAudioTracks()) track.enabled = !muted;
    },
    kapat: () => {
      try {
        dc.close();
      } catch {
        /* ignore */
      }
      ms.getTracks().forEach((t) => t.stop());
      pc.close();
      audioEl.srcObject = null;
      audioEl.remove();
    },
  };
}
