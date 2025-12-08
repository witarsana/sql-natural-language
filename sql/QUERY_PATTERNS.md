# Chronicle Database - Common Query Patterns

## Quick Reference for Natural Language Queries

### Plot Queries

#### Find Available Plots

```
"Show me all available plots"
"List available plots in section A"
"How many available plots do we have?"
```

```sql
SELECT * FROM cemeteries_plot
WHERE deleted_at IS NULL AND is_deleted = 0
AND status = 'Available'
```

#### Find Occupied Plots

```
"Show me occupied plots"
"List all occupied plots with burial details"
```

```sql
SELECT cp.*, cir.interment_date
FROM cemeteries_plot cp
INNER JOIN cemeteries_intermentrecord cir ON cp.id = cir.plot_id
WHERE cp.deleted_at IS NULL AND cp.is_deleted = 0
```

#### Plots by Section

```
"Show plots in section B"
"How many plots are in section A?"
```

```sql
SELECT cp.*, cs.name as section_name
FROM cemeteries_plot cp
LEFT JOIN cemeteries_section cs ON cp.section_link_id = cs.id
WHERE cp.deleted_at IS NULL AND cp.is_deleted = 0
AND cs.name = 'A'
```

#### Plots with Pricing

```
"Show plots with prices"
"List available plots under $10000"
```

```sql
SELECT * FROM cemeteries_plot
WHERE deleted_at IS NULL AND is_deleted = 0
AND price IS NOT NULL AND price > 0
AND price < 10000
ORDER BY price ASC
```

### Interment (Burial) Queries

#### Recent Burials

```
"Who was buried in 2024?"
"Show me burials from last month"
"List recent cremations"
```

```sql
SELECT
  cp.first_name, cp.last_name, cp.middle_name,
  cir.interment_date, cir.date_of_birth, cir.date_of_death,
  cir.interment_type, cir.age,
  plot.plot_id, plot.section, plot.row, plot.plot_no
FROM cemeteries_intermentrecord cir
INNER JOIN cemeteries_person cp ON cir.person_id = cp.id AND cp.deleted_at IS NULL
LEFT JOIN cemeteries_plot plot ON cir.plot_id = plot.id AND plot.deleted_at IS NULL
WHERE YEAR(cir.interment_date) = 2024
ORDER BY cir.interment_date DESC
```

#### Interments by Type

```
"Show me all cremations"
"List burial interments"
```

```sql
SELECT * FROM cemeteries_intermentrecord
WHERE interment_type = 'Cremation'
ORDER BY interment_date DESC
```

#### Interments with Funeral Director

```
"Show burials with funeral director details"
"List interments handled by specific funeral homes"
```

```sql
SELECT
  cir.*,
  cp.first_name, cp.last_name,
  bus.business_name as funeral_director
FROM cemeteries_intermentrecord cir
INNER JOIN cemeteries_person cp ON cir.person_id = cp.id AND cp.deleted_at IS NULL
LEFT JOIN cemeteries_business bus ON cir.funeral_director_id = bus.id AND bus.deleted_at IS NULL
WHERE bus.business_name IS NOT NULL
```

### Person Queries

#### Find Deceased Persons

```
"Find persons named Smith"
"Search for John Doe"
"Show deceased persons buried in 2023"
```

```sql
SELECT cp.*, cir.interment_date, cir.date_of_death
FROM cemeteries_person cp
LEFT JOIN cemeteries_intermentrecord cir ON cp.id = cir.person_id
WHERE cp.deleted_at IS NULL
AND cp.last_name LIKE '%Smith%'
```

#### Person with Contact Info

```
"Show contact information for applicants"
"List persons with email addresses"
```

```sql
SELECT
  cp.first_name, cp.last_name,
  ce.email,
  cph.phone_number,
  ca.street, ca.suburb, ca.postcode, ca.state
FROM cemeteries_person cp
LEFT JOIN cemeteries_email ce ON cp.id = ce.person_id
LEFT JOIN cemeteries_phone cph ON cp.id = cph.person_id
LEFT JOIN cemeteries_address ca ON cp.id = ca.person_id AND ca.primary = 1
WHERE cp.deleted_at IS NULL
AND cp.is_applicant = 1
```

### Application & Purchase Queries

#### Plot Applications

```
"Show recent plot applications"
"List applications with unpaid fees"
```

```sql
SELECT
  car.*,
  cp.first_name, cp.last_name,
  plot.plot_id, plot.section
FROM cemeteries_applicationrecord car
LEFT JOIN cemeteries_person cp ON car.applicant_id = cp.id AND cp.deleted_at IS NULL
LEFT JOIN cemeteries_plot plot ON car.plot_id = plot.id AND plot.deleted_at IS NULL
WHERE car.fee_paid = 0
ORDER BY car.application_date DESC
```

#### Plot Purchasers

```
"Show plot purchasers"
"List purchases from 2024"
```

```sql
SELECT
  cpp.*,
  plot.plot_id, plot.section, plot.row, plot.plot_no
FROM cemeteries_plotpurchaser cpp
LEFT JOIN cemeteries_plot plot ON cpp.plot_id = plot.id
WHERE YEAR(cpp.created_at) = 2024
```

### Statistics & Aggregation

#### Count by Status

```
"How many available plots?"
"Count occupied plots"
"Show plot statistics by status"
```

```sql
SELECT
  status,
  COUNT(*) as plot_count
FROM cemeteries_plot
WHERE deleted_at IS NULL AND is_deleted = 0
GROUP BY status
ORDER BY plot_count DESC
```

#### Count by Section

```
"Show plot count by section"
"Which section has the most plots?"
```

```sql
SELECT
  cs.name as section_name,
  COUNT(cp.id) as plot_count,
  SUM(CASE WHEN cp.status = 'Available' THEN 1 ELSE 0 END) as available_count,
  SUM(CASE WHEN cp.status = 'Occupied' THEN 1 ELSE 0 END) as occupied_count
FROM cemeteries_plot cp
LEFT JOIN cemeteries_section cs ON cp.section_link_id = cs.id
WHERE cp.deleted_at IS NULL AND cp.is_deleted = 0
GROUP BY cs.name
ORDER BY plot_count DESC
```

#### Monthly Interment Statistics

```
"Show burial statistics by month for 2024"
"How many burials per month?"
```

```sql
SELECT
  DATE_FORMAT(interment_date, '%Y-%m') as month,
  COUNT(*) as interment_count,
  interment_type
FROM cemeteries_intermentrecord
WHERE YEAR(interment_date) = 2024
GROUP BY DATE_FORMAT(interment_date, '%Y-%m'), interment_type
ORDER BY month DESC
```

### Complex Queries

#### Available Plots with Details

```
"Show available plots with full details including section and pricing"
```

```sql
SELECT
  cp.plot_id,
  cp.section,
  cp.row,
  cp.plot_no,
  cp.status,
  cp.price,
  cp.total_capacity,
  cp.burials_capacity,
  cp.cremation_capacity,
  cp.plot_type,
  cs.name as section_name,
  cs.type as section_type
FROM cemeteries_plot cp
LEFT JOIN cemeteries_section cs ON cp.section_link_id = cs.id
WHERE cp.deleted_at IS NULL
  AND cp.is_deleted = 0
  AND cp.status = 'Available'
ORDER BY cs.name, cp.row, cp.plot_no
```

#### Deceased with Full Burial Details

```
"Show complete burial information including plot, section, and funeral details"
```

```sql
SELECT
  cp.title,
  cp.first_name,
  cp.middle_name,
  cp.last_name,
  cir.date_of_birth,
  cir.date_of_death,
  cir.age,
  cir.interment_date,
  cir.interment_type,
  cir.cause_of_death,
  cir.occupation,
  cir.religion,
  plot.plot_id,
  plot.section,
  plot.row,
  plot.plot_no,
  cs.name as section_name,
  fd.business_name as funeral_director
FROM cemeteries_intermentrecord cir
INNER JOIN cemeteries_person cp ON cir.person_id = cp.id AND cp.deleted_at IS NULL
LEFT JOIN cemeteries_plot plot ON cir.plot_id = plot.id AND plot.deleted_at IS NULL
LEFT JOIN cemeteries_section cs ON plot.section_link_id = cs.id
LEFT JOIN cemeteries_business fd ON cir.funeral_director_id = fd.id AND fd.deleted_at IS NULL
ORDER BY cir.interment_date DESC
LIMIT 100
```

## Important Notes

### Soft Delete Filters

**ALWAYS include both conditions for tables with soft deletes:**

```sql
WHERE deleted_at IS NULL AND is_deleted = 0
```

Tables with soft deletes:

- `cemeteries_plot`
- `cemeteries_person`
- `cemeteries_business`

### Status Values

**cemeteries_plot.status**:

- `'Available'`
- `'Occupied'`
- `'Reserved'`
- `'Sold'`

**cemeteries_intermentrecord.interment_type**:

- `'Burial'`
- `'Cremation'`
- `'Entombment'`

### Foreign Key Relationships

- `cemeteries_plot.section_link_id` → `cemeteries_section.id`
- `cemeteries_plot.lot_link_id` → `cemeteries_lot.id`
- `cemeteries_plot.cemetery_id` → `cemeteries_cemetery.id`
- `cemeteries_intermentrecord.person_id` → `cemeteries_person.id`
- `cemeteries_intermentrecord.plot_id` → `cemeteries_plot.id`
- `cemeteries_intermentrecord.funeral_director_id` → `cemeteries_business.id`
- `cemeteries_applicationrecord.applicant_id` → `cemeteries_person.id`
- `cemeteries_applicationrecord.plot_id` → `cemeteries_plot.id`

### Performance Tips

1. Always filter on indexed columns (id, status, deleted_at)
2. Use LIMIT for large result sets
3. Index dates for year-based queries
4. Join only necessary tables
5. Filter soft-deleted records early in WHERE clause
