FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Build
COPY . .
RUN pnpm run build

# Production stage
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/.next ./.next
COPY --from=base /app/next.config.js ./
COPY --from=base /app/server.ts ./
COPY --from=base /app/tsconfig.json ./
COPY --from=base /app/src ./src

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 6175
ENV NODE_ENV=production
CMD ["pnpm", "start"]
