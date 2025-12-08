# Chronicle Cemetery Database Schema

## Core Tables

### cemeteries_cemetery

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| database | varchar | - | ✗ |  |
| name | varchar | - | ✗ |  |
| location | point | MUL | ✗ |  |
| description | longtext | - | ✓ |  |
| bounds | polygon | - | ✓ |  |
| unique_name | varchar | UNI | ✗ |  |
| ortho_layer | varchar | - | ✓ |  |
| working_hours | varchar | - | ✓ |  |
| web_site | varchar | - | ✓ |  |
| archive_date | date | - | ✓ |  |
| archived | tinyint | - | ✗ |  |
| deleted | tinyint | - | ✗ |  |
| status | varchar | - | ✗ |  |
| verified | tinyint | - | ✗ |  |
| maintenance | tinyint | - | ✗ |  |
| last_generated_interment_number | int | - | ✓ |  |
| sell_story | tinyint | - | ✓ |  |
| is_locked | tinyint | - | ✓ |  |
| database_location | varchar | - | ✓ |  |
| fee_currency | varchar | - | ✓ |  |
| fee_type | varchar | - | ✓ |  |
| fee_value | varchar | - | ✓ |  |
| organization_id | int | MUL | ✓ |  |
| story_product_id | varchar | - | ✓ |  |
| seo_date | datetime | - | ✓ |  |
| seo_status | tinyint | - | ✗ |  |

### cemeteries_section

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| name | varchar | - | ✗ |  |
| type | varchar | - | ✗ |  |
| polygon | polygon | - | ✓ |  |
| cemetery_id | int | MUL | ✗ |  |
| background | varchar | - | ✓ |  |
| rotate_degree | int | - | ✓ |  |
| section_order | int | - | ✓ |  |
| bottom | int | - | ✗ |  |
| left | int | - | ✗ |  |
| right | int | - | ✗ |  |
| top | int | - | ✗ |  |

### cemeteries_lot

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| name | varchar | - | ✗ |  |
| type | varchar | - | ✗ |  |
| polygon | polygon | - | ✓ |  |
| background | varchar | - | ✓ |  |
| rotate_degree | int | - | ✓ |  |
| cemetery_id | int | MUL | ✗ |  |
| lot_order | int | - | ✓ |  |

### cemeteries_plot

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| external_id | varchar | - | ✓ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| plot_id | varchar | - | ✗ |  |
| section | varchar | - | ✓ |  |
| row | varchar | - | ✓ |  |
| plot_no | varchar | - | ✓ |  |
| status | varchar | - | ✗ |  |
| cemetery_id | int | MUL | ✗ |  |
| length | double | - | ✗ |  |
| width | double | - | ✗ |  |
| total_capacity | int | - | ✗ |  |
| inscription | longtext | - | ✓ |  |
| section_link_id | int | MUL | ✓ |  |
| burials_capacity | int | - | ✗ |  |
| cremation_capacity | int | - | ✗ |  |
| direction | varchar | - | ✓ |  |
| note | longtext | - | ✓ |  |
| plot_type | varchar | - | ✓ |  |
| entombment_capacity | int | - | ✗ |  |
| highlight_story | varchar | - | ✓ |  |
| sell_story | tinyint | - | ✓ |  |
| price | int | - | ✓ |  |
| custom_fields | json | - | ✗ |  |
| show_price | smallint | - | ✓ |  |
| memorial_capacity | int | - | ✓ |  |
| lot_link_id | int | MUL | ✓ |  |
| lot | varchar | - | ✓ |  |
| deleted_at | datetime | - | ✓ |  |
| is_deleted | tinyint | - | ✗ |  |
| unique_id | varchar | UNI | ✓ |  |
| sync_with_osiris | tinyint | - | ✗ |  |
| is_processing_edit | tinyint | - | ✗ |  |
| last_edit_user_id | int | MUL | ✓ |  |
| processing_session_id | varchar | - | ✓ |  |
| virtual_tour_deep_url | varchar | - | ✓ |  |

### cemeteries_person

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| gender | varchar | - | ✓ |  |
| title | varchar | - | ✓ |  |
| first_name | varchar | - | ✗ |  |
| middle_name | varchar | - | ✓ |  |
| last_name | varchar | - | ✗ |  |
| external_id | varchar | - | ✓ |  |
| notes | longtext | - | ✓ |  |
| cem_unique_name | varchar | - | ✓ |  |
| is_applicant | tinyint | - | ✗ |  |
| is_holder | tinyint | - | ✗ |  |
| deleted_at | datetime | - | ✓ |  |
| is_deleted | tinyint | - | ✗ |  |
| unique_id | varchar | UNI | ✓ |  |
| sync_with_osiris | tinyint | - | ✗ |  |
| contact_id | varchar | - | ✓ |  |
| payment_gateway_id | int | MUL | ✓ |  |

### cemeteries_intermentrecord

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| external_id | varchar | - | ✓ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| interment_date | datetime | - | ✓ |  |
| interment_type | varchar | - | ✓ |  |
| date_of_birth | datetime | - | ✓ |  |
| date_of_death | datetime | - | ✓ |  |
| age | varchar | - | ✓ |  |
| returned_serviceman | tinyint | - | ✓ |  |
| cause_of_death | varchar | - | ✓ |  |
| occupation | varchar | - | ✓ |  |
| religion | varchar | - | ✓ |  |
| headstone | varchar | - | ✓ |  |
| comment | longtext | - | ✓ |  |
| funeral_director_id | int | MUL | ✓ |  |
| interment_minister_id | int | MUL | ✓ |  |
| person_id | int | UNI | ✓ |  |
| plot_id | int | MUL | ✓ |  |
| interment_depth | double | - | ✓ |  |
| applicant_id | int | MUL | ✓ |  |
| container_dimensions | varchar | - | ✓ |  |
| container_type | varchar | - | ✓ |  |
| cremation_location | varchar | - | ✓ |  |
| interment_number | int | - | ✓ |  |
| custom_date_of_birth | varchar | - | ✓ |  |
| custom_date_of_death | varchar | - | ✓ |  |
| custom_interment_date | varchar | - | ✓ |  |
| also_for | json | - | ✓ |  |
| custom_fields | json | - | ✓ |  |
| other_religion | varchar | - | ✓ |  |
| unique_id | varchar | UNI | ✓ |  |
| returned_serviceman_badge | int | - | ✓ |  |
| interment_depth_unit | varchar | - | ✓ |  |

### cemeteries_intermentstory

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| text | longtext | - | ✓ |  |
| cemetery_unique_name | varchar | - | ✓ |  |
| interment_id | int | MUL | ✓ |  |
| is_featured | tinyint | - | ✗ |  |
| approval_step | int | - | ✓ |  |
| approval_user_id | int | MUL | ✓ |  |
| approved_at | datetime | - | ✓ |  |
| created_user_id | int | MUL | ✓ |  |
| rejected_at | datetime | - | ✓ |  |
| rejected_reason | varchar | - | ✓ |  |
| relationship_interment | varchar | - | ✓ |  |
| status_story | varchar | - | ✓ |  |
| title | varchar | - | ✓ |  |
| is_admin | tinyint | - | ✓ |  |
| external_id | varchar | - | ✓ |  |
| story_code | varchar | - | ✓ |  |
| amplitude_user_id | varchar | - | ✓ |  |
| unique_id | varchar | UNI | ✓ |  |

### cemeteries_applicationrecord

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| external_id | varchar | - | ✓ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| application_date | datetime | - | ✓ |  |
| right_type | varchar | - | ✗ |  |
| term_of_right | json | - | ✗ |  |
| note | longtext | - | ✓ |  |
| applicant_id | int | MUL | ✓ |  |
| plot_id | int | MUL | ✗ |  |
| payment_date | datetime | - | ✓ |  |
| fee | varchar | - | ✓ |  |
| fee_paid | tinyint | - | ✗ |  |
| certificate_number | varchar | - | ✓ |  |
| service_need | varchar | - | ✓ |  |
| expiry_date | datetime | - | ✓ |  |
| add_to_event_calendar | tinyint | - | ✗ |  |
| custom_fields | json | - | ✗ |  |
| invoice_id | int | UNI | ✓ |  |
| unique_id | varchar | UNI | ✓ |  |

### cemeteries_plotpurchaser

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| purc_price | int | - | ✓ |  |
| plot_id | int | MUL | ✓ |  |
| event_id | int | MUL | ✓ |  |
| billing_address | varchar | - | ✓ |  |
| billing_city | varchar | - | ✓ |  |
| billing_country | varchar | - | ✓ |  |
| billing_phone_number | varchar | - | ✓ |  |
| billing_postcode | varchar | - | ✓ |  |
| billing_state | varchar | - | ✓ |  |
| comments | longtext | - | ✓ |  |
| email | varchar | - | ✓ |  |
| first_name | varchar | - | ✓ |  |
| last_name | varchar | - | ✓ |  |
| mobile_phone | varchar | - | ✓ |  |
| purchase_code | varchar | - | ✓ |  |
| custom_form_value | json | - | ✓ |  |
| is_old | tinyint | - | ✗ |  |
| temporary_event_id | int | MUL | ✓ |  |

### cemeteries_business

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| business_name | varchar | - | ✗ |  |
| business_code | varchar | - | ✓ |  |
| comment | longtext | - | ✓ |  |
| person_id | int | MUL | ✓ |  |
| deleted_at | datetime | - | ✓ |  |
| is_deleted | tinyint | - | ✗ |  |
| business_type_id | int | MUL | ✓ |  |

### cemeteries_address

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| street | varchar | - | ✓ |  |
| suburb | varchar | - | ✓ |  |
| postcode | varchar | - | ✓ |  |
| state | varchar | - | ✓ |  |
| country | varchar | - | ✓ |  |
| cemetery_id | int | MUL | ✓ |  |
| person_id | int | MUL | ✓ |  |
| primary | tinyint | - | ✗ |  |

### cemeteries_phone

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| phone_type | varchar | - | ✗ |  |
| phone_number | varchar | - | ✗ |  |
| cemetery_id | int | MUL | ✓ |  |
| person_id | int | MUL | ✓ |  |

### cemeteries_email

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| email | varchar | - | ✗ |  |
| cemetery_id | int | MUL | ✓ |  |
| person_id | int | MUL | ✓ |  |

### cemeteries_personrelationship

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| relationship | varchar | - | ✗ |  |
| form_type | varchar | - | ✗ |  |
| interment_id | int | MUL | ✓ |  |
| person_id | int | MUL | ✓ |  |

### cemeteries_attribute

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| application_date | datetime | - | ✓ |  |
| certificate_number | varchar | - | ✓ |  |
| right_type | varchar | - | ✓ |  |
| term_of_right | json | - | ✗ |  |
| fee | varchar | - | ✓ |  |
| payment_date | datetime | - | ✓ |  |
| fee_paid | tinyint | - | ✗ |  |
| service_need | varchar | - | ✓ |  |
| person_id | int | MUL | ✓ |  |
| notes | longtext | - | ✓ |  |

### cemeteries_events

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| external_id | varchar | - | ✓ |  |
| event_name | varchar | - | ✗ |  |
| types | varchar | - | ✗ |  |
| descriptions | longtext | - | ✓ |  |
| make_public | tinyint | - | ✗ |  |
| cremation_location | varchar | - | ✓ |  |
| end_time | datetime | - | ✓ |  |
| repeating | varchar | - | ✓ |  |
| repeat_until | datetime | - | ✓ |  |
| is_completed | smallint | - | ✓ |  |
| is_deleted | smallint | - | ✓ |  |
| assigned_party_id | int | - | ✓ |  |
| created_by_id | int | - | ✓ |  |
| event_payment_id | int | - | ✓ |  |
| event_purchaser_id | int | - | ✓ |  |
| plot_id | int | - | ✓ |  |
| responsible_person_id | int | - | ✓ |  |
| location_type | varchar | - | ✓ |  |
| start_time | datetime | - | ✓ |  |
| cemetery_id | int | MUL | ✓ |  |
| section_id | int | MUL | ✓ |  |
| related_interment_id | int | MUL | ✓ |  |
| event_status_id | int | MUL | ✓ |  |
| event_types_id | int | MUL | ✓ |  |
| story_data_id | int | MUL | ✓ |  |
| event_subtype_id | int | MUL | ✓ |  |
| is_email_sent | smallint | - | ✓ |  |
| cover_image | varchar | - | ✓ |  |
| unique_id | varchar | UNI | ✓ |  |

### cemeteries_recordfile

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| file | varchar | - | ✗ |  |
| file_path | varchar | - | ✓ |  |

### invoices_invoice

| Column | Type | Key | Nullable | Description |
|--------|------|-----|----------|-------------|
| id | int | PRI | ✗ |  |
| created_at | datetime | - | ✗ |  |
| updated_at | datetime | - | ✗ |  |
| external_id | varchar | - | ✓ |  |
| invoice_number | varchar | - | ✗ |  |
| invoice_date | datetime | - | ✗ |  |
| due_date | datetime | - | ✓ |  |
| currency | varchar | - | ✗ |  |
| status | varchar | - | ✓ |  |
| customer | json | - | ✗ |  |
| integration_type | varchar | - | ✓ |  |
| cemetery_id | int | MUL | ✓ |  |
| discount | double | - | ✓ |  |
| internal_status | varchar | - | ✓ |  |
| notes | longtext | - | ✓ |  |
| owner_id | int | MUL | ✓ |  |
| reference | varchar | - | ✓ |  |
| is_deleted | tinyint | - | ✗ |  |
| organization_id | int | MUL | ✗ |  |
| created_by_id | int | MUL | ✓ |  |
| purchaser_id | int | MUL | ✓ |  |
| issue_date | datetime | - | ✓ |  |
| is_tax_enabled | tinyint | - | ✗ |  |
| tax_application | varchar | - | ✓ |  |
| tax_calculation | varchar | - | ✓ |  |
| tax_name | varchar | - | ✓ |  |
| tax_rate | double | - | ✗ |  |
| grand_total | double | - | ✗ |  |
| subtotal | double | - | ✗ |  |
| tax_amount | double | - | ✗ |  |
| total_discount | double | - | ✗ |  |
| purchaser_person_id | int | MUL | ✓ |  |
| sales_request_id | int | MUL | ✓ |  |
| payment_token | char | UNI | ✗ |  |
| currency_symbol | varchar | - | ✓ |  |

