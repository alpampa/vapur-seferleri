FROM node:20-alpine AS base

# 1. Builder Stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
# Install all dependencies
RUN npm ci

COPY . .
# Build the Next.js app
RUN npm run build --workspace=web

# 2. Production Stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# Next.js standalone output copies everything needed
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
