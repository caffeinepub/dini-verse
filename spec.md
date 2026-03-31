# Dini.Verse — Avatar Editor Feature

## Current State

The app has a full left sidebar navigation with links: Profile, Social, People, Groups, Inventory, Settings. There is an existing `/avatar-shop` page (AvatarShop.tsx). User settings are stored in localStorage via `useAccountSettings.ts` (LocalUserSettings). The LocalUserSettings interface stores: username, displayName, visibility, avatarDataUrl, gender, language, theme, birthday, location.

There is no dedicated Avatar Editor page. The sidebar does not include an "Avatar" link.

## Requested Changes (Diff)

### Add
- New `/avatar` route in App.tsx + LeftSidebar.tsx link labeled "Avatar" with an appropriate icon (e.g., UserCircle)
- New page `src/frontend/src/pages/AvatarEditor.tsx` with:
  - 2D avatar preview built using inline SVG: Head (circle), Torso (rounded rect), Left Arm, Right Arm, Left Leg, Right Leg — all drawn as white/light-gray base shapes
  - A global skin color picker (`<input type="color">`) that updates a `skinColor` state variable
  - All body parts receive the selected skin color as their SVG fill, simulating a CSS tint/multiply effect
  - "Advanced" toggle switch: when OFF, all parts use global `skinColor`; when ON, clicking any individual body part in the preview opens a color picker for that specific part (each part stores its own color independently)
  - On color change (both global and per-part), save to localStorage under the user's settings key — add fields `skinColor: string` (hex, default "#f5cba7") and `bodyPartColors: { head, torso, leftArm, rightArm, leftLeg, rightLeg }` (all optional, fall back to skinColor)
- Update `LocalUserSettings` interface in `useAccountSettings.ts` to add `skinColor?: string` and `bodyPartColors?: Record<string, string>`
- Update `getLocalSettings()` defaults to include `skinColor: '#f5cba7'` and `bodyPartColors: {}`

### Modify
- `LeftSidebar.tsx`: Add "Avatar" nav item (with UserCircle icon, link to "/avatar") between Profile and Social or before Inventory
- `App.tsx`: Import and register the `/avatar` route
- `useAccountSettings.ts`: Add `skinColor` and `bodyPartColors` fields + defaults

### Remove
- Nothing removed

## Implementation Plan

1. Update `LocalUserSettings` in `useAccountSettings.ts` — add `skinColor?: string` and `bodyPartColors?: Record<string, string>` with defaults in `getLocalSettings()`
2. Create `AvatarEditor.tsx`:
   - Load current username, read `skinColor` and `bodyPartColors` from localStorage
   - Render an SVG avatar (400x500 viewBox):
     - Head: circle at top-center
     - Torso: rounded rect below head
     - Left Arm: rect to left of torso
     - Right Arm: rect to right of torso  
     - Left Leg: rect below-left of torso
     - Right Leg: rect below-right of torso
   - Each SVG shape gets fill from: Advanced mode ? bodyPartColors[part] ?? skinColor : skinColor
   - Global color picker below preview
   - "Advanced" toggle using shadcn Switch
   - In Advanced mode: clicking a body part highlights it and shows a part-specific color picker
   - On any color change: save to localStorage immediately (reactive, no save button needed — but optionally show a subtle toast)
3. Update `LeftSidebar.tsx` — add Avatar link
4. Update `App.tsx` — add avatarEditorRoute at path "/avatar"
5. The app is client-side only (no backend calls needed) — localStorage IS the "persistent user profile" in this codebase
