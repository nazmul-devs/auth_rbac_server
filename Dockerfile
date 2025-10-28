# ---------- Builder ----------
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig*.json ./
COPY src ./src
COPY prisma ./prisma
COPY .env.production ./.env


# Generate Prisma client (safe, doesn’t need DB)
RUN npm run pg
RUN npm run build


# ---------- Runtime ----------
FROM node:18-alpine AS app
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE 4001

# Run migrations after env is loaded, then start server
CMD npx prisma migrate deploy && npm run start
