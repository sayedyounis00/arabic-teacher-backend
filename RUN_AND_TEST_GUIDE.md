# Backend Run & Test Guide (Docker)

Single Docker-based workflow to run the backend, execute tests, send API requests, and inspect responses.

---

## 1. Start the App & Database

Your Docker image `arabic-teacher-backend:latest` and PostgreSQL 16 container will run together with initialized schemas:

```bash
docker compose up -d
```

Verify containers are running:
```bash
docker compose ps
```

View live server logs:
```bash
docker compose logs -f backend
```

---

## 2. Run Backend Tests Inside Docker

Execute tests directly against your Docker container/image:

```bash
# Run all tests (unit + integration)
docker compose run --rm backend npm test

# Or run tests directly against the image
docker run --rm arabic-teacher-backend:latest npm test
```

---

## 3. Send API Requests & Inspect Responses

Run these `curl` commands in your terminal to test the API and see responses.

### 3.1 Check Server Root & Health
```bash
# API Root Check
curl -i http://localhost:5000/

# Health & Database Connectivity Check
curl -i http://localhost:5000/health
```

**Expected Response (`/health`):**
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "status": "ok",
  "db": {
    "connected": true,
    "database": "arabic_platform",
    "timestamp": "2026-11-22T..."
  }
}
```

---

### 3.2 Register a New User
```bash
curl -i -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "password": "Password123!",
    "phone": "01012345678",
    "student_id": "STU-0001",
    "current_year_id": "00000000-0000-0000-0000-000000000000",
    "governorate_name": "Gharbia",
    "center_name": "El Mahalla El Kubra",
    "parent_phone_number": "01098765432"
  }'
```

**Expected Response:**
```json
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Content-Length: 312

{
  "message": "User registered successfully",
  "user": {
    "id": "3f2b8c1e-5a7d-4e9a-b1c2-9d8e7f6a5b4c",
    "full_name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "01012345678",
    "student_id": "STU-0001",
    "current_year_id": "00000000-0000-0000-0000-000000000000",
    "governorate_name": "Gharbia",
    "center_name": "El Mahalla El Kubra",
    "parent_phone_number": "01098765432",
    "created_at": "2026-11-22T10:38:00.000Z"
  }
}
```

---

## 4. Stop the Environment

```bash
# Stop containers
docker compose down

# Stop and wipe database volume for a clean reset:
docker compose down -v
```
