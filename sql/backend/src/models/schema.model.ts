/**
 * Chronicle Database Schema Reference
 * This file documents the available tables and fields for query generation
 */

export const SCHEMA = {
  // Main tables
  PLOTS: "cemeteries_plot",
  INTERMENTS: "cemeteries_intermentrecord",
  PERSONS: "cemeteries_person",
  SECTIONS: "cemeteries_section",
  LOTS: "cemeteries_lot",
  CEMETERIES: "cemeteries_cemetery",
  APPLICATIONS: "cemeteries_applicationrecord",
  BUSINESSES: "cemeteries_business",
  ADDRESSES: "cemeteries_address",
  PHONES: "cemeteries_phone",
  EMAILS: "cemeteries_email",
  STORIES: "cemeteries_intermentstory",
  EVENTS: "cemeteries_events",
  INVOICES: "invoices_invoice",

  // Allowed fields by table (key tables)
  ALLOWED_FIELDS: {
    cemeteries_plot: [
      "id",
      "plot_id",
      "external_id",
      "unique_id",
      "section",
      "row",
      "plot_no",
      "lot",
      "status",
      "length",
      "width",
      "total_capacity",
      "burials_capacity",
      "cremation_capacity",
      "entombment_capacity",
      "memorial_capacity",
      "price",
      "show_price",
      "plot_type",
      "direction",
      "inscription",
      "note",
      "custom_fields",
      "cemetery_id",
      "section_link_id",
      "lot_link_id",
      "deleted_at",
      "is_deleted",
      "created_at",
      "updated_at",
    ],
    cemeteries_person: [
      "id",
      "external_id",
      "unique_id",
      "contact_id",
      "title",
      "first_name",
      "middle_name",
      "last_name",
      "gender",
      "notes",
      "cem_unique_name",
      "is_applicant",
      "is_holder",
      "deleted_at",
      "is_deleted",
      "created_at",
      "updated_at",
    ],
    cemeteries_intermentrecord: [
      "id",
      "external_id",
      "unique_id",
      "interment_number",
      "person_id",
      "plot_id",
      "interment_date",
      "interment_type",
      "interment_depth",
      "interment_depth_unit",
      "date_of_birth",
      "date_of_death",
      "age",
      "cause_of_death",
      "occupation",
      "religion",
      "other_religion",
      "returned_serviceman",
      "returned_serviceman_badge",
      "headstone",
      "container_type",
      "container_dimensions",
      "cremation_location",
      "applicant_id",
      "funeral_director_id",
      "interment_minister_id",
      "comment",
      "custom_fields",
      "also_for",
      "created_at",
      "updated_at",
    ],
    cemeteries_section: [
      "id",
      "name",
      "type",
      "polygon",
      "cemetery_id",
      "background",
      "rotate_degree",
      "section_order",
      "bottom",
      "left",
      "right",
      "top",
      "created_at",
      "updated_at",
    ],
    cemeteries_cemetery: [
      "id",
      "name",
      "unique_name",
      "database",
      "location",
      "bounds",
      "description",
      "status",
      "working_hours",
      "web_site",
      "organization_id",
      "deleted",
      "archived",
      "created_at",
      "updated_at",
    ],
    cemeteries_applicationrecord: [
      "id",
      "external_id",
      "unique_id",
      "plot_id",
      "applicant_id",
      "application_date",
      "right_type",
      "term_of_right",
      "fee",
      "fee_paid",
      "payment_date",
      "certificate_number",
      "service_need",
      "expiry_date",
      "note",
      "invoice_id",
      "custom_fields",
      "created_at",
      "updated_at",
    ],
    cemeteries_business: [
      "id",
      "business_name",
      "business_code",
      "business_type_id",
      "person_id",
      "comment",
      "deleted_at",
      "is_deleted",
      "created_at",
      "updated_at",
    ],
    cemeteries_address: [
      "id",
      "street",
      "suburb",
      "postcode",
      "state",
      "country",
      "cemetery_id",
      "person_id",
      "primary",
      "created_at",
      "updated_at",
    ],
    cemeteries_phone: [
      "id",
      "phone_type",
      "phone_number",
      "cemetery_id",
      "person_id",
      "created_at",
      "updated_at",
    ],
    cemeteries_email: [
      "id",
      "email",
      "cemetery_id",
      "person_id",
      "created_at",
      "updated_at",
    ],
  },
} as const;

// Common JOIN patterns
export const COMMON_JOINS = {
  PLOT_WITH_SECTION: `
    LEFT JOIN cemeteries_section ON cemeteries_plot.section_link_id = cemeteries_section.id
  `,
  PLOT_WITH_LOT: `
    LEFT JOIN cemeteries_lot ON cemeteries_plot.lot_link_id = cemeteries_lot.id
  `,
  PLOT_WITH_CEMETERY: `
    LEFT JOIN cemeteries_cemetery ON cemeteries_plot.cemetery_id = cemeteries_cemetery.id
  `,
  PLOT_WITH_INTERMENTS: `
    LEFT JOIN cemeteries_intermentrecord ON cemeteries_plot.id = cemeteries_intermentrecord.plot_id
  `,
  INTERMENT_WITH_PERSON: `
    LEFT JOIN cemeteries_person ON cemeteries_intermentrecord.person_id = cemeteries_person.id 
    AND cemeteries_person.deleted_at IS NULL
  `,
  INTERMENT_WITH_PLOT: `
    LEFT JOIN cemeteries_plot ON cemeteries_intermentrecord.plot_id = cemeteries_plot.id 
    AND cemeteries_plot.deleted_at IS NULL
  `,
  PERSON_WITH_ADDRESS: `
    LEFT JOIN cemeteries_address ON cemeteries_person.id = cemeteries_address.person_id 
    AND cemeteries_address.primary = 1
  `,
  PERSON_WITH_PHONE: `
    LEFT JOIN cemeteries_phone ON cemeteries_person.id = cemeteries_phone.person_id
  `,
  INTERMENT_WITH_FUNERAL_DIRECTOR: `
    LEFT JOIN cemeteries_business AS funeral_director 
    ON cemeteries_intermentrecord.funeral_director_id = funeral_director.id 
    AND funeral_director.deleted_at IS NULL
  `,
};

// Natural language mappings
export const NL_MAPPINGS = {
  available: "status = 'Available'",
  occupied:
    "status = 'Occupied' OR EXISTS (SELECT 1 FROM cemeteries_intermentrecord WHERE plot_id = cemeteries_plot.id)",
  empty:
    "status = 'Available' AND NOT EXISTS (SELECT 1 FROM cemeteries_intermentrecord WHERE plot_id = cemeteries_plot.id)",
  reserved: "status = 'Reserved'",
  sold: "status = 'Sold'",
  burial: "interment_type = 'Burial'",
  cremation: "interment_type = 'Cremation'",
  entombment: "interment_type = 'Entombment'",
  familyPlot: "(total_capacity >= 4 OR burials_capacity >= 4)",
  singlePlot: "(total_capacity = 1 OR burials_capacity = 1)",
} as const;

// Allowed SQL operations (whitelist)
export const ALLOWED_OPERATIONS = [
  "SELECT",
  "WHERE",
  "JOIN",
  "LEFT JOIN",
  "INNER JOIN",
  "ORDER BY",
  "LIMIT",
  "COUNT",
  "SUM",
  "AVG",
  "MAX",
  "MIN",
  "GROUP BY",
  "HAVING",
] as const;

// Forbidden SQL keywords (blacklist)
export const FORBIDDEN_KEYWORDS = [
  "DELETE",
  "DROP",
  "TRUNCATE",
  "UPDATE",
  "INSERT",
  "ALTER",
  "CREATE",
  "REPLACE",
  "EXEC",
  "EXECUTE",
  "SCRIPT",
  "MERGE",
  "CALL",
  "GRANT",
  "REVOKE",
] as const;
