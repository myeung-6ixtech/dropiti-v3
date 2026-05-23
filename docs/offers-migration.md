# Dashboard offers & applications — current structure (incl. admin + transfer ownership)

This document describes how **`/dashboard/applications`** and **`/dashboard/offers`** work today: UX purpose, file layout, data model, and API routes.

It also documents the **admin-managed listing** workflow:

- **Admin incoming offers inbox**: a consolidated offer view for listings “owned” by platform/admin users (based on recipient ids).
- **Transfer ownership invitation**: when an admin reaches out to an external landlord/agent via WhatsApp, they can send a time-limited link that lets the recipient register/log in and claim the listing under `/transfer-ownership/[token]`.

---

## 1. Product semantics

| Route | Role | Meaning |
|-------|------|--------|
| **`/dashboard/applications`** | **Initiator** (typically tenant) | “Applications” = **outgoing** offers the logged-in user created. They track status and can **withdraw**. |
| **`/dashboard/offers`** | **Recipient** (typically landlord) | “Incoming offers” = offers **addressed to** the logged-in user (`recipient_user_id`). They can **accept**, **reject**, or **counter**. |

Both pages use the authenticated user’s **`AuthContext` user `id`** (Nhost user id / `nhost_user_id` aligned id used elsewhere as `initiatorUserId` / `recipientUserId` in APIs).

**Property flow:** After a successful create from `/property/[id]`, the app redirects to **`/dashboard/applications`** (`src/app/property/[id]/page.tsx`).

---

## 2. Page structure (App Router)

```
src/app/dashboard/
├── applications/
│   ├── page.tsx                    # Shell: auth + AllOutgoingOffers
│   └── _components/
│       └── applications-header.tsx # Title + description (i18n)
└── offers/
    ├── page.tsx                    # Shell: auth + PullToRefresh + AllIncomingOffers
    └── _components/
        └── offers-header.tsx       # Title + description (i18n)
```

- **`applications/page.tsx`**: Waits for `useAuth()`; passes `initiatorUserId={authUser.id}` to `AllOutgoingOffers`.
- **`offers/page.tsx`**: Wraps content in `PullToRefreshWrapper` (increments `key` to remount list); passes `recipientUserId={authUser.id}` to `AllIncomingOffers`.

Navigation labels live in **`src/app/dashboard/layout.tsx`** and **`src/components/dashboard/MobileDashboardMenu.tsx`** (links to the same paths).

---

## 3. Core UI components

### 3.1 `AllOutgoingOffers` — applications list

**File:** `src/components/common/AllOutgoingOffers.tsx`

| Concern | Behavior |
|----------|----------|
| **Fetch** | `offersAPI.getOffersByInitiator(initiatorUserId)` on mount / when id changes. |
| **Tabs** | `MobileTabs` + desktop tab row. Filters: `pending` (includes `pending`, `tentatively_accepted`, `countered`), `accepted`, `rejected`, `withdrawn`, `all`. |
| **Row UI** | `OfferCard` with `isIncomingOffer={false}`, `onWithdrawOffer`, `currentUserId={initiatorUserId}`. |
| **Withdraw** | Parent calls `offersAPI.withdrawOffer(offerId, initiatorUserId)` and patches local state. |
| **Refresh** | On `onOfferStatusChange`, refetches via `getOffersByInitiator` (used when nested actions complete). |
| **Counter from list** | `onCounterOffer` on the card is wired to a `console.log` + TODO (outgoing counter UX not finished on this page). |
| **Empty** | `EmptyState` → browse `/search`. |

### 3.2 `AllIncomingOffers` — offers list

**File:** `src/components/common/AllIncomingOffers.tsx`

| Concern | Behavior |
|----------|----------|
| **Fetch** | `offersAPI.getOffersByRecipient(recipientUserId)` (no `propertyUuid` → all properties). |
| **Property enrichment** | If API payload already includes `offer.property`, maps it for `OfferCardDetails`. Else **N+1 fallback**: `propertiesAPI.getPropertyByUuid(offer.propertyUuid)` per offer. |
| **Tabs** | Same pending bucket as applications; also `accepted`, `rejected`, `all` (no `withdrawn` tab on incoming). |
| **Grouping** | Groups filtered rows by `propertyUuid` for display sections. |
| **Row UI** | `OfferCard` with `isIncomingOffer={true}`, accept/reject/counter handlers, `currentUserId={recipientUserId}`. |
| **Accept / reject** | Thin wrappers calling `offersAPI.acceptOffer` / `offersAPI.rejectOffer`, then local state patch. |
| **Counter** | Opens `CreateOfferModal` in `mode="counter"`; submit → `offersAPI.counterOffer(offerId, recipientUserId, counterData)`. |
| **Refresh after some actions** | `onOfferStatusChange` on cards triggers **`window.location.reload()`** (heavy-handed vs applications’ refetch). |

### 3.3 `OfferCard` composition

**File:** `src/components/common/OfferCard.tsx`

- **`OfferCardDetails`** — terms, property block, negotiation display.
- **Actions**
  - **Incoming:** `IncomingOfferCardActions` / `IncomingOfferCardStatus` — can call **`offersAPI.acceptOffer`** again internally (duplicate path with parent handlers depending on flow), reject, counter trigger from parent.
  - **Outgoing:** `OutgoingOfferCardActions` / `OutgoingOfferCardStatus` — **`offersAPI.withdrawOffer`**, **`rejectOffer`**, **`counterOffer`** (e.g. final counter modal), negotiation UI.

For a full inventory of client calls, grep `offersAPI` under `src/components/common/`.

---

## 4. HTTP API surface (`offersAPI`) + admin extensions

**Client:** `src/lib/api-client.ts` — `export const offersAPI`  
**Base URL:** Axios `baseURL: '/api/v1'` → routes live under **`src/app/api/v1/offers/`**.

| Method | Client function | HTTP | Route file |
|--------|-----------------|------|------------|
| Create | `createOffer` | `POST` | `create-offer/route.ts` |
| List by initiator | `getOffersByInitiator` | `GET` | `get-offers-by-initiator/route.ts` |
| List by recipient | `getOffersByRecipient` | `GET` | `get-offers-by-id/route.ts` ⚠️ name is “by-id” but query is **by recipient** (+ optional `propertyUuid`) |
| Accept | `acceptOffer` | `POST` | `accept-offer/route.ts` |
| Reject | `rejectOffer` | `POST` | `reject-offer/route.ts` |
| Counter | `counterOffer` | `POST` | `counter-offer/route.ts` |
| Withdraw | `withdrawOffer` | `POST` | `withdraw-offer/route.ts` |
| Actions history | `getOfferActions` | `GET` | `get-offer-actions/route.ts` |
| Negotiation UI helper | `getNegotiationState` | `GET` | `get-negotiation-state/route.ts` |

**Exact client paths (relative to `/api/v1`):**

- `GET /offers/get-offers-by-initiator?initiatorUserId=...`
- `GET /offers/get-offers-by-id?recipientUserId=...`  
  Optional: `&propertyUuid=...` (Hasura `where` adds property filter when set).
- `POST /offers/create-offer` — body: `CreateOfferInput` (`propertyId`, `initiatorUserId`, `recipientUserId`, `proposingRentPrice`, `numLeasingMonths`, `paymentFrequency`, `moveInDate`, `currency`, …).
- `POST /offers/accept-offer` — `{ offerId, currentUserId }`
- `POST /offers/reject-offer` — `{ offerId, currentUserId, reason? }`
- `POST /offers/counter-offer` — `{ offerId, currentUserId, counterData }` (`rentPrice`, `numLeasingMonths`, `paymentFrequency`, `moveInDate`, optional `message` / `reason`)
- `POST /offers/withdraw-offer` — `{ offerId, currentUserId, reason? }`
- `GET /offers/get-negotiation-state?offerId=...&currentUserId=...`

### 4.1 Admin list endpoint (incoming offers across admin-managed listings)

**Route:** `GET /api/v1/admin/offers/incoming`  
**File:** `src/app/api/v1/admin/offers/incoming/route.ts`

This endpoint returns offers where:

- `is_active = true`
- `recipient_user_id ∈ DROPITI_PLATFORM_LANDLORD_USER_IDS` (comma-separated env var of Nhost user ids for platform/admin “landlord” accounts)

It enriches each row with:

- `initiator` (tenant) profile from `real_estate_user`
- `property` from `real_estate_property_listing`
- `externalContact` from `property_listing.external_contact` (new column) for admin outreach workflows

Query params:

- `propertyUuid` (optional)
- `status` (optional)
- `limit` (default 50, max 100)
- `offset` (default 0)

### 4.2 Transfer ownership invitation APIs (admin + public)

These endpoints support sending a time-limited invitation link and letting the external party claim the listing.

| Capability | HTTP | Route |
|-----------|------|-------|
| Create + send invitation | `POST` | `/api/v1/admin/transfer-ownership/invite` |
| Resend invitation (fresh token) | `POST` | `/api/v1/admin/transfer-ownership/resend` |
| Latest invitation status (admin UI badge) | `GET` | `/api/v1/admin/transfer-ownership/status?propertyUuid=...` |
| Public token validation (live expiry check) | `GET` | `/api/v1/transfer-ownership/validate?token=...` |
| Claim listing (requires auth) | `POST` | `/api/v1/transfer-ownership/claim` |

Implementation files:

- `src/app/api/v1/admin/transfer-ownership/invite/route.ts`
- `src/app/api/v1/admin/transfer-ownership/resend/route.ts`
- `src/app/api/v1/admin/transfer-ownership/status/route.ts`
- `src/app/api/v1/transfer-ownership/validate/route.ts`
- `src/app/api/v1/transfer-ownership/claim/route.ts`

**Note:** `src/app/api/v1/offers/get-offers/route.ts` targets a different GraphQL shape (`offers` table) and is **not** what these dashboard pages use.

**Payment frequency:** API layer maps UI `yearly` ↔ DB `annually` (`src/lib/payment-frequency.ts`); list endpoints normalize **to client** on read.

---

## 5. Domain model (frontend `Offer`)

**File:** `src/types/offer.ts`

Important fields for routing and admin work:

- **Identity / linkage:** `id`, `offerKey`, `propertyUuid`
- **Parties:** `initiatorUserId`, `recipientUserId` (these are the Hasura / Nhost user ids used in API filters)
- **Terms:** `proposingRentPrice`, `numLeasingMonths`, `paymentFrequency`, `moveInDate`, currencies
- **Negotiation:** `currentRentPrice`, `currentNumLeasingMonths`, `currentPaymentFrequency`, `currentMoveInDate`, `negotiationRound`, `lastActionBy`, `lastActionType`, `lastActionAt`
- **Lifecycle:** `offerStatus` (`pending` | `tentatively_accepted` | `accepted` | `rejected` | `countered` | `withdrawn` | …), `isActive`
- **Finalized deal:** `finalRentPrice`, `finalNumLeasingMonths`, `finalPaymentFrequency`, `finalMoveInDate`, …
- **Hydration:** optional `initiator`, `recipient`, `property` (incoming list tries to ensure `property` for cards)

**Create-offer** persists `recipient_user_id` = landlord (or whoever owns the listing). For **admin-owned listings**, that recipient should be the **admin user id** so those rows appear in `get-offers-by-id?recipientUserId=<adminId>` — the same endpoint the dashboard offers page already uses.

---

## 6. Backend data access (high level)

- Routes use **`executeQuery` / `executeMutation`** → **`src/app/api/graphql/serverClient.ts`** against Hasura.
- Primary table: **`real_estate_offer`** (snake_case in GraphQL; responses mapped to camelCase for the app).

### 6.1 Latest database structure (relevant fields)

The app’s “source of truth” is the Hasura schema. The docs in `documentation/database/complete-database-setup.sql` may contain legacy `firebase_uid` naming, but the runtime API layer uses Nhost user ids.

**`real_estate_property_listing` (property_listings)**

Key ownership + admin fields used by the offers/admin flows:

- `property_uuid` (listing id)
- `landlord_firebase_uid` (currently used in app code as the “owner” column; stores the owner’s Nhost user id in practice)
- `external_contact` (new): external landlord/agent phone digits used for WhatsApp outreach

**`real_estate_offer` (offers)**

Key linkage fields:

- `property_uuid`
- `initiator_user_id` (tenant)
- `recipient_user_id` (landlord / listing owner; for admin-managed listings this is one of the platform landlord ids)
- negotiation fields: `current_*`, `negotiation_round`, `last_action_*`
- final terms: `final_*`

**`real_estate_property_transfer_invitation` (ownership invitations)**

New table storing time-limited claim tokens:

- `token_uuid` (invitation token)
- `property_uuid`
- `external_contact`
- `sent_by_admin_id`
- `status`: `pending | used | expired | cancelled`
- `expires_at`, `claimed_by_user_id`, `resend_count`, `whatsapp_message_id`

Recipient listing without property filter matches **all offers** for that user across properties (`get-offers-by-id/route.ts` — `GET_OFFERS_BY_RECIPIENT_WITHOUT_PROPERTY_FILTER_QUERY`).

---

## 7. Admin-managed listings: incoming offers + transfer ownership

### 7.1 How admin-managed listings are identified

In this repo’s current implementation, “admin-managed listings” are identified by the **recipient (owner) user id**:

- Offers are considered admin offers when `recipient_user_id ∈ DROPITI_PLATFORM_LANDLORD_USER_IDS`
- The admin inbox uses a dedicated endpoint `GET /api/v1/admin/offers/incoming` to query those rows and enrich them with `externalContact`

This avoids requiring a `landlord_role` column on `property_listing`.

### 7.2 Admin inbox (read-only + outreach)

UI components:

- `src/components/admin/AdminIncomingOffers.tsx`
- `src/components/admin/AdminOfferCard.tsx`

The admin card shows offer terms and invitation status, and can trigger:

- `POST /api/v1/admin/transfer-ownership/invite` (first send)
- `POST /api/v1/admin/transfer-ownership/resend` (fresh token) — allowed when the last invite is expired or ≥24h old

### 7.3 Transfer ownership invitation: user-facing claim flow

Page route:

- `/transfer-ownership/[token]` → `src/app/transfer-ownership/[token]/page.tsx`

Behavior:

1. Page calls `GET /api/v1/transfer-ownership/validate?token=...`
2. If unauthenticated, routes to:
   - `/auth/signup?callbackUrl=/transfer-ownership/[token]`
   - `/auth/signin?callbackUrl=/transfer-ownership/[token]`
3. After successful login/signup, user returns to the claim page and clicks **Claim This Property**
4. Page calls `POST /api/v1/transfer-ownership/claim` which:
   - validates token is pending + not expired
   - updates `property_listing.landlord_firebase_uid` to the authenticated user id
   - marks invitation status `used`

### 7.4 Doc debt to avoid

- **Naming debt**: incoming offers list uses **`get-offers-by-id`** (but is actually “by recipient”). Use file paths when referencing the canonical behavior.
- **Legacy naming**: `landlord_firebase_uid` stores Nhost user ids in practice. When updating schema docs, treat column meaning as “owner user id”.

---

## 8. Quick file index

| Area | Path |
|------|------|
| Applications page | `src/app/dashboard/applications/page.tsx` |
| Offers page | `src/app/dashboard/offers/page.tsx` |
| Outgoing list | `src/components/common/AllOutgoingOffers.tsx` |
| Incoming list | `src/components/common/AllIncomingOffers.tsx` |
| Card shell | `src/components/common/OfferCard.tsx` |
| Tenant-side actions | `src/components/common/OutgoingOfferCardActions.tsx` |
| Landlord-side actions | `src/components/common/IncomingOfferCardActions.tsx` |
| API client | `src/lib/api-client.ts` (`offersAPI`) |
| Offer types | `src/types/offer.ts` |
| Create from property | `src/app/property/[id]/page.tsx` (`handleOfferSubmit` → `offersAPI.createOffer`) |

---

*Generated from the Dropiti v3 codebase as a structural reference for admin incoming-offers work.*
