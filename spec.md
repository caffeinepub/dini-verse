# Specification

## Summary
**Goal:** Fix the missing `TranslationProvider` wrapper in the application root so that translation context is available to all components.

**Planned changes:**
- Wrap the component tree in `frontend/src/App.tsx` with `TranslationProvider` from `frontend/src/contexts/TranslationContext.tsx`

**User-visible outcome:** The app loads without the "useTranslationContext must be used within TranslationProvider" error, and all pages with translations continue to work correctly.
