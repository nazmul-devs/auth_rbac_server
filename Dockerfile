# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript to /dist
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy package.json and dist folder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
RUN npm ci --production

# Copy wait-for script
COPY wait-for.sh /wait-for.sh
RUN chmod +x /wait-for.sh

EXPOSE 4001

# Run wait-for script to wait for Postgres & Redis before starting app
CMD ["/wait-for.sh", "postgres:5432", "redis:6379", "--", "node", "dist/server.js"]
