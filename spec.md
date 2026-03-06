# Dini.Verse

## Current State

- Full-stack gaming platform with Motoko backend and React/TypeScript frontend.
- Authentication is localStorage-based (username + password, session token).
- Settings page has profile picture upload/remove, display name, username, password, visibility, language, gender, theme, delete account.
- SignUp page collects username, display name, password only — no gender or language selection.
- Profile picture: upload button + "Remove" button shown when an image exists. Removing clears avatar but does not allow immediate re-upload in the same flow.
- Groups page is a near-empty stub showing "Your Groups" placeholder with no functionality.
- Profile picture avatar is used in Settings page but its usage across the whole platform (header, sidebar, profile page) needs to be confirmed/ensured.

## Requested Changes (Diff)

### Add

- **SignUp page — Gender selector**: A dropdown/select for Female, Male, or Other. Value stored in localStorage settings on account creation.
- **SignUp page — Language selector**: A dropdown/select for all 10 supported languages (English, Spanish, French, Portuguese, German, Turkish, Russian, Vietnamese, Korean, Dutch). Value stored in localStorage settings on account creation.
- **Settings page — Profile picture "Remove" becomes re-upload trigger**: When a profile picture is set, show only a "Remove" button. Clicking "Remove" clears the image AND immediately opens the file picker so the user can upload a new one in the same action. When no image is set, show "Upload" button as normal.
- **Profile picture propagation**: Ensure the avatar (avatarDataUrl from localStorage settings) is displayed everywhere it appears across the platform — header user avatar, left sidebar, profile page, etc.
- **Groups page — Full implementation** (all localStorage-based, no backend calls):
  - **Groups list view**: Shows user's groups and a "Trending Groups" section. Has a "Create Group" button (costs 500 Dini Bucks, shown as a deduction from a local Dini Bucks balance).
  - **Create Group flow**: Modal/dialog with group name input and thumbnail upload. First thumbnail becomes the primary one shown on Trending Groups.
  - **Group detail view**: When clicking a group, shows the group detail with tabs for all sections below.
  - **Member Management tab**: UI for creating roles, changing rankings, accepting join requests, banning/kicking members. Stored locally.
  - **Revenue tab**: Shared treasury showing Dini Bucks balance from sales. UI for one-time and recurring payouts to members.
  - **Group Experiences tab**: List of games owned by the group. Members with permission can create/edit games. Links to Create game flow.
  - **Item Creation & Sales tab**: UI to create and sell clothing (shirts, pants) and UGC items. Shows items listed for sale.
  - **Social tab**: Community wall for posts. Anyone can post a message. Posts are stored locally.
  - **Audit Log tab**: Read-only log of group activities (member joins, role changes, payouts, etc.).
  - **Allies/Enemies tab**: List of allied and rival groups. Buttons to add alliance or rivalry with another group.

### Modify

- **Settings page — Profile picture section**: Change the button behavior so "Remove" triggers file picker for replacement (not just remove). Keep the "Upload" button for first-time upload when no image exists.
- **SignUp page**: Add gender and language fields before the submit button.

### Remove

- Nothing removed.

## Implementation Plan

1. **SignUp.tsx**: Add `gender` state (default "other") and `language` state (default "en"). Add Select components for both. On signup success, create default settings in localStorage with the chosen gender and language using `saveLocalSettings`.
2. **Settings.tsx — Profile picture**: Change the "Remove" button logic: clicking Remove calls `handleRemoveAvatar` AND then opens the file input immediately after. Remove the separate "Upload" button when an image already exists (only show "Remove" which re-opens picker). When no image exists, show "Upload Photo" button as before.
3. **Profile picture propagation**: Read `getLocalSettings(username).avatarDataUrl` in `SiteHeader`, `LeftSidebar`, and `Profile` page avatars so the uploaded image is always shown.
4. **Groups.tsx**: Full replacement with localStorage-based groups system:
   - Groups stored in `localStorage` under key `diniverse_groups`.
   - Create Group modal (name + thumbnail upload, deduct 500 Dini Bucks from `diniverse_dinibucks_{username}`).
   - Group list and Trending Groups.
   - Group detail page with tabbed navigation covering all 7 sections.
   - All data (members, roles, posts, audit log, allies/enemies) stored in localStorage.
