FROM node:20-alpine AS base

# 1. Builder Stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
# Install all dependencies (workspaces)
RUN npm ci

COPY . .
# Build the API
RUN npm run build --workspace=api

# 2. Production Stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Install only production dependencies
RUN npm ci --omit=dev

USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/src/main"]
