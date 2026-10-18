import { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { VoiceAvatar } from './components/VoiceAvatar';
import { MessageList } from './components/MessageList';
import { MicrophoneBar } from './components/MicrophoneBar';
import { SubjectBar } from './components/SubjectBar';
import { PromptSuggestions } from './components/PromptSuggestions';
import { SettingsModal } from './components/SettingsModal';
import { Message, VoiceSettings } from './types';
import { HindiSpeechRecognizer } from './utils/speechRecognition';
import { hindiVoicePlayer } from './utils/speechSynthesis';

const DEFAULT_SETTINGS: VoiceSettings = {
  autoSpeak: true,
  voicePersona: 'Puck', // Default to male teacher voice for Rakesh Sir
  speechRate: 1.0,
  inputLanguage: 'hi-IN',
  teachingMode: 'comprehensive',
};

const INITIAL_WELCOME_MESSAGE: Message = {
  id: 'welcome-rakesh',
  role: 'model',
  text: 'नमस्ते प्रिय विद्यार्थी! 🙏\n\nमैं आपका शिक्षक और मेंटर **राकेश** (Rakesh Sir) हूँ। आज की क्लास में आपका बहुत-बहुत स्वागत है!\n\nचाहे **गणित**, **विज्ञान**, **कंप्यूटर व कोडिंग**, **अंग्रेज़ी बोलना**, या **परीक्षा की तैयारी** हो — आपके मन में जो भी सवाल या संशय (Doubt) है, बेझिझक पूछिए।\n\nनीचे दिए गए **माइक बटन (Microphone)** को दबाकर अपनी आवाज़ में पूछें या लिखकर भेजें। मैं आपको सरल व्यावहारिक उदाहरणों के साथ हिंदी में बोलकर समझाऊँगा!',
  timestamp: Date.now(),
  status: 'complete',
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('rakesh_ai_messages');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('rakesh_ai_settings');
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | undefined>();
  const [showSettings, setShowSettings] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognizerRef = useRef<HindiSpeechRecognizer | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognizer
  useEffect(() => {
    recognizerRef.current = new HindiSpeechRecognizer();
    return () => {
      recognizerRef.current?.stopListening();
    };
  }, []);

  // Subscribe to Hindi voice player state
  useEffect(() => {
    hindiVoicePlayer.subscribe((playing, textId) => {
      setIsSpeaking(playing);
      setPlayingMessageId(playing ? textId : undefined);
    });

    return () => {
      hindiVoicePlayer.stop();
    };
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rakesh_ai_messages', JSON.stringify(messages));
    } catch {
      // ignore
    }
  }, [messages]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rakesh_ai_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Auto-scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Handle Voice Playback
  const handlePlaySpeech = (msg: Message) => {
    hindiVoicePlayer.speak({
      id: msg.id,
      text: msg.text,
      voicePersona: settings.voicePersona,
      rate: settings.speechRate,
    });
  };

  const handleStopSpeech = () => {
    hindiVoicePlayer.stop();
    setIsSpeaking(false);
    setPlayingMessageId(undefined);
  };

  // Handle Send Message to Rakesh Sir
  const handleSendMessage = async (text: string) => {
    const cleanPrompt = text.trim();
    if (!cleanPrompt || isLoading) return;

    // Stop speaking if currently speaking
    handleStopSpeech();
    setErrorMessage(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: cleanPrompt,
      timestamp: Date.now(),
      status: 'complete',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // Add teaching mode nuance to the request if non-standard
      let modeNote = '';
      if (settings.teachingMode === 'simplified') {
        modeNote = '\n[नोट: कृपया एकदम शुरुआती छात्र के लिए सबसे सरलतम शब्दों और आसान उदाहरणों में समझाएं]';
      } else if (settings.teachingMode === 'quiz_mode') {
        modeNote = '\n[नोट: विषय समझाने के बाद छात्र से 1-2 बहुविकल्पीय या अभ्यास प्रश्न पूछकर क्विज़ लें]';
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: cleanPrompt + modeNote,
          history: newMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}`);
      }

      const data = await response.json();
      const reply = data.reply || 'माफ़ कीजिए, मैं अभी उत्तर तैयार नहीं कर सका। कृपया दोबारा पूछें।';

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: Date.now(),
        status: 'complete',
      };

      setMessages((prev) => [...prev, aiMessage]);

      // If Auto-speak is on, automatically speak the Hindi reply as teacher
      if (settings.autoSpeak) {
        hindiVoicePlayer.speak({
          id: aiMessage.id,
          text: reply,
          voicePersona: settings.voicePersona,
          rate: settings.speechRate,
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Teaching Chat error:', error);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: 'माफ़ कीजिए, उत्तर प्राप्त करने में कुछ समस्या आई। कृपया अपना इंटरनेट जांचें या पुनः पूछें।',
        timestamp: Date.now(),
        status: 'error',
        errorMessage: error.message,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Microphone Start
  const handleStartListening = () => {
    handleStopSpeech();
    setErrorMessage(null);
    setInterimTranscript('');

    if (!recognizerRef.current) return;

    const started = recognizerRef.current.startListening({
      onStart: () => {
        setIsListening(true);
      },
      onInterimResult: (transcript) => {
        setInterimTranscript(transcript);
      },
      onFinalResult: (finalTranscript) => {
        setIsListening(false);
        setInterimTranscript('');
        if (finalTranscript.trim()) {
          handleSendMessage(finalTranscript.trim());
        }
      },
      onError: (err) => {
        setIsListening(false);
        setInterimTranscript('');
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });

    if (!started) {
      setIsListening(false);
      setErrorMessage('माइक्रोफ़ोन शुरू करने में समस्या आई।');
    }
  };

  // Handle Microphone Stop
  const handleStopListening = () => {
    if (recognizerRef.current) {
      recognizerRef.current.stopListening();
    }
    setIsListening(false);

    // If there is any interim transcript accumulated, submit it
    if (interimTranscript.trim()) {
      handleSendMessage(interimTranscript.trim());
      setInterimTranscript('');
    }
  };

  // Clear Chat History
  const handleClearChat = () => {
    handleStopSpeech();
    handleStopListening();
    setMessages([INITIAL_WELCOME_MESSAGE]);
    setErrorMessage(null);
  };

  const currentAvatarStatus = isListening
    ? 'listening'
    : isSpeaking
    ? 'speaking'
    : isLoading
    ? 'processing'
    : 'idle';

  return (
    <div className="flex flex-col h-screen max-h-screen bg-stone-50 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
        onOpenSettings={() => setShowSettings(true)}
        onClearChat={handleClearChat}
        isSpeaking={isSpeaking}
        onStopSpeaking={handleStopSpeech}
      />

      {/* Main Chat Scroll Area */}
      <main
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 space-y-3 max-w-4xl w-full mx-auto"
      >
        {/* Subject Quick Selector Bar */}
        <SubjectBar onSelectPrompt={handleSendMessage} />

        {/* Friendly Teacher Avatar */}
        <VoiceAvatar
          status={currentAvatarStatus}
          interimTranscript={interimTranscript}
          errorMessage={errorMessage || undefined}
          voicePersona={settings.voicePersona}
          onClickAvatar={() => {
            if (isSpeaking) {
              handleStopSpeech();
            } else if (isListening) {
              handleStopListening();
            } else {
              handleStartListening();
            }
          }}
        />

        {/* Suggested Quick Topics from Rakesh Sir if chat is fresh */}
        {messages.length <= 1 && (
          <PromptSuggestions onSelectPrompt={handleSendMessage} />
        )}

        {/* Message Conversation List */}
        <MessageList
          messages={messages}
          playingMessageId={playingMessageId}
          onPlaySpeech={handlePlaySpeech}
          onStopSpeech={handleStopSpeech}
          onQuickPrompt={handleSendMessage}
          isLoading={isLoading}
        />
      </main>

      {/* Fixed Bottom Microphone & Input Bar */}
      <MicrophoneBar
        isListening={isListening}
        interimTranscript={interimTranscript}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
      />
    </div>
  );
}
