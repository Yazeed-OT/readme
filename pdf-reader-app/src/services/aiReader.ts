import { VoiceOption } from '../types';
  
class AIReader {
    private speechSynthesis: SpeechSynthesis;
    private currentUtterance: SpeechSynthesisUtterance | null;
    private voices: VoiceOption[];

    constructor() {
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.voices = [];
        this.loadVoices();
    }

    private loadVoices() {
        this.voices = this.speechSynthesis.getVoices().map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default
        }));

        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = () => {
                this.voices = this.speechSynthesis.getVoices().map(voice => ({
                    name: voice.name,
                    lang: voice.lang,
                    default: voice.default
                }));
            };
        }
    }

    public selectVoice(voiceName: string) {
        if (this.voices.length > 0) {
            const selectedVoice = this.voices.find(voice => voice.name === voiceName);
            if (selectedVoice) {
                this.currentUtterance.voice = selectedVoice;
            }
        }
    }

    public speak(text: string) {
        if (this.currentUtterance) {
            this.stop();
        }
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.onend = () => {
            this.currentUtterance = null;
        };
        this.speechSynthesis.speak(this.currentUtterance);
    }

    public stop() {
        if (this.currentUtterance) {
            this.speechSynthesis.cancel();
            this.currentUtterance = null;
        }
    }

    public isSpeaking(): boolean {
        return this.speechSynthesis.speaking;
    }

    public getAvailableVoices(): VoiceOption[] {
        return this.voices;
    }
}

export default new AIReader();