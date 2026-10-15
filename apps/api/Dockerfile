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
# Prisma istemcisini üret (monorepo'da postinstall şemayı bulamaz, bu yüzden açıkça).
ENV DATABASE_URL=file:./dev.db
RUN npx prisma generate --schema apps/api/prisma/schema.prisma
# Build the API
RUN npm run build --workspace=api

# 2. Production Stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/data/vapur.db
ENV PORT=3001

# Sadece production bağımlılıkları + üretilmiş Prisma istemcisi
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
RUN npm ci --omit=dev
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/apps/api/dist ./apps/api/dist

RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 3001

# Şema yoksa SQLite dosyası ilk bağlantıda oluşturulur; tablolar için
# `npm run prisma:push` (veya prisma db push) bir kez çalıştırılmalıdır.
CMD ["node", "apps/api/dist/main"]
