# 1. Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Set production environment for build (must be set before npm install)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci --production=false

COPY . .

# Remove any local .env to prevent conflicts
RUN rm -f .env .env.local .env.development .env.production

# Build with explicit env
RUN npx prisma generate && next build

# 2. Run stage
FROM node:22-alpine
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
