export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  audioBase64?: string;
  audioUrl?: string;
  isPlaying?: boolean;
  status?: 'sending' | 'complete' | 'error';
  errorMessage?: string;
  subject?: string;
}

export type VoicePersona = 'Kore' | 'Puck' | 'Zephyr';

export interface VoiceSettings {
  autoSpeak: boolean;
  voicePersona: VoicePersona;
  speechRate: number; // 0.8 to 1.2
  inputLanguage: string; // 'hi-IN'
  teachingMode: 'comprehensive' | 'simplified' | 'quiz_mode';
}

export interface TeachingSubject {
  id: string;
  name: string;
  icon: string;
  description: string;
  sampleQuestion: string;
}

export interface PromptSuggestion {
  category: string;
  icon: string;
  text: string;
  badge?: string;
}
