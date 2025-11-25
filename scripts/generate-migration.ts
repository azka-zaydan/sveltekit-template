#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get arguments
const args = process.argv.slice(2);

function printUsage() {
	console.log(`
Usage: npm run generate:migration -- --type=<migrate|seed> --name=<description> [--schema=<schema>]

Examples:
  npm run generate:migration -- --type=migrate --name=create_users_table --schema=auth
  npm run generate:migration -- --type=seed --name=add_default_categories --schema=master

Options:
  --type=<migrate|seed>       Type of migration (required)
  --name=<description>        Description of the migration (required)
  --schema=<auth|app|master>  Target schema (optional, defaults to 'public')
  --help                      Show this help message

Available Schemas:
  auth    - Authentication related tables (users, sessions, etc.)
  app     - Application data tables (listings, favorites, etc.)
  master  - Master/reference data (categories, locations, etc.)
  public  - Default/other tables
`);
}

// Parse arguments
let type: 'migrate' | 'seed' | null = null;
let name: string | null = null;
let schema: string = 'public';

for (const arg of args) {
	if (arg === '--help' || arg === '-h') {
		printUsage();
		process.exit(0);
	}

	if (arg.startsWith('--type=')) {
		const value = arg.split('=')[1];
		if (value === 'migrate' || value === 'seed') {
			type = value;
		} else {
			console.error(`❌ Invalid type: ${value}. Must be 'migrate' or 'seed'`);
			process.exit(1);
		}
	}

	if (arg.startsWith('--name=')) {
		name = arg.split('=')[1];
	}

	if (arg.startsWith('--schema=')) {
		schema = arg.split('=')[1];
		if (!['auth', 'app', 'master', 'public'].includes(schema)) {
			console.error(`❌ Invalid schema: ${schema}. Must be 'auth', 'app', 'master', or 'public'`);
			process.exit(1);
		}
	}
}

// Validate arguments
if (!type || !name) {
	console.error('❌ Missing required arguments\n');
	printUsage();
	process.exit(1);
}

// Generate timestamp
const timestamp = new Date()
	.toISOString()
	.replace(/[-:]/g, '')
	.replace(/\..+/, '')
	.replace('T', '_');

// Create filenames
const upFilename = `${timestamp}_${name}.up.sql`;
const downFilename = `${timestamp}_${name}.down.sql`;

// Determine target directory
const targetDir = path.join(__dirname, '..', 'migrations', type);

// Create file paths
const upFilePath = path.join(targetDir, upFilename);
const downFilePath = path.join(targetDir, downFilename);

// Create template content based on type
const upTemplate =
	type === 'migrate'
		? `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Schema: ${schema}

-- Add your CREATE TABLE, ALTER TABLE, or other DDL statements here
-- Example: CREATE TABLE IF NOT EXISTS ${schema}.table_name (...)

`
		: `-- Seed: ${name}
-- Created: ${new Date().toISOString()}
-- Schema: ${schema}

-- Add your INSERT or UPDATE statements here
-- Example: INSERT INTO ${schema}.table_name (...) VALUES (...)

`;

const downTemplate =
	type === 'migrate'
		? `-- Rollback migration: ${name}
-- Created: ${new Date().toISOString()}
-- Schema: ${schema}

-- Add your DROP TABLE, ALTER TABLE, or other rollback DDL statements here
-- Example: DROP TABLE IF EXISTS ${schema}.table_name CASCADE

`
		: `-- Rollback seed: ${name}
-- Created: ${new Date().toISOString()}
-- Schema: ${schema}

-- Add your DELETE or UPDATE statements to remove seeded data
-- Example: DELETE FROM ${schema}.table_name WHERE ...

`;

// Write files
try {
	fs.writeFileSync(upFilePath, upTemplate);
	fs.writeFileSync(downFilePath, downTemplate);

	console.log('✅ Successfully created migration files:');
	console.log(`   📄 ${path.relative(process.cwd(), upFilePath)}`);
	console.log(`   📄 ${path.relative(process.cwd(), downFilePath)}`);
	console.log(`   🗂️  Schema: ${schema}`);
	console.log('');
	console.log('Next steps:');
	console.log(
		`   1. Edit the SQL files to add your ${type === 'migrate' ? 'schema changes' : 'seed data'}`
	);
	console.log(`   2. Run: npm run ${type}:up`);
} catch (error) {
	console.error('❌ Error creating migration files:', error);
	process.exit(1);
}
