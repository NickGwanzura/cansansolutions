# Production Dockerfile - Your Products Only
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

# Copy YOUR 342-line products file
COPY --from=builder /app/data/products.json /app/data.seed/products.json

# Create directories
RUN mkdir -p /app/data /app/uploads/products

EXPOSE 3000

# ALWAYS use your products on startup (overwrites any demo data)
CMD ["sh", "-c", "echo '[PROD] Loading your products...' && mkdir -p /app/data && cp /app/data.seed/products.json /app/data/products.json && exec node server.js"]
