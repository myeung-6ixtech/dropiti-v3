# Moderate Properties (Admin) — Product Functions & Specification

**Document location:** `/documentation/moderate-properties.md`  
**Last updated:** 2026-01-11  
**Applies to:** Property listing creation/edit flows used by `/dashboard/add-property` and `/dashboard/properties/edit/[id]`  

---

## Purpose

This document defines the **admin backend functions** required to:

- **Moderate** property listings (review, approve/reject, unpublish, archive, investigate reports).
- **Create and modify** listings from an admin interface while staying consistent with the existing product field schema used in the dashboard flows.
- Support **“Staff Created”** listings (admin-created inventory) in a product that is otherwise P2P.

This is a **spec + function contract** document (not an implementation).

---

## Current product listing format (source of truth)

The existing user-facing listing creation flow is an 8-step wizard (Add Property) and maps to a single payload type that the frontend submits to the backend.

### Canonical frontend schema: `PropertyDataForAPI`

This is the shape the Add Property flow builds, and is the most helpful reference for admin-created listing UI forms as well.

- **Step 1 — Property Type**
  - `propertyType`: `"residential" | "commercial"` (commercial currently disabled in UI)
  - `residentialType`: `"serviced-apartment" | "village-house" | "apartment" | "condo"`
- **Step 2 — Rental Space**
  - `rentalSpace`: `"entire-apartment" | "partial-apartment" | "shared-space" | "private-room"`
- **Step 3 — Address**
  - `address`: object
    - `unit`, `floor`, `block`, `building`
    - `addressLine1`, `addressLine2`
    - `district`, `state`, `country`, `city`
    - `showSpecificLocation` (boolean)
- **Step 4 — Unit Details**
  - `unitDetails`: object
    - `grossArea`, `netArea`
    - `bedrooms`, `bathrooms`
    - `furnished`: `"fully" | "partially" | "non-furnished"`
    - `petsAllowed` (boolean)
- **Step 5 — Amenities**
  - `amenities`: `string[]`
- **Step 6 — Photos**
  - `photos`: `string[]` (S3 URLs)  
    - Note: in the UI, photos are selected as `File[]` then uploaded to S3; the API expects URLs.
- **Step 7 — Rental Details**
  - `rentalDetails`: object
    - `listingName`, `listingDescription`
    - `rentalPrice`
    - `availableDate` (Date | string | null)
- **Status**
  - `status`: `"draft" | "published" | "archived" | "expired"`

### “Complete listing” (publish) required fields (frontend validation)

The dashboard “Add Property” flow only allows submission when these exist:

- `propertyType`
- `residentialType`
- `rentalSpace`
- `address.addressLine1`
- `address.district`
- `unitDetails.bedrooms` and `unitDetails.bathrooms` (not undefined)
- `amenities.length > 0`
- `photos.length > 0`
- `rentalDetails.listingName`
- `rentalDetails.rentalPrice`

### Draft behavior (product expectation)

Drafts support **minimal data**, and the backend currently enforces only:

- `title` exists and is **3+ chars** (see backend create-property route)

---

## Backend storage model (current)

Listings are persisted to `real_estate_property_listing` (Hasura/GraphQL).

### Key columns used today

- Identity
  - `property_uuid` (UUID v4)
- Ownership
  - `landlord_firebase_uid` (string)
- Core content
  - `title`, `description`
  - `address` (stored as structured JSON)
  - `show_specific_location` (boolean)
- Listing attributes
  - `property_type` (string)
  - `rental_space` (string)
  - `num_bedroom`, `num_bathroom`
  - `gross_area_size`, `gross_area_size_unit`
  - `furnished` (string)
  - `pets_allowed` (boolean)
  - `amenities` (string[])
- Media
  - `display_image` (string)
  - `uploaded_images` (string[])
- Pricing + availability
  - `rental_price`, `rental_price_currency`
  - `availability_date`
- Lifecycle fields
  - `status`: `"draft" | "published" | "archived" | "expired"` (**single source of truth**)
  - `last_saved_at`, `completion_percentage`
  - `created_at`, `updated_at`

---

## Admin: What we need (product requirements)

### Core admin jobs

- **Create listing** (including Staff Created listings)
- **Edit listing** (field-level editing and corrections)
- **Moderate listing** (approve/reject, publish/unpublish, archive/restore)
- **Investigate listing** (reports, policy violations, fraud signals)
- **Audit** admin actions (who changed what, when, why)

### Roles / permission expectations

- **Admin (standard)**: view listings, edit non-sensitive fields, moderate approve/reject.
- **Admin (senior)**: all above + create staff listings + change owner, override status, bulk operations.
- **Read-only**: view listing and moderation history.

---

## Admin API functions (proposed)

All admin endpoints MUST:

- Require **admin authentication** (separate from user auth).
- Write an **audit log** entry for any state-changing action.
- Support idempotency for key actions where applicable (approve/reject/publish).

Namespace recommendation: `/api/v1/admin/properties/...`

### 1) Search / list listings

**GET** `/api/v1/admin/properties`

- **Query params**
  - `q` (search: title, uuid, landlord uid)
  - `status` (`draft|published|archived|expired`)
  - `listing_origin` (`p2p|staff`) *(see “Staff Created” section)*
  - `created_from`, `created_to` (date range)
  - `limit`, `offset`

- **Returns**
  - `data: PropertySummary[]`
  - `pagination`

### 2) Get listing detail (admin view)

**GET** `/api/v1/admin/properties/:property_uuid`

- **Returns**
  - Full listing record (all fields)
  - Owner summary (landlord user info)
  - Moderation + audit metadata (if available)

### 3) Admin update listing fields (safe patch)

**PATCH** `/api/v1/admin/properties/:property_uuid`

- **Body (recommended)**
  - `updates`: partial fields in **DB column naming** (to match existing update behavior):
    - `title`, `description`
    - `address`, `show_specific_location`
    - `property_type`, `rental_space`
    - `num_bedroom`, `num_bathroom`
    - `gross_area_size`, `gross_area_size_unit`
    - `furnished`, `pets_allowed`
    - `amenities`
    - `display_image`, `uploaded_images`
    - `rental_price`, `rental_price_currency`
    - `availability_date`
    - `status` (restricted; see below)
  - `reason` (required string)

- **Rules**
  - Validation must mirror existing constraints:
    - `status ∈ {draft,published,archived,expired}`
    - Type checks for numeric fields
  - Sensitive changes require elevated role:
    - Changing `landlord_firebase_uid` (ownership transfer)
    - Setting `status` to `published` (if moderation gating exists)

### 4) Admin publish/unpublish/archive

These are convenience wrappers to avoid arbitrary status edits and to enforce policy.

- **POST** `/api/v1/admin/properties/:property_uuid/publish`
- **POST** `/api/v1/admin/properties/:property_uuid/unpublish` (sets `status=draft`)
- **POST** `/api/v1/admin/properties/:property_uuid/archive`
- **POST** `/api/v1/admin/properties/:property_uuid/restore` (recommended default: `draft`)

Each requires:

- `reason` (string)
- Optional: `notify_owner` boolean + template selection

### 5) Moderation decisions (approve/reject) — recommended model

Today the DB `status` is used for lifecycle only. For real moderation (policy review), we should not overload it.

**Recommendation:** Add a separate moderation field:

- `moderation_status`: `pending | approved | rejected | needs_changes`
- `moderation_reason` (string / enum + free text)
- `moderated_by_admin_id` (uuid)
- `moderated_at` (timestamp)

Then expose:

- **GET** `/api/v1/admin/properties/moderation-queue?status=pending`
- **POST** `/api/v1/admin/properties/:property_uuid/approve`
- **POST** `/api/v1/admin/properties/:property_uuid/reject`
- **POST** `/api/v1/admin/properties/:property_uuid/request-changes`

**If you prefer minimal schema changes:** you can approximate moderation by leaving `status=draft` until approved, then setting `status=published`. Rejection becomes an admin note + keeping the listing in draft/archived. This is workable but less explicit.

---

## Staff Created listings (admin-created inventory) — proposed product behavior

### Problem

Dropiti is P2P: listings are created by landlords. We need a controlled mechanism for admins to create listings that are **clearly marked as platform-created** and managed differently (ownership, trust, auditing, and possible display treatment).

### Requirements

- Admins can create a listing that is tagged **Staff Created**.
- Staff Created listings must:
  - Be attributable to a specific admin (audit trail).
  - Be distinguishable from P2P listings in the database and UI.
  - Support either:
    - **On-behalf-of** creation (assigned to a real landlord), or
    - **Platform-owned** creation (assigned to a platform account).
- Staff Created listings should be eligible for the same edit/publish lifecycle, but may optionally skip certain checks (configurable).

### Data model options (recommended)

#### Option A (best): Add explicit columns

Add to `real_estate_property_listing`:

- `listing_origin` (enum): `p2p | staff`
- `created_by_admin_id` (uuid, nullable)
- `created_via_admin` (boolean, derived from `listing_origin` but convenient)

Pros: clear, queryable, and robust.

#### Option B (minimal schema): Store in existing JSON metadata

If you want to avoid schema changes, store metadata in an existing JSON column (example: `draft_metadata`) but rename/generalize it over time:

```json
{
  "listing_origin": "staff",
  "created_by_admin_id": "uuid",
  "source_note": "Imported from partner spreadsheet"
}
```

Pros: faster to ship. Cons: harder to enforce constraints and index.

### Proposed admin function: Create Staff Listing

**POST** `/api/v1/admin/properties/create`

- **Body**
  - `property`: accepts the **same shape** as the product creation payload (`PropertyDataForAPI`) OR the DB-shaped object (choose one and standardize).
  - `owner_mode`: `"platform" | "on_behalf_of"`
  - If `owner_mode="on_behalf_of"`:
    - `landlord_firebase_uid` (string) — the intended owner
  - If `owner_mode="platform"`:
    - system uses `PLATFORM_LANDLORD_FIREBASE_UID` (config/env)
  - `listing_origin`: `"staff"` (forced)
  - `reason` (required string)

- **Behavior**
  - Creates listing in `status="draft"` by default.
  - Sets `listing_origin="staff"`.
  - Attaches `created_by_admin_id` and writes audit log.
  - Returns `property_uuid` and full listing.

### Proposed admin function: Convert P2P → Staff Created (rare)

Only for edge cases like compliance migrations or import cleanup.

**POST** `/api/v1/admin/properties/:property_uuid/mark-staff-created`

- Body: `reason` (required)
- Requires: senior role

---

## Audit logging (required for all admin mutations)

For every admin mutation, write an audit record:

- `admin_id`
- `action` (e.g. `PROPERTY_UPDATE`, `PROPERTY_PUBLISH`, `PROPERTY_STAFF_CREATE`)
- `resource_type = "property"`
- `resource_id = property_uuid`
- `details` (JSON diff + reason)
- `timestamp`

This aligns with the broader admin plan described in `/docs/admin-interface-functions.md`.

---

## UI / Admin experience expectations (non-functional)

- **Fast review**: show key fields first (title, price, address summary, photos, owner, status).
- **Safe edits**: prefer guided forms; avoid raw JSON editing unless senior role.
- **Action confirmations**: publish/unpublish/archive/reject should require confirmation + reason.
- **Traceability**: show an “Admin history” panel with last N audit events.

---

## Open questions (confirm before implementation)

1. Should moderation be a **separate moderation status** (recommended) or piggyback on `status` only?
2. For Staff Created listings, do you prefer:
   - **Platform-owned** listings (one platform landlord uid), or
   - Always “on behalf of” a real landlord (assigned owner)?
3. Should Staff Created listings display a “Staff Created” badge on the consumer UI?

