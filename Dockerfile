# Multi-stage build for NestJS application with frontend

# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Copy frontend build from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
RUN npm run build

# Stage 3: Production runtime
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies + sequelize-cli for migrations
COPY package.json package-lock.json ./
RUN npm ci --only=production && \
    npm install -g sequelize-cli && \
    npm cache clean --force

# Copy built application
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/frontend/dist ./frontend/dist

# Copy migration files and config needed for migrations
COPY --from=backend-builder /app/src/database/migrations ./src/database/migrations
COPY --from=backend-builder /app/src/database/config.js ./src/database/config.js
COPY --from=backend-builder /app/.sequelizerc ./.sequelizerc

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs

ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Default command (can be overridden in docker-compose)
CMD ["node", "dist/main.js"]
