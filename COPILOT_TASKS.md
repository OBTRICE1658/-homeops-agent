# Copilot Prime Directive — HomeOps UI vNext
You are building a mobile-first, chat-first UI in a vanilla HTML/CSS/JS frontend (public/) for a Node/Express backend (index.cjs). Ship production-quality code with clean structure, small modules, and accessible, responsive UX.

**Key Requirements**
- Default view is the Chat Agent (thread + composer).
- A sticky top bar has two lucide icon buttons: Mail (opens Email Overlay) and Calendar (opens Calendar Overlay).
- Email Overlay shows AI summaries of important emails with action buttons: Add to Calendar, Draft Reply (AI), Open in Gmail, and Mark as Reviewed (local state).
- Calendar Overlay renders FullCalendar (mobile friendly) + Event Inspector + quick add.
- All UI is fully mobile-optimized (safe areas, 100dvh, large tap targets, sticky composer).
- Implement skeleton loaders, error states, and optimistic UI for actions.
- No frameworks; use modern, modular JS with ES modules.

**APIs to call** (contract below):
- GET `/api/email/important?limit=20` → list of important email summaries.
- POST `/api/email/draft` { messageId, styleHints? } → { draft }.
- POST `/api/calendar-events` (existing) to create events.
- GET `/api/calendar-events/:userId` (existing) to list events.
- GET `/api/chat?conversationId=...` and POST `/chat` (existing) for the agent.

**Quality Bar**
- A11y: focus states, aria-roles, ESC to close overlays, focus trap when overlay open.
- Performance: avoid layout thrash; use CSS variables; defer heavy work; lazy-init calendar overlay.
- Reliability: handle network errors; show toasts; never crash.
