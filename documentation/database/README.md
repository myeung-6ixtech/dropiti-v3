# Database Scripts

This folder contains SQL scripts for database setup, migrations, and maintenance.

## Scripts Overview

### Setup Scripts
- **`chat-database-setup.sql`** - Initial setup for chat functionality
- **`create-chat-view.sql`** - Creates database views for chat system

### Migration Scripts
- **`add-review-window-fields.sql`** - Adds fields for review window functionality
- **`update-property-status-constraint.sql`** - Updates property status constraint to support new status values
- **`fix-property-status-constraint.sql`** - Alternative fix for property status constraint

### Schema Validation
- **`check-review-schema.sql`** - Validates review schema structure

## Usage

These scripts should be run in the order they were created, typically:

1. Setup scripts first (if setting up a new database)
2. Migration scripts to update existing schemas
3. Validation scripts to verify changes

## Important Notes

- Always backup your database before running migration scripts
- Test scripts in a development environment first
- Some scripts may need to be run in a specific order due to dependencies

## Property Status Values

The property status constraint has been updated to support these values:
- `draft` - Property is being created/edited
- `published` - Property is live and visible to public
- `archived` - Property is no longer active
- `expired` - Property listing has expired
