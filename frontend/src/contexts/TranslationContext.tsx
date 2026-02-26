import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCallerSettings } from '../hooks/useAccountSettings';
import { Language } from '../backend';
import { translations } from '../i18n/translations';

interface TranslationContextType {
  t: (key: string) => string;
  language: Language;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useGetCallerSettings();
  const [language, setLanguage] = useState<Language>(Language.german);

  useEffect(() => {
    if (settings?.language) {
      setLanguage(settings.language);
    }
  }, [settings?.language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language === Language.english ? 'en' : 'de'];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if not found in fallback either
          }
        }
        break;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <TranslationContext.Provider value={{ t, language }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within TranslationProvider');
  }
  return context;
}
