Prisma Migration & Production Build Guide

Purpose
- Explain safe workflow for schema changes and production builds to avoid accidental data loss.

Summary recommendations
- Do NOT run `prisma db push --accept-data-loss` during production build.
- Use Prisma Migrations in development and `prisma migrate deploy` in production.
- Always back up your production database before applying schema changes.

Commands

# During development (create and test migrations)
npx prisma migrate dev --name <meaningful-name>
# This creates SQL migration files under prisma/migrations and updates your local DB.

# Generate Prisma client (after schema changes)
npx prisma generate

# Apply migrations in production (CI/deploy step)
npx prisma migrate deploy

# Production build (no DB push)
npm run build

Package.json notes
- `build` should not include `prisma db push --accept-data-loss`.
- Add a `migrate:deploy` script for CI/deploy: `prisma migrate deploy`.

Backup & Verification
- Export a DB dump before running migrations (pg_dump for Postgres).
- Run migrations in a staging environment first.
- Verify application on staging before deploying to production.

When to use `db push`
- Use `prisma db push` only for quick prototyping or local-only workflows.
- Avoid `--accept-data-loss` unless you are certain and have backups.

CI tips
- Run `npx prisma migrate deploy` as a separate step before starting the server.
- Keep migration files in version control (prisma/migrations).

If you want, I can:
- Create a quick `prisma/migrations` test by adding a small schema change locally and running `npx prisma migrate dev`.
- Add a short note to the main `README.md` linking to this file.
