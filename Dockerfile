FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env .env.local .env.development .env.production

# Create required directories
RUN mkdir -p /app/data /app/uploads/products

# Build
RUN npm run build

EXPOSE 3000

# Test that node works, then start
CMD ["sh", "-c", "echo 'Node version:' && node --version && echo 'Starting app...' && exec npm start"]
