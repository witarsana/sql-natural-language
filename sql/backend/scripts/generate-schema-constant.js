#!/usr/bin/env node
/**
 * Build script to generate schema constant from DATABASE_SCHEMA.md
 * This ensures the schema is embedded in the code for Vercel deployment
 */

const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../docs/DATABASE_SCHEMA.md');
const outputPath = path.join(__dirname, '../api/lib/generated-schema.ts');
const outputDir = path.dirname(outputPath);

try {
  console.log('Generating schema constant for Vercel deployment...');
  console.log('Schema path:', schemaPath);
  console.log('Output path:', outputPath);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    console.log('Creating output directory:', outputDir);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Check if schema file exists
  if (!fs.existsSync(schemaPath)) {
    console.error('ERROR: DATABASE_SCHEMA.md not found at:', schemaPath);
    console.error('Available files in docs/:');
    try {
      const docsDir = path.join(__dirname, '../docs');
      if (fs.existsSync(docsDir)) {
        console.error(fs.readdirSync(docsDir));
      } else {
        console.error('docs/ directory does not exist!');
      }
    } catch (e) {
      console.error('Cannot read docs directory');
    }
    process.exit(1);
  }

  console.log('Reading DATABASE_SCHEMA.md...');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  // Escape backticks and ${} in the schema content
  const escapedContent = schemaContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');

  const output = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * Generated from docs/DATABASE_SCHEMA.md
 * Run: npm run generate-schema to regenerate
 */

export const DATABASE_SCHEMA = \`${escapedContent}\`;
`;

  fs.writeFileSync(outputPath, output, 'utf-8');
  console.log('✓ Generated api/lib/generated-schema.ts');
  console.log(`  Schema size: ${schemaContent.length} characters`);
} catch (error) {
  console.error('Error generating schema constant:', error);
  process.exit(1);
}
