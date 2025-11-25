# 📚 SvelteKit Template - Complete Documentation Index

Quick reference to find any documentation in this template.

## 🚀 Getting Started (Read in Order)

1. **README.md** - Project overview, features, tech stack
2. **GETTING_STARTED.md** - Initial setup steps
3. **TEMPLATE_GUIDE.md** - How to build with this template
4. **TEMPLATE_STRUCTURE.md** - What's included

## 🤖 For AI Agents

### Main Instructions

- `.github/copilot-instructions.md` - Core AI instructions and patterns

### Pattern Guides (`.github/instructions/`)

- `api-client.instructions.md` - Type-safe API client usage
- `database.instructions.md` - Multi-schema database operations
- `logging.instructions.md` - Winston logging patterns
- `svelte5.instructions.md` - Svelte 5 runes patterns
- `ui-design.instructions.md` - UI design guidelines
- `validation.instructions.md` - Zod v4 validation patterns
- `workflows.instructions.md` - Development workflows

## 👨‍💻 For Developers

### Quick Reference

- `docs/API.md` - API endpoint patterns and examples
- `docs/DATABASE.md` - Database architecture and migrations
- `docs/DEVELOPMENT.md` - Development guide and patterns
- `docs/ERROR_HANDLING.md` - Error handling patterns

### Deep Dives

- `docs/LOGGER.md` - Logging system details
- `docs/COMPONENTS.md` - UI component library reference
- `docs/UI_STYLE_GUIDE.md` - UI design principles

### Deployment

- `docs/DEPLOYMENT.md` - Deployment guides (Railway, Vercel, etc.)
- `docs/DEPLOYMENT_CHECKLIST.md` - Pre-deployment checklist
- `docs/DEBUGGING.md` - Troubleshooting guide

## 🔧 Configuration Files

### Environment

- `.env.example` - Environment variables template
- `compose.yaml` - Docker Compose PostgreSQL setup

### Build Tools

- `package.json` - Dependencies and npm scripts
- `vite.config.ts` - Vite configuration
- `svelte.config.js` - SvelteKit configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `tsconfig.json` - TypeScript configuration

### Code Quality

- `eslint.config.js` - ESLint rules
- `.prettierrc` - Prettier formatting
- `.prettierignore` - Format ignore patterns
- `.gitignore` - Git ignore patterns

## 🛠️ Scripts

### Migration Scripts (`scripts/`)

- `generate-migration.ts` - Create new migration files
- `migrate.ts` - Run database migrations
- `seed.ts` - Run database seeds
- `railway-migrate.sh` - Railway deployment migration

### Package.json Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run check            # Type check
npm run lint             # Lint code
npm run format           # Format code
npm run migrate:up       # Run migrations
npm run seed:up          # Run seeds
npm run db:studio        # Database GUI
npm run generate:migration  # Create migration
```

## 🗄️ Database

### Example Migrations (`migrations/migrate/`)

- `00000000_000000_create_schemas.up.sql` - Create schemas
- `00000000_000001_create_migration_history.up.sql` - Migration tracking

### Example Seeds (`migrations/seed/`)

- `00000000_000001_example_data.up.sql` - Example seed data

## 📖 About This Template

- `TEMPLATE_README.md` - Template repository information
- `TEMPLATE_GUIDE.md` - Comprehensive building guide
- `TEMPLATE_STRUCTURE.md` - What's included reference
- `CONVERSION_SUMMARY.md` - Conversion details
- `AGENTS.md` - AI agent integration

## 🎯 By Use Case

### "I want to start a new project"

1. Read `README.md`
2. Follow `GETTING_STARTED.md`
3. Reference `TEMPLATE_GUIDE.md`

### "I want to add a new feature"

1. Check `TEMPLATE_GUIDE.md` - Building Your Application
2. Review `docs/API.md` - API patterns
3. See `docs/DATABASE.md` - Schema updates

### "I want to understand the architecture"

1. Read `TEMPLATE_STRUCTURE.md` - What's included
2. Study `docs/DATABASE.md` - Multi-schema design
3. Review `.github/copilot-instructions.md` - Core patterns

### "I want to customize the UI"

1. Read `docs/UI_STYLE_GUIDE.md` - Design principles
2. Check `docs/COMPONENTS.md` - Component library
3. Update `.github/instructions/ui-design.instructions.md`

### "I want to deploy"

1. Review `docs/DEPLOYMENT_CHECKLIST.md` - Pre-deploy checks
2. Follow `docs/DEPLOYMENT.md` - Deployment guide
3. Check `docs/DEBUGGING.md` - Troubleshooting

### "I'm an AI agent helping with this project"

1. Start with `.github/copilot-instructions.md`
2. Reference `.github/instructions/*.md` for patterns
3. Use `docs/*.md` for detailed information

## 🔍 Find by Topic

### Authentication

- `docs/DEVELOPMENT.md` - Auth setup
- `.github/instructions/api-client.instructions.md` - Auth endpoints

### Validation

- `.github/instructions/validation.instructions.md` - Zod patterns
- `docs/ERROR_HANDLING.md` - Error validation

### Database

- `.github/instructions/database.instructions.md` - Operations
- `docs/DATABASE.md` - Architecture

### API

- `.github/instructions/api-client.instructions.md` - Client usage
- `docs/API.md` - Endpoint patterns

### Logging

- `.github/instructions/logging.instructions.md` - Quick guide
- `docs/LOGGER.md` - Detailed reference

### UI/Components

- `.github/instructions/ui-design.instructions.md` - Design rules
- `docs/UI_STYLE_GUIDE.md` - Style guide
- `docs/COMPONENTS.md` - Component reference

### Svelte 5

- `.github/instructions/svelte5.instructions.md` - Runes patterns
- `docs/DEVELOPMENT.md` - Component organization

### Workflows

- `.github/instructions/workflows.instructions.md` - Dev workflows
- `GETTING_STARTED.md` - Setup workflow
- `TEMPLATE_GUIDE.md` - Building workflow

## 📊 Documentation Statistics

- **Total markdown files**: 27
- **AI instructions**: 8 files
- **Developer docs**: 10 files
- **Setup guides**: 5 files
- **Reference docs**: 4 files

## 🎓 Recommended Reading Order

### For First-Time Users

1. README.md
2. GETTING_STARTED.md
3. TEMPLATE_GUIDE.md (Steps 1-3)
4. docs/DATABASE.md (Schema section)
5. docs/API.md (Basic patterns)

### For Experienced SvelteKit Developers

1. TEMPLATE_STRUCTURE.md
2. .github/copilot-instructions.md
3. docs/DATABASE.md
4. .github/instructions/\*.md (as needed)

### For AI Agents

1. .github/copilot-instructions.md
2. All .github/instructions/\*.md files
3. docs/\*.md for reference

## 🔗 Quick Links by File Type

### Markdown Documentation

```
./README.md
./GETTING_STARTED.md
./TEMPLATE_GUIDE.md
./TEMPLATE_STRUCTURE.md
./TEMPLATE_README.md
./CONVERSION_SUMMARY.md
./AGENTS.md
./.github/copilot-instructions.md
./.github/instructions/*.md (7 files)
./docs/*.md (10 files)
```

### TypeScript Scripts

```
./scripts/generate-migration.ts
./scripts/migrate.ts
./scripts/seed.ts
```

### SQL Migrations

```
./migrations/migrate/*.sql (4 files)
./migrations/seed/*.sql (2 files)
```

### Configuration

```
./.env.example
./package.json
./compose.yaml
./drizzle.config.ts
./tsconfig.json
./vite.config.ts
./svelte.config.js
./eslint.config.js
```

## 💡 Tips

- **Search this file** (Ctrl/Cmd+F) to find specific topics
- **Check TEMPLATE_STRUCTURE.md** for complete file listing
- **Use TEMPLATE_GUIDE.md** for step-by-step examples
- **Reference docs/\*** for deep technical details
- **Follow .github/instructions/** for consistent patterns

## 🆘 Need Help?

1. **Setup issues** → GETTING_STARTED.md
2. **Building features** → TEMPLATE_GUIDE.md
3. **Database questions** → docs/DATABASE.md
4. **API patterns** → docs/API.md
5. **Deployment** → docs/DEPLOYMENT.md
6. **Debugging** → docs/DEBUGGING.md

---

**Last Updated**: November 2025  
**Template Version**: 1.0.0
