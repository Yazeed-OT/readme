import React, { useState } from 'react';
import { extractTextFromPdf } from '../services/pdfParser';
import { speak, pause, resume, cancel } from '../services/aiReader';

export default function PdfViewer() {
    const [text, setText] = useState<string>('');
    const [loading, setLoading] = useState(false);

    async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files?.[0];
        if (!f) return;
        setLoading(true);
        try {
            const t = await extractTextFromPdf(f);
            setText(t);
            window.dispatchEvent(new CustomEvent('reader:text', { detail: t }));
        } finally {
            setLoading(false);
        }
    }

    function onRead() {
        const settings = window.voiceSettings ?? { rate: 1, pitch: 1 };
        speak(text, settings);
    }

    return (
        <div className="controls">
            <input type="file" accept="application/pdf" onChange={onFile} />
            <button onClick={onRead} disabled={!text || loading}>Read</button>
            <button onClick={pause}>Pause</button>
            <button onClick={resume}>Resume</button>
            <button onClick={cancel}>Stop</button>
            {loading && <span className="small">Extracting text…</span>}
        </div>
    );
}