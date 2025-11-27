````markdown
# Quick Start: Deploy to Railway in 5 Minutes

## Step-by-Step Deployment

### 1. Push Code to GitHub (if not already)

```bash
git add .
git commit -m "chore: add Railway deployment configuration"
git push origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway detects the configuration automatically ✅

### 3. Add PostgreSQL Database

1. In your project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Done! Railway auto-connects it to your app

### 4. Set Environment Variables

Click on your **app service** → **"Variables"** → Add:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
LOG_LEVEL=info
LOG_TO_FILE=false
```

**Important**: Use `${{Postgres.DATABASE_URL}}` exactly as shown - Railway will replace it with the actual database URL.

### 5. Wait for Deploy

Railway will automatically build and deploy. Watch the logs in the **"Deployments"** tab.

### 6. Run Database Migrations

**Option A: Railway Dashboard**

1. Click your app service
2. Go to **"Settings"** → **"Deploy"**
3. Under "One-off Commands", run:
   ```bash
   npm run railway:migrate
   ```
   This will run migrations and optionally seed demo data.

**Option B: Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link
railway login
railway link

# Run migrations and seeds
railway run npm run railway:migrate
```

**Note**: The seed step is optional. If you don't want demo data in production:

1. Edit `scripts/railway-migrate.sh`
2. Comment out the seed section

### 7. Test Your Deployment

Railway gives you a URL like: `https://your-app.up.railway.app`

Click it and test:

- ✅ Homepage loads
- ✅ Can register
- ✅ Can login
- ✅ App functionality works

## That's It! 🎉

Your app is live on Railway!

---

## Next Steps

- **Custom Domain**: Settings → Networking → Add Custom Domain
- **Monitor Logs**: Deployments → View Logs
- **Scale**: Settings → Resources (increase RAM/CPU if needed)

## Troubleshooting

**Build fails?**

- Check logs in Railway dashboard
- Run `npm run check` locally first

**Database connection error?**

- Verify `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- Make sure PostgreSQL service is running

**App crashes?**

- Run migrations: `railway run npm run migrate:up`
- Check logs for specific errors

---

## Full Documentation

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for complete deployment guide.
````
