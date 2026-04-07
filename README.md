## Cansan Solutions

This is a Next.js 16 application for the Cansan Solutions site and admin panel.

## Local development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open the local URL shown in the terminal and the app will reload as you edit files.

## Production

This app runs as a standard Next.js server because it includes:

- API routes under `app/api`
- admin authentication via cookies
- runtime writes to PostgreSQL for products
- runtime writes to PostgreSQL for banners
- runtime writes to PostgreSQL for brands
- runtime writes to `data/categories.json`
- admin image uploads via UploadThing

Use the included `Dockerfile` for production deployments.

## Deploying on Railway

This repo is now Railway-ready with the included [`railway.toml`](./railway.toml) and `Dockerfile`.

Recommended setup:

1. Create a new Railway project from this GitHub repo:
   `https://github.com/NickGwanzura/cansansolutions.git`
2. Add a PostgreSQL service in Railway.
3. Set these variables on the web service:
   - `DATABASE_URL` = the Postgres connection string from Railway
   - `ADMIN_PASSWORD` = your admin login password
   - `UPLOADTHING_TOKEN` = required for admin image uploads
   - `DATA_DIR=/app/data`
4. Add a Railway Volume and mount it at `/app/data`.
5. Deploy.

Why the volume matters:

- category edits are stored in `data/categories.json`
- the container seeds that file on first boot and preserves it after that

Railway will use:

- the `Dockerfile` builder
- the injected `PORT` variable
- the healthcheck path `/api/health`

## Deploying on Coolify

Recommended setup:

1. Create a new application in Coolify from this Git repository.
2. Choose the `Dockerfile` build pack.
3. Keep the base directory as `/`.
4. Expose port `3000`.
5. Set a strong `ADMIN_PASSWORD` environment variable.
6. Add persistent storage for these paths:
   - `/app/data`
   - `/app/public/images/products`

Why the storage mounts matter:

- category edits are saved to `data/categories.json`

If those paths are not persistent, changes made in the admin panel can be lost on redeploys or restarts.

## Useful commands

```bash
npm run dev
npm run build
npm run start
```
// Deployment trigger: 2026-03-26 20:13:49
// Build: 1774548878
