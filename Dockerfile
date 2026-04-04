# Production Dockerfile - Bulletproof Version
FROM node:22-alpine AS builder

WORKDIR /app

# Build args and env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Remove any local env files
RUN rm -f .env .env.local .env.development .env.production

# Build Next.js app
RUN npm run build

# Production stage - minimal image
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DATA_DIR=/app/data

# Install curl for healthchecks
RUN apk add --no-cache curl

# Create app directory structure
RUN mkdir -p /app/data /app/uploads/products

# Copy built application from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy data directory with products
COPY --from=builder /app/data ./data

# Ensure products.json exists (create empty if missing)
RUN if [ ! -f /app/data/products.json ]; then echo '[]' > /app/data/products.json; fi

# Fix permissions
RUN chmod -R 755 /app/data /app/uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
