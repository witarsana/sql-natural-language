const fs = require("fs");
const path = require("path");

const schemaPath = path.join(__dirname, "../src/models/full-schema.json");
const schemaContent = fs.readFileSync(schemaPath, "utf8");
const lines = schemaContent.split("\n");
const jsonContent = lines.slice(1).join("\n"); // Skip first line "Found 144 tables"
const schema = JSON.parse(jsonContent);

// Focus on key cemetery tables
const keyTables = [
  "cemeteries_cemetery",
  "cemeteries_section",
  "cemeteries_lot",
  "cemeteries_plot",
  "cemeteries_person",
  "cemeteries_intermentrecord",
  "cemeteries_intermentstory",
  "cemeteries_applicationrecord",
  "cemeteries_plotpurchaser",
  "cemeteries_business",
  "cemeteries_address",
  "cemeteries_phone",
  "cemeteries_email",
  "cemeteries_personrelationship",
  "cemeteries_attribute",
  "cemeteries_events",
  "cemeteries_recordfile",
  "invoices_invoice",
  "invoices_invoiceitem",
];

let schemaDoc = `# Chronicle Cemetery Database Schema

## Core Tables

`;

for (const tableName of keyTables) {
  if (!schema[tableName]) continue;

  schemaDoc += `### ${tableName}\n\n`;
  schemaDoc += `| Column | Type | Key | Nullable | Description |\n`;
  schemaDoc += `|--------|------|-----|----------|-------------|\n`;

  for (const col of schema[tableName]) {
    const key = col.COLUMN_KEY || "-";
    const nullable = col.IS_NULLABLE === "YES" ? "✓" : "✗";
    schemaDoc += `| ${col.COLUMN_NAME} | ${col.DATA_TYPE} | ${key} | ${nullable} | ${col.COLUMN_COMMENT || ""} |\n`;
  }

  schemaDoc += `\n`;
}

// Generate simplified schema for AI prompt
let aiSchema = {
  cemeteries_cemetery: {},
  cemeteries_section: {},
  cemeteries_lot: {},
  cemeteries_plot: {},
  cemeteries_person: {},
  cemeteries_intermentrecord: {},
  cemeteries_intermentstory: {},
  cemeteries_applicationrecord: {},
  cemeteries_plotpurchaser: {},
  cemeteries_business: {},
  cemeteries_address: {},
  cemeteries_phone: {},
  cemeteries_email: {},
};

for (const [tableName, columns] of Object.entries(schema)) {
  if (keyTables.includes(tableName)) {
    const cols = {};
    for (const col of columns) {
      cols[col.COLUMN_NAME] = {
        type: col.DATA_TYPE,
        key: col.COLUMN_KEY,
        nullable: col.IS_NULLABLE === "YES",
        comment: col.COLUMN_COMMENT || "",
      };
    }
    aiSchema[tableName] = cols;
  }
}

// Write documentation
fs.writeFileSync(path.join(__dirname, "../docs/DATABASE_SCHEMA.md"), schemaDoc);

// Write AI-friendly schema
fs.writeFileSync(
  path.join(__dirname, "../src/models/ai-schema.json"),
  JSON.stringify(aiSchema, null, 2)
);

console.log("✅ Schema documentation generated");
console.log(`   - docs/DATABASE_SCHEMA.md`);
console.log(`   - src/models/ai-schema.json`);
