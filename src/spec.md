# Specification

## Summary
**Goal:** Add core social functionality to DiniVerse Social: friends, private messaging, parties for joining experiences together, and creator following, with supporting user discovery and frontend pages.

**Planned changes:**
- Implement backend friend requests and friends list APIs scoped to authenticated users (send/accept/decline/cancel; inbox/outbox; mutual friends on accept).
- Implement backend direct messaging between two principals (create/find conversation, send message, list conversations, fetch messages with access limited to participants).
- Implement backend party system (create party, invite/respond, join/leave, view party state; optional experienceId association).
- Implement backend creator following (follow/unfollow, list followed creators, follower count per principal).
- Add backend user discovery/search endpoints to find users by display name for friending/messaging/following.
- Add a new Social area in the frontend (nav + hub) with sections for Friends, Messages, Parties, and Following, including loading/empty states and auth-gated messaging.
- Create new React Query hooks for social APIs using existing actor patterns and query invalidation so UI updates after actions.
- Add Follow/Unfollow UI on the Experience Details page for the experience author, reflecting follow state and follower count when available.
- Ensure new social pages match the existing Tailwind/shadcn visual theme and English UI copy.

**User-visible outcome:** Signed-in users can find other users, send/accept friend requests, message other users in 1:1 threads, create and manage parties (optionally tied to an experience), and follow/unfollow creators (including from Experience Details), with the Social hub providing dedicated pages for these features.
