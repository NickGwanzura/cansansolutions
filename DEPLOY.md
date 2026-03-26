# Dokploy Deployment Guide

## Prerequisites

1. A Dokploy instance running
2. PostgreSQL database (can be created via Dokploy or external)

## Deployment Steps

### Option 1: Using Docker Compose (Recommended)

1. **Push your code to a Git repository** (GitHub, GitLab, etc.)

2. **In Dokploy Dashboard:**
   - Create a new "Compose" project
   - Connect your repository
   - Dokploy will use the `docker-compose.yml` file

3. **Set Environment Variables** in Dokploy:
   ```
   DATABASE_URL=postgresql://username:password@db:5432/cansan
   DB_USER=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=cansan
   ```

4. **Deploy** - Dokploy will build and start both services

### Option 2: Using Dockerfile Only (External DB)

If you have an external PostgreSQL database:

1. **In Dokploy Dashboard:**
   - Create a new "Application" project
   - Connect your repository

2. **Set Environment Variables:**
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

3. **Deploy**

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Full PostgreSQL connection string |
| `NODE_ENV` | Auto | Set to `production` automatically |
| `NEXT_TELEMETRY_DISABLED` | Auto | Set to `1` automatically |

## Database Migrations

The container automatically runs `prisma db push` on startup to sync the schema.

## Health Check

The app exposes a health endpoint at `/api/health` for monitoring.

## Troubleshooting

- **Build fails**: Ensure `DATABASE_URL` is set in Dokploy environment variables
- **Database connection fails**: Check that the database service is running and accessible
- **Port issues**: The app listens on port 3000
