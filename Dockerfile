# Stage 1: Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/src/server.js ./src/

# Install only production dependencies
RUN npm ci --only=production

# Switch to non-root user
USER appuser

# Set port and healthcheck
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -qO- http://localhost:80/health || exit 1

# Start the application
CMD ["npm", "start"] 