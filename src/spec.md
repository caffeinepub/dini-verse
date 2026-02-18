# Specification

## Summary
**Goal:** Fix the Settings page load failure by ensuring settings APIs always return initialized defaults (no auth/initialization traps) and by showing the underlying error message in the UI for easier diagnosis.

**Planned changes:**
- Backend: Update `getOrCreateCallerSettings()` so it always returns a valid `UserSettings` record for the caller, creating and persisting default settings when none exist, and avoiding failures solely due to missing permissions/initialization.
- Backend: Update settings mutation methods (`updateDisplayName`, `updateDisplayNameAndAvatar`, `updateVisibility`, `deleteAvatar`) to reuse the same “get or initialize defaults” flow so first-time users can successfully mutate settings.
- Frontend: Improve Settings page fetch failure alert to include the actual underlying error message (in English) in addition to the existing generic text, without enabling infinite retries.
- Deploy: Produce and redeploy a new production build containing the backend fixes and improved frontend error reporting.

**User-visible outcome:** Authenticated users can open `/settings` and see their settings (with defaults created on first use), and if loading fails, the alert shows both the generic message and the specific underlying error message.
