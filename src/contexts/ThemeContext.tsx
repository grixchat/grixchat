import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/StorageService';

export type Theme = 'light' | 'dark';
export type Language = 'hi-in' | 'en-us';

const translations = {
  'hi-in': {
    settings: 'सेटिंग्स',
    preferences: 'पसंद',
    language: 'भाषा',
    theme: 'थीम',
    chats: 'चैट',
    status: 'स्टेटस',
    calls: 'कॉल',
  },
  'en-us': {
    settings: 'Settings',
    preferences: 'Preferences',
    language: 'Language',
    theme: 'Theme',
    chats: 'Chats',
    status: 'Status',
    calls: 'Calls',
  }
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['en-us']) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = storage.getItem('app-theme');
    return (saved as Theme) || 'light';
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = storage.getItem('app-lang');
    return (saved as Language) || 'hi-in';
  });

  const t = (key: keyof typeof translations['en-us']) => {
    return translations[language][key] || translations['en-us'][key];
  };

  useEffect(() => {
    storage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme-color meta tag for PWA status bar
    let themeColor = theme === 'light' ? '#ffffff' : '#0f172a';
    
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
  }, [theme]);

  useEffect(() => {
    storage.setItem('app-lang', language);
  }, [language]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, language, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
