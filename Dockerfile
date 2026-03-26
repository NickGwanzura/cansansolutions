# 1. Build stage
FROM node:18-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Run stage
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app ./

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
