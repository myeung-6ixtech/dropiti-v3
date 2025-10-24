# Tenant Marketplace Database Setup

## Overview
The tenant marketplace feature requires a new database table `real_estate.tenant_profile` to store tenant marketplace-specific data.

## Database Migration Required

Before the tenant marketplace can function properly, you need to run the database migration:

```sql
-- Run this SQL script in your Hasura database
-- File: documentation/database/create-tenant-profile-table.sql
```

## What This Creates

1. **`real_estate.tenant_profile` table** - Stores tenant marketplace data
2. **Indexes** - For efficient querying and filtering
3. **Constraints** - Data validation and referential integrity

## Current Status

- ✅ API endpoint created (`/api/v1/tenants`)
- ✅ Frontend components created
- ✅ Navigation item added
- ⚠️ **Database table needs to be created**

## After Database Setup

Once the database table is created, the tenant marketplace will:
- Display tenant profiles from the database
- Support filtering and pagination
- Show user information for each tenant profile
- Handle empty states gracefully

## Testing

After running the database migration, you can test the API endpoint:
```bash
curl http://localhost:3000/api/v1/tenants
```

The tenant marketplace page should then load without errors and display any existing tenant profiles.
