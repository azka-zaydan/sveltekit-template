# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Code Quality

- [ ] Run `npm run check` - No TypeScript errors
- [ ] Run `npm run lint` - No linting errors
- [ ] Run `npm run build` - Build succeeds locally
- [ ] All tests pass (if you have tests)
- [ ] Code reviewed and approved

### Environment Configuration

- [ ] `.env.production.example` reviewed
- [ ] All required environment variables documented
- [ ] Sensitive data not committed to git
- [ ] `NODE_ENV=production` set

### Database

- [ ] Migration files tested locally
- [ ] Migrations run successfully: `npm run migrate:up`
- [ ] Can rollback migrations: `npm run migrate:down`
- [ ] Seed data reviewed (remove if not needed in production)
- [ ] Database backup strategy in place

### Security

- [ ] Session cookies use `secure: true` in production
- [ ] CORS configured appropriately
- [ ] Rate limiting enabled
- [ ] SQL injection prevention (using Drizzle ORM ✓)
- [ ] XSS prevention (SvelteKit auto-escapes ✓)
- [ ] Password hashing with Argon2 ✓
- [ ] No sensitive data in logs

### Performance

- [ ] Images optimized
- [ ] Unnecessary console.logs removed
- [ ] Log level set to `info` or `warn` (not `debug`)
- [ ] File logging disabled: `LOG_TO_FILE=false`

## Railway Deployment

### Initial Setup

- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] PostgreSQL database added
- [ ] Services linked (app ↔ database)

### Environment Variables (Railway)

- [ ] `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [ ] `NODE_ENV=production`
- [ ] `LOG_LEVEL=info`
- [ ] `LOG_TO_FILE=false`
- [ ] Custom variables added (if any)

### Database Setup

- [ ] Migrations run: `railway run npm run railway:migrate`
- [ ] Database tables verified
- [ ] Demo data seeded automatically (10 users, categories, locations, listings)

### Deployment

- [ ] First deploy successful
- [ ] App accessible at Railway URL
- [ ] Health check passing
- [ ] No errors in Railway logs

## Post-Deployment

### Smoke Testing

- [ ] Homepage loads
- [ ] Can register new account
- [ ] Can login
- [ ] Can create listing
- [ ] Can upload images
- [ ] Can favorite listing
- [ ] Can view dashboard
- [ ] Can logout

### Monitoring

- [ ] Railway logs monitored
- [ ] Error tracking configured (optional: Sentry)
- [ ] Uptime monitoring configured (optional)
- [ ] Database performance acceptable

### Documentation

- [ ] Deployment documented
- [ ] Environment variables documented
- [ ] Runbook created for common issues
- [ ] Team notified of deployment

## Optional Enhancements

### Custom Domain

- [ ] Domain purchased
- [ ] DNS configured
- [ ] SSL certificate verified
- [ ] Domain points to Railway app

### Scaling

- [ ] Resource limits reviewed
- [ ] Auto-scaling configured (if needed)
- [ ] Database connection pooling configured
- [ ] CDN configured for static assets (optional)

### Integrations

- [ ] Cloud storage for images (S3, Cloudinary)
- [ ] Email service configured (SendGrid, Resend)
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog, Google Analytics)

## Rollback Plan

If deployment fails:

1. **Check Railway logs** for errors
2. **Rollback migration** if database issue:
   ```bash
   railway run npm run migrate:down
   ```
3. **Revert to previous deployment** in Railway dashboard
4. **Fix issues** locally and redeploy

## Maintenance

### Regular Tasks

- [ ] Database backups (automatic with Railway PostgreSQL)
- [ ] Monitor disk usage
- [ ] Review logs weekly
- [ ] Update dependencies monthly
- [ ] Security patches applied

### Scaling Triggers

- Monitor these metrics and scale when needed:
- [ ] Response time > 1s
- [ ] Error rate > 1%
- [ ] CPU usage > 80%
- [ ] Memory usage > 80%
- [ ] Database connections > 80% of limit

---

## Quick Reference

```bash
# Pre-deployment checks
npm run check
npm run lint
npm run build

# Railway CLI commands
railway login
railway link
railway run npm run railway:migrate  # Migrations + seeds
railway logs
railway variables

# Emergency rollback
railway run npm run migrate:down
railway run npm run seed:down
# Then rollback deployment in Railway dashboard
```

---

**Last Updated**: _Add date when you deploy_
