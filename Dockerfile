# ==========================================
# SENDFILES - 100% FREE PRODUCTION DOCKERFILE
# Multi-stage ultra-lightweight alpine container
# ==========================================

# Stage 1: Build Frontend
FROM node:22-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# Stage 2: Production Server
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server code
COPY server/src ./server/src

# Copy built frontend assets from stage 1
COPY --from=client-builder /app/client/dist ./client/dist

# Ensure data storage directory exists
RUN mkdir -p /app/data/storage

EXPOSE 4000

# Run unified server (handles both API and frontend SPA)
CMD ["node", "server/src/server.js"]
