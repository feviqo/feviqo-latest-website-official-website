import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteLanguage, BilingualText } from './membershipTranslations';

const LANG_STORAGE_KEY = 'feviqo_site_language';

interface LanguageContextValue {
  lang: SiteLanguage;
  isUrdu: boolean;
  dir: 'ltr' | 'rtl';
  setLang: (next: SiteLanguage) => void;
  toggleLang: () => void;
  t: (entry: BilingualText) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  isUrdu: false,
  dir: 'ltr',
  setLang: () => {},
  toggleLang: () => {},
  t: (entry) => entry.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SiteLanguage>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
        if (saved === 'ur' || saved === 'en') {
          return saved;
        }
      } catch {
        // ignore storage restrictions
      }
    }
    return 'en';
  });

  const setLang = (next: SiteLanguage) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, next);
      } catch {
        // ignore
      }
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ur' : 'en');
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang === 'ur' ? 'ur' : 'en';
    }
  }, [lang]);

  const value: LanguageContextValue = {
    lang,
    isUrdu: lang === 'ur',
    dir: lang === 'ur' ? 'rtl' : 'ltr',
    setLang,
    toggleLang,
    t: (entry) => (lang === 'ur' ? entry.ur : entry.en),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
