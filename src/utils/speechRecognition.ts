// Audio & Speech recognition utilities for Hindi voice assistant

interface SpeechRecognitionEventLike {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export class HindiSpeechRecognizer {
  private recognition: SpeechRecognitionInstance | null = null;
  private isListening = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private mediaStream: MediaStream | null = null;

  constructor() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const instance = new SpeechRec();
        instance.continuous = false;
        instance.interimResults = true;
        instance.lang = 'hi-IN'; // Hindi (India)
        this.recognition = instance;
      } catch (e) {
        console.warn('SpeechRecognition init failed:', e);
      }
    }
  }

  public setLanguage(lang: string) {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  public startListening(callbacks: {
    onStart?: () => void;
    onInterimResult?: (transcript: string) => void;
    onFinalResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }): boolean {
    if (this.isListening) {
      this.stopListening();
    }

    // Try standard Web Speech Recognition first
    if (this.recognition) {
      try {
        this.recognition.onstart = () => {
          this.isListening = true;
          callbacks.onStart?.();
        };

        this.recognition.onresult = (event: SpeechRecognitionEventLike) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = 0; i < event.results.length; ++i) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript;
            } else {
              interimTranscript += result[0].transcript;
            }
          }

          if (interimTranscript && callbacks.onInterimResult) {
            callbacks.onInterimResult(interimTranscript);
          }

          if (finalTranscript && callbacks.onFinalResult) {
            callbacks.onFinalResult(finalTranscript);
          }
        };

        this.recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          
          if (event.error === 'not-allowed') {
            callbacks.onError?.('माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।');
          } else if (event.error === 'no-speech') {
            callbacks.onError?.('कोई आवाज़ नहीं सुनाई दी। कृपया पुनः बोलें।');
          } else if (event.error === 'network') {
            // If network error on Web Speech API, try fallback media recording
            this.fallbackMediaRecord(callbacks);
            return;
          } else {
            callbacks.onError?.(`त्रुटि: ${event.error}`);
          }
          callbacks.onEnd?.();
        };

        this.recognition.onend = () => {
          this.isListening = false;
          callbacks.onEnd?.();
        };

        this.recognition.start();
        return true;
      } catch (err) {
        console.warn('Native speech recognition failed to start, falling back to MediaRecorder:', err);
      }
    }

    // Fallback using MediaRecorder + Gemini Transcribe
    return this.fallbackMediaRecord(callbacks);
  }

  private fallbackMediaRecord(callbacks: {
    onStart?: () => void;
    onInterimResult?: (transcript: string) => void;
    onFinalResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }): boolean {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      callbacks.onError?.('आपका ब्राउज़र आवाज़ रिकॉर्डिंग का समर्थन नहीं करता है।');
      return false;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaStream = stream;
        this.audioChunks = [];
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });
        this.mediaRecorder = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        recorder.onstop = async () => {
          this.isListening = false;
          callbacks.onEnd?.();
          
          // Stop media tracks
          stream.getTracks().forEach((track) => track.stop());

          if (this.audioChunks.length === 0) return;

          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            if (!base64Data) return;

            try {
              callbacks.onInterimResult?.('आवाज़ समझी जा रही है...');
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType: mimeType,
                }),
              });
              const data = await response.json();
              if (data.text) {
                callbacks.onFinalResult?.(data.text);
              } else {
                callbacks.onError?.('आवाज़ पहचानी नहीं जा सकी, कृपया दोबारा बोलें।');
              }
            } catch {
              callbacks.onError?.('ऑडियो भेजने में विफल रहा।');
            }
          };
        };

        recorder.start();
        this.isListening = true;
        callbacks.onStart?.();
        callbacks.onInterimResult?.('सुन रहा हूँ... बोलिए...');
      })
      .catch((err) => {
        console.error('MediaRecorder error:', err);
        callbacks.onError?.('माइक्रोफ़ोन चालू नहीं हो सका। कृपया अनुमति जांचें।');
        callbacks.onEnd?.();
      });

    return true;
  }

  public stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
  }

  public getIsListening(): boolean {
    return this.isListening;
  }
}
