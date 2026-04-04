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

# Create directories
RUN mkdir -p /app/data /app/uploads/products

# Copy and set up start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000

CMD ["/app/start.sh"]
