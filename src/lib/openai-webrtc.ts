/** Tarayıcıda OpenAI GPT-Live WebRTC — API anahtarı yok, SDP sunucuda değiş tokuş. */

export type OpenAiRealtimeBaglanti = {
  gonder: (ev: Record<string, unknown>) => void;
  setMicMuted: (muted: boolean) => void;
  kapat: () => void;
};

function iceTopla(pc: RTCPeerConnection, ms = 4000): Promise<void> {
  const adayVar = () => Boolean(pc.localDescription?.sdp?.includes("a=candidate"));
  if (pc.iceGatheringState === "complete" && adayVar()) return Promise.resolve();
  return new Promise((resolve) => {
    const bitir = () => {
      window.clearTimeout(t);
      pc.removeEventListener("icegatheringstatechange", onState);
      pc.removeEventListener("icecandidate", onCand);
      resolve();
    };
    const t = window.setTimeout(bitir, ms);
    function onState() {
      if (pc.iceGatheringState === "complete") bitir();
    }
    function onCand(ev: RTCPeerConnectionIceEvent) {
      if (ev.candidate === null || adayVar()) bitir();
    }
    pc.addEventListener("icegatheringstatechange", onState);
    pc.addEventListener("icecandidate", onCand);
    onState();
  });
}

function sdpGonder(sdp: string): string {
  const govde = sdp.replace(/^\uFEFF/, "").trim();
  const crlf = govde.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\n/g, "\r\n");
  return crlf.endsWith("\r\n") ? crlf : `${crlf}\r\n`;
}

export async function openaiLiveBaglan(opts: {
  sdpAlisveris: (sdp: string) => Promise<string>;
  onEvent: (ev: Record<string, unknown>) => void;
}): Promise<OpenAiRealtimeBaglanti> {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });
  const audioEl = document.createElement("audio");
  audioEl.autoplay = true;
  pc.ontrack = (e) => {
    audioEl.srcObject = e.streams[0] ?? null;
    void audioEl.play().catch(() => {
      /* kullanıcı jesti gerekebilir */
    });
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
  await iceTopla(pc);
  const yerelSdp = pc.localDescription?.sdp;
  if (!yerelSdp?.trim()) {
    ms.getTracks().forEach((t) => t.stop());
    pc.close();
    throw new Error("WebRTC teklifi oluşturulamadı.");
  }

  let cevapSdp: string;
  try {
    cevapSdp = await opts.sdpAlisveris(sdpGonder(yerelSdp));
  } catch (e) {
    ms.getTracks().forEach((t) => t.stop());
    pc.close();
    throw e;
  }

  await pc.setRemoteDescription({ type: "answer", sdp: cevapSdp });

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
        if (dc.readyState === "open") {
          dc.send(JSON.stringify({ type: "session.close" }));
        }
      } catch {
        /* ignore */
      }
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
