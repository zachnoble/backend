FROM oven/bun:1 as builder

WORKDIR /app

# Copy package.json and lockfile
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy all files
COPY . .

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy only necessary files from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lockb ./

# Install only production dependencies
RUN bun install --production --frozen-lockfile

# Install PM2 globally
RUN bun install -g pm2

# Expose the port the app runs on
EXPOSE 8080

# Start the application
CMD ["bun", "start"] 