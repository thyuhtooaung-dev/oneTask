FROM node:20-alpine AS base

# Stage 1: Install dev dependencies and build NestJS code
FROM base AS builder
WORKDIR /app

# Install pnpm globally
RUN npm i -g pnpm

# Copy package configuration files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including devDependencies) for the build step
RUN pnpm install --frozen-lockfile

# Copy all source files
COPY . .

# Build the NestJS app (compiles TS into JS in the 'dist' directory)
RUN pnpm run build

# Stage 2: Install production dependencies ONLY
FROM base AS deps
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Stage 3: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy compiled files and production dependencies
COPY --from=builder /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/main"]
