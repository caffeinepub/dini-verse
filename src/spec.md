# Specification

## Summary
**Goal:** Add Roblox-style navigation and richer Discover/Experience flows with categories, trending browsing, and enhanced play/details UI.

**Planned changes:**
- Add a left sidebar navigation (desktop/tablet) in the main app layout with links to Profile, Inventory, Groups, and Settings, without disrupting the existing top header.
- Create new pages/routes for Inventory, Groups, and Settings and connect them to the sidebar.
- Update Discover to support category browsing (at least Adventure, Roleplay, Simulator) and a Trending experiences section that updates when switching categories, backed by persisted category data.
- Extend the backend Experience model to persist category, player count, thumbs up/down counts, and optional per-experience controls guidance; add backend methods to fetch details and to update thumbs up/down (authenticated users only).
- Update the publish experience flow to require selecting a category (Adventure/Roleplay/Simulator at minimum) and store it for Discover filtering.
- Enhance the Experience Details page with a prominent green Play button, description, player count, and thumbs up/down controls with counts from persisted backend data (updating without full refresh).
- In play mode, show a Controls section (WASD/Space/Mouse defaults) with optional per-experience overrides, and add an in-game menu with Leave, Reset Character, and Settings (basic panel/modal).
- If required by state changes, add a conditional backend migration to backfill new Experience fields while preserving existing data.

**User-visible outcome:** Users can navigate via a new left sidebar, browse Discover trending experiences by category, publish experiences with a category, view richer experience details (Play, stats, ratings), and access controls guidance and an in-game menu during play mode.
