# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* yarn.lock* ./

# Install dependencies
RUN npm ci || npm install

# Copy source
COPY . .

# Build
RUN npm run build

# Copy PDF.js worker files to dist - pdfjs-dist v4 uses .mjs files
RUN if [ -f node_modules/pdfjs-dist/build/pdf.worker.min.mjs ]; then \
      cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs dist/pdf.worker.min.js; \
      echo "✓ Copied pdf.worker.min.mjs as pdf.worker.min.js"; \
    else \
      echo "✗ Worker file not found!"; \
    fi

# Runtime stage
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify worker file is in final image
RUN ls -la /usr/share/nginx/html/pdf.worker.min.js || echo "Warning: pdf.worker.min.js not found"

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=10s --timeout=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
