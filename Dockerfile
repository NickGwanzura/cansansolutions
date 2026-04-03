# Production Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env .env.local .env.development .env.production
RUN npm run build

# Keep seed data
RUN mkdir -p /app/data.seed && cp /app/data/products.json /app/data.seed/products.json

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DATA_DIR=/app/data

RUN apk add --no-cache dumb-init curl su-exec

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone/ ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/data.seed ./data.seed

# Create directories with correct permissions
RUN mkdir -p /app/data /app/uploads/products && \
    chown -R nextjs:nodejs /app/data /app/uploads/products

# Copy and setup entrypoint
COPY --from=builder --chown=root:root /app/entrypoint.sh ./
COPY --from=builder --chown=root:root /app/start.sh ./
RUN chmod +x entrypoint.sh start.sh

EXPOSE 3000

# Run entrypoint as root (it will fix perms and switch user)
ENTRYPOINT ["dumb-init", "./entrypoint.sh"]
CMD ["./start.sh"]
