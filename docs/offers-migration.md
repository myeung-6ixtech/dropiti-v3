# Dashboard offers & applications — reference for admin incoming offers

This document describes how **`/dashboard/applications`** and **`/dashboard/offers`** work today: UX purpose, file layout, data model, and API routes. Use it as a baseline when building an **admin** view for offers where **`recipient_user_id`** is an admin user (same data model; different navigation and possibly broader filters).

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

## 4. HTTP API surface (`offersAPI`)

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

Recipient listing without property filter matches **all offers** for that user across properties (`get-offers-by-id/route.ts` — `GET_OFFERS_BY_RECIPIENT_WITHOUT_PROPERTY_FILTER_QUERY`).

---

## 7. Implications for an admin “incoming offers” area

1. **Reuse the same read path:** `getOffersByRecipient(adminUserId)` (or direct GET to the same route) returns everything where `recipient_user_id === adminUserId`. No new table required if admin listings use the admin’s user id as recipient on create.
2. **Reuse list UI:** `AllIncomingOffers` is already parameterized by `recipientUserId`; you can mount it on an admin route with the admin session’s id, or extract a headless hook + presentational list for admin styling.
3. **Actions:** Accept / reject / counter all require `currentUserId` matching the **recipient** in business rules (`src/lib/offer-negotiation.ts`). Ensure the admin account is the stored recipient for those offers.
4. **Performance:** `AllIncomingOffers` may call `getPropertyByUuid` per offer when the API omits property embeds; the admin view may want a backend join (already partially done when property is included in offer payload) or a dedicated admin list endpoint to avoid N+1.
5. **Naming debt:** Incoming offers use **`get-offers-by-id`** — when adding admin docs or new code, refer to the implementation file, not the name alone.

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
