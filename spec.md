# Specification

## Summary
**Goal:** Add multi-language support to the Dini.Verse app, enabling users to switch the UI between English, Spanish, French, Portuguese, German, Turkish, Russian, Vietnamese, Korean, and Dutch.

**Planned changes:**
- Add translations for all 9 new locales (es, fr, pt, de, tr, ru, vi, ko, nl) to `frontend/src/i18n/translations.ts`, covering all existing translation keys with English as fallback for missing keys
- Update `frontend/src/contexts/TranslationContext.tsx` to support all 10 locale codes and resolve strings from the correct locale based on the user's language setting
- Update the language selector in `frontend/src/pages/Settings.tsx` to list all 10 languages by their native names, persist the selection app-wide, and default to English
- Update `backend/main.mo` to accept and store all 10 locale codes in the `UserSettings.language` field, defaulting to `en` for existing records

**User-visible outcome:** Users can open Settings, select from 10 languages, and the entire UI immediately re-renders in the chosen language, with the preference saved persistently.
