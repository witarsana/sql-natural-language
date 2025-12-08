const knex = require("knex");
require("dotenv").config();

const db = knex({
  client: "mysql2",
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "3306"),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
});

async function extractSchema() {
  try {
    // Get all tables
    const tables = await db.raw(
      `
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `,
      [process.env.DATABASE_NAME]
    );

    const tableList = tables[0].map((t) => t.TABLE_NAME);
    console.log(`Found ${tableList.length} tables\n`);

    const schema = {};

    // Get columns for each table
    for (const tableName of tableList) {
      const columns = await db.raw(
        `
        SELECT 
          COLUMN_NAME,
          DATA_TYPE,
          COLUMN_KEY,
          IS_NULLABLE,
          COLUMN_DEFAULT,
          COLUMN_COMMENT
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `,
        [process.env.DATABASE_NAME, tableName]
      );

      schema[tableName] = columns[0];
    }

    console.log(JSON.stringify(schema, null, 2));
  } catch (error) {
    console.error("Error extracting schema:", error);
  } finally {
    await db.destroy();
  }
}

extractSchema();
