import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCallerSettings } from '../hooks/useAccountSettings';
import { Language } from '../backend';
import { translations } from '../i18n/translations';

type TranslationLocale = keyof typeof translations;

interface TranslationContextType {
  t: (key: string) => string;
  language: Language;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function languageToLocale(lang: Language): TranslationLocale {
  switch (lang) {
    case Language.en: return 'en';
    case Language.es: return 'es';
    case Language.fr: return 'fr';
    case Language.pt: return 'pt';
    case Language.de: return 'de';
    case Language.tr: return 'tr';
    case Language.ru: return 'ru';
    case Language.vi: return 'vi';
    case Language.ko: return 'ko';
    case Language.nl: return 'nl';
    default: return 'en';
  }
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { data: settings } = useGetCallerSettings();
  const [language, setLanguage] = useState<Language>(Language.en);

  useEffect(() => {
    if (settings?.language) {
      setLanguage(settings.language);
    }
  }, [settings?.language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    const locale = languageToLocale(language);
    let value: any = translations[locale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found in selected locale
        let fallback: any = translations.en;
        for (const fallbackKey of keys) {
          if (fallback && typeof fallback === 'object' && fallbackKey in fallback) {
            fallback = fallback[fallbackKey];
          } else {
            return key;
          }
        }
        return typeof fallback === 'string' ? fallback : key;
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
