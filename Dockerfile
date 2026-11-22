# ==========================================
# Stage 1: Build Application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm via Corepack
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Copy dependency manifests
COPY package.json pnpm-lock.yaml ./

# Install exact production dependencies
RUN pnpm install --frozen-lockfile

# Copy project source code
COPY . .

# Build production bundle
RUN pnpm run build

# ==========================================
# Stage 2: Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: Run as unprivileged node user
USER node

# Copy built frontend assets and serverless API handlers
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/api ./api
COPY --chown=node:node --from=builder /app/scripts/prod-server.mjs ./scripts/prod-server.mjs
COPY --chown=node:node --from=builder /app/package.json ./package.json

EXPOSE 3000

# Health check to ensure zero-downtime rolling updates
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "scripts/prod-server.mjs"]
