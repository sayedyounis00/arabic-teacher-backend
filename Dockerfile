ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./
COPY . .

# Install dependencies only if node_modules is missing
RUN if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then npm ci --omit=dev; fi

ENV NODE_ENV=production \
    PORT=5000

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]


