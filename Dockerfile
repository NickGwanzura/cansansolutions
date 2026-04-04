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

# Production stage
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV DATA_DIR=/app/data

RUN apk add --no-cache curl

# Copy standalone output
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static ./.next/static

# Create required directories
RUN mkdir -p /app/data /app/uploads/products

# Seed initial data if not present
RUN if [ ! -f /app/data/products.json ]; then echo '[]' > /app/data/products.json; fi

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

EXPOSE 3000

CMD ["node", "server.js"]
