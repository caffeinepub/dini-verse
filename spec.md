# Dini.Verse

## Current State
- Settings page has: Account Info, Offline Mode (in Visibility card), Theme (dark mode toggle), Promo Codes, Social Networks, Privacy (who can message), Notifications, Security (II 2FA + PIN)
- No "Preferences" section exists yet
- Dark mode toggle is in its own "Theme" card
- Offline Mode is in its own "Visibility" card
- Privacy card only has who-can-message control; no recently played toggle
- Public profile visibility is not yet implemented anywhere in settings
- Internet Identity 2FA in Security section currently just sets a localStorage flag (no actual II redirect/login)

## Requested Changes (Diff)

### Add
- New **Preferences** section in Settings containing:
  - Dark Mode toggle (moved from the "Theme" card)
  - Public Profile visibility selector: "No one", "Friends", "Everyone" (default: Everyone)
    - When not "Everyone", the public profile page only shows: username, display name, profile picture, banner, games created, social medias, bio
- Move **Offline Mode** from the "Visibility" card into the existing **Privacy** section
- Move **Recently Played** visibility (who can see recently played games) also into Privacy section
- Internet Identity 2-step authentication in the Security section should actually redirect the user to Internet Identity (https://identity.ic0.app) when enabled — i.e., it opens the II login in a new tab or redirects
- Responsive UI improvements (already partially done, ensure breakpoints are solid)

### Modify
- Remove the standalone "Theme" card (dark mode now lives in Preferences)
- Remove the standalone "Visibility" card (Offline Mode now lives in Privacy)
- Privacy card: add Offline Mode toggle and Recently Played visibility (who can see: Everyone, Friends, No one)
- PublicProfile page: respect the publicProfile visibility setting — if set to "No one" or "Friends", only show username, display name, profile picture, banner, games created, social medias, bio (hide badges, groups, friends count, followers, following, favorited items, etc.)
- socialStorage: extend PrivacySettings to include offlineMode, recentlyPlayedVisibility; add getPreferences/savePreferences for publicProfileVisibility and darkMode preference

### Remove
- Standalone "Theme" card
- Standalone "Visibility" card (Offline Mode moved to Privacy)

## Implementation Plan
1. Extend `socialStorage.ts`: add `getPreferences(username)` / `savePreferences(username, prefs)` storing `{ publicProfileVisibility: 'everyone' | 'friends' | 'no-one' }`. Extend `PrivacySettings` to include `offlineMode: boolean` and `recentlyPlayedVisibility: 'everyone' | 'friends' | 'no-one'`.
2. Update `Settings.tsx`:
   - Remove Theme card and Visibility card
   - Add Preferences card with dark mode switch + public profile visibility select
   - Add Offline Mode switch and Recently Played visibility select to the Privacy card
3. Update `PublicProfile.tsx`: read publicProfileVisibility from prefs; if 'no-one' or 'friends', render restricted view (username, display name, pfp, banner, games created, social medias, bio only)
4. Internet Identity 2FA toggle: when turned ON, open `https://identity.ic0.app` in a new tab (window.open) to indicate the external II authentication
5. Ensure responsive classes on Settings layout (already using cards, verify mobile padding)
