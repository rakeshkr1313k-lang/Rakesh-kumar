import React from 'react';
import { PromptSuggestion } from '../types';

interface PromptSuggestionsProps {
  onSelectPrompt: (promptText: string) => void;
}

const RAKESH_TEACHING_SUGGESTIONS: PromptSuggestion[] = [
  {
    category: 'विज्ञान (Science)',
    icon: '🔬',
    badge: 'Physics',
    text: 'राकेश सर, न्यूटन के गति के तीन नियम (Newton\'s Laws) आसान घरेलू उदाहरणों से समझाइए।',
  },
  {
    category: 'गणित (Math)',
    icon: '📐',
    badge: 'Geometry',
    text: 'राकेश सर, पाइथागोरस प्रमेय (Pythagoras Theorem) क्या है और इसका व्यावहारिक उपयोग कहाँ होता है?',
  },
  {
    category: 'कंप्यूटर व तकनीक (Tech)',
    icon: '💻',
    badge: 'Coding',
    text: 'राकेश सर, कंप्यूटर प्रोग्रामिंग में "एल्गोरिदम" (Algorithm) और "लूप्स" (Loops) सरल शब्दों में सिखाइए।',
  },
  {
    category: 'स्पोकन इंग्लिश (Spoken English)',
    icon: '🗣️',
    badge: 'Fluency',
    text: 'राकेश सर, किसी नए व्यक्ति या इंटरव्यू में अपना प्रभावशाली परिचय (Self-Introduction) कैसे दें?',
  },
  {
    category: 'पढ़ाई की तकनीक (Study Hacks)',
    icon: '⏳',
    badge: 'Focus',
    text: 'राकेश सर, पढ़ाई में ध्यान लगाने के लिए पोमोडोरो तकनीक (Pomodoro Technique) क्या है?',
  },
  {
    category: 'ज्ञान क्विज़ (Live Quiz)',
    icon: '🎯',
    badge: 'Quiz',
    text: 'राकेश सर, आज मुझसे एक रोचक सवाल पूछिए ताकि मैं अपनी समझ परख सकूँ!',
  },
];

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelectPrompt }) => {
  return (
    <div className="max-w-3xl mx-auto my-3 px-2">
      <div className="text-center mb-3">
        <span className="text-xs font-bold tracking-wide uppercase text-indigo-900 bg-indigo-100/80 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-2xs">
          👨‍🏫 राकेश सर से आज क्या सीखना चाहेंगे?
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {RAKESH_TEACHING_SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(item.text)}
            className="group text-left p-3.5 rounded-2xl bg-white/95 hover:bg-indigo-50/80 border border-indigo-100 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all flex items-start gap-3 active:scale-98"
          >
            <span className="text-2xl p-2 rounded-2xl bg-indigo-50 group-hover:bg-indigo-100 transition-colors shrink-0">
              {item.icon}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold text-indigo-700 block uppercase tracking-wider">
                  {item.category}
                </span>
                {item.badge && (
                  <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-stone-800 font-devanagari line-clamp-2 group-hover:text-indigo-950 transition-colors">
                {item.text}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
