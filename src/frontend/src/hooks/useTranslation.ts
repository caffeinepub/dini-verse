import { useTranslationContext } from "../contexts/TranslationContext";

export function useTranslation() {
  return useTranslationContext();
}
