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
  rate?: number;
  pitch?: number;
  lang?: string;
};

// Generic shim so TS accepts ?worker imports
declare module '*?worker' {
  const WorkerCtor: new () => Worker;
  export default WorkerCtor;
}