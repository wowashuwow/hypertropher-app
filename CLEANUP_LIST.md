# Temporary Files Cleanup List

## Overview
This document lists all temporary files that were created during development and can be safely removed now that the features are implemented and tested.

---

## 1. Migration SQL Files (All Applied Successfully)

These SQL migration files have been executed and their changes are now part of the database schema. They can be safely deleted:

### Restaurant-Centric Architecture Migrations
- ✅ `migration-001-restaurant-schema.sql` - Initial restaurant schema creation
- ✅ `migration-002-data-migration-fixed.sql` - Data migration to new schema

### Database Constraint Fixes
- ✅ `migration-003-fix-dishes-constraints.sql` - Fixed restaurant_name constraint (superseded by migration-004)
- ✅ `migration-004-fix-all-dishes-constraints.sql` - Fixed all NOT NULL constraints (superseded by migration-005)
- ✅ `migration-005-complete-database-cleanup.sql` - Removed all redundant columns from dishes table

### Foreign Key Migrations
- ✅ `migration-006-add-all-foreign-keys.sql` - Initial foreign key creation (had errors, superseded by migration-006-fixed)
- ✅ `migration-006-add-all-foreign-keys-fixed.sql` - Fixed version with IF NOT EXISTS clauses

### Storage RLS Policy Migrations
- ✅ `migration-007-add-dish-photos-delete-policy.sql` - Added DELETE policy for dish-photos bucket
- ✅ `migration-008-fix-dish-photos-delete-policy.sql` - Attempted fix (superseded by migration-009)
- ✅ `migration-009-add-dish-photos-select-policy.sql` - Added SELECT policy (CRITICAL FIX)

**Total Migration Files to Delete: 9**

---

## 2. Migration API Endpoints (One-Time Use Only)

These API endpoints were created for one-time data migration and are no longer needed:

### Photo Migration API
- ✅ `app/api/migrate-dish-photos/route.ts` - Migrated dish photos to user ID folder structure
  - **Status**: Migration completed successfully (10/10 dishes migrated)
  - **Purpose**: One-time migration of existing photos from bucket root to `{user_id}/` folders
  - **Current State**: No longer needed as all photos are now in correct structure
  - **Verification**: All new uploads automatically use `{user_id}/` structure

**Total Migration APIs to Delete: 1 file (entire directory)**

---

## 3. Superseded/Duplicate Files

Files that were replaced or superseded by better versions:

### Migration Files (Superseded Versions)
- `migration-003-fix-dishes-constraints.sql` - Only fixed `restaurant_name`, superseded by migration-004
- `migration-004-fix-all-dishes-constraints.sql` - Fixed constraints, superseded by migration-005 cleanup
- `migration-006-add-all-foreign-keys.sql` - Had errors, replaced by migration-006-fixed
- `migration-008-fix-dish-photos-delete-policy.sql` - Attempted fix, superseded by migration-009

**Note**: Migration-005 and migration-006-fixed are the final versions that worked

---

## 4. Files to KEEP (Do NOT Delete)

These files should be retained for reference:

### Reference Documentation
- ✅ `Docs/Supabase_Workflow.md` - Critical workflow documentation to prevent future issues
- ✅ `Docs/Bug_tracking.md` - Complete bug history and resolutions
- ✅ `DATABASE_SCHEMA.md` - Current database schema documentation

### Final Working Migrations (for reference)
- ✅ `migration-001-restaurant-schema.sql` - Documents the schema design
- ✅ `migration-002-data-migration-fixed.sql` - Documents the data migration approach
- ✅ `migration-005-complete-database-cleanup.sql` - Documents final cleanup
- ✅ `migration-006-add-all-foreign-keys-fixed.sql` - Documents all foreign keys
- ✅ `migration-007-add-dish-photos-delete-policy.sql` - Documents DELETE policy
- ✅ `migration-009-add-dish-photos-select-policy.sql` - Documents SELECT policy (critical)

**Recommendation**: Keep final working migrations (001, 002, 005, 006-fixed, 007, 009) for reference, delete superseded ones (003, 004, 006, 008)

---

## Cleanup Summary

### Files to Delete (Total: 5)

**Migration Files (4):**
1. `migration-003-fix-dishes-constraints.sql` (superseded by 004)
2. `migration-004-fix-all-dishes-constraints.sql` (superseded by 005)
3. `migration-006-add-all-foreign-keys.sql` (superseded by 006-fixed)
4. `migration-008-fix-dish-photos-delete-policy.sql` (superseded by 009)

**Migration API (1 directory):**
5. `app/api/migrate-dish-photos/` (one-time migration completed)

### Files to Keep for Reference (6)

**Core Migrations (Document Schema Evolution):**
1. `migration-001-restaurant-schema.sql` - Restaurant-centric architecture
2. `migration-002-data-migration-fixed.sql` - Data migration approach
3. `migration-005-complete-database-cleanup.sql` - Final cleanup
4. `migration-006-add-all-foreign-keys-fixed.sql` - All foreign keys
5. `migration-007-add-dish-photos-delete-policy.sql` - DELETE RLS policy
6. `migration-009-add-dish-photos-select-policy.sql` - SELECT RLS policy (critical)

---

## Verification Before Cleanup

Before deleting files, verify:

### ✅ Database State
- [ ] All tables have proper schemas (check `DATABASE_SCHEMA.md`)
- [ ] All foreign keys are in place (run: `SELECT * FROM pg_constraint WHERE contype = 'f';`)
- [ ] All RLS policies exist for `dish-photos` bucket (SELECT, INSERT, DELETE)
- [ ] All redundant columns removed from `dishes` table

### ✅ Photo Storage
- [ ] All dish photos are in `{user_id}/` folder structure
- [ ] No photos remain in bucket root
- [ ] Photo deletion working correctly in edit-dish form
- [ ] New uploads automatically use `{user_id}/` structure

### ✅ Application Functionality
- [ ] Dish creation works correctly
- [ ] Dish editing works correctly
- [ ] Photo upload works correctly
- [ ] Photo deletion works correctly
- [ ] Navigate buttons work for in-store dishes
- [ ] Delivery app buttons work for online dishes

---

## Cleanup Commands

**DO NOT RUN THESE YET - Wait for user confirmation**

```bash
# Delete superseded migration files
rm migration-003-fix-dishes-constraints.sql
rm migration-004-fix-all-dishes-constraints.sql
rm migration-006-add-all-foreign-keys.sql
rm migration-008-fix-dish-photos-delete-policy.sql

# Delete one-time migration API
rm -rf app/api/migrate-dish-photos/
```

---

## Post-Cleanup Actions

After cleanup:

1. **Update `.gitignore`** (if needed):
   ```
   # Temporary migration files
   migration-*-temp-*.sql
   ```

2. **Update Documentation**:
   - ✅ Already updated `Docs/Bug_tracking.md`
   - ✅ Already updated `Docs/project_structure.md`
   - ✅ Already created `Docs/Supabase_Workflow.md`

3. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Clean up temporary migration files and one-time migration API"
   ```

---

## Important Notes

1. **Keep Reference Migrations**: Migrations 001, 002, 005, 006-fixed, 007, and 009 document the schema evolution and should be kept for reference

2. **Migration API Removal**: The `/api/migrate-dish-photos` endpoint can be safely removed as:
   - Migration completed successfully (10/10 dishes)
   - All new uploads use correct structure
   - No future migration needed

3. **Supabase Workflow**: The new `Docs/Supabase_Workflow.md` ensures we won't face similar issues in the future

4. **Backup First**: If uncertain, create a backup before deleting files:
   ```bash
   mkdir -p .backup/migrations
   cp migration-*.sql .backup/migrations/
   cp -r app/api/migrate-dish-photos .backup/
   ```

---

**Created**: 2025-01-10  
**Purpose**: Organize cleanup of temporary development files  
**Status**: Awaiting user confirmation for deletion

