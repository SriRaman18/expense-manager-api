FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1
WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/package.json ./

EXPOSE 3000

CMD ["bun", "run", "dist/index.js"]

