# Specification

## Summary
**Goal:** Enable first-party, on-platform username/password authentication with session-based login (no Internet Identity and no external redirects).

**Planned changes:**
- Add Motoko backend canister methods for username/password signup and login, ensuring unique usernames and storing only hashed/derived password data.
- Implement backend session token management (issue/validate/logout) and gate existing write/mutation actions using a valid session token while keeping read-only browsing available to guests.
- Replace the frontend “Login Disabled / Sign Up Disabled” flow with on-platform `/login` and `/signup` forms that call the backend auth APIs and show English validation/error messages.
- Refactor frontend auth state to persist the backend session token across reloads (e.g., localStorage), update AuthButtons/RequireProfile behavior to use session auth, and avoid edits to immutable frontend files/paths.
- Update existing banner/change-control messaging to remain accurate: external redirects remain disabled while on-platform auth is enabled.

**User-visible outcome:** Users can sign up and log in directly داخل the app using username/password, stay logged in across reloads, log out, and access account-gated/write features once authenticated—while guests can still browse read-only content without external login redirects.
