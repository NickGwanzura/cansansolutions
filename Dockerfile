FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env .env.local .env.development .env.production

# Create data directory before build
RUN mkdir -p /app/data

# Build the app
RUN npm run build

# Create uploads directory
RUN mkdir -p /app/uploads/products

EXPOSE 3000

# Start with explicit host binding
CMD ["sh", "-c", "echo 'Starting server on port 3000' && npm start"]
