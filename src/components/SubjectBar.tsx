import React from 'react';

export interface SubjectItem {
  id: string;
  label: string;
  icon: string;
  prompt: string;
}

export const TEACHING_SUBJECTS: SubjectItem[] = [
  {
    id: 'math',
    label: 'गणित (Math)',
    icon: '📐',
    prompt: 'राकेश सर, मुझे गणित का एक कठिन सवाल या सूत्र आसान उदाहरण से समझाइए।',
  },
  {
    id: 'science',
    label: 'विज्ञान (Science)',
    icon: '🔬',
    prompt: 'राकेश सर, गुरुत्वाकर्षण (Gravity) या प्रकाश संश्लेषण (Photosynthesis) सरल भाषा में समझाइए।',
  },
  {
    id: 'coding',
    label: 'कोडिंग (Coding)',
    icon: '💻',
    prompt: 'राकेश सर, कोडिंग में लूप्स (Loops) और वेरिएबल्स (Variables) क्या होते हैं? सरल उदाहरण दें।',
  },
  {
    id: 'english',
    label: 'अंग्रेज़ी (English)',
    icon: '🗣️',
    prompt: 'राकेश सर, रोज़मर्रा की बातचीत में अच्छी अंग्रेज़ी कैसे बोलें? 5 आसान वाक्य सिखाएं।',
  },
  {
    id: 'gk',
    label: 'सामान्य ज्ञान (GK)',
    icon: '🌍',
    prompt: 'राकेश सर, भारत के संविधान और मौलिक अधिकारों के मुख्य बिंदु संक्षेप में बताएं।',
  },
  {
    id: 'exam',
    label: 'परीक्षा टिप्स (Exams)',
    icon: '🎯',
    prompt: 'राकेश सर, पढ़ाई में ध्यान केंद्रित करने और याददाश्त बढ़ाने का सबसे असरदार तरीका क्या है?',
  },
];

interface SubjectBarProps {
  onSelectPrompt: (promptText: string) => void;
}

export const SubjectBar: React.FC<SubjectBarProps> = ({ onSelectPrompt }) => {
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none px-1">
      <div className="flex items-center gap-2 min-w-max">
        <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100/70 border border-indigo-200 px-2.5 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1">
          <span>📚</span>
          <span>विषय चुनें:</span>
        </span>
        {TEACHING_SUBJECTS.map((subj) => (
          <button
            key={subj.id}
            type="button"
            onClick={() => onSelectPrompt(subj.prompt)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-indigo-200/80 hover:border-indigo-400 text-stone-800 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all active:scale-95"
          >
            <span>{subj.icon}</span>
            <span>{subj.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
