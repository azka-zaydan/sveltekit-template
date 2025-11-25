# SvelteKit Template - Getting Started

This guide will help you set up and customize the template for your project.

## Initial Setup

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd <your-project>
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and update:

- `DATABASE_URL` - Your PostgreSQL connection string
- Other environment variables as needed

### 3. Update Project Name

**In `package.json`:**

```json
{
	"name": "your-project-name"
}
```

**In `compose.yaml`:**

```yaml
container_name: your-project-db
environment:
  POSTGRES_DB: your_database
  POSTGRES_PASSWORD: your_password
```

**In `.env`:**

```bash
DATABASE_URL="postgres://root:your_password@localhost:5432/your_database"
```

### 4. Start Database

```bash
docker compose up -d
```

### 5. Run Migrations

```bash
npm run migrate:up
npm run seed:up
```

### 6. Start Development

```bash
npm run dev
```

## Customization Steps

### Define Your Database Schema

1. **Edit Drizzle schema** (`src/lib/server/db/schema.ts`):

```typescript
export const yourTable = appSchema.table('your_table', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: varchar('name', { length: 255 }).notNull()
	// ... your columns
});
```

2. **Generate migration**:

```bash
npm run generate:migration -- --type=migrate --name=create_your_table --schema=app
```

3. **Edit the generated SQL files** in `migrations/migrate/`

4. **Run migration**:

```bash
npm run migrate:up
```

### Create Validation Schemas

Create Zod schemas in `src/lib/types/` for your entities:

```typescript
// src/lib/types/your-entity.schemas.ts
import { z } from 'zod';

export const yourEntitySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(255)
	// ... your fields
});

export type YourEntity = z.infer<typeof yourEntitySchema>;
```

### Build Your API

1. **Create API client method** (`src/lib/api/your-entity.ts`)
2. **Create API endpoint** (`src/routes/api/your-entity/+server.ts`)
3. **Add validation using Zod schemas**

See `docs/API.md` for detailed examples.

### Create UI Components

Use Svelte 5 runes pattern:

```svelte
<script lang="ts">
	let { data } = $props();
	let count = $state(0);
</script>

<button onclick={() => count++}>
	Clicked {count} times
</button>
```

## Testing Your Setup

```bash
# Type check
npm run check

# Lint
npm run lint

# Format
npm run format

# Test database connection
npm run db:studio
```

## Next Steps

- Read the [documentation](docs/)
- Review [AI agent instructions](.github/instructions/)
- Customize the UI design (see `docs/UI_STYLE_GUIDE.md`)
- Add your business logic
- Deploy (see deployment guides)

## Common Issues

### Database Connection Fails

- Ensure Docker is running
- Check DATABASE_URL in `.env`
- Verify PostgreSQL container is healthy: `docker ps`

### Migration Errors

- Ensure migration_history table exists
- Check SQL syntax in migration files
- Verify schema names are correct

### Type Errors

- Run `npm run check` to see all errors
- Ensure Zod schemas match database schema
- Check imports are from correct paths

## Resources

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte 5 Documentation](https://svelte.dev/docs/svelte/overview)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Zod Documentation](https://zod.dev/)
