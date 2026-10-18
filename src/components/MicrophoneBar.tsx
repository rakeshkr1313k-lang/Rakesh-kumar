import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X, CornerDownLeft, Sparkles } from 'lucide-react';

interface MicrophoneBarProps {
  isListening: boolean;
  interimTranscript: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const MicrophoneBar: React.FC<MicrophoneBarProps> = ({
  isListening,
  interimTranscript,
  onStartListening,
  onStopListening,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync interim transcript into input text or preview when listening
  useEffect(() => {
    if (isListening && interimTranscript) {
      setInputText(interimTranscript);
    }
  }, [isListening, interimTranscript]);

  const handleSend = () => {
    const textToSend = inputText.trim() || interimTranscript.trim();
    if (!textToSend || isLoading) return;

    if (isListening) {
      onStopListening();
    }

    onSendMessage(textToSend);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      setInputText('');
      onStartListening();
    }
  };

  return (
    <div className="sticky bottom-0 z-20 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent pt-3 pb-4 px-3 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Live Listening Banner when Microphone is active */}
        {isListening && (
          <div className="bg-gradient-to-r from-rose-600 via-indigo-600 to-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-600/20 flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="relative flex h-3.5 w-3.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-200" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold uppercase tracking-wider block opacity-90 flex items-center gap-1">
                  <span>👨‍🏫</span>
                  <span>राकेश सर सुन रहे हैं...</span>
                </span>
                <p className="text-sm font-semibold truncate font-devanagari">
                  {interimTranscript || 'हिंदी में अपना सवाल बोलिए, मैं ध्यान से सुन रहा हूँ...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {interimTranscript && (
                <button
                  type="button"
                  onClick={handleSend}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-indigo-50 active:scale-95 transition-all flex items-center gap-1 shadow-xs"
                >
                  <span>पूछें</span>
                  <Send className="w-3 h-3" />
                </button>
              )}
              <button
                type="button"
                onClick={onStopListening}
                className="p-1.5 rounded-xl bg-black/25 hover:bg-black/35 text-white transition-all"
                title="माइक बंद करें"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Input Controls Bar */}
        <div className="relative bg-white border-2 border-indigo-200 rounded-2xl shadow-md p-1.5 sm:p-2 flex items-center gap-2 focus-within:border-indigo-600 transition-colors">
          {/* Big Microphone Button */}
          <button
            type="button"
            onClick={handleMicClick}
            disabled={isLoading}
            className={`relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl transition-all duration-300 shrink-0 select-none ${
              isListening
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/40 ring-4 ring-rose-200 animate-pulse'
                : 'bg-gradient-to-tr from-indigo-700 via-blue-600 to-indigo-800 text-white hover:from-indigo-800 hover:to-blue-700 active:scale-95 shadow-md shadow-indigo-600/25'
            }`}
            title={isListening ? 'माइक बंद करें' : 'माइक दबाकर राकेश सर से पूछें'}
            aria-label="Microphone"
          >
            {isListening ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
            {!isListening && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
            )}
          </button>

          {/* Text Input for typing questions */}
          <div className="flex-1 relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder={
                isListening
                  ? 'बोलिए... आपका सवाल टाइप हो रहा है...'
                  : 'राकेश सर से कोई भी सवाल पूछें या माइक दबाकर बोलें...'
              }
              className="w-full bg-transparent text-stone-900 placeholder-stone-400 font-devanagari text-[15px] sm:text-base px-2 py-2 focus:outline-hidden"
            />
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="p-1 text-stone-400 hover:text-stone-600 rounded-lg mr-1"
                title="हटाएँ"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-indigo-700 hover:bg-indigo-800 text-white shadow-xs active:scale-95'
                : 'bg-stone-100 text-stone-300 cursor-not-allowed'
            }`}
            title="राकेश सर को भेजें (Enter)"
            aria-label="Send question"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Subtle helper text */}
        <div className="flex items-center justify-between text-[11px] text-stone-500 px-2 font-medium">
          <span className="flex items-center gap-1.5 text-indigo-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>राकेश टीचिंग सहायक • बोलकर या लिखकर पूछें</span>
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-stone-400">
            <span>Enter दबाकर भेजें</span>
            <CornerDownLeft className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
};
