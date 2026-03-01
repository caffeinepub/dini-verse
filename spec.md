# Specification

## Summary
**Goal:** Remove all external redirects from the app and replace the Internet Identity authentication flow with an in-website, modal-based login/signup experience.

**Planned changes:**
- Audit and remove or replace all links, buttons, and anchor tags that navigate to external URLs; all navigation must stay within the SPA using TanStack Router
- Replace the Internet Identity (off-site redirect) auth flow with in-app modal dialogs or internal route-based login/signup screens powered by the existing `useSessionAuth` hook
- Wire up `useSessionAuth` login, signup, and logout methods as the primary auth mechanism throughout the app (SiteHeader, AuthButtons, Login.tsx, SignUp.tsx)
- Ensure logout clears the session and returns the user to the home page within the app
- Update or remove the `AuthChangeBanner` component so it no longer references external login redirects as a known limitation; remove it from `AppLayout` if no longer needed

**User-visible outcome:** Users can log in and sign up entirely within the website without ever being redirected to an external domain. All navigation stays inside the app, and the auth banner warning about external redirects is gone.
