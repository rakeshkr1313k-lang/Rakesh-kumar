import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, User, AlertCircle, GraduationCap, HelpCircle, Lightbulb } from 'lucide-react';
import { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  playingMessageId?: string;
  onPlaySpeech: (msg: Message) => void;
  onStopSpeech: () => void;
  onQuickPrompt: (promptText: string) => void;
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  playingMessageId,
  onPlaySpeech,
  onStopSpeech,
  onQuickPrompt,
  isLoading,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderFormattedText = (text: string) => {
    const paragraphs = text.split('\n');
    return (
      <div className="space-y-2.5 leading-relaxed text-stone-800 text-[15px] font-devanagari">
        {paragraphs.map((p, idx) => {
          if (!p.trim()) return <div key={idx} className="h-1" />;

          // Highlight Headers (### or ##)
          if (p.trim().startsWith('### ') || p.trim().startsWith('## ')) {
            const headingText = p.replace(/^#+\s+/, '');
            return (
              <h4 key={idx} className="text-base font-bold text-indigo-900 mt-2 border-b border-indigo-100 pb-1 flex items-center gap-1.5">
                <span className="text-indigo-600">🔹</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(headingText) }} />
              </h4>
            );
          }

          // Highlight bullet points
          if (p.trim().startsWith('* ') || p.trim().startsWith('- ') || p.trim().startsWith('• ')) {
            const content = p.trim().replace(/^[*•-]\s+/, '');
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-indigo-600 font-bold text-base leading-none mt-1">•</span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
              </div>
            );
          }

          // Highlight numbered lists (1. , 2. )
          const matchNum = p.trim().match(/^(\d+[\.\)])\s+(.*)/);
          if (matchNum) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="text-indigo-700 font-bold shrink-0 text-sm mt-0.5 px-1.5 py-0.2 rounded-md bg-indigo-50 border border-indigo-200">
                  {matchNum[1]}
                </span>
                <span dangerouslySetInnerHTML={{ __html: formatBold(matchNum[2]) }} />
              </div>
            );
          }

          return (
            <p key={idx} dangerouslySetInnerHTML={{ __html: formatBold(p) }} />
          );
        })}
      </div>
    );
  };

  const formatBold = (str: string) => {
    return str.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-indigo-950">$1</strong>');
  };

  return (
    <div className="space-y-4 pb-6">
      {messages.map((message, index) => {
        const isAI = message.role === 'model';
        const isPlayingThis = playingMessageId === message.id;
        const isLastMessage = index === messages.length - 1;

        return (
          <div
            key={message.id}
            className={`flex gap-3 sm:gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
          >
            {/* AI Teacher Avatar */}
            {isAI && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1 text-base select-none">
                👨‍🏫
              </div>
            )}

            {/* Bubble Container */}
            <div
              className={`relative max-w-[90%] sm:max-w-[82%] rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-xs transition-all ${
                isAI
                  ? 'bg-white border border-indigo-100 text-stone-900 rounded-tl-sm'
                  : 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-tr-sm shadow-indigo-600/10'
              }`}
            >
              {/* Message Header for AI Teacher */}
              {isAI && (
                <div className="flex items-center justify-between gap-3 border-b border-indigo-50 pb-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                    <span>राकेश सर (Rakesh Sir)</span>
                  </div>

                  {/* Audio Playback & Copy Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => (isPlayingThis ? onStopSpeech() : onPlaySpeech(message))}
                      className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-xl border transition-all ${
                        isPlayingThis
                          ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                          : 'bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                      }`}
                      title={isPlayingThis ? 'राकेश सर की आवाज़ रोकें' : 'राकेश सर की आवाज़ में सुनें'}
                    >
                      {isPlayingThis ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5" />
                          <span>रोकें</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>बोलकर सुनें</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopy(message.id, message.text)}
                      className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-md transition-colors"
                      title="नोट्स कॉपी करें"
                    >
                      {copiedId === message.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Message Content */}
              {isAI ? (
                renderFormattedText(message.text)
              ) : (
                <p className="text-[15px] font-devanagari leading-relaxed text-white whitespace-pre-wrap">
                  {message.text}
                </p>
              )}

              {/* Error State */}
              {message.status === 'error' && (
                <div className="mt-2 text-xs text-rose-600 flex items-center gap-1 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{message.errorMessage || 'उत्तर प्राप्त करने में समस्या हुई। कृपया दोबारा पूछें।'}</span>
                </div>
              )}

              {/* Pedagogical Follow-up suggestions on the latest teacher response */}
              {isAI && isLastMessage && !isLoading && (
                <div className="mt-4 pt-3 border-t border-indigo-100">
                  <p className="text-[11px] text-indigo-900 font-bold mb-2 flex items-center gap-1">
                    <Lightbulb className="w-3 h-3 text-amber-500" />
                    राकेश सर से आगे समझें:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => onQuickPrompt('राकेश सर, मुझे इस विषय का एक आसान घरेलू उदाहरण देकर समझाइए।')}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 px-2.5 py-1 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
                    >
                      <span>💡</span>
                      <span>एक और उदाहरण दें</span>
                    </button>
                    <button
                      onClick={() => onQuickPrompt('राकेश सर, मेरी समझ परखने के लिए इस विषय पर एक सवाल (Quiz) पूछिए।')}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 px-2.5 py-1 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3 text-indigo-600" />
                      <span>मुझसे एक क्विज़ पूछें</span>
                    </button>
                    <button
                      onClick={() => onQuickPrompt('राकेश सर, इसे एकदम शुरुआती छात्र (Beginner) के स्तर पर स्टेप-बाय-स्टेप समझाइए।')}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 px-2.5 py-1 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
                    >
                      <span>🪜</span>
                      <span>स्टेप-बाय-स्टेप सिखाएं</span>
                    </button>
                    <button
                      onClick={() => onQuickPrompt('राकेश सर, परीक्षा के लिए इसके मुख्य बिंदु (Key Notes) बुलेट पॉइंट्स में लिख दें।')}
                      className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200/80 px-2.5 py-1 rounded-xl transition-colors active:scale-95 flex items-center gap-1"
                    >
                      <span>📌</span>
                      <span>परीक्षा नोट्स दें</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Student Avatar */}
            {!isAI && (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        );
      })}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex gap-3 items-start justify-start">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs text-base">
            👨‍🏫
          </div>
          <div className="bg-white border border-indigo-100 rounded-2xl px-5 py-3.5 shadow-xs flex items-center gap-2 text-stone-600">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
            <span className="text-xs font-devanagari font-medium text-indigo-900 ml-1">
              राकेश सर उत्तर व उदाहरण तैयार कर रहे हैं...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
