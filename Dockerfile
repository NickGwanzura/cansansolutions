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

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy standalone output
COPY --from=builder /app/.next/standalone/ ./
COPY --from=builder /app/.next/static ./.next/static

# Create data directory and seed with empty array
RUN mkdir -p /app/data && echo '[]' > /app/data/products.json

# Create uploads directory
RUN mkdir -p /app/uploads/products

EXPOSE 3000

CMD ["node", "server.js"]
