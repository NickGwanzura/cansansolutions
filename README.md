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
- runtime writes to `data/products.json`
- runtime image uploads to `public/images/products`

Use the included `Dockerfile` for production deployments.

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

- product edits are saved to `data/products.json`
- uploaded product images are saved to `public/images/products`

If those paths are not persistent, changes made in the admin panel can be lost on redeploys or restarts.

## Useful commands

```bash
npm run dev
npm run build
npm run start
```
// Deployment trigger: 2026-03-26 20:13:49
// Build: 1774548878
