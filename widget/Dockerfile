# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache layer)
COPY widget/package.json widget/package-lock.json ./
RUN npm ci

# Copy the rest of the widget source
COPY widget/ ./

# VITE_API_BASE_URL is baked into the static bundle at build time.
# Override this ARG when building for production (e.g. your AWS/Azure domain).
ARG VITE_API_BASE_URL=http://localhost:8000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Overwrite the committed .env files so the build ARG always wins.
# This matters when building for production with a different API URL.
RUN echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env.production && \
    echo "VITE_API_BASE_URL=${VITE_API_BASE_URL}" > .env.development

RUN npm run build

# ── Serve stage ───────────────────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY widget/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
