# Production Dockerfile for Dokploy
FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Remove any local .env to prevent conflicts
RUN rm -f .env .env.local .env.development .env.production

# Build Next.js
RUN npm run build

# Keep a seed copy of data for volume initialization
RUN mkdir -p /app/data.seed && cp /app/data/products.json /app/data.seed/products.json

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DATA_DIR=/app/data

# Install dumb-init, curl, and su-exec for user switching
RUN apk add --no-cache dumb-init curl su-exec

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/data ./data
COPY --from=builder --chown=nextjs:nodejs /app/data.seed ./data.seed
COPY --from=builder --chown=nextjs:nodejs /app/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/entrypoint.sh ./entrypoint.sh

RUN chmod +x start.sh entrypoint.sh

EXPOSE 3000

# Run as root initially - entrypoint will fix permissions and switch to nextjs
ENTRYPOINT ["dumb-init", "./entrypoint.sh"]
CMD ["./start.sh"]
