FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN rm -f .env .env.local .env.development .env.production

RUN npm run build

EXPOSE 3000

# Use sh to catch errors
CMD ["sh", "-c", "npm start 2>&1 || echo 'Exit code:' $?"]
