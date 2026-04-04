FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Remove local env files
RUN rm -f .env .env.local .env.development .env.production

# Create directories and ensure data file exists
RUN mkdir -p /app/data /app/uploads/products && \
    if [ ! -f /app/data/products.json ]; then echo '[]' > /app/data/products.json; fi

# Build
RUN npm run build

EXPOSE 3000

# Simple start with error capture
CMD ["sh", "-c", "echo '=== Starting Cansan Solutions ===' && echo 'Node:' && node --version && echo 'Files in /app/data:' && ls -la /app/data/ && echo 'Starting server...' && exec npm start"]
