# Dini.Verse Avatar System Overhaul

## Current State
The Avatar tab has a basic 2D avatar preview with grayscale base sprites (Head, Torso, Arms, Legs), a color picker for skin tone, an Advanced toggle for per-body-part coloring, and skin hex code saved to localStorage. Avatars render on profile pages.

## Requested Changes (Diff)

### Add
- Modular chibi body rig with layered sprite system: base skin body, ears, hair, eyes, nose, mouth — all rendered in z-order layers
- Dynamic color picker for skin AND hair (separate controls)
- Face customizer panel: multiple preset options for eyes, eyebrows, nose, mouth, ears — user can cycle through options per slot
- Upload custom transparent PNG for eyes and mouth slots
- Clothing system with categories: Shirts, T-Shirts, Pants — layered over body
- Accessory system with slots: Hat, Face, Neck, Shoulder, Front, Back, Waist
- Adjustment controls (arrow buttons + rotation buttons) for each equipped accessory to set XY offset and rotation
- Persistent inventory grid showing all owned items (clothing + accessories)
- Avatar Shop page: browse items for purchase with Dini Bucks
- 'Create' button in Avatar Shop: upload transparent PNG, set title, description, price in Dini Bucks, optional limited-stock toggle; creator receives the item for free automatically
- All avatar data (facial feature selections, color hex codes, equipped items, per-accessory XY+rotation) saved to localStorage under user profile key
- Avatar renders identically on Avatar page, Profile page, and anywhere else it appears

### Modify
- Avatar page: replace simple body sprites with full chibi rig renderer
- Profile page: update avatar renderer to use new layered chibi system
- Avatar Shop: add 'Create' button and item creation modal
- User data schema: extend avatarData to include faceFeatures, hairColor, clothingSlots, accessorySlots with positions

### Remove
- Old simple grayscale sprite system (replaced by chibi rig)
- Separate 'Advanced' per-body-part coloring (replaced by layered system with hair/skin color pickers)

## Implementation Plan
1. Define avatarData schema: { skinColor, hairColor, faceFeatures: {eyes, eyebrows, nose, mouth, ears, customEyeImg, customMouthImg}, clothing: {shirt, tshirt, pants}, accessories: {hat, face, neck, shoulder, front, back, waist}, accessoryPositions: { [slotKey]: {x, y, rotation} }, inventory: [{id, type, name, img}] }
2. Build ChibiAvatar React component that renders all layers in z-order using absolute positioned divs/images over a canvas-like container
3. Build AvatarEditor panel: color pickers for skin+hair, face customizer with slot cycling + custom upload
4. Build ClothingPanel and AccessoryPanel with category tabs and inventory grid
5. Build AccessoryAdjuster: arrow pad + rotate buttons that update XY/rotation for selected accessory slot
6. Build AvatarShop page: item grid, buy button (deducts Dini Bucks), Create modal (upload PNG, title, desc, price, limited stock toggle; auto-adds to creator inventory)
7. Persist all avatarData to localStorage on every change, keyed by username
8. Update Profile page to use ChibiAvatar component with user's saved avatarData
