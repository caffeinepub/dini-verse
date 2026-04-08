import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  getCurrentUsername,
  getLocalSettings,
} from "../hooks/useAccountSettings";
import { translations } from "../i18n/translations";
import { Language } from "../types/backendTypes";

type TranslationLocale = keyof typeof translations;

interface TranslationContextType {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(
  undefined,
);

function languageToLocale(lang: Language): TranslationLocale {
  const map: Record<string, TranslationLocale> = {
    en: "en",
    es: "es",
    fr: "fr",
    pt: "pt",
    de: "de",
    tr: "tr",
    ru: "ru",
    vi: "vi",
    ko: "ko",
    nl: "nl",
  };
  return map[lang] ?? "en";
}

function readLanguageFromStorage(): Language {
  try {
    const username = getCurrentUsername();
    if (username) {
      const settings = getLocalSettings(username);
      if (settings?.language) return settings.language as Language;
    }
  } catch {
    // fall through
  }
  return Language.en;
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() =>
    readLanguageFromStorage(),
  );

  // Re-read from storage when the component mounts (covers SSR/hydration gap)
  useEffect(() => {
    const lang = readLanguageFromStorage();
    setLanguageState(lang);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    try {
      const keys = key.split(".");
      const locale = languageToLocale(language);
      let value: unknown = translations[locale];

      for (const k of keys) {
        if (
          value &&
          typeof value === "object" &&
          k in (value as Record<string, unknown>)
        ) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Fallback to English
          let fallback: unknown = translations.en;
          for (const fk of keys) {
            if (
              fallback &&
              typeof fallback === "object" &&
              fk in (fallback as Record<string, unknown>)
            ) {
              fallback = (fallback as Record<string, unknown>)[fk];
            } else {
              return key;
            }
          }
          return typeof fallback === "string" ? fallback : key;
        }
      }
      return typeof value === "string" ? value : key;
    } catch {
      return key;
    }
  };

  return (
    <TranslationContext.Provider value={{ t, language, setLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslationContext() {
  const context = useContext(TranslationContext);
  if (!context) {
    // Provide a safe fallback so the app never crashes even outside the provider
    return {
      t: (key: string) => key,
      language: Language.en,
      setLanguage: (_lang: Language) => {},
    };
  }
  return context;
}
