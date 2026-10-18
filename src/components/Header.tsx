import React from 'react';
import { Volume2, VolumeX, Settings, Trash2, GraduationCap } from 'lucide-react';
import { VoiceSettings } from '../types';

interface HeaderProps {
  settings: VoiceSettings;
  onUpdateSettings: (settings: Partial<VoiceSettings>) => void;
  onOpenSettings: () => void;
  onClearChat: () => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  selectedSubject?: string;
  onSelectSubject?: (subj: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onOpenSettings,
  onClearChat,
  isSpeaking,
  onStopSpeaking,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-indigo-100 shadow-xs px-3 py-2.5 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/25">
              <span className="text-xl select-none">👨‍🏫</span>
            </div>
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-900 via-blue-800 to-amber-700 bg-clip-text text-transparent">
                राकेश टीचिंग AI
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                <GraduationCap className="w-3 h-3 text-indigo-600" />
                राकेश सर (Hindi Mentor)
              </span>
            </div>
            <p className="text-xs text-stone-500 font-medium hidden sm:block">
              माइक से पूछें — गणित, विज्ञान, कोडिंग व किसी भी विषय की सरल हिंदी में पढ़ाई
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Speaking Indicator with quick stop */}
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-amber-500 text-white shadow-xs hover:bg-amber-600 active:scale-95 transition-all animate-pulse"
              title="राकेश सर की आवाज़ रोकें"
            >
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-full bg-white rounded-full animate-soundwave-1" />
                <span className="w-0.5 h-full bg-white rounded-full animate-soundwave-2" />
                <span className="w-0.5 h-full bg-white rounded-full animate-soundwave-3" />
              </div>
              <span>आवाज़ रोकें</span>
            </button>
          )}

          {/* Toggle Auto Speak Voice */}
          <button
            onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              settings.autoSpeak
                ? 'bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100'
            }`}
            title={settings.autoSpeak ? 'शिक्षक की आवाज़ चालू है' : 'आवाज़ म्यूट है'}
          >
            {settings.autoSpeak ? (
              <>
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span className="hidden md:inline">आवाज़ चालू</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-stone-400" />
                <span className="hidden md:inline">म्यूट</span>
              </>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
            title="टीचिंग व आवाज़ सेटिंग्स"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear Chat Button */}
          <button
            onClick={onClearChat}
            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="नई कक्षा / नया पाठ शुरू करें"
            aria-label="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
