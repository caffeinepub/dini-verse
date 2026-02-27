# Specification

## Summary
**Goal:** Fix the "Unauthorized: Only users can access settings" error on the Settings page by guarding backend calls with authentication checks.

**Planned changes:**
- Update the Settings page to skip calling the backend settings endpoint when the user is not authenticated, and instead show a login prompt.
- Update the `useAccountSettings` hook to guard all backend queries and mutations behind an authentication check, returning an unauthenticated/idle state when no valid session is present.

**User-visible outcome:** Unauthenticated users see a prompt to log in on the Settings page instead of an error message. Authenticated users load their settings successfully without any "Unauthorized" or "Failed to load settings" errors.
