# Docker Guide: Arabic Educational Platform Backend

## 1. Overview
- Image: Alpine Node (`ARG NODE_VERSION=20-alpine` default, supports `--build-arg NODE_VERSION=24-alpine`)
- Database: PostgreSQL 16 (automatic `schema.sql` initialization via Compose)
- Multi-container orchestrator: Docker Compose

---

## 2. Quick Start (App + PostgreSQL)

Start the entire environment (API server on port 5000 + PostgreSQL on port 5432):
```bash
docker compose up --build
```

- **Run in background (detached mode):**
  ```bash
  docker compose up -d --build
  ```
- **Stop containers:**
  ```bash
  docker compose down
  ```
- **Stop and wipe database volume (clean reset):**
  ```bash
  docker compose down -v
  ```

---

## 3. Building the Docker Image Directly

Build with default cached image:
```bash
docker build -t arabic-teacher-backend:latest .
```

Build with Node 24 Alpine:
```bash
docker build --build-arg NODE_VERSION=24-alpine -t arabic-teacher-backend:latest .
```

---

## 4. Running & Testing Inside Docker

### Run test suite inside container:
```bash
# Run all tests (unit + integration)
docker run --rm arabic-teacher-backend:latest npm test

# Run unit tests only
docker run --rm arabic-teacher-backend:latest npm run test:unit

# Run via Docker Compose
docker compose run --rm backend npm test
```

### Test PostgreSQL connection & database init:
```bash
# Verify connection to PostgreSQL container
docker compose run --rm backend npm run db:test

# Run manual schema migration/init
docker compose run --rm backend npm run db:init
```

### Run an interactive shell in container:
```bash
docker compose run --rm backend sh
```

---

## 5. Monitoring & Health Check

### View backend live logs:
```bash
docker compose logs -f backend
```

### Health check endpoint:
```bash
curl http://localhost:5000/health
```

