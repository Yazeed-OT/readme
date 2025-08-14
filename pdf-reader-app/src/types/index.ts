export interface PdfDocument {
    title: string;
    author: string;
    pages: number;
    textContent: string[];
}

export interface VoiceOption {
    name: string;
    lang: string;
    uri: string;
}

export interface HighlightedTextProps {
    currentTextPosition: number;
    totalTextLength: number;
}

export type VoiceSettings = {
  voiceURI?: string;
  rate?: number;   // 0.1 - 10
  pitch?: number;  // 0 - 2
  lang?: string;
};

// Vite worker import shim for pdf.js
declare module 'pdfjs-dist/build/pdf.worker.min.mjs?worker' {
  const WorkerCtor: new () => Worker;
  export default WorkerCtor;
}