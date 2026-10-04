# ==========================================
# Campus Arena API — Production Multi-stage Dockerfile
# ==========================================

# 1. Base stage with pnpm
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 2. Dependencies & Build stage
FROM base AS builder
WORKDIR /app

# Copy root workspace and api dependencies
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

# Install all dependencies
RUN pnpm --filter api install --frozen-lockfile

# Generate Prisma Client
RUN pnpm --filter api exec prisma generate

# Copy source code and build
COPY apps/api ./apps/api/
RUN pnpm --filter api build

# Prune devDependencies for minimal production footprint
RUN pnpm --filter api prune --prod

# 3. Production Runner stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Run as non-root user for security
USER node

# Copy built artifacts and production node_modules
COPY --from=builder --chown=node:node /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./

EXPOSE 3001

CMD ["node", "dist/main.js"]
