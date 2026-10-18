// Speech Synthesis Player for Hindi Assistant (Gemini Flash Lite TTS + Web Speech Synthesis fallback)

class HindiVoicePlayer {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioCache = new Map<string, string>(); // text -> blobUrl
  private onStateChange?: (isPlaying: boolean, textId?: string) => void;
  private currentPlayingId?: string;

  public subscribe(callback: (isPlaying: boolean, textId?: string) => void) {
    this.onStateChange = callback;
  }

  public async speak(options: {
    id: string;
    text: string;
    voicePersona?: 'Kore' | 'Puck' | 'Zephyr';
    rate?: number;
    useLocalTtsOnly?: boolean;
  }): Promise<void> {
    this.stop();
    this.currentPlayingId = options.id;

    // Clean text for speaking: eliminate markdown symbols and hashtags
    const spokenText = options.text
      .replace(/[*#`_~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!spokenText) return;

    // Notify playing started
    this.onStateChange?.(true, this.currentPlayingId);

    // Try Gemini Server TTS first if not local-only
    if (!options.useLocalTtsOnly) {
      try {
        const cacheKey = `${options.voicePersona || 'Kore'}_${spokenText.substring(0, 80)}`;
        let audioUrl = this.audioCache.get(cacheKey);

        if (!audioUrl) {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: spokenText,
              voiceName: options.voicePersona || 'Kore',
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.audio) {
              const byteCharacters = atob(data.audio);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: data.mimeType || 'audio/wav' });
              audioUrl = URL.createObjectURL(blob);
              this.audioCache.set(cacheKey, audioUrl);
            }
          }
        }

        if (audioUrl) {
          const audio = new Audio(audioUrl);
          if (options.rate) {
            audio.playbackRate = options.rate;
          }
          this.currentAudio = audio;

          audio.onended = () => {
            this.currentAudio = null;
            this.currentPlayingId = undefined;
            this.onStateChange?.(false);
          };

          audio.onerror = () => {
            this.currentAudio = null;
            // Fallback to browser SpeechSynthesis
            this.speakWithWebSpeech(spokenText, options.rate);
          };

          await audio.play();
          return;
        }
      } catch (err) {
        console.warn('Gemini TTS error, falling back to Web Speech API:', err);
      }
    }

    // Fallback: Web Speech API with Hindi voice
    this.speakWithWebSpeech(spokenText, options.rate);
  }

  private speakWithWebSpeech(text: string, rate: number = 1.0) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      this.onStateChange?.(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = rate;

    // Try finding Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(
      (v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')
    );
    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      this.currentPlayingId = undefined;
      this.onStateChange?.(false);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.currentUtterance = null;
      this.currentPlayingId = undefined;
      this.onStateChange?.(false);
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    if (this.currentPlayingId) {
      this.currentPlayingId = undefined;
      this.onStateChange?.(false);
    }
  }

  public isCurrentlyPlaying(id?: string): boolean {
    if (!this.currentAudio && !this.currentUtterance) return false;
    if (!id) return true;
    return this.currentPlayingId === id;
  }
}

export const hindiVoicePlayer = new HindiVoicePlayer();
