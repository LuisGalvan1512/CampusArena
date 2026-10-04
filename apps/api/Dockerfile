# ==========================================
# Campus Arena API — Production Multi-stage Dockerfile
# ==========================================

# 1. Base stage with Alpine + OpenSSL + pnpm
FROM node:22-alpine AS base
RUN apk add --no-cache openssl libc6-compat
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# 2. Dependencies & Build stage
FROM base AS builder
WORKDIR /app

# Copy root workspace and api package definitions
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma/

# Install dependencies in the monorepo for api
RUN pnpm --filter api install --frozen-lockfile

# Generate Prisma Client (with OpenSSL installed)
RUN pnpm --filter api exec prisma generate

# Copy source code and build NestJS
COPY apps/api ./apps/api/
RUN pnpm --filter api build

# 3. Production Runner stage
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

USER node

# Copy root node_modules (.pnpm virtual store) + apps/api artifacts
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=node:node /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=node:node /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder --chown=node:node /app/apps/api/package.json ./apps/api/

WORKDIR /app/apps/api

EXPOSE 3001

CMD ["node", "dist/main.js"]
