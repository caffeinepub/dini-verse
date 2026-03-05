# Dini.Verse

## Current State
No existing project code. Full rebuild from scratch.

## Requested Changes (Diff)

### Add
- Full on-platform username + password + display name authentication (no Internet Identity, no external redirects)
- User sessions managed in Motoko backend
- User settings: username (changeable every 7 days), display name (changeable daily), password (changeable daily), profile picture (letter avatar default, image upload option, removable), visibility toggle (Online/Offline Mode), gender (Female/Male/Other), language preference, light/dark mode toggle, delete account
- Home page: dark-blue/white (light mode default), "Welcome back, [display name]!" greeting, recommended games grid, friend activity feed
- Top navigation: Home, Discover, Avatar Shop, Create, Dini Bucks
- Left sidebar: Profile, Inventory, Groups, Settings
- Discover page: trending games by category (Adventure, Roleplay, Simulator), game cards with Play button, description, player count, thumbs up/down ratings
- Avatar Shop: buy clothes, accessories, animations with Dini Bucks earned from games; items listed with price tags
- Create page: two large containers — "Create a Game" (drag-and-drop 2D shapes, resize/rotate/layer, decals, sliders) and "Create UGC" (same toolset for accessories/models)
- Dini Studio: canvas with 2D shapes (squares, circles, rectangles), resize/rotate/layer, decal image uploads, color/transparency/position sliders, save to inventory
- Social features: friend requests, private messaging, party system, follow creators
- Safety features: chat filters, reporting system, parental controls section in settings
- Settings page: all account fields functional, no "unauthorized" errors for any logged-in user
- Language switcher: English (default), Spanish, French, Portuguese, German, Turkish, Russian, Vietnamese, Korean, Dutch
- Light/dark mode toggle affecting whole site
- Platform logo (Dini.Verse branding) in header
- Header background: light green (#cde5aa)
- All text font: Builder Sans (Google Fonts)
- No external redirects anywhere in the app
- Dini Bucks virtual currency display and balance

### Modify
- N/A (fresh build)

### Remove
- N/A (fresh build)

## Implementation Plan
1. Backend: user accounts (signup/login/logout/session), settings CRUD with field-level cooldowns, friend system, messaging, Dini Bucks balance, game catalog, avatar shop items, inventory
2. Backend: auto-create default settings for every new user on signup
3. Frontend: AuthContext wrapping entire app, in-platform login/signup forms (no external auth)
4. Frontend: persistent session check on load — show login/signup if not authenticated, show main app if authenticated
5. Frontend: Header with logo, nav, Dini Bucks balance, logout button (no signup button when logged in)
6. Frontend: Left sidebar with Profile, Inventory, Groups, Settings links
7. Frontend: Home page with welcome message using display name, recommended games grid, friend activity
8. Frontend: Discover page with category tabs and game cards
9. Frontend: Avatar Shop page with items and Dini Bucks purchase flow
10. Frontend: Create page with two large containers linking to Dini Studio modes
11. Frontend: Dini Studio canvas with 2D shapes, decal uploads, property sliders
12. Frontend: Settings page — all fields functional, cooldown enforcement, profile picture upload/remove, visibility, gender, language, dark mode, delete account
13. Frontend: Translation provider wrapping all pages, language switcher in settings
14. Frontend: Light/dark mode context applied globally
15. Frontend: No window.open() or external href links anywhere
