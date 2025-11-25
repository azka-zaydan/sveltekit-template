#!/usr/bin/env tsx
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config();

const MIGRATION_TYPE = 'migrate';

async function main() {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	// Get direction from command line args
	const direction = process.argv.includes('--down') ? 'down' : 'up';

	console.log(`🔄 Running ${direction} migrations...`);

	// Create database connection
	const client = postgres(connectionString, { max: 1 });
	const db = drizzle(client);

	try {
		// Ensure migration_history table exists (only for up migrations)
		if (direction === 'up') {
			await db.execute(sql`
				CREATE TABLE IF NOT EXISTS migration_history (
					id SERIAL PRIMARY KEY,
					name VARCHAR(255) NOT NULL UNIQUE,
					type VARCHAR(50) NOT NULL,
					executed_at TIMESTAMP DEFAULT NOW() NOT NULL
				)
			`);
			await db.execute(
				sql`CREATE INDEX IF NOT EXISTS idx_migration_history_name ON migration_history(name)`
			);
			await db.execute(
				sql`CREATE INDEX IF NOT EXISTS idx_migration_history_type ON migration_history(type)`
			);
		}

		// Get all migration files
		const migrationsDir = path.join(__dirname, '..', 'migrations', MIGRATION_TYPE);
		const files = fs
			.readdirSync(migrationsDir)
			.filter((f) => f.endsWith(`.${direction}.sql`))
			.sort();

		if (files.length === 0) {
			console.log(`📭 No ${direction} migration files found`);
			await client.end();
			return;
		}

		// Get already executed migrations
		let executedMigrations: string[] = [];
		if (direction === 'up') {
			const result = await db.execute<{ name: string }>(
				sql`SELECT name FROM migration_history WHERE type = ${MIGRATION_TYPE}`
			);
			executedMigrations = result.map((r) => r.name);
		}

		let migrationsRun = 0;

		// Execute migrations
		for (const file of files) {
			const migrationName = file.replace(`.${direction}.sql`, '');
			const filePath = path.join(migrationsDir, file);

			// Skip already executed migrations when going up
			if (direction === 'up' && executedMigrations.includes(migrationName)) {
				console.log(`⏭️  Skipping ${file} (already executed)`);
				continue;
			}

			// For down migrations, check if it was executed
			if (direction === 'down') {
				const result = await db.execute<{ name: string }>(
					sql`SELECT name FROM migration_history WHERE name = ${migrationName} AND type = ${MIGRATION_TYPE}`
				);
				if (result.length === 0) {
					console.log(`⏭️  Skipping ${file} (not in history)`);
					continue;
				}
			}

			console.log(`📄 Executing ${file}...`);

			// Read and execute SQL file
			const sqlContent = fs.readFileSync(filePath, 'utf-8');
			await db.execute(sql.raw(sqlContent));

			// Update migration history
			if (direction === 'up') {
				await db.execute(
					sql`INSERT INTO migration_history (name, type) VALUES (${migrationName}, ${MIGRATION_TYPE})`
				);
			} else {
				// For down migrations, the table might have been dropped
				try {
					await db.execute(
						sql`DELETE FROM migration_history WHERE name = ${migrationName} AND type = ${MIGRATION_TYPE}`
					);
				} catch (error) {
					// Ignore if migration_history table doesn't exist (it was dropped)
					if (error instanceof Error && !error.message.includes('does not exist')) {
						throw error;
					}
				}
			}

			console.log(`✅ ${file} executed successfully`);
			migrationsRun++;
		}

		if (migrationsRun === 0) {
			console.log(`📭 No migrations to run`);
		} else {
			console.log(`\n✅ Successfully executed ${migrationsRun} ${direction} migration(s)!`);
		}
	} catch (error) {
		console.error('❌ Migration failed:', error);
		throw error;
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error('Migration error:', err);
	process.exit(1);
});
