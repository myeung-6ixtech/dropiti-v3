# Decouple Plan v2 — Nhost Functions Migration (Phases 6–8)

**Date:** June 2026  
**Author:** Engineering  
**Status:** ✅ Complete  
**Scope:** Phases 6 (Notifications), 7 (Chat), 8 (Search Consolidation) + full end-state cleanup.

> This document becomes the **active sprint document** when all v1 completion criteria are met (all property, offer, review, profile, tenant, and upload phases done).

---

## Context

By the time this plan is active, the following will already be complete (from v1):

- All property CRUD, drafts, and search going through Nhost.
- All offer lifecycle (create, accept, reject, counter, withdraw) on Nhost.
- All review CRUD on Nhost.
- User profile and tenant profile routes fully migrated.
- Upload via `nhost.storage.upload()` SDK — S3 routes deleted.
- `api-client.ts` has no `USE_NHOST_FUNCTIONS` guards for any v1-scope feature.

The remaining legacy routes at the start of v2 will be:

```
src/app/api/v1/notifications/              (5 routes)
src/app/api/v1/chat/                       (4 routes)
src/app/api/v1/search/                     (1 route — already 404s on Nhost)
src/app/api/v1/auth/session/route.ts       (keep — SSR cookie sync)
src/app/api/v1/bff/functions/[...path]/    (keep — BFF proxy, permanent)
src/app/api/v1/admin/*                     (keep — admin portal, out of scope)
```

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Migrated — API client calls BFF → Nhost |
| ⚠️ | Partially migrated — some branches still hit legacy route |
| ❌ | Not migrated — still calling legacy Next.js route |
| 🗑️ | Ready to retire (Nhost side complete, v3 wired) |
| 🔵 | Nhost Function exists |
| ⬜ | Nhost Function does not exist |

---

## 1. Endpoint Inventory & Migration Status (v2 scope)

### 1.1 Notifications

| Legacy `api/v1` route | Nhost Function | Client call | Status |
|---|---|---|---|
| `GET /api/v1/notifications` | 🔵 `client/notifications/index` | `notificationsAPI.getNotifications()` | ❌ Still hits legacy |
| `GET /api/v1/notifications/unread-count` | 🔵 `client/notifications/unread-count` | `notificationsAPI.getUnreadCount()` | ❌ Still hits legacy |
| `POST /api/v1/notifications/mark-read` | 🔵 `client/notifications/mark-read` | `notificationsAPI.markRead()` | ❌ Still hits legacy |
| `POST /api/v1/notifications/mark-all-read` | 🔵 `client/notifications/mark-all-read` | `notificationsAPI.markAllRead()` | ❌ Still hits legacy |
| `POST /api/v1/notifications/archive` | 🔵 `client/notifications/archive` | `notificationsAPI.archiveNotification()` | ❌ Still hits legacy |

---

### 1.2 Chat

| Legacy `api/v1` route | Nhost Function | Client call | Status |
|---|---|---|---|
| `POST /api/v1/chat/get-or-create-room` | 🔵 `client/chat/get-or-create-room` | `chatAPI.getOrCreateRoom()` | ❌ Still hits legacy |
| `GET /api/v1/chat/get-chat-rooms` | 🔵 `client/chat/get-chat-rooms` | `chatAPI.getChatRooms()` | ❌ Still hits legacy |
| `GET /api/v1/chat/get-room-messages` | 🔵 `client/chat/get-room-messages` | `chatAPI.getRoomMessages()` | ❌ Still hits legacy |
| `POST /api/v1/chat/send-message` | 🔵 `client/chat/send-message` | `chatAPI.sendMessage()` | ❌ Still hits legacy |

---

### 1.3 Search

| Legacy `api/v1` route | Nhost Function | Notes | Status |
|---|---|---|---|
| `POST /api/v1/search/properties` | ⬜ None — consolidate into `get-listings` | `searchAPI.searchProperties()` — already 404s on Nhost | ❌ No Nhost route; consolidate into `get-listings` |

---

## 2. Phased Migration Plan

### Phase 6 — Notifications
> Unblocks: Notification bell, unread badge, in-app notification feed

All 5 notification endpoints exist in Nhost. Only change needed in `api-client.ts`: add `USE_NHOST_FUNCTIONS` branches to route to Nhost paths.

#### 6a — Wire all notification calls

| Legacy path | Nhost path | Change in client |
|-------------|-----------|-----------------|
| `/notifications` | `client/notifications/index` | Remove `userId` query param — Nhost scopes to JWT |
| `/notifications/unread-count` | `client/notifications/unread-count` | Same — remove explicit `userId` |
| `/notifications/mark-read` | `client/notifications/mark-read` | Body: `{ notificationId }` |
| `/notifications/mark-all-read` | `client/notifications/mark-all-read` | Body: `{}` — Nhost JWT scopes automatically |
| `/notifications/archive` | `client/notifications/archive` | Body: `{ notificationId }` |

#### 6b — Retire legacy routes

```
src/app/api/v1/notifications/route.ts              → delete
src/app/api/v1/notifications/unread-count/route.ts → delete
src/app/api/v1/notifications/mark-read/route.ts    → delete
src/app/api/v1/notifications/mark-all-read/route.ts → delete
src/app/api/v1/notifications/archive/route.ts      → delete
```

---

### Phase 7 — Chat
> Unblocks: Chat interface, in-app messaging, offer-linked conversations

All 4 chat endpoints exist in Nhost. Wire in `api-client.ts` with `USE_NHOST_FUNCTIONS` branch.

#### 7a — Wire all chat calls

| Legacy path | Nhost path | Notes |
|-------------|-----------|-------|
| `/chat/get-or-create-room` | `client/chat/get-or-create-room` | Body: `{ otherUserId }` |
| `/chat/get-chat-rooms` | `client/chat/get-chat-rooms` | No params; JWT scoped |
| `/chat/get-room-messages` | `client/chat/get-room-messages` | Query: `?roomId=&limit=&before=` |
| `/chat/send-message` | `client/chat/send-message` | Body: `{ roomId, content }` |

#### 7b — Retire legacy routes

```
src/app/api/v1/chat/get-or-create-room/route.ts → delete
src/app/api/v1/chat/get-chat-rooms/route.ts     → delete
src/app/api/v1/chat/get-room-messages/route.ts  → delete
src/app/api/v1/chat/send-message/route.ts       → delete
```

---

### Phase 8 — Search Consolidation
> No Nhost `search/properties` endpoint exists. The legacy route hits Hasura with full-text filters.

**Decision:** Consolidate into `client/properties/get-listings` which already supports `minPrice`, `maxPrice`, `bedrooms`, `type`, `landlord_user_id`. Add any missing filters to that handler and retire `searchAPI.searchProperties()` in the client.

#### 8a — Extend `get-listings` Nhost function

Add the following optional query params to `client/properties/get-listings.ts` in `dropiti-nhost`:

| Param | Filter type | Notes |
|-------|-------------|-------|
| `location` | `district _ilike "%{location}%"` | District-level text search |
| `keyword` | `title _ilike "%{keyword}%"` | Free-text property title search |
| `furnishing` | `furnishing = {value}` | Exact match |
| `available_from` | `available_from <= {date}` | Date comparison |

#### 8b — Update client

1. Update `SearchPageContent` (already using `get-listings`) to pass all search params.
2. Remove `searchAPI` export and `searchAPI.searchProperties()` from `api-client.ts`.
3. Delete `src/app/api/v1/search/` route directory.

#### 8c — Retire

```
src/app/api/v1/search/properties/route.ts → delete (or it may already be removed in v1 Phase 1e)
```

---

## 3. New Nhost Functions Required (v2 scope)

| Feature | Required Nhost Function | Priority |
|---------|------------------------|----------|
| Extended search filters | Extend `client/properties/get-listings` params | Medium |
| Real-time notifications (WebSocket) | Consider Hasura subscriptions or polling | Low / future |
| Chat real-time (WebSocket) | Consider Hasura subscriptions | Low / future |

---

## 4. BFF Allowlist Updates (v2 phases)

```ts
// Phase 6 — notifications require Bearer; no allowlist changes needed

// Phase 7 — chat GET endpoints need to be allowlisted if used without auth (unlikely)
// All chat routes require Bearer — no allowlist changes needed

// Phase 8 — search consolidates into get-listings which is already allowlisted
// "client/properties/get-listings" ✅
```

---

## 5. Migration Progress Tracker (v2)

| Phase | Feature | Status | Nhost deploy | v3 wired | Legacy retired |
|-------|---------|--------|-------------|----------|---------------|
| 6 | Notifications | ✅ Done | ✅ | ✅ | ✅ |
| 7 | Chat | ✅ Done | ✅ | ✅ | ✅ |
| 8 | Search Consolidation | ✅ Done | ✅ | ✅ | ✅ |

---

## 6. v2 Completion Criteria

This plan is considered complete (monolith fully retired) when **all** of the following are true:

- [x] Notifications wired to Nhost; 5 legacy routes deleted (Phase 6 done)
- [x] Chat wired to Nhost; 4 legacy routes deleted (Phase 7 done)
- [x] `searchAPI` removed from `api-client.ts`; search consolidated into `get-listings` (Phase 8 done)
- [x] `src/app/api/v1/` contains **only**: `bff/functions/`, `auth/session/`, `admin/`
- [x] `api-client.ts` has **no** `USE_NHOST_FUNCTIONS` conditional branches anywhere
- [x] `useNhostFunctions()` check and `USE_NHOST_FUNCTIONS` constant deleted from `nhost-functions.ts`
- [x] `NEXT_PUBLIC_FUNCTIONS_URL` is no longer a feature gate — it is just a config value

---

## 7. End State

When v2 is complete, the architecture is:

```
dropiti-v3 (Next.js)
  ├── src/app/api/v1/
  │   ├── bff/functions/[...path]/route.ts   ← permanent BFF proxy
  │   ├── auth/session/route.ts              ← SSR cookie sync
  │   └── admin/*                            ← admin portal (separate concern)
  └── src/lib/api-client.ts                  ← all calls go to Nhost, no conditionals

dropiti-nhost (Nhost Functions)
  └── functions/client/*                     ← single source of truth for all client API

Mobile App (future React Native / Expo)
  └── calls NEXT_PUBLIC_FUNCTIONS_URL directly with Bearer JWT
      ← no Next.js dependency; same backend as web
```

**`api-client.ts` after full migration:**
- `baseURL` is always `NEXT_PUBLIC_FUNCTIONS_URL/v1` (no fallback, required env var).
- No `USE_NHOST_FUNCTIONS` guard, no dual-branch logic.
- All methods are clean Axios calls to `client/*` paths.
- A React Native / Expo app can import the same `api-client` with its own `FUNCTIONS_URL` and `Authorization: Bearer {jwt}` header — no BFF needed.
