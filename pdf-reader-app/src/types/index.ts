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