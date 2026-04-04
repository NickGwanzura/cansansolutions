# Production Dockerfile - Preserves uploaded products
FROM node:22-alpine AS builder

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env .env.local .env.development .env.production

# Build Next.js app
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy seed data (used only if volume is empty)
COPY --from=builder /app/data /app/data.seed

# Create startup script that preserves existing data
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=== Starting Cansan ==="' >> /app/start.sh && \
    echo 'mkdir -p /app/data /app/uploads/products' >> /app/start.sh && \
    echo 'if [ ! -f /app/data/products.json ] || [ ! -s /app/data/products.json ]; then' >> /app/start.sh && \
    echo '  echo "Seeding initial data..."' >> /app/start.sh && \
    echo '  cp /app/data.seed/products.json /app/data/products.json' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'echo "Data ready. Starting server..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["/app/start.sh"]
