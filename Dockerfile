# syntax=docker/dockerfile:1
# ============================================================
# Dockerfile production cho blog-trip (Next.js 14 standalone + Prisma)
# Multi-stage de image cuoi nho gon, chay bang non-root user.
# ============================================================

# ---- Base: node 20 + openssl (Prisma can libssl) ----
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Deps: cai dependencies (postinstall tu chay prisma generate) ----
FROM base AS deps
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

# ---- Builder: build Next.js ra .next/standalone ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Bien NEXT_PUBLIC_* PHAI co luc build vi Next inline vao client bundle.
# DATABASE_URL can luc build vi generateStaticParams (SSG) truy van DB.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG DATABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    DATABASE_URL=$DATABASE_URL
RUN npm run build

# ---- Runner: image chay production, chi chua artifact can thiet ----
FROM base AS runner
ENV NODE_ENV=production
# Tao user khong phai root de chay an toan hon
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

# Copy public assets + standalone server + static (standalone khong gom 2 cai sau)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Belt-and-suspenders: dam bao Prisma query engine co mat trong runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0

# server.js la entrypoint do Next standalone sinh ra
CMD ["node", "server.js"]
