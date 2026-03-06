# Dini.Verse

## Current State

The Groups page (`src/frontend/src/pages/Groups.tsx`) is fully implemented with:
- Group creation (500 Dini Bucks)
- Group detail view with tabs: Member Management, Revenue, Experiences, Item Sales, Social, Audit Log, Allies/Enemies
- Social tab has a post composer (text only) and a read-only feed — no edit/delete on posts
- Group header shows name and thumbnail but has no controls to change them after creation
- The full tab configuration (all 7 tabs) is always visible to whoever opens the group — no distinction between owner/admin view and member view

## Requested Changes (Diff)

### Add

1. **Rename Group button** in the group detail header — costs 100 Dini Bucks. Opens a dialog where the owner can type a new name, confirm, and have 100 Dini Bucks deducted. Add an audit log entry for the rename.
2. **Change Thumbnail button** in the group detail header — free. Owner clicks it, a file picker opens, they select a new image, and the thumbnail updates immediately. Add an audit log entry.
3. **Edit button on each social post** — visible only to the post author. Clicking it turns the post content into an inline editable textarea. Confirm saves the edit, cancel reverts. The edit should update the post in the group's posts array.
4. **Delete button on each social post** — visible to the post author AND to the group owner/admin. Clicking removes the post from the posts array. Add an audit log entry for admin/owner deletions.
5. **Image upload in social posts** — the post composer should allow attaching an image (file picker). The post stores an optional `imageDataUrl`. Images are displayed in the feed below the text content.
6. **"Switch to Member View" toggle button** in the group detail header — only visible to the group owner. When toggled ON, the owner sees the group as a regular member would see it. The tab bar is replaced with a member-only view showing: Social tab, UGC Store tab (showing group items for sale), and Allies tab.
7. **Member View** — non-owner members who open a group they belong to should see the same limited view: Social (can post text and images), UGC Store (group items for sale, buy button), and Allies (read-only list of allies). The full configuration tabs (Member Management, Revenue, Experiences, Item Sales, Audit Log) are only shown to the group owner/admin.

### Modify

- `GroupPost` interface: add optional `imageDataUrl?: string` field.
- `SocialTab`: add image upload button to post composer, display image in posts, add edit/delete buttons on each post card.
- `GroupDetail` header: add "Rename Group (100 DB)" button and "Change Thumbnail" button, both only visible when `currentUser === group.ownedBy`. Add "Switch to Member View" toggle for owners.
- `GroupDetail` routing logic: if the current user is NOT the owner (but is a member), show the member view instead of the full config tabs. If the current user IS the owner and toggles member view, show the member view temporarily.

### Remove

- Nothing is removed.

## Implementation Plan

1. Update `GroupPost` interface to add `imageDataUrl?: string`.
2. In `SocialTab`:
   - Add a file input ref and upload button in the composer for image attachment.
   - Preview the selected image below the textarea before posting.
   - Store `imageDataUrl` on the post object.
   - Render post images in the feed.
   - Add edit button (pencil icon) on posts authored by `currentUser` — renders an inline textarea + save/cancel.
   - Add delete button (trash icon) on posts authored by `currentUser` OR when `currentUser` is owner/admin. Removing calls `onUpdate`.
   - Pass `isAdmin` prop into `SocialTab` so it knows who can delete others' posts.
3. In `GroupDetail` header:
   - Add "Rename Group" button (only owner). Opens a dialog: text input pre-filled with current name, confirm button costs 100 Dini Bucks (check balance, deduct, update group name, add audit entry).
   - Add "Change Thumbnail" button (only owner). Hidden file input, clicking opens picker, on select updates `thumbnailDataUrl`, adds audit entry.
   - Add "Member View" toggle button (only owner). State: `memberViewMode: boolean`.
4. In `GroupDetail` render:
   - Determine `isOwner = currentUser === group.ownedBy`.
   - Determine `isAdmin = member role is Owner or Admin`.
   - If `isOwner && !memberViewMode`: show full 7-tab config layout as today, plus the header buttons.
   - If `!isOwner && isMember`: show member view (Social, UGC Store, Allies tabs only).
   - If `isOwner && memberViewMode`: show same member view (Social, UGC Store, Allies).
5. Create a `MemberView` component (or inline in `GroupDetail`) with three tabs: Social (full posting), UGC Store (read-only item grid with buy button placeholder), Allies (read-only list).
6. Add `data-ocid` markers to all new interactive surfaces.
