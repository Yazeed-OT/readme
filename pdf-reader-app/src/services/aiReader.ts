import type { VoiceSettings } from '../types';

export function getVoices(): SpeechSynthesisVoice[] {
  return window.speechSynthesis.getVoices();
}

export function onVoicesChanged(cb: () => void) {
  window.speechSynthesis.onvoiceschanged = cb;
}

export function cancel() {
  window.speechSynthesis.cancel();
}

export function pause() {
  window.speechSynthesis.pause();
}

export function resume() {
  window.speechSynthesis.resume();
}

function pickVoice(uri?: string, lang?: string) {
  const voices = getVoices();
  if (uri) return voices.find(v => v.voiceURI === uri) ?? null;
  if (lang) return voices.find(v => v.lang?.startsWith(lang)) ?? null;
  return voices[0] ?? null;
}

// Speak in chunks and emit global char index via callback and custom event
export async function speak(
  text: string,
  settings: VoiceSettings,
  onBoundary?: (globalCharIndex: number) => void
) {
  cancel();
  const chunks = splitIntoChunks(text, 1600);
  let baseIndex = 0;

  for (const chunk of chunks) {
    await new Promise<void>((resolve) => {
      const u = new SpeechSynthesisUtterance(chunk);
      const voice = pickVoice(settings.voiceURI, settings.lang);
      if (voice) u.voice = voice;
      if (settings.rate) u.rate = settings.rate;
      if (settings.pitch) u.pitch = settings.pitch;

      u.onboundary = (e: SpeechSynthesisEvent) => {
        const idx = baseIndex + (e.charIndex ?? 0);
        onBoundary?.(idx);
        window.dispatchEvent(new CustomEvent('reader:boundary', { detail: idx }));
      };
      u.onend = () => resolve();
      window.speechSynthesis.speak(u);
    });
    baseIndex += chunk.length;
  }
}

function splitIntoChunks(s: string, maxLen: number) {
  if (s.length <= maxLen) return [s];
  const parts: string[] = [];
  let i = 0;
  while (i < s.length) {
    let end = Math.min(i + maxLen, s.length);
    const dot = s.lastIndexOf('.', end);
    const sp = s.lastIndexOf(' ', end);
    if (dot > i + 200) end = dot + 1;
    else if (sp > i + 200) end = sp + 1;
    parts.push(s.slice(i, end));
    i = end;
  }
  return parts;
}