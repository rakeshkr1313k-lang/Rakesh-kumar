import React from 'react';
import { X, Volume2, Mic, Sliders, Check, GraduationCap } from 'lucide-react';
import { VoiceSettings, VoicePersona } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const personas: { id: VoicePersona; name: string; desc: string; icon: string }[] = [
    {
      id: 'Puck',
      name: 'पक (Puck) — पुरुष शिक्षक (Rakesh Sir Male Voice)',
      desc: 'उत्साही, दोस्ताना और स्पष्ट शिक्षक की आवाज़',
      icon: '👨‍🏫',
    },
    {
      id: 'Kore',
      name: 'कोरे (Kore) — महिला शिक्षक (Female Voice)',
      desc: 'मधुर, धैर्यवान और आत्मीय आवाज़',
      icon: '👩‍🏫',
    },
    {
      id: 'Zephyr',
      name: 'ज़ेफिर (Zephyr) — शांत आवाज़ (Calm)',
      desc: 'शांत और संतुलित आवाज़',
      icon: '✨',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-indigo-100 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-900">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">राकेश टीचिंग AI सेटिंग्स</h2>
              <p className="text-xs text-stone-500">शिक्षक की आवाज़ व शिक्षण शैली चुनें</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Teaching Mode Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>शिक्षण शैली (Teaching Style)</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'comprehensive', label: 'विस्तृत व उदाहरण' },
              { id: 'simplified', label: 'सरल व आसान' },
              { id: 'quiz_mode', label: 'क्विज़ व टेस्ट' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onUpdateSettings({ teachingMode: m.id as any })}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
                  settings.teachingMode === m.id
                    ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Persona Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block">
            राकेश सर की आवाज़ (Voice Tone)
          </label>
          <div className="grid grid-cols-1 gap-2">
            {personas.map((persona) => {
              const isSelected = settings.voicePersona === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => onUpdateSettings({ voicePersona: persona.id })}
                  className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs'
                      : 'border-stone-200 hover:border-indigo-300 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1 bg-white rounded-xl shadow-2xs border border-stone-100">
                      {persona.icon}
                    </span>
                    <div>
                      <div className="text-sm font-semibold">{persona.name}</div>
                      <div className="text-xs text-stone-500">{persona.desc}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-700 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Auto Speak Toggle */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-sm font-semibold text-stone-800">
                स्वचालित आवाज़ (Auto-Speak)
              </div>
              <div className="text-xs text-stone-500">
                उत्तर मिलते ही राकेश सर अपने आप बोलकर समझाएँ
              </div>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              settings.autoSpeak ? 'bg-indigo-700' : 'bg-stone-300'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                settings.autoSpeak ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Speech Rate */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-stone-600">
            <span>बोलने की गति (Speech Speed)</span>
            <span className="text-indigo-800 font-bold">{settings.speechRate}x</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0.85, 1.0, 1.15].map((rate) => (
              <button
                key={rate}
                onClick={() => onUpdateSettings({ speechRate: rate })}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  settings.speechRate === rate
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {rate === 0.85 ? 'धीमी (0.85x)' : rate === 1.0 ? 'सामान्य (1.0x)' : 'तेज़ (1.15x)'}
              </button>
            ))}
          </div>
        </div>

        {/* Helpful Tip */}
        <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-2.5 text-xs text-indigo-950">
          <Mic className="w-4 h-4 text-indigo-700 mt-0.5 shrink-0" />
          <p>
            <strong>छात्रों के लिए सलाह:</strong> किसी भी सवाल को हल करते समय राकेश सर से "स्टेप-बाय-स्टेप" या "दैनिक जीवन का उदाहरण" माँग सकते हैं।
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-xs"
        >
          पूर्ण (Done)
        </button>
      </div>
    </div>
  );
};
