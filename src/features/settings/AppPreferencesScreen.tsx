import React from 'react';
import { ArrowLeft, Palette, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import SettingHeader from '../../components/layout/SettingHeader.tsx';

export default function AppPreferencesScreen() {
  const navigate = useNavigate();
  const { theme, setTheme, language, setLanguage, t } = useTheme();

  const themes = [
    { id: 'light', label: 'Light Theme', sub: 'Clean light mode with white headers' },
    { id: 'dark', label: 'Dark Theme', sub: 'Full dark mode with dark headers' }
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg-main)] overflow-hidden">
      <SettingHeader title={t('preferences')} />

      <div className="flex-1 overflow-y-auto no-scrollbar py-6">
        {/* Theme Section */}
        <h3 className="px-6 mb-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">{t('theme')}</h3>
        <div className="bg-[var(--bg-card)] border-y border-[var(--border-color)] mb-8">
          {themes.map((t, index) => (
            <button 
              key={t.id}
              onClick={() => setTheme(t.id as any)}
              className={`w-full flex items-center justify-between px-6 py-4 hover:bg-zinc-50/10 transition-colors ${
                index !== themes.length - 1 ? 'border-b border-[var(--border-color)]' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-zinc-50/10 ${theme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>
                  <Palette size={20} />
                </div>
                <div className="text-left">
                  <h4 className={`text-sm font-bold ${theme === t.id ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'}`}>
                    {t.label}
                  </h4>
                  <p className="text-[11px] text-[var(--text-secondary)]">{t.sub}</p>
                </div>
              </div>
              {theme === t.id && (
                <div className="bg-[var(--primary)] p-1 rounded-full shadow-lg">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="py-12 flex flex-col items-center gap-1 opacity-40">
          <span className="text-[var(--text-primary)] font-black tracking-[0.2em] uppercase text-[10px]">GrixChat V 1.0.0</span>
          <div className="flex flex-col items-center mt-2">
            <span className="text-[var(--text-secondary)] text-[10px] font-medium">from</span>
            <span className="text-[var(--text-primary)] font-bold tracking-widest uppercase text-[9px]">Gothwad technologies</span>
          </div>
        </div>
      </div>
    </div>
  );
}
