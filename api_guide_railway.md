# 🚀 API Guide — Arabic Educational Platform (Railway)

> **Live Base URL:**
> ```
> https://arabic-backend-production.up.railway.app
> ```
> All endpoints below are prefixed with this URL.

---

## 📋 Table of Contents

1. [Railway Deployment Status](#-railway-deployment-status)
2. [How to Complete the Deployment](#-how-to-complete-the-deployment)
3. [Authentication](#-authentication)
4. [Response Format](#-response-format)
5. [Endpoints Reference](#-endpoints-reference)
6. [Frontend Integration Guide](#-frontend-integration-guide)
7. [Environment Variables Reference](#-environment-variables-reference)

---

## 🛤️ Railway Deployment Status

| Resource            | Value                                              |
| ------------------- | -------------------------------------------------- |
| **Project**         | illustrious-gentleness                             |
| **Backend Service** | `arabic-backend`                                   |
| **Backend URL**     | `https://arabic-backend-production.up.railway.app` |
| **Database**        | Postgres (Railway — already running ✅)             |
| **DATABASE_URL**    | Wired via `${{Postgres.DATABASE_URL}}` ✅           |
| **JWT_SECRET**      | Set ✅                                              |
| **Environment**     | production                                         |

> [!IMPORTANT]
> **One step remaining:** The backend service needs a GitHub repository source connected before it goes live. See the next section.

---

## 🔧 How to Complete the Deployment

### Step 1 — Push your code to GitHub

Open a terminal in your backend folder and run:

```bash
cd /home/sir/Desktop/arabic-educational-website/arabic_teacher_backend

# Git is already initialized
git add -A
git commit -m "feat: initial Railway deployment"

# Create a new repo at https://github.com/new  →  name it: arabic-teacher-backend
git remote add origin https://github.com/YOUR_USERNAME/arabic-teacher-backend.git
git branch -M main
git push -u origin main
```

### Step 2 — Connect the GitHub repo to Railway

1. Open **[railway.app](https://railway.app)** → your project **illustrious-gentleness**
2. Click the **arabic-backend** service card
3. Click **Settings** tab → **Source** → **Connect Repo**
4. Select your `arabic-teacher-backend` repo, branch `main`
5. Railway auto-deploys immediately 🚀

### Step 3 — Run the database schema

After the first successful deploy, initialize the DB tables:

**Option A — Railway Dashboard:**
1. Click the **Postgres** service → **Data** tab → **Query**
2. Paste the entire contents of `schema.sql`
3. Click **Run**

**Option B — via psql:**
```bash
# Get DATABASE_URL from Railway → Postgres service → Variables tab
psql "postgresql://..." -f schema.sql
```

### Step 4 — Set your frontend's CORS origin

In Railway dashboard → **arabic-backend** service → **Variables**, update:
```
ALLOWED_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### Step 5 — Verify

```bash
curl https://arabic-backend-production.up.railway.app/health
```

**Expected:**
```json
{ "status": "ok", "db": { "connected": true } }
```

---

## 🔐 Authentication

The API uses **JWT Bearer tokens**.

After login/register, save the returned `token` and add it to every protected request:

```http
Authorization: Bearer <your_token_here>
```

**Token payload:**
```json
{ "id": "uuid", "phone": "01012345678", "full_name": "Student Name", "exp": ... }
```

**Token lifetime:** `7 days`

> [!NOTE]
> Routes marked 🔒 require the Authorization header. Routes marked 🌐 are public.

---

## 📦 Response Format

**Success:**
```json
{ "success": true, "data": { ... } }
```

**Error:**
```json
{ "success": false, "message": "Error description" }
```

---

## 📡 Endpoints Reference

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | 🌐 | Server + DB status |
| GET | `/` | 🌐 | API info |

---

### Auth — `/api/auth`

#### POST `/api/auth/register` 🌐

```json
// Request body
{
  "full_name": "أحمد محمد",          // required
  "phone": "01012345678",            // required, unique
  "password": "mypassword",          // required, min 6 chars
  "email": "ahmed@example.com",      // optional
  "governorate_name": "القاهرة",    // optional
  "center_name": "مركز النور",       // optional
  "parent_phone_number": "010...",   // optional
  "current_year_id": "uuid"          // optional
}

// Response 201
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid", "full_name": "أحمد محمد",
    "phone": "01012345678", "email": null,
    "student_id": null, "current_year_id": null,
    "governorate_name": null, "center_name": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errors:** `400` missing fields / password < 6 · `409` phone taken

---

#### POST `/api/auth/login` 🌐

```json
// Request
{ "phone": "01012345678", "password": "mypassword" }

// Response 200
{ "success": true, "token": "eyJhbGc...", "user": { ... } }
```

**Errors:** `400` missing fields · `401` wrong credentials

---

#### GET `/api/auth/me` 🔒

Returns the current user's profile from the database.

```json
{ "success": true, "user": { "id": "uuid", "full_name": "...", ... } }
```

---

### Academic Years — `/api/years`

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/years` | 🌐 |
| GET | `/api/years/:id` | 🌐 |
| POST | `/api/years` | 🔒 |
| PATCH | `/api/years/:id` | 🔒 |
| DELETE | `/api/years/:id` | 🔒 |

**Default data (seeded by schema.sql):**
- الصف الأول الثانوي
- الصف الثاني الثانوي
- الصف الثالث الثانوي

**POST body:** `{ "title": "الصف الأول الإعدادي", "order_index": 4 }`

---

### Courses — `/api/courses`

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/courses` | 🌐 | All published courses |
| GET | `/api/courses?year_id=:id` | 🌐 | Filter by year |
| GET | `/api/courses/:id` | 🌐 | Single course |
| POST | `/api/courses` | 🔒 | Create (admin) |
| PATCH | `/api/courses/:id` | 🔒 | Update (admin) |
| DELETE | `/api/courses/:id` | 🔒 | Delete (admin) |

**POST body:**
```json
{
  "year_id": "uuid",
  "title": "النحو والصرف",
  "description": "كورس شامل",
  "thumbnail_url": "https://...",
  "price": 150.00,
  "is_published": true
}
```

---

### Lessons — `/api/lessons`

> All lesson routes require 🔒 authentication.

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/lessons?course_id=:id` | Required param |
| GET | `/api/lessons/:id` | Single lesson |
| POST | `/api/lessons` | Admin |
| PATCH | `/api/lessons/:id` | Admin |
| DELETE | `/api/lessons/:id` | Admin |

**POST body:**
```json
{
  "course_id": "uuid",
  "title": "الدرس الأول — المبتدأ والخبر",
  "content": "شرح تفصيلي...",
  "video_url": "https://youtube.com/...",
  "order_index": 1,
  "attachment_urls": ["https://storage.com/file.pdf"],
  "is_published": true
}
```

---

### Enrollments — `/api/enrollments`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/enrollments/me` | 🔒 | My courses |
| GET | `/api/enrollments` | 🔒 | All (admin) |
| GET | `/api/enrollments?user_id=&course_id=` | 🔒 | Filter |
| POST | `/api/enrollments` | 🔒 | Enroll user (admin) |
| DELETE | `/api/enrollments/:id` | 🔒 | Remove enrollment |

**POST body:** `{ "user_id": "uuid", "course_id": "uuid", "expires_at": "2025-12-31" }`

---

### Lesson Access — `/api/lesson-access`

> Grant access to individual lessons without full enrollment.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/lesson-access/me` | 🔒 | My lesson access |
| GET | `/api/lesson-access/me?course_id=:id` | 🔒 | Filtered |
| POST | `/api/lesson-access` | 🔒 | Grant (admin) |
| DELETE | `/api/lesson-access/:id` | 🔒 | Revoke |

**POST body:**
```json
{ "user_id": "uuid", "lesson_id": "uuid", "course_id": "uuid", "notes": "trial", "expires_at": null }
```

---

### Progress — `/api/progress`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/progress/me` | 🔒 | All my progress |
| GET | `/api/progress/me?course_id=:id` | 🔒 | Progress for one course |
| POST | `/api/progress` | 🔒 | Mark lesson complete |
| DELETE | `/api/progress/:lesson_id` | 🔒 | Unmark |

**POST body:** `{ "lesson_id": "uuid" }`

---

### Course Requests — `/api/course-requests`

> Students request enrollment → admin approves → auto-enrolled.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/course-requests` | 🔒 | All requests (admin) |
| GET | `/api/course-requests?status=pending` | 🔒 | Filter by status |
| GET | `/api/course-requests/me` | 🔒 | My requests |
| POST | `/api/course-requests` | 🔒 | Submit request |
| PATCH | `/api/course-requests/:id` | 🔒 | Approve/reject (admin) |

**POST body:** `{ "course_id": "uuid" }`

**PATCH body:** `{ "status": "approved" }` — values: `approved | rejected | pending`

> [!TIP]
> Setting status to `"approved"` **automatically creates an enrollment** record.

---

### Exams — `/api/exams`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/exams` | 🔒 | List all |
| GET | `/api/exams?year_id=&course_id=` | 🔒 | Filter |
| GET | `/api/exams/:id` | 🔒 | Single exam |
| POST | `/api/exams` | 🔒 | Create (admin) |
| PATCH | `/api/exams/:id` | 🔒 | Update (admin) |
| DELETE | `/api/exams/:id` | 🔒 | Delete (admin) |
| POST | `/api/exams/:id/submit` | 🔒 | Student submits |
| GET | `/api/exams/submissions/me` | 🔒 | My submissions |
| GET | `/api/exams/:id/submissions` | 🔒 | All submissions (admin) |

**POST body:** `{ "title": "امتحان الفصل الأول", "exam_url": "https://forms.google.com/...", "course_id": "uuid", "year_id": "uuid" }`

---

### Complaints — `/api/complaints`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/complaints` | 🌐 | Submit complaint |
| GET | `/api/complaints` | 🔒 | List all (admin) |

**POST body:**
```json
{
  "complaint_text": "لم أتمكن من الوصول للدرس",
  "phone_number": "01012345678",
  "user_name": "أحمد",
  "user_id": "uuid"
}
```

---

### Profiles — `/api/profiles`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/profiles` | 🔒 | All students (admin) |
| GET | `/api/profiles?year_id=&search=` | 🔒 | Search by name/phone |
| GET | `/api/profiles/:id` | 🔒 | Single profile |
| PATCH | `/api/profiles/:id` | 🔒 | Update own profile only |

**PATCH body:**
```json
{
  "full_name": "أحمد محمد علي",
  "email": "ahmed@example.com",
  "governorate_name": "الإسكندرية",
  "center_name": "مركز النجاح",
  "parent_phone_number": "01098765432",
  "current_year_id": "uuid"
}
```

> [!WARNING]
> `PATCH /api/profiles/:id` enforces self-update only — a student can't update another's profile.

---

## 🖥️ Frontend Integration Guide

### 1 — Base URL config

```javascript
// src/config/api.js
export const BASE_URL = "https://arabic-backend-production.up.railway.app";
```

### 2 — API client (fetch)

```javascript
// src/utils/apiClient.js
import { BASE_URL } from "../config/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
  return data;
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: "POST",   body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: "PATCH",  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: "DELETE" }),
};
```

### 3 — Auth functions

```javascript
import { api } from "./utils/apiClient";

export async function register(formData) {
  const { token, user } = await api.post("/api/auth/register", {
    full_name:          formData.fullName,
    phone:              formData.phone,
    password:           formData.password,
    email:              formData.email,
    governorate_name:   formData.governorate,
    current_year_id:    formData.yearId,
  });
  localStorage.setItem("token", token);
  return user;
}

export async function login(phone, password) {
  const { token, user } = await api.post("/api/auth/login", { phone, password });
  localStorage.setItem("token", token);
  return user;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
```

### 4 — Load courses & years

```javascript
// All courses (homepage)
export const getCourses = (yearId) =>
  api.get(yearId ? `/api/courses?year_id=${yearId}` : "/api/courses").then(r => r.data);

// Academic years (for filter dropdown)
export const getYears = () => api.get("/api/years").then(r => r.data);
```

### 5 — Enrollment flow (student)

```javascript
// Student requests a course
export const requestCourse = (courseId) =>
  api.post("/api/course-requests", { course_id: courseId }).then(r => r.data);

// My enrolled courses
export const getMyEnrollments = () =>
  api.get("/api/enrollments/me").then(r => r.data);

// My pending requests
export const getMyRequests = () =>
  api.get("/api/course-requests/me").then(r => r.data);
```

### 6 — Lessons & progress

```javascript
// Lessons for a course
export const getLessons = (courseId) =>
  api.get(`/api/lessons?course_id=${courseId}`).then(r => r.data);

// Mark lesson complete
export const markComplete = (lessonId) =>
  api.post("/api/progress", { lesson_id: lessonId }).then(r => r.data);

// My progress for a course
export const getCourseProgress = (courseId) =>
  api.get(`/api/progress/me?course_id=${courseId}`).then(r => r.data);
```

### 7 — Submit a complaint (no token needed)

```javascript
export async function submitComplaint(text, phone = null, name = null) {
  const res = await fetch(`${BASE_URL}/api/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ complaint_text: text, phone_number: phone, user_name: name }),
  });
  return res.json();
}
```

### 8 — Axios setup (alternative)

```javascript
// src/utils/axios.js
import axios from "axios";

const http = axios.create({
  baseURL: "https://arabic-backend-production.up.railway.app",
});

// Auto-attach token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-handle 401 (session expired)
http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default http;
```

---

## 🌍 Environment Variables Reference

| Variable | Value on Railway | Notes |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` | Auto-wired ✅ |
| `JWT_SECRET` | *(128-char secret — set)* | Do not expose |
| `JWT_EXPIRES_IN` | `7d` | |
| `NODE_ENV` | `production` | |
| `PORT` | `5000` | Railway overrides with its own port |
| `DB_POOL_MAX` | `20` | |
| `ALLOWED_ORIGINS` | `*` ← **change this!** | Set to your frontend URL |

> [!CAUTION]
> Before going public, change `ALLOWED_ORIGINS` to your actual frontend domain:
> ```
> ALLOWED_ORIGINS=https://your-frontend.vercel.app
> ```
> Update in Railway dashboard → arabic-backend service → Variables tab.

---

## 🗄️ Database Tables Summary

| Table | Purpose |
|---|---|
| `years` | Academic year levels |
| `profiles` | Students / users |
| `courses` | Courses per year |
| `lessons` | Lessons per course |
| `enrollments` | Full course access |
| `lesson_access` | Per-lesson access grants |
| `lesson_progress` | Student progress |
| `course_requests` | Enrollment requests |
| `exams` | Exam links |
| `exam_submissions` | Exam submission records |
| `complaints` | Student complaints |

---

*Generated: 2026-11-22 · Project: illustrious-gentleness · Service ID: 3dd0b895-a19d-4035-9c1e-f313a6973875*
