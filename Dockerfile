# Production Dockerfile
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

# Seed runtime-managed JSON data for first boot
COPY --from=builder /app/data /app/data.seed
COPY --from=builder /app/scripts/start-production.sh /app/scripts/start-production.sh

# Create directories and mark startup script executable
RUN mkdir -p /app/data /app/uploads/products /app/scripts \
  && chmod +x /app/scripts/start-production.sh

EXPOSE 3000

CMD ["/app/scripts/start-production.sh"]
