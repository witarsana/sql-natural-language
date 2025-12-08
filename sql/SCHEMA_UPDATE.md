# Database Schema Update - December 8, 2024

## Overview

Updated the Chronicle Natural Language Query System with the **real production database schema** from `aus_dev_chronicle_dev` database.

## Changes Made

### 1. Schema Extraction

- **Created**: `/backend/scripts/extract-schema.js` - Extracts complete schema from MySQL
- **Created**: `/backend/scripts/generate-schema-doc.js` - Generates documentation from schema
- **Generated**: `/backend/src/models/full-schema.json` - Complete 144-table schema (11,109 lines)
- **Generated**: `/backend/src/models/ai-schema.json` - AI-friendly simplified schema (2,024 lines)
- **Generated**: `/backend/docs/DATABASE_SCHEMA.md` - Human-readable schema documentation

### 2. Updated Core Files

#### `/backend/src/prompts/system-prompt.ts`

**Before**: Mock schema with tables `plots`, `graves`, `persons`, `sections`, `plot_statuses`, `plot_reservations`

**After**: Real Chronicle schema with actual tables:

- `cemeteries_cemetery` - Cemetery properties
- `cemeteries_section` - Cemetery sections/areas
- `cemeteries_lot` - Cemetery lots
- `cemeteries_plot` - Individual burial plots (with real fields: `plot_id`, `section`, `row`, `plot_no`, `status`, `length`, `width`, `price`, etc.)
- `cemeteries_person` - Deceased and contact persons
- `cemeteries_intermentrecord` - Burial/interment records (replaces `graves`)
- `cemeteries_applicationrecord` - Plot applications/rights
- `cemeteries_plotpurchaser` - Plot purchasers
- `cemeteries_business` - Funeral directors, etc.
- `cemeteries_address`, `cemeteries_phone`, `cemeteries_email` - Contact information
- `cemeteries_intermentstory` - Memorial stories
- `cemeteries_events` - Cemetery events
- `invoices_invoice` - Invoices

#### `/backend/src/models/schema.model.ts`

Updated constants:

- `SCHEMA.PLOTS`: `'plots'` → `'cemeteries_plot'`
- `SCHEMA.INTERMENTS`: Added (replaces GRAVES)
- `SCHEMA.PERSONS`: `'persons'` → `'cemeteries_person'`
- Added: `SECTIONS`, `LOTS`, `CEMETERIES`, `APPLICATIONS`, `BUSINESSES`, `ADDRESSES`, etc.

Updated `ALLOWED_FIELDS` with real column names from database
Updated `COMMON_JOINS` with correct table relationships
Updated `NL_MAPPINGS` with correct status values

### 3. Real Database Schema Highlights

#### Key Tables Structure:

**cemeteries_plot** (Primary plot table)

- 35+ columns including: `id`, `plot_id`, `section`, `row`, `plot_no`, `status`, `length`, `width`, `total_capacity`, `burials_capacity`, `cremation_capacity`, `price`, `deleted_at`, `is_deleted`
- **Soft deletes**: Uses both `deleted_at` (datetime) and `is_deleted` (tinyint)
- **Status values**: 'Available', 'Occupied', 'Reserved', 'Sold'
- **Plot types**: 'Burial', 'Cremation'
- **JSON fields**: `custom_fields`

**cemeteries_intermentrecord** (Replaces old "graves" table)

- 30+ columns including: `person_id`, `plot_id`, `interment_date`, `interment_type`, `date_of_birth`, `date_of_death`, `age`, `cause_of_death`, `occupation`, `religion`, `funeral_director_id`, `returned_serviceman`
- **Interment types**: 'Burial', 'Cremation', 'Entombment'

**cemeteries_person**

- Fields: `title`, `first_name`, `middle_name`, `last_name`, `gender`, `is_applicant`, `is_holder`
- **Soft deletes**: `deleted_at` and `is_deleted`
- Links to addresses, phones, emails via foreign keys

### 4. Query Examples Updated

**Old Query** (Mock schema):

```sql
SELECT plots.*, sections.section_name, plot_statuses.plot_status_name
FROM plots
LEFT JOIN sections ON plots.plot_section_id = sections.section_id
WHERE plots.plot_deleted_at IS NULL AND sections.section_name = 'A'
```

**New Query** (Real schema):

```sql
SELECT cemeteries_plot.*, cemeteries_section.name as section_name
FROM cemeteries_plot
LEFT JOIN cemeteries_section ON cemeteries_plot.section_link_id = cemeteries_section.id
WHERE cemeteries_plot.deleted_at IS NULL
  AND cemeteries_plot.is_deleted = 0
  AND cemeteries_section.name = 'A'
  AND cemeteries_plot.status = 'Available'
ORDER BY cemeteries_plot.row, cemeteries_plot.plot_no
```

### 5. Soft Delete Handling

The real database uses **two soft delete mechanisms**:

1. `deleted_at` - datetime field (NULL = not deleted)
2. `is_deleted` - tinyint field (0 = not deleted, 1 = deleted)

**Important**: All queries must now filter BOTH:

```sql
WHERE cemeteries_plot.deleted_at IS NULL
  AND cemeteries_plot.is_deleted = 0
```

### 6. Natural Language Mappings Updated

| User Says         | SQL Condition                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------- |
| "available plots" | `status = 'Available'`                                                                                              |
| "occupied plots"  | `status = 'Occupied' OR EXISTS (SELECT 1 FROM cemeteries_intermentrecord WHERE plot_id = cemeteries_plot.id)`       |
| "empty plots"     | `status = 'Available' AND NOT EXISTS (SELECT 1 FROM cemeteries_intermentrecord WHERE plot_id = cemeteries_plot.id)` |
| "reserved plots"  | `status = 'Reserved'`                                                                                               |
| "sold plots"      | `status = 'Sold'`                                                                                                   |
| "burial"          | `interment_type = 'Burial'`                                                                                         |
| "cremation"       | `interment_type = 'Cremation'`                                                                                      |
| "family plot"     | `(total_capacity >= 4 OR burials_capacity >= 4)`                                                                    |
| "single plot"     | `(total_capacity = 1 OR burials_capacity = 1)`                                                                      |

## Database Statistics

- **Total Tables**: 144 tables
- **Cemetery-Related Tables**: 42 tables (cemeteries\_\*)
- **Key Tables for Queries**: 19 tables documented
- **Total Schema Lines**: 11,109 lines (full-schema.json)

## Files Changed

1. ✅ `/backend/src/prompts/system-prompt.ts` - Complete rewrite with real schema
2. ✅ `/backend/src/models/schema.model.ts` - Updated constants and mappings
3. ✅ `/backend/scripts/extract-schema.js` - New schema extraction script
4. ✅ `/backend/scripts/generate-schema-doc.js` - New documentation generator
5. ✅ `/backend/src/models/database-schema.json` - Raw foreign key relationships
6. ✅ `/backend/src/models/full-schema.json` - Complete column definitions
7. ✅ `/backend/src/models/ai-schema.json` - Simplified schema for AI
8. ✅ `/backend/docs/DATABASE_SCHEMA.md` - Human-readable documentation

## Testing Recommendations

After this update, test these query types:

1. **Plot Queries**:

   - "Show me all available plots"
   - "How many plots are in section A?"
   - "List plots with price over $5000"

2. **Interment Queries**:

   - "Who was buried in 2024?"
   - "Show cremations from last month"
   - "List all interments in plot 123"

3. **Person Queries**:

   - "Find persons named Smith"
   - "Show all applicants"
   - "List contact information for John Doe"

4. **Complex Queries**:
   - "Show available plots in section B with prices"
   - "List all interments with funeral director details"
   - "Count occupied plots by section"

## Migration Notes

### Breaking Changes

- ❌ Old table names (`plots`, `graves`, `persons`) will **NOT** work
- ✅ Must use new table names (`cemeteries_plot`, `cemeteries_intermentrecord`, `cemeteries_person`)
- ❌ Old field names (e.g., `plot_status_name`) will **NOT** work
- ✅ Must use new field names (e.g., `status`)

### Backwards Compatibility

- **None** - This is a complete schema replacement
- Any existing queries using old schema will fail
- Claude AI will generate queries with new schema automatically

## Next Steps

1. ✅ Schema updated in backend
2. ✅ Backend server running with new schema
3. ✅ Frontend compiled successfully
4. 🔄 **TODO**: Add Anthropic API key to `.env`
5. 🔄 **TODO**: Test real queries against production database
6. 🔄 **TODO**: Update example queries in frontend if needed

## Support

If you encounter issues with the new schema:

1. Check `/backend/docs/DATABASE_SCHEMA.md` for table structures
2. Review `/backend/src/models/ai-schema.json` for field definitions
3. Check backend logs for SQL errors
4. Verify soft delete filters are applied (`deleted_at IS NULL AND is_deleted = 0`)
