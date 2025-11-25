# 📦 About This Template Repository

This is the **sveltekit-template** repository - a production-ready template based on the craigslist-dupe project architecture.

## 🎯 Purpose

This repository serves as a **reusable template** for creating new SvelteKit projects with:

- Pre-configured multi-schema PostgreSQL architecture
- Type-safe validation and API patterns
- Production-ready logging and error handling
- Comprehensive documentation for both humans and AI

## 🚀 Using This Template

### For New Projects

**Option 1: GitHub Template (Recommended)**

1. Click "Use this template" button on GitHub
2. Create your new repository
3. Clone and follow `GETTING_STARTED.md`

**Option 2: Manual Clone**

```bash
git clone https://github.com/your-username/sveltekit-template my-new-project
cd my-new-project
rm -rf .git
git init
```

Then follow the setup in `GETTING_STARTED.md`.

## 📚 Documentation Overview

### Quick Navigation

| Document                          | Purpose                | Audience   |
| --------------------------------- | ---------------------- | ---------- |
| `README.md`                       | Project overview       | Everyone   |
| `GETTING_STARTED.md`              | Initial setup steps    | New users  |
| `TEMPLATE_GUIDE.md`               | Building with template | Developers |
| `TEMPLATE_STRUCTURE.md`           | What's included        | Reference  |
| `.github/copilot-instructions.md` | AI integration         | AI agents  |
| `/docs/*`                         | Detailed guides        | Developers |
| `.github/instructions/*`          | Pattern guides         | AI agents  |

### Documentation Types

**For Getting Started:**

1. Read `README.md`
2. Follow `GETTING_STARTED.md`
3. Reference `TEMPLATE_GUIDE.md` as you build

**For AI Agents:**

- `.github/copilot-instructions.md` - Main instructions
- `.github/instructions/*.md` - Specific patterns

**For Deep Dives:**

- `/docs/*.md` - Comprehensive developer guides

## 🏗️ What's Included

### Core Features

- ✅ SvelteKit 2 + Svelte 5 (Runes API)
- ✅ Multi-schema PostgreSQL with Drizzle ORM
- ✅ Custom SQL migration system
- ✅ Zod v4 validation (schema-first)
- ✅ Type-safe API client
- ✅ Winston logging with request tracking
- ✅ Lucia authentication
- ✅ Tailwind CSS 4
- ✅ Docker Compose for local dev

### Documentation

- ✅ 7 AI agent instruction files
- ✅ 10 developer documentation files
- ✅ 4 setup/guide documents
- ✅ Example migration files
- ✅ Comprehensive comments

### Scripts

- ✅ Migration generator
- ✅ Migration runner
- ✅ Seed runner
- ✅ Database management commands

## 📋 Template vs Project

| Aspect  | Template (this repo)   | Your Project         |
| ------- | ---------------------- | -------------------- |
| Purpose | Reusable foundation    | Specific application |
| Naming  | Generic (your-project) | Specific (acme-app)  |
| Schema  | Example structure      | Your domain models   |
| API     | Pattern examples       | Your endpoints       |
| UI      | Basic components       | Your design system   |

## 🔄 Template Updates

### Getting Updates

When this template is updated:

```bash
# In your project
git remote add template https://github.com/your-username/sveltekit-template
git fetch template
git merge template/main --allow-unrelated-histories
# Resolve conflicts carefully
```

### Contributing Improvements

If you make improvements that could benefit the template:

1. **Generalize** - Remove project-specific code
2. **Document** - Update relevant docs
3. **Test** - Ensure template still works
4. **PR** - Submit to template repository

## 🎨 Customization Philosophy

This template provides **structure, not content**:

- ✅ Keep: Architecture, patterns, tooling, documentation structure
- 🔄 Customize: Schema, validation, API, UI, business logic
- ❌ Don't keep: Example data, generic names, placeholder content

## 📦 What to Change First

1. **Project identity**
   - `package.json` → name
   - `compose.yaml` → container name, database name
   - `.env` → database URL

2. **Database schema**
   - Define your tables in `src/lib/server/db/schema.ts`
   - Create migrations
   - Update Zod schemas

3. **API structure**
   - Define your entities
   - Create validation schemas
   - Build API endpoints

4. **UI customization**
   - Update `docs/UI_STYLE_GUIDE.md`
   - Modify component library
   - Build your pages

## 🛠️ Maintenance

### Template Repository

- Keep dependencies updated
- Maintain documentation accuracy
- Add new patterns as discovered
- Preserve generic nature

### Your Projects

- Pull template updates occasionally
- Contribute improvements back
- Customize freely for your needs

## 🤝 Support

### For Template Issues

- Open issue in template repository
- Check existing issues first
- Provide minimal reproduction

### For Project Issues

- Review project-specific code first
- Check template documentation
- Community support in discussions

## 📝 License

MIT - Use freely for commercial and personal projects.

## 🌟 Credits

Based on production architecture from **craigslist-dupe** project.

## 📞 Contact

- Template Repo: https://github.com/your-username/sveltekit-template
- Issues: https://github.com/your-username/sveltekit-template/issues

---

**Happy Building! 🚀**

Remember: This is a **foundation, not a cage**. Customize everything to fit your project's needs.
