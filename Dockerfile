FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env .env.local .env.development .env.production

# Build the app
RUN npm run build

# Create data directory
RUN mkdir -p /app/data && echo '[]' > /app/data/products.json
RUN mkdir -p /app/uploads/products

EXPOSE 3000

CMD ["npm", "start"]
