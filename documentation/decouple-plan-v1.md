# Decouple Plan v1 — Nhost Functions Migration (Phases 0–5 + Media)

**Date:** June 2026  
**Author:** Engineering  
**Status:** ✅ Complete — all v1 phases wired and legacy routes retired  
**Scope:** Phases 0–5 (Infrastructure → Properties → Offers → Reviews → Profile → Tenants) + Phase 9 (Upload / Media, required by Phase 1).  
**Next wave:** Phases 6–8 (Notifications, Chat, Search) are tracked in [`decouple-plan-v2.md`](./decouple-plan-v2.md) and will become the active document once this plan is complete.

---

## Context

Dropiti-v3 is a Next.js client-side app that currently operates in two modes:

| Mode | Condition | How it works |
|------|-----------|--------------|
| **Legacy (monolith)** | `NEXT_PUBLIC_FUNCTIONS_URL` not set | `api-client.ts` calls `src/app/api/v1/*` Next.js route handlers which talk to Hasura via `serverClient.ts` |
| **Nhost (target)** | `NEXT_PUBLIC_FUNCTIONS_URL` is set | `api-client.ts` routes through `/api/v1/bff/functions/client/*` which proxies to the Nhost Functions at `fcuycyemqprjrkbshlcj.functions.ap-southeast-1.nhost.run` |

The BFF proxy (`src/app/api/v1/bff/functions/[...path]/route.ts`) already exists and handles auth cookie forwarding. The goal of this plan is to wire **every feature area** through Nhost Functions and then retire the legacy Next.js route handlers.

**Future payoff:** Once the monolith routes are retired, a React Native / Expo mobile app can call the same Nhost Functions URL directly (with its own JWT), giving us a shared backend without any Next.js dependency.

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

## 1. Endpoint Inventory & Migration Status (v1 scope)

### 1.1 Authentication / Session

| Legacy `api/v1` route | Nhost Function | Client call (`api-client.ts`) | Status |
|---|---|---|---|
| `GET /api/v1/auth/session` | ❌ None needed (Nhost SDK session) | AuthContext uses `nhost.auth.*` directly | ⚠️ Route exists but is auth-SDK concern |
| `GET /api/v1/users/get-user-by-id` | 🔵 `client/users/get-user-by-id` | `usersAPI.getUserByNhostUserId()` → BFF | ✅ |
| `GET /api/v1/users/get-user-by-uuid` | 🔵 `client/users/get-user-by-uuid` (410 stub) | Removed — use `get-user-by-id` | ✅ Deprecated |
| `POST /api/v1/users/create-user` | 🔵 `client/users/create-user` | `usersAPI.createUser()` | ✅ |
| `PUT /api/v1/users/update-user` | 🔵 `client/users/update-user` | `usersAPI.updateUser()` — PATCH on Nhost | ✅ |
| `DELETE /api/v1/users/delete-user` | ⬜ Not implemented | `usersAPI.deleteUser()` → legacy | ❌ |

---

### 1.2 Properties

| Legacy `api/v1` route | Nhost Function | Client call | Status |
|---|---|---|---|
| `GET /api/v1/properties/get-listings` | 🔵 `client/properties/get-listings` | `propertiesAPI.getListings()` → BFF | ✅ |
| `GET /api/v1/properties/get-property` | 🔵 `client/properties/get-property` | `propertiesAPI.getProperty()` | ✅ |
| `GET /api/v1/properties/get-property-by-uuid` | 🔵 `client/properties/get-property-by-uuid` | `propertiesAPI.getPropertyByUuid()` → BFF | ✅ |
| `POST /api/v1/properties/create-property` | 🔵 `client/properties/create-property` | `propertiesAPI.createProperty()` | ⚠️ Body shape differs; image upload not yet wired |
| `PATCH /api/v1/properties/update-property` | 🔵 `client/properties/update-property` | `propertiesAPI.updateProperty()` — uses `PUT` on legacy | ⚠️ Uses `PUT` on legacy, `PATCH` on Nhost |
| `GET /api/v1/properties/get-drafts` | 🔵 `client/properties/get-drafts` | `propertiesAPI.getDrafts()` | ❌ Still hits legacy |
| `POST /api/v1/properties/publish-draft` | 🔵 `client/properties/publish-draft` | `propertiesAPI.publishDraft()` | ❌ Still hits legacy |
| `DELETE /api/v1/properties/delete-draft` | 🔵 `client/properties/delete-draft` | `propertiesAPI.deleteDraft()` | ❌ Still hits legacy |
| `GET /api/v1/properties/get-property-count-by-user` | 🔵 `client/properties/get-property-count-by-user` | `propertiesAPI.getPropertyCountByUser()` | ❌ Still hits legacy |
| `POST /api/v1/search/properties` | ⬜ No Nhost equivalent — use `get-listings` filters | `searchAPI.searchProperties()` | ❌ No Nhost route; consolidate into `get-listings` |

---

### 1.3 Offers

| Legacy `api/v1` route | Nhost Function | Client call | Status |
|---|---|---|---|
| `POST /api/v1/offers/create-offer` | 🔵 `client/offers/create-offer` | `offersAPI.createOffer()` | ❌ Still hits legacy |
| `GET /api/v1/offers/get-offers` | 🔵 `client/offers/get-offers` | Not used in v3 | ⬜ Route exists in Nhost; unused in client |
| `GET /api/v1/offers/get-offers-by-id` | 🔵 `client/offers/get-offers-by-id` | `offersAPI.getOffersByRecipient()` | ❌ Still hits legacy |
| `GET /api/v1/offers/get-offers-by-initiator` | 🔵 `client/offers/get-offers-by-initiator` | `offersAPI.getOffersByInitiator()` | ❌ Still hits legacy |
| `POST /api/v1/offers/accept-offer` | 🔵 `client/offers/accept-offer` | `offersAPI.acceptOffer()` | ❌ Still hits legacy |
| `POST /api/v1/offers/reject-offer` | 🔵 `client/offers/reject-offer` | `offersAPI.rejectOffer()` | ❌ Still hits legacy |
| `POST /api/v1/offers/counter-offer` | 🔵 `client/offers/counter-offer` | `offersAPI.counterOffer()` | ❌ Still hits legacy |
| `POST /api/v1/offers/withdraw-offer` | 🔵 `client/offers/withdraw-offer` | `offersAPI.withdrawOffer()` | ❌ Still hits legacy |
| `GET /api/v1/offers/get-negotiation-state` | 🔵 `client/offers/get-negotiation-state` | `offersAPI.getNegotiationState()` | ❌ Still hits legacy |
| `GET /api/v1/offers/get-offer-actions` | 🔵 `client/offers/get-offer-actions` | `offersAPI.getOfferActions()` | ❌ Still hits legacy |
| `GET /api/v1/offers/get-review-opportunities` | 🔵 `client/offers/get-review-opportunities` | `offersAPI.getReviewOpportunities()` | ❌ Still hits legacy |

---

### 1.4 Reviews

| Legacy `api/v1` route | Nhost Function | Client call | Status |
|---|---|---|---|
| `POST /api/v1/reviews/create-review` | 🔵 `client/reviews/create-review` | `offersAPI.createReview()` / `reviewsAPI.createReview()` | ❌ Still hits legacy |
| `GET /api/v1/reviews/get-reviews-by-user` | 🔵 `client/reviews/get-reviews-by-user` | `reviewsAPI.getReviewsByUser()` | ❌ Still hits legacy |
| `GET /api/v1/reviews/get-reviews-by-property` | 🔵 `client/reviews/get-reviews-by-property` | `reviewsAPI.getReviewsByProperty()` | ❌ Still hits legacy |
| `PATCH /api/v1/reviews/update-review` | 🔵 `client/reviews/update-review` | `reviewsAPI.updateReview()` — uses `PUT` on legacy | ⚠️ Uses `PUT` on legacy, `PATCH` on Nhost |
| `DELETE /api/v1/reviews/delete-review` | 🔵 `client/reviews/delete-review` | `reviewsAPI.deleteReview()` | ❌ Still hits legacy |
| `POST /api/v1/reviews/mark-helpful` | 🔵 `client/reviews/mark-helpful` | `reviewsAPI.markReviewHelpful()` | ❌ Still hits legacy |
| `GET /api/v1/reviews/test-review-schema` | ⬜ None | Dev-only test route | 🗑️ Delete immediately |

---

### 1.5 Tenant Profiles

| Legacy `api/v1` route | Nhost Function | Client call | Status |
|---|---|---|---|
| `GET /api/v1/tenants` | 🔵 `client/tenants` | `tenantsAPI.getTenantProfiles()` → BFF | ✅ |
| `GET /api/v1/tenants/profile` | 🔵 `client/tenants/profile` | `tenantsAPI.getMyTenantProfile()` / `getTenantProfile()` → BFF | ✅ |
| `POST /api/v1/tenants/profile` | 🔵 `client/tenants/profile` | `tenantsAPI.upsertTenantProfile()` | ✅ |
| `PUT /api/v1/tenants/profile` | 🔵 `client/tenants/profile` (PATCH) | `tenantsAPI.updateTenantProfile()` — PATCH on Nhost | ✅ |

---

### 1.6 Upload / Media

| Legacy `api/v1` route | Nhost Function | Notes | Status |
|---|---|---|---|
| `POST /api/v1/upload` | 🔵 `client/upload/presign` (validation stub) | Prefer `@nhost/nhost-js` `storage.upload()` directly in UI | ⚠️ Nhost stub rejects; must use Nhost Storage SDK |
| `POST /api/v1/upload/s3` | ⬜ None (S3 path retired) | Replaced by Nhost Storage | 🗑️ Delete |

---

## 2. Phased Migration Plan

### Phase 0 — Infrastructure (Done ✅)

- [x] BFF proxy `src/app/api/v1/bff/functions/[...path]/route.ts`
- [x] `api-client.ts` dual-mode: `baseURL` switches on `NEXT_PUBLIC_FUNCTIONS_URL`
- [x] `nhost-functions.ts` helpers (`useNhostFunctions`, `isPublicClientBffRoute`, `PUBLIC_CLIENT_BFF_GET_PATHS`)
- [x] `NEXT_PUBLIC_FUNCTIONS_URL` in `.env`
- [x] Auth interceptor attaches Bearer from `nhost.auth.getAccessToken()`
- [x] Response interceptor normalises `{ ok, data }` → `{ success, data }`

---

### Phase 1 — Properties & Add Property Flow 🚧 Priority
> Unblocks: Dashboard "Add Property", "My Properties", "Edit Properties"

**Goal:** All property CRUD goes through Nhost; legacy property routes can be retired.

> **Dependency:** Phase 1d (image upload) depends on Phase 9 — complete the Nhost upload helper before wiring photos in `AddPropertyView`.

#### 1a — Wire drafts / publish / delete to BFF

In `api-client.ts`, `propertiesAPI`:

| Method | Current URL | Target Nhost path | Notes |
|--------|-------------|-------------------|-------|
| `GET getDrafts` | `/properties/get-drafts` | `client/properties/get-drafts` | Add to `PUBLIC_CLIENT_BFF_GET_PATHS` (Bearer required, already handled) |
| `POST publishDraft` | `/properties/publish-draft` | `client/properties/publish-draft` | Body: `{ propertyUuid }` |
| `DELETE deleteDraft` | `/properties/delete-draft` | `client/properties/delete-draft` | Query: `?property_uuid=` |
| `GET getPropertyCountByUser` | `/properties/get-property-count-by-user` | `client/properties/get-property-count-by-user` | Query: `?nhost_user_id=` |

#### 1b — Fix `createProperty` body shape

The Nhost function expects:
```json
{ "title", "description", "rental_price", "address", "photos": ["url1","url2"], ... }
```
The legacy route wraps in `{ property: { ... } }`. Align `transformPropertyData()` in `api-client.ts` to produce the flat Nhost shape when `USE_NHOST_FUNCTIONS`.

#### 1c — Fix `updateProperty` verb

Nhost expects `PATCH`; legacy uses `PUT`. Add `USE_NHOST_FUNCTIONS` branch (same pattern as `updateUser`).

#### 1d — Image upload in Add/Edit Property

Replace S3/presign flow with `nhost.storage.upload()` (Nhost SDK) directly in the file-picker component. Collect resulting URLs and pass them as `photos[]` to `create-property` / `update-property`. Full detail in [Phase 9](#phase-9--upload--media).

#### 1e — Retire legacy routes (after 1a–1d verified)

```
src/app/api/v1/properties/create-property/route.ts            → delete
src/app/api/v1/properties/update-property/route.ts            → delete
src/app/api/v1/properties/get-drafts/route.ts                 → delete
src/app/api/v1/properties/publish-draft/route.ts              → delete
src/app/api/v1/properties/delete-draft/route.ts               → delete
src/app/api/v1/properties/get-property-count-by-user/route.ts → delete
src/app/api/v1/properties/get-property/route.ts               → delete
src/app/api/v1/properties/get-property-by-uuid/route.ts       → delete
src/app/api/v1/properties/get-listings/route.ts               → delete
src/app/api/v1/search/properties/route.ts                     → delete (replace with get-listings params)
```

---

### Phase 2 — Offers (Incoming & Outgoing) 🚧 Priority
> Unblocks: Dashboard "Incoming Offers", "Outgoing Offers / Applications", offer negotiation modal

**Goal:** All offer lifecycle calls go through Nhost.

#### 2a — Wire all offer reads to BFF

Add these paths to `api-client.ts` with `USE_NHOST_FUNCTIONS` branches:

| Method | Nhost path | Params change |
|--------|-----------|---------------|
| `getOffersByInitiator` | `client/offers/get-offers-by-initiator` | Query: `?initiatorUserId=` (same) |
| `getOffersByRecipient` | `client/offers/get-offers-by-id` | Query: `?recipientUserId=&propertyUuid=` (same) |
| `getNegotiationState` | `client/offers/get-negotiation-state` | Query: `?offerId=&currentUserId=` (same) |
| `getOfferActions` | `client/offers/get-offer-actions` | Query: `?offerId=` (same) |
| `getReviewOpportunities` | `client/offers/get-review-opportunities` | Query: `?user_id=` (same) |

#### 2b — Wire all offer mutations to BFF

| Method | Nhost path | Body alignment |
|--------|-----------|----------------|
| `createOffer` | `client/offers/create-offer` | `{ propertyUuid, initiatorUserId, recipientUserId, proposingRentPrice, ... }` |
| `acceptOffer` | `client/offers/accept-offer` | `{ offerId, currentUserId }` |
| `rejectOffer` | `client/offers/reject-offer` | `{ offerId, currentUserId, reason? }` |
| `counterOffer` | `client/offers/counter-offer` | `{ offerId, currentUserId, counterData }` |
| `withdrawOffer` | `client/offers/withdraw-offer` | `{ offerId, currentUserId, reason? }` |

#### 2c — Retire legacy routes

```
src/app/api/v1/offers/create-offer/route.ts             → delete
src/app/api/v1/offers/get-offers/route.ts               → delete
src/app/api/v1/offers/get-offers-by-id/route.ts         → delete
src/app/api/v1/offers/get-offers-by-initiator/route.ts  → delete
src/app/api/v1/offers/accept-offer/route.ts             → delete
src/app/api/v1/offers/reject-offer/route.ts             → delete
src/app/api/v1/offers/counter-offer/route.ts            → delete
src/app/api/v1/offers/withdraw-offer/route.ts           → delete
src/app/api/v1/offers/get-negotiation-state/route.ts    → delete
src/app/api/v1/offers/get-offer-actions/route.ts        → delete
src/app/api/v1/offers/get-review-opportunities/route.ts → delete
```

---

### Phase 3 — Reviews 🚧 Priority
> Unblocks: "Your Reviews" tab, "Review Opportunities" tab

**Goal:** All review reads/writes go through Nhost.

#### 3a — Response shape alignment

The Nhost `get-reviews-by-user` and `get-reviews-by-property` return `{ ok, data: { items, pagination } }`.  
The legacy routes return `{ success, data: [...reviews...] }`.  
Update `reviewsAPI` in `api-client.ts` to normalise the envelope when `USE_NHOST_FUNCTIONS`.

#### 3b — Fix `updateReview` verb

Same pattern as `updateProperty`: use `PATCH` on Nhost, `PUT` on legacy.

#### 3c — Wire all review calls

| Method | Nhost path | Notes |
|--------|-----------|-------|
| `createReview` | `client/reviews/create-review` | Body: `{ offerId, rating, comment, reviewType, reviewerId, revieweeUserId, propertyUuid }` |
| `getReviewsByUser` | `client/reviews/get-reviews-by-user` | Query: `?userId=` |
| `getReviewsByProperty` | `client/reviews/get-reviews-by-property` | Query: `?propertyUuid=` |
| `updateReview` | `client/reviews/update-review` | PATCH body: `{ reviewId, rating?, comment? }` |
| `deleteReview` | `client/reviews/delete-review` | Query: `?reviewId=` |
| `markReviewHelpful` | `client/reviews/mark-helpful` | POST body: `{ reviewUuid }` |

#### 3d — Retire legacy routes

```
src/app/api/v1/reviews/create-review/route.ts            → delete
src/app/api/v1/reviews/get-reviews-by-user/route.ts      → delete
src/app/api/v1/reviews/get-reviews-by-property/route.ts  → delete
src/app/api/v1/reviews/update-review/route.ts            → delete
src/app/api/v1/reviews/delete-review/route.ts            → delete
src/app/api/v1/reviews/mark-helpful/route.ts             → delete
src/app/api/v1/reviews/test-review-schema/route.ts       → delete immediately (dev-only)
```

---

### Phase 4 — Profile Updates
> Unblocks: Dashboard "Profile" page, onboarding photo, account settings

**Status:** Mostly done — `createUser`, `getUserByNhostUserId`, `updateUser` all hit Nhost.

#### Remaining gaps

| Item | Action |
|------|--------|
| `deleteUser` — no Nhost function | Implement `client/users/delete-user` in Nhost (soft delete) OR keep legacy temporarily |
| Onboarding photo upload | Switch `photoUrl` upload to `nhost.storage.upload()`, then save URL via `updateUser` — see Phase 9 |
| Profile form `languages` / JSON fields | Verify PATCH body serialisation is consistent for all JSON columns |

#### Retire

```
src/app/api/v1/users/create-user/route.ts      → delete (after confirming Nhost version handles conflict correctly)
src/app/api/v1/users/update-user/route.ts      → delete
src/app/api/v1/users/get-user-by-id/route.ts   → delete
src/app/api/v1/users/get-user-by-uuid/route.ts → delete (already 410 stub, remove file)
```

---

### Phase 5 — Tenant Profiles (Dashboard + Marketplace)
> Already substantially migrated.

**Status:** `tenantsAPI` fully uses BFF for GET/POST/PATCH.

#### Remaining gaps

| Item | Action |
|------|--------|
| `PUT /api/v1/tenants/profile` legacy fallback in `updateTenantProfile` | Remove the `else` branch now that Nhost PATCH is in place |
| Confirm `user` object (nested `auth.users`) from Nhost list endpoint | Verify Nhost function redeployed with `user { id, email, avatarUrl }` |

#### Retire

```
src/app/api/v1/tenants/route.ts          → delete
src/app/api/v1/tenants/profile/route.ts  → delete
```

---

### Phase 9 — Upload / Media
> Required by Phase 1d (Add/Edit Property photos) and Phase 4 (Profile + Onboarding photo)

---

#### 9.1 Context — Why the admin approach differs from the client

The admin console (`dropiti-admin-console-2`) uses a **server-side proxy** pattern:

```
Browser → POST /api/v1/admin/upload/image (Next.js server) → Nhost Storage (admin secret)
```

The server proxy uses `HASURA_GRAPHQL_ADMIN_SECRET` so it can:
- Perform SHA-256 deduplication against `real_estate_media_assets`.
- Upload raw multipart bytes directly to Nhost Storage with the admin secret.
- Insert/update the `real_estate_media_assets` catalog in Hasura.
- Repair orphaned or S3-URL rows automatically.

**Client-side (dropiti-v3) cannot replicate this exactly** because:
- `HASURA_GRAPHQL_ADMIN_SECRET` must never be exposed to the browser or to Next.js edge functions accessible to users.
- The client authenticates via the user's JWT (Bearer token), not an admin secret.
- Nhost Storage upload with a user JWT uploads to the user's own file namespace and respects bucket access rules — this is the **correct and secure** path for end-user uploads.

The Nhost Function `POST /v1/client/upload/presign` deliberately **rejects** in this build and exists only as a validation stub.

---

#### 9.2 Client upload architecture (target)

```
Browser File picker
  │
  ▼
nhost.storage.upload({ file, bucketId? })   ← @nhost/nhost-js SDK (user JWT, browser-side)
  │
  ├─ Returns: { fileMetadata: { id, name, mimeType, size, ... } }
  │
  ▼
publicUrl = `https://{subdomain}.storage.{region}.nhost.run/v1/files/{fileMetadata.id}`
  │
  ▼
Store URL in Hasura field
  ├─ Property: photos[] → create-property / update-property body
  └─ User:     photo_url → users/update-user PATCH body
```

The `nhost` client is already instantiated in `src/lib/nhost.ts` with the correct subdomain and region — `nhost.storage.upload()` is **available today** in the browser without any additional setup.

`next.config.js` already allows `**.nhost.run` as a remote image pattern, so uploaded URLs work with `next/image` immediately.

---

#### 9.3 Constraints (aligned with admin media-upload.md)

| Constraint | Admin console | Client-side (dropiti-v3) |
|------------|---------------|--------------------------|
| Auth for upload | `HASURA_GRAPHQL_ADMIN_SECRET` | User JWT via `nhost.storage.upload()` |
| Deduplication | SHA-256 against `real_estate_media_assets` | None by default — acceptable for end-user flows |
| `real_estate_media_assets` catalog | Updated on every upload | **Not written to** by client uploads — catalog is admin/Nhost Function concern |
| MIME detection | hasura-storage `DetectReader` (auto on Nhost ≥ 0.12.0) | Same — MIME is detected by Nhost Storage from file bytes regardless of upload path |
| File size limit | Up to proxy cap (Next.js body limit) | Nhost Storage SDK default (up to 100 MB); enforce in UI (recommend ≤ 10 MB per file for property photos) |
| Bucket | `dropiti-bucket` (Nhost secret `MEDIA_STORAGE_BUCKET`) | Same bucket — ensure bucket has **authenticated user** download + upload permission in Nhost dashboard |
| Public display | Image served from Nhost Storage public URL | Same — `next.config.js` `remotePatterns` already set for `**.nhost.run` |

> **Bucket permissions note:** Nhost Storage bucket must allow authenticated users to upload (`INSERT` permission for the user role) and the bucket must be set to **public** for download (or the URLs will 403 in `<Image>`). Verify in Nhost Dashboard → Storage → Buckets → `dropiti-bucket` (or `default`).

---

#### 9.4 Current state vs target

| Upload touchpoint | Current (legacy) | Target (Nhost SDK) |
|-------------------|------------------|--------------------|
| Add Property photos (`Step6Photos` → `AddPropertyView`) | `uploadService.uploadPropertyPhotos(files)` → `POST /api/v1/upload` → S3 via `s3-upload.ts` | `nhost.storage.upload({ file })` per file in browser; collect `publicUrl`s; pass as `photos[]` to `create-property` |
| Edit Property photos (`PhotosSection`) | Same S3 path | Same Nhost SDK path; pass URLs to `update-property` PATCH |
| Profile photo (`ProfilePhotoUpload`) | `POST /api/v1/upload` → S3 | `nhost.storage.upload({ file })`; URL saved via `usersAPI.updateUser({ photo_url })` |
| Onboarding photo (`/onboarding/photo`) | No upload wired — sets `photoUrl` from OAuth avatar | Add `nhost.storage.upload()` for users who want to set a custom photo |
| Tenant profile photo | Not implemented | `nhost.storage.upload()` → URL saved via `tenantsAPI.updateTenantProfile({ photo_url })` |

---

#### 9.5 Migration steps

**Step 1 — Create a shared upload helper**

Create `src/lib/nhost-upload.ts`:

```ts
import { nhost } from '@/lib/nhost';

export interface NhostUploadResult {
  publicUrl: string;
  fileId: string;
  mimeType: string;
  name: string;
  size: number;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

export function validateImageFile(
  file: File,
  opts: { maxMb?: number } = {},
): { valid: boolean; error?: string } {
  const maxBytes = (opts.maxMb ?? 10) * 1024 * 1024;
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `Unsupported type: ${file.type}. Use JPEG, PNG, WebP or HEIC.` };
  }
  if (file.size > maxBytes) {
    return { valid: false, error: `File too large (max ${opts.maxMb ?? 10} MB).` };
  }
  return { valid: true };
}

/**
 * Upload a single File to Nhost Storage using the user's JWT.
 * Returns the public Nhost Storage URL. Throws on failure.
 */
export async function uploadFileToNhost(
  file: File,
  bucketId?: string,
): Promise<NhostUploadResult> {
  const { fileMetadata, error } = await nhost.storage.upload({
    file,
    ...(bucketId ? { bucketId } : {}),
  });

  if (error || !fileMetadata) {
    throw new Error(error?.message ?? 'Upload failed');
  }

  const subdomain = process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN!;
  const region = process.env.NEXT_PUBLIC_NHOST_REGION!;
  const publicUrl = `https://${subdomain}.storage.${region}.nhost.run/v1/files/${fileMetadata.id}`;

  return {
    publicUrl,
    fileId: fileMetadata.id,
    mimeType: fileMetadata.mimeType,
    name: fileMetadata.name,
    size: fileMetadata.size,
  };
}

/**
 * Upload multiple files in parallel. Returns URLs in the same order as input.
 */
export async function uploadFilesToNhost(
  files: File[],
  bucketId?: string,
): Promise<string[]> {
  const results = await Promise.all(
    files.map((file) => uploadFileToNhost(file, bucketId)),
  );
  return results.map((r) => r.publicUrl);
}
```

**Step 2 — Replace `AddPropertyView` upload**

In `src/components/dashboard/AddPropertyView.tsx`, replace:
```ts
const uploadResponse = await uploadService.uploadPropertyPhotos(propertyData.photos);
photoUrls = uploadResponse.data.uploadedFiles.map(file => file.url);
```

With:
```ts
import { uploadFilesToNhost } from '@/lib/nhost-upload';
photoUrls = await uploadFilesToNhost(propertyData.photos);
```

**Step 3 — Replace `ProfilePhotoUpload`**

In `src/components/common/ProfilePhotoUpload.tsx`, replace the `fetch('/api/v1/upload', ...)` block with:
```ts
import { uploadFileToNhost } from '@/lib/nhost-upload';
const { publicUrl } = await uploadFileToNhost(file);
onPhotoChange(publicUrl);
```

**Step 4 — Replace `PhotosSection` (edit property)**

Same pattern — collect `File[]`, call `uploadFilesToNhost()`, pass resulting URLs to `updateProperty`.

**Step 5 — Wire onboarding photo**

In `/onboarding/photo/page.tsx`, add a file picker that calls `uploadFileToNhost()` and saves the URL via `usersAPI.updateUser({ photo_url: publicUrl })`.

---

#### 9.6 File validation rules

| Rule | Value |
|------|-------|
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| Max file size | 10 MB per file (property photos), 5 MB (profile photo) |
| Max photo count | 20 (property gallery) |
| Min resolution | No server check — UI preview sufficient |

Call `validateImageFile(file, { maxMb: 10 })` before calling `uploadFileToNhost` in each touchpoint.

---

#### 9.7 Retire legacy upload routes

Once Steps 1–5 are complete and tested:

```
src/app/api/v1/upload/route.ts  → delete  (was S3 upload + presign proxy)
src/app/api/v1/upload/s3/route.ts → delete  (legacy S3 path)
src/lib/s3-upload.ts             → delete  (S3 SDK service)
src/lib/file-upload.ts           → delete  (stub upload service)
```

`S3_BUCKET_*` env vars can be removed from `.env` after retirement is confirmed.

---

#### 9.8 Environment checklist for Nhost Storage uploads

| Variable | Where | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_NHOST_SUBDOMAIN` | `.env` | ✅ Already set (`fcuycyemqprjrkbshlcj`) |
| `NEXT_PUBLIC_NHOST_REGION` | `.env` | ✅ Already set (`ap-southeast-1`) |
| Nhost bucket permissions | Nhost Dashboard | ✅ Verify `authenticated` role can `INSERT` to `dropiti-bucket`; bucket is public for reads |
| `next.config.js` `remotePatterns` | `next.config.js` | ✅ `**.nhost.run` already added |
| `S3_BUCKET_*` vars | `.env` | ⚠️ Remove after migration confirmed |

---

## 3. Routes to Retire Immediately (no migration needed)

These routes should be deleted before any phase work — they are dev utilities or already superseded:

```
src/app/api/v1/reviews/test-review-schema/route.ts  — dev test, not used in production
src/app/api/v1/upload/s3/route.ts                   — S3 path retired, Nhost Storage is primary
src/app/api/v1/users/get-user-by-uuid/route.ts      — 410 stub, safe to delete
```

---

## 4. Routes to Keep (Not Retiring)

| Route | Reason |
|-------|--------|
| `src/app/api/v1/bff/functions/[...path]/route.ts` | Core BFF proxy — keep forever |
| `src/app/api/v1/auth/session/route.ts` | Nhost SDK handles session; route may still be needed for SSR cookie sync |
| `src/app/api/v1/admin/*` | Admin routes power the admin console; out of scope for this plan |

---

## 5. New Nhost Functions Required (v1 scope)

| Feature | Required Nhost Function | Priority |
|---------|------------------------|----------|
| Delete user (soft delete) | `client/users/delete-user` | Low |
| Search / full-text property filter | Extend `client/properties/get-listings` | Medium |
| Presign / direct upload validation | Use SDK `nhost.storage.upload()` instead | Resolved — no function needed |

---

## 6. BFF Allowlist Updates (v1 phases)

As each phase is wired, add the Nhost client path to `PUBLIC_CLIENT_BFF_GET_PATHS` (in `src/lib/nhost-functions.ts`) for any endpoint that is optionally-authenticated. Bearer-required endpoints are already protected by the BFF 401 guard.

Paths to add (as phases complete):

```ts
// Phase 1
"client/properties/get-property-count-by-user"

// Phase 2 — all offer GETs require Bearer; no allowlist changes needed

// Phase 3 — reviews already in allowlist
// "client/reviews/get-reviews-by-property" ✅
// "client/reviews/get-reviews-by-user" ✅
```

---

## 7. Migration Progress Tracker (v1)

| Phase | Feature | Status | Nhost deploy | v3 wired | Legacy retired |
|-------|---------|--------|-------------|----------|---------------|
| 0 | Infrastructure / BFF | ✅ Done | ✅ | ✅ | — |
| 1 | Properties & Add Property | ✅ Done | ✅ | ✅ | ✅ |
| 2 | Offers (Incoming & Outgoing) | ✅ Done | ✅ | ✅ | ✅ |
| 3 | Reviews | ✅ Done | ✅ | ✅ | ✅ |
| 4 | Profile Updates | ✅ Done | ✅ | ✅ | ✅ |
| 5 | Tenant Profiles | ✅ Done | ✅ | ✅ | ✅ |
| 9 | Upload / Media | ✅ Done | ✅ (SDK) | ✅ | ✅ |

> Phases 6 (Notifications), 7 (Chat), and 8 (Search Consolidation) are tracked in [`decouple-plan-v2.md`](./decouple-plan-v2.md).

---

## 8. v1 Completion Criteria

This plan is considered complete (and superseded by v2) when **all** of the following are true:

- [ ] All property CRUD routes hit Nhost (Phases 1a–1d done)
- [ ] All offer lifecycle routes hit Nhost (Phase 2 done)
- [ ] All review routes hit Nhost (Phase 3 done)
- [ ] Profile and user routes fully retired (Phase 4 done)
- [ ] Tenant profile legacy routes retired (Phase 5 done)
- [ ] `nhost-upload.ts` helper created; S3 upload routes deleted (Phase 9 done)
- [ ] `USE_NHOST_FUNCTIONS` guard removed from all v1-scope API methods
- [ ] `src/lib/s3-upload.ts`, `src/lib/file-upload.ts` deleted
- [ ] `S3_BUCKET_*` env vars removed from `.env`
