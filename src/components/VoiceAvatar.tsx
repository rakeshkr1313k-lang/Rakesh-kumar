import React from 'react';
import { Mic, Volume2, Sparkles, AlertCircle, BookOpen } from 'lucide-react';

interface VoiceAvatarProps {
  status: 'idle' | 'listening' | 'processing' | 'speaking';
  interimTranscript?: string;
  errorMessage?: string;
  onClickAvatar?: () => void;
  voicePersona: string;
}

export const VoiceAvatar: React.FC<VoiceAvatarProps> = ({
  status,
  interimTranscript,
  errorMessage,
  onClickAvatar,
  voicePersona,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-3 px-4 text-center">
      <div className="relative group cursor-pointer" onClick={onClickAvatar}>
        {/* Pulsing rings when listening */}
        {status === 'listening' && (
          <>
            <span className="absolute -inset-4 rounded-full bg-rose-400/30 animate-ping opacity-75" />
            <span className="absolute -inset-8 rounded-full bg-indigo-400/20 animate-pulse" />
          </>
        )}

        {/* Pulsing rings when speaking */}
        {status === 'speaking' && (
          <>
            <span className="absolute -inset-3 rounded-full bg-emerald-400/25 animate-ping opacity-75" />
            <span className="absolute -inset-6 rounded-full bg-indigo-400/15 animate-pulse" />
          </>
        )}

        {/* Shimmer rings when processing */}
        {status === 'processing' && (
          <span className="absolute -inset-3 rounded-full bg-gradient-to-r from-indigo-400 via-amber-300 to-blue-500 opacity-40 blur-md animate-spin" />
        )}

        {/* Main Avatar Circle */}
        <div
          className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 shadow-xl select-none ${
            status === 'listening'
              ? 'bg-gradient-to-br from-rose-500 to-orange-600 scale-105 shadow-rose-500/35 text-white'
              : status === 'speaking'
              ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 scale-105 shadow-indigo-500/30 text-white'
              : status === 'processing'
              ? 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-indigo-500/30 text-white animate-pulse'
              : 'bg-gradient-to-br from-indigo-50 via-white to-amber-50 border-2 border-indigo-200/90 text-indigo-950 hover:scale-105 hover:shadow-indigo-500/20'
          }`}
        >
          {/* Inner Content Based on Status */}
          {status === 'listening' ? (
            <div className="flex flex-col items-center">
              <Mic className="w-8 h-8 sm:w-9 sm:h-9 animate-bounce text-white" />
              <span className="text-[10px] font-bold tracking-wider mt-1 uppercase text-rose-100">
                सुन रहा हूँ
              </span>
            </div>
          ) : status === 'speaking' ? (
            <div className="flex flex-col items-center">
              <Volume2 className="w-8 h-8 sm:w-9 sm:h-9 animate-pulse text-white" />
              <div className="flex items-center gap-1 mt-1.5 h-3">
                <span className="w-1 bg-white rounded-full animate-soundwave-1" />
                <span className="w-1 bg-white rounded-full animate-soundwave-2" />
                <span className="w-1 bg-white rounded-full animate-soundwave-3" />
                <span className="w-1 bg-white rounded-full animate-soundwave-4" />
                <span className="w-1 bg-white rounded-full animate-soundwave-5" />
              </div>
            </div>
          ) : status === 'processing' ? (
            <div className="flex flex-col items-center">
              <Sparkles className="w-8 h-8 sm:w-9 sm:h-9 animate-spin text-white" />
              <span className="text-[10px] font-bold tracking-wider mt-1 text-indigo-100">
                पाठ तैयार हो रहा है...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl drop-shadow-sm">👨‍🏫</span>
              <span className="text-[11px] font-bold tracking-tight text-indigo-900 mt-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-600" />
                राकेश सर
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Status Label & Active Info */}
      <div className="mt-3 max-w-lg mx-auto">
        {status === 'listening' ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2 shadow-xs inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <p className="text-xs sm:text-sm font-medium text-rose-950 font-devanagari">
              {interimTranscript ? (
                <span className="italic font-semibold">"{interimTranscript}"</span>
              ) : (
                'राकेश सर सुन रहे हैं... अपना सवाल पूछिए!'
              )}
            </p>
          </div>
        ) : status === 'speaking' ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2 shadow-xs inline-flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs sm:text-sm font-medium text-emerald-950 font-devanagari">
              राकेश सर बोलकर समझा रहे हैं... ({voicePersona === 'Puck' ? 'पुरुष आवाज़' : 'मधुर आवाज़'})
            </p>
          </div>
        ) : status === 'processing' ? (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-2 shadow-xs inline-flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
            <p className="text-xs sm:text-sm font-medium text-indigo-900 font-devanagari">
              राकेश सर सरल व्याख्या और उदाहरण तैयार कर रहे हैं...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-2 shadow-xs inline-flex items-center gap-2 text-rose-800">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <p className="text-xs font-medium">{errorMessage}</p>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-stone-600 font-medium font-devanagari">
            नमस्ते! मैं आपका शिक्षक <strong className="text-indigo-800">राकेश</strong> हूँ। नीचे दिए गए <strong className="text-rose-600">माइक बटन</strong> से कुछ भी पूछें!
          </p>
        )}
      </div>
    </div>
  );
};
