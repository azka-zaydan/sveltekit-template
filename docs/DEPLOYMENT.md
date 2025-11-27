# Railway Deployment Guide

Complete guide for deploying the Craigslist Clone to Railway.app.

## Prerequisites

1. [Railway Account](https://railway.app/) (sign up with GitHub)
2. Railway CLI installed (optional, but recommended):
   ```bash
   npm i -g @railway/cli
   ```
3. GitHub repository with your code

## Quick Deploy (Recommended)

### Step 1: Create Railway Project

1. Go to [Railway.app](https://railway.app/)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `craigslist-dupe` repository
5. Railway will detect the Dockerfile automatically

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway will provision a PostgreSQL database
4. Copy the `DATABASE_URL` from the PostgreSQL service

### Step 3: Configure Environment Variables

Add these environment variables to your **app service** (not the database):

```bash
# Database (automatically set by Railway if you link the services)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Node Environment
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_TO_FILE=false

# Railway sets PORT automatically - don't override it
```

**Note**: Database seeding is mandatory. Demo data (users, categories, locations, listings) will be automatically populated when you run migrations.

**Important**: Railway automatically sets the `PORT` environment variable. Your app should use `process.env.PORT`.

### Step 4: Run Initial Migration and Seeding

**Option A: Using Railway CLI**

```bash
# Login to Railway
railway login

# Link to your project
railway link

# Run migrations and seeds (mandatory)
railway run npm run railway:migrate
```

**Option B: Using Railway Dashboard**

1. Go to your app service
2. Click **"Settings"** → **"Deploy"**
3. Add a **"One-off Command"**:
   ```bash
   npm run railway:migrate
   ```
4. Click **"Run"**

This will automatically:

- Create all database tables and schemas
- Populate demo data (10 users, categories, locations, 12+ listings)

### Step 5: Deploy

Railway will automatically deploy when you push to your main branch.

To manually trigger a deploy:

```bash
git push origin master
```

Or in Railway dashboard: **"Deployments"** → **"Deploy"**

---

## Environment Variables Reference

| Variable       | Required | Default      | Description                                            |
| -------------- | -------- | ------------ | ------------------------------------------------------ |
| `DATABASE_URL` | ✅ Yes   | -            | PostgreSQL connection string (auto-set by Railway)     |
| `NODE_ENV`     | ✅ Yes   | `production` | Set to `production` for Railway                        |
| `PORT`         | Auto-set | `3000`       | Railway sets this automatically                        |
| `LOG_LEVEL`    | No       | `info`       | Logging level: `debug`, `info`, `warn`, `error`        |
| `LOG_TO_FILE`  | No       | `false`      | Enable file-based logging (not recommended on Railway) |

**Note**: Database seeding is mandatory and runs automatically with migrations.

---

## Deployment Workflow

### Initial Setup (One-time)

```bash
# 1. Create Railway project from GitHub
# 2. Add PostgreSQL database
# 3. Set environment variables
# 4. Run migrations and seeds (mandatory)
railway run npm run railway:migrate

# This will:
# - Run all database migrations
# - Seed demo data (10 users, categories, locations, listings)
```

### Regular Deployments

```bash
# 1. Make changes locally
git add .
git commit -m "feat: add new feature"

# 2. Push to GitHub
git push origin master

# Railway auto-deploys when you push to master
```

### Manual Migration After Schema Changes

```bash
# After adding new migration files:
railway run npm run railway:migrate

# Or run separately:
railway run npm run migrate:up
railway run npm run seed:up
```

---

## Database Management

### Run Migrations and Seeds

```bash
# Using Railway CLI (recommended - runs both)
railway run npm run railway:migrate

# Or run migrations only
railway run npm run migrate:up

# Or use the Railway dashboard one-off command
```

### Rollback Migrations

```bash
railway run npm run migrate:down
```

### Seed Database

```bash
railway run npm run seed:up
```

### View Database (Railway CLI)

```bash
# Connect to PostgreSQL
railway connect Postgres

# Or get connection details
railway variables
```

---

## Monitoring & Debugging

### View Logs

**In Railway Dashboard:**

1. Go to your app service
2. Click **"Deployments"**
3. Select the active deployment
4. View real-time logs

**Using CLI:**

```bash
railway logs
```

### Health Check

Your app includes a health check endpoint. Railway will automatically restart if health checks fail.

Test locally:

```bash
curl http://localhost:3000/
```

### Common Issues

#### 1. Database Connection Failed

**Solution**: Ensure `DATABASE_URL` is set correctly:

```bash
railway variables
```

Should show: `DATABASE_URL=${{Postgres.DATABASE_URL}}`

#### 2. Migration Errors

**Solution**: Run migrations manually:

```bash
railway run npm run migrate:up
```

#### 3. Build Failures

**Solution**: Check build logs in Railway dashboard. Common causes:

- TypeScript errors: Run `npm run check` locally first
- Missing dependencies: Ensure `package.json` is committed
- Node version mismatch: We use Node 20

#### 4. App Crashes on Startup

**Solution**: Check logs for errors. Common causes:

- Database not connected: Verify `DATABASE_URL`
- Migrations not run: Run `railway run npm run migrate:up`
- Port binding issues: Ensure app uses `process.env.PORT`

---

## Custom Domain Setup

1. Go to **"Settings"** → **"Domains"**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `mycraigslist.com`)
4. Update your DNS records as shown by Railway:
   - **A Record**: Point to Railway's IP
   - **CNAME**: Point to `*.up.railway.app`
5. Wait for DNS propagation (up to 48 hours)

---

## Scaling

### Vertical Scaling (More Resources)

1. Go to **"Settings"** → **"Resources"**
2. Adjust:
   - **Memory**: 512MB - 8GB
   - **CPU**: 1-8 vCPUs

### Horizontal Scaling (Multiple Instances)

Railway supports horizontal scaling:

1. Go to **"Settings"** → **"Replicas"**
2. Set number of replicas (instances)

**Note**: This app uses session-based auth with cookies, so sticky sessions are not required.

---

## Backup Strategy

### Database Backups

Railway PostgreSQL includes automatic daily backups.

**Manual Backup:**

```bash
# Export database
railway connect Postgres
pg_dump > backup.sql

# Or using pg_dump directly
railway run pg_dump $DATABASE_URL > backup.sql
```

**Restore from Backup:**

```bash
railway run psql $DATABASE_URL < backup.sql
```

---

## CI/CD Integration

Railway auto-deploys from GitHub. For advanced CI/CD:

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [master]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js 20
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Type check
        run: npm run check

      # Railway auto-deploys on push, so this is optional
      - name: Deploy to Railway
        run: echo "Railway will auto-deploy"
```

---

## Production Checklist

Before going live:

- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` to Railway PostgreSQL
- [ ] Run migrations: `railway run npm run migrate:up`
- [ ] Set `LOG_LEVEL=info` (not `debug`)
- [ ] Set `LOG_TO_FILE=false` (Railway handles logs)
- [ ] Test authentication flow
- [ ] Test listing creation
- [ ] Test image uploads (update to cloud storage for production)
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts
- [ ] Review Railway's pricing for your expected usage

---

## Cost Estimation

Railway Pricing (as of 2025):

- **Starter Plan**: $5/month
  - 512MB RAM per service
  - Shared CPU
  - Good for development/testing

- **Pro Plan**: $20/month + usage
  - Up to 8GB RAM
  - Dedicated resources
  - Recommended for production

**Estimated Monthly Cost:**

- App service: ~$5-20
- PostgreSQL: ~$5-10
- **Total**: ~$10-30/month for small to medium traffic

---

## Alternative: Deploy to Vercel + Neon

For serverless alternative:

1. **Frontend**: Deploy to Vercel
2. **Database**: Use [Neon](https://neon.tech/) serverless PostgreSQL
3. Update `DATABASE_URL` to Neon connection string

---

## Support & Resources

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)
- [Railway Pricing](https://railway.app/pricing)

---

## Quick Commands Cheat Sheet

```bash
# Railway CLI
railway login              # Login to Railway
railway link               # Link to project
railway run <command>      # Run command in Railway environment
railway logs               # View logs
railway variables          # View environment variables
railway connect Postgres   # Connect to PostgreSQL

# Database
railway run npm run migrate:up     # Run migrations
railway run npm run migrate:down   # Rollback migrations
railway run npm run seed:up        # Seed database

# Deployment
git push origin master             # Auto-deploy to Railway

# Local testing with Railway DB
railway run npm run dev            # Run locally with Railway DB
```

---

## Next Steps

After successful deployment:

1. **Update Image Storage**: Integrate cloud storage (AWS S3, Cloudinary) for listing images
2. **Add Email Service**: Integrate email provider (SendGrid, Resend) for notifications
3. **Set up Monitoring**: Add error tracking (Sentry) and analytics
4. **Performance**: Add Redis caching for frequently accessed data
5. **Security**: Add rate limiting, CSRF protection, and security headers

---

**Happy Deploying! 🚀**
