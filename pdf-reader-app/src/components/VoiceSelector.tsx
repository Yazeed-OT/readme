import React, { useEffect, useState } from 'react';
import { getVoices, onVoicesChanged } from '../services/aiReader';
import type { VoiceSettings } from '../types';

declare global {
  interface Window { voiceSettings?: VoiceSettings; }
}

export default function VoiceSelector() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>();
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);

  useEffect(() => {
    const load = () => setVoices(getVoices());
    load();
    onVoicesChanged(load);
  }, []);

  useEffect(() => {
    window.voiceSettings = { voiceURI, rate, pitch };
  }, [voiceURI, rate, pitch]);

  return (
    <div className="controls">
      <label className="small">Voice</label>
      <select
        value={voiceURI ?? ''}
        onChange={(e) => setVoiceURI(e.target.value || undefined)}
      >
        <option value="">Default</option>
        {voices.map(v => (
          <option key={v.voiceURI} value={v.voiceURI}>
            {v.name} ({v.lang})
          </option>
        ))}
      </select>

      <label className="small">Rate {rate.toFixed(1)}</label>
      <input type="range" min={0.5} max={2} step={0.1}
        value={rate} onChange={e => setRate(parseFloat(e.target.value))} />

      <label className="small">Pitch {pitch.toFixed(1)}</label>
      <input type="range" min={0} max={2} step={0.1}
        value={pitch} onChange={e => setPitch(parseFloat(e.target.value))} />
    </div>
  );
}