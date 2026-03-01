# Specification

## Summary
**Goal:** Fix Settings page authentication recognition, add an "Other" gender option, and surface a Change Password form.

**Planned changes:**
- Fix the Settings page to read auth state from `useSessionAuth` instead of Internet Identity directly, so logged-in users are correctly recognized and no "not authenticated" error is shown.
- Add "Other" as a selectable gender option in the Settings gender field, storing the value as `"Other"` in both the frontend and backend profile/settings type.
- Add a "Change Password" section to the Settings page with fields for Current Password, New Password, and Confirm New Password; validate inputs and show success/error toasts on submission.

**User-visible outcome:** Authenticated users can open Settings without seeing an authentication error, select "Other" as their gender, and change their password directly from the Settings page.
