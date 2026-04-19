import React, { useState } from 'react';
import { Check, Search } from 'lucide-react';
import SettingHeader from '../../components/layout/SettingHeader.tsx';

export default function LanguageSettingsScreen() {
  const [selected, setSelected] = useState('English');
  const languages = [
    'English', 'Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Punjabi', 'Spanish', 'French', 'German', 'Japanese', 'Korean'
  ];

  return (
    <div className="flex flex-col bg-[var(--bg-main)] h-full overflow-y-auto no-scrollbar">
      <SettingHeader title="Language" />
      
      <div className="p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
          <input 
            type="text" 
            placeholder="Search"
            className="w-full bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
        </div>

        <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] overflow-hidden">
          {languages.map((lang, index) => (
            <button 
              key={lang}
              onClick={() => setSelected(lang)}
              className={`w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-main)] transition-colors ${
                index !== languages.length - 1 ? 'border-b border-[var(--border-color)]/30' : ''
              }`}
            >
              <span className={`text-sm font-bold ${selected === lang ? 'text-blue-500' : 'text-[var(--text-primary)]'}`}>
                {lang}
              </span>
              {selected === lang && <Check size={18} className="text-blue-500" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
