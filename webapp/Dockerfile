FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY webapp/package.json ./webapp/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy webapp source and build
COPY webapp/ ./webapp/
RUN pnpm --filter webapp build

# Production stage
FROM node:22-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY webapp/package.json ./webapp/
RUN pnpm install --frozen-lockfile --prod

COPY --from=base /app/webapp/.next ./webapp/.next
COPY --from=base /app/webapp/next.config.js ./webapp/
COPY --from=base /app/webapp/server.ts ./webapp/
COPY --from=base /app/webapp/tsconfig.json ./webapp/
COPY --from=base /app/webapp/src ./webapp/src

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 6175
ENV NODE_ENV=production
CMD ["pnpm", "--filter", "webapp", "start"]
