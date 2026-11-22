ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./
COPY . .

# Install dependencies using lockfile if present, otherwise npm install
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

ENV NODE_ENV=production \
    PORT=5000

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "src/server.js"]


